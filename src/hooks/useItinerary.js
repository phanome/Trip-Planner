import { useState, useRef, useCallback, useEffect } from "react";
import { generateItinerary, refineItinerary } from "../api/groq";
import { parseItinerary } from "../utils/parseItinerary";
import { SAMPLE_ICELAND_ITINERARY } from "../data/sampleItinerary";

const ACTIVE_STORAGE_KEY = "trip_planner_active_session_v1";
const SESSIONS_STORAGE_KEY = "trip_planner_saved_sessions_v1";

export function useItinerary() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [lastPrompt, setLastPrompt] = useState("");
  const [undoItem, setUndoItem] = useState(null); // { type: 'stop'|'day', data, dayId, index, timeoutId }
  const [savedSessions, setSavedSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Abort controller for race-condition protection
  const abortRef = useRef(null);
  // Request counter to drop stale results
  const requestIdRef = useRef(0);

  // Restore saved sessions and active session on initial load
  useEffect(() => {
    try {
      // 1. Load saved sessions list
      const savedList = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (savedList) {
        const parsedList = JSON.parse(savedList);
        if (Array.isArray(parsedList)) {
          setSavedSessions(parsedList);
        }
      }

      // 2. Load active session
      const activeSaved = localStorage.getItem(ACTIVE_STORAGE_KEY);
      if (activeSaved) {
        const parsed = JSON.parse(activeSaved);
        if (parsed?.itinerary && parsed.itinerary.days?.length > 0) {
          setItinerary(parsed.itinerary);
          setLastPrompt(parsed.lastPrompt || "");
          setActiveSessionId(parsed.sessionId || null);
          setStatus("success");
        }
      }
    } catch {
      // Ignore corrupted localStorage
    }
  }, []);

  // Persist active session changes
  useEffect(() => {
    if (itinerary && status === "success") {
      try {
        localStorage.setItem(
          ACTIVE_STORAGE_KEY,
          JSON.stringify({
            itinerary,
            lastPrompt,
            sessionId: activeSessionId,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Storage quota or private browsing
      }
    }
  }, [itinerary, lastPrompt, status, activeSessionId]);

  // Clean up in-flight requests and undo timers on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (undoItem?.timeoutId) clearTimeout(undoItem.timeoutId);
    };
  }, [undoItem]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((curr) => (curr === msg ? null : curr)), 3000);
  };

  const generate = useCallback(async (prompt) => {
    if (!prompt.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const myRequestId = ++requestIdRef.current;

    setLastPrompt(prompt);
    setStatus("loading");
    setError(null);
    setWarnings([]);
    setActiveSessionId(null);

    const { data: raw, error: apiError } = await generateItinerary(
      prompt,
      controller.signal
    );

    if (myRequestId !== requestIdRef.current) return;
    if (controller.signal.aborted) return;

    if (apiError) {
      if (apiError.type === "aborted") return;
      setStatus("error");
      setError(apiError);
      return;
    }

    try {
      const { data, warnings: w } = parseItinerary(raw);
      setItinerary(data);
      setWarnings(w);
      setStatus("success");
    } catch (parseErr) {
      setStatus("error");
      setError(parseErr);
    }
  }, []);

  // Refinement loop: refine current itinerary via follow-up prompt
  const refine = useCallback(async (refinementPrompt) => {
    if (!refinementPrompt.trim() || !itinerary) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const myRequestId = ++requestIdRef.current;
    setStatus("loading");
    setError(null);

    const { data: raw, error: apiError } = await refineItinerary(
      itinerary,
      refinementPrompt,
      controller.signal
    );

    if (myRequestId !== requestIdRef.current) return;
    if (controller.signal.aborted) return;

    if (apiError) {
      if (apiError.type === "aborted") return;
      setStatus("error");
      setError(apiError);
      return;
    }

    try {
      const { data, warnings: w } = parseItinerary(raw);
      setItinerary(data);
      setWarnings(w);
      setStatus("success");
      showToast("✨ Itinerary updated with AI refinement!");
    } catch (parseErr) {
      setStatus("error");
      setError(parseErr);
    }
  }, [itinerary]);

  const retry = useCallback(() => {
    if (lastPrompt) generate(lastPrompt);
  }, [lastPrompt, generate]);

  const clearSession = useCallback(() => {
    abortRef.current?.abort();
    setItinerary(null);
    setStatus("idle");
    setError(null);
    setWarnings([]);
    setLastPrompt("");
    setUndoItem(null);
    setActiveSessionId(null);
    try {
      localStorage.removeItem(ACTIVE_STORAGE_KEY);
    } catch {}
  }, []);

  // Multi-session Management: Save Current Session
  const saveCurrentSession = useCallback(() => {
    if (!itinerary) return;

    const sessionId = activeSessionId || `session_${Date.now()}`;
    const stopsCount = itinerary.days.reduce((acc, d) => acc + d.stops.length, 0);

    const sessionData = {
      id: sessionId,
      title: itinerary.tripTitle || "My Trip",
      destination: itinerary.destination || "Destination",
      totalDays: itinerary.totalDays || itinerary.days.length,
      stopsCount,
      itinerary,
      prompt: lastPrompt,
      savedAt: new Date().toISOString(),
    };

    setSavedSessions((prev) => {
      const existingIdx = prev.findIndex((s) => s.id === sessionId);
      let updated;
      if (existingIdx !== -1) {
        updated = [...prev];
        updated[existingIdx] = sessionData;
      } else {
        updated = [sessionData, ...prev];
      }

      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      return updated;
    });

    setActiveSessionId(sessionId);
    showToast(`💾 Saved "${sessionData.title}" to your sessions!`);
  }, [itinerary, lastPrompt, activeSessionId]);

  // Multi-session Management: Load a saved session
  const loadSession = useCallback((savedSession) => {
    if (!savedSession?.itinerary) return;

    abortRef.current?.abort();
    setItinerary(savedSession.itinerary);
    setLastPrompt(savedSession.prompt || "");
    setActiveSessionId(savedSession.id);
    setStatus("success");
    setError(null);
    setWarnings([]);
    showToast(`📂 Loaded "${savedSession.title}"`);
  }, []);

  // Multi-session Management: Delete a saved session
  const deleteSession = useCallback((sessionId) => {
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
    showToast("🗑 Session deleted");
  }, [activeSessionId]);

  // Load sample / demo itinerary for preview without API key
  const loadDemo = useCallback(() => {
    abortRef.current?.abort();
    setItinerary(SAMPLE_ICELAND_ITINERARY);
    setLastPrompt("Road trip through Iceland for 4 days — Northern Lights, waterfalls, and volcanic landscapes.");
    setActiveSessionId(null);
    setStatus("success");
    setError(null);
    setWarnings([]);
    showToast("✨ Loaded Iceland Demo Itinerary!");
  }, []);

  // Reorder days
  const reorderDays = useCallback((fromIndex, toIndex) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const days = [...prev.days];
      const [moved] = days.splice(fromIndex, 1);
      days.splice(toIndex, 0, moved);
      return { ...prev, days };
    });
  }, []);

  // Reorder stops within a day
  const reorderStops = useCallback((dayId, fromIndex, toIndex) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((day) => {
          if (day.id !== dayId) return day;
          const stops = [...day.stops];
          const [moved] = stops.splice(fromIndex, 1);
          stops.splice(toIndex, 0, moved);
          return { ...day, stops };
        }),
      };
    });
  }, []);

  // Remove a stop with Undo capability
  const removeStop = useCallback((dayId, stopId) => {
    setItinerary((prev) => {
      if (!prev) return prev;

      const targetDay = prev.days.find((d) => d.id === dayId);
      if (!targetDay) return prev;

      const stopIndex = targetDay.stops.findIndex((s) => s.id === stopId);
      const removedStop = targetDay.stops[stopIndex];

      if (removedStop) {
        if (undoItem?.timeoutId) clearTimeout(undoItem.timeoutId);
        const timeoutId = setTimeout(() => setUndoItem(null), 5000);
        setUndoItem({
          type: "stop",
          name: removedStop.name,
          stop: removedStop,
          dayId,
          index: stopIndex,
          timeoutId,
        });
      }

      return {
        ...prev,
        days: prev.days
          .map((day) => {
            if (day.id !== dayId) return day;
            return { ...day, stops: day.stops.filter((s) => s.id !== stopId) };
          })
          .filter((day) => day.stops.length > 0),
      };
    });
  }, [undoItem]);

  // Remove a day with Undo capability
  const removeDay = useCallback((dayId) => {
    setItinerary((prev) => {
      if (!prev) return prev;
      const dayIndex = prev.days.findIndex((d) => d.id === dayId);
      const removedDay = prev.days[dayIndex];

      if (removedDay) {
        if (undoItem?.timeoutId) clearTimeout(undoItem.timeoutId);
        const timeoutId = setTimeout(() => setUndoItem(null), 5000);
        setUndoItem({
          type: "day",
          name: `Day ${removedDay.dayNumber}`,
          day: removedDay,
          index: dayIndex,
          timeoutId,
        });
      }

      const days = prev.days.filter((d) => d.id !== dayId);
      return { ...prev, days, totalDays: days.length };
    });
  }, [undoItem]);

  // Restore the last deleted item
  const restoreUndo = useCallback(() => {
    if (!undoItem) return;

    if (undoItem.timeoutId) clearTimeout(undoItem.timeoutId);

    setItinerary((prev) => {
      if (!prev) return prev;

      if (undoItem.type === "stop") {
        return {
          ...prev,
          days: prev.days.map((day) => {
            if (day.id !== undoItem.dayId) return day;
            const stops = [...day.stops];
            stops.splice(undoItem.index, 0, undoItem.stop);
            return { ...day, stops };
          }),
        };
      } else if (undoItem.type === "day") {
        const days = [...prev.days];
        days.splice(undoItem.index, 0, undoItem.day);
        return { ...prev, days, totalDays: days.length };
      }

      return prev;
    });

    setUndoItem(null);
  }, [undoItem]);

  const dismissUndo = useCallback(() => {
    if (undoItem?.timeoutId) clearTimeout(undoItem.timeoutId);
    setUndoItem(null);
  }, [undoItem]);

  return {
    status,
    itinerary,
    error,
    warnings,
    lastPrompt,
    undoItem,
    savedSessions,
    activeSessionId,
    toastMessage,
    generate,
    refine,
    retry,
    loadDemo,
    clearSession,
    saveCurrentSession,
    loadSession,
    deleteSession,
    reorderDays,
    reorderStops,
    removeStop,
    removeDay,
    restoreUndo,
    dismissUndo,
  };
}
