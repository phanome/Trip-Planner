import { useState, useRef, useCallback } from "react";
import { useItinerary } from "./hooks/useItinerary";
import TripInput from "./components/TripInput";
import ItineraryView from "./components/ItineraryView";
import LoadingState from "./components/LoadingState";
import ErrorBanner from "./components/ErrorBanner";
import SavedSessionsModal from "./components/SavedSessionsModal";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const textareaRef = useRef(null);

  const {
    status,
    itinerary,
    error,
    warnings,
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
  } = useItinerary();

  const handleSubmit = useCallback(() => {
    const val = inputValue.trim();
    if (!val || status === "loading") return;
    generate(val);
  }, [inputValue, status, generate]);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExampleClick = (text) => {
    setInputValue(text);
    textareaRef.current?.focus();
  };

  const charCount = inputValue.length;
  const isLoading = status === "loading";
  const maxChars = 800;

  return (
    <div className="app">
      {/* Background ambient lighting */}
      <div className="bg-blob blob-1" aria-hidden="true" />
      <div className="bg-blob blob-2" aria-hidden="true" />
      <div className="bg-blob blob-3" aria-hidden="true" />

      {/* Generic Toast Notification */}
      {toastMessage && (
        <div className="status-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}

      {/* Undo Toast Notification */}
      {undoItem && (
        <div className="undo-toast" role="status" aria-live="polite">
          <span>
            Removed <strong>{undoItem.name}</strong>
          </span>
          <div className="undo-actions">
            <button className="undo-btn" onClick={restoreUndo} aria-label="Undo deletion">
              ↩ Undo
            </button>
            <button className="undo-dismiss" onClick={dismissUndo} aria-label="Dismiss notification">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Saved Sessions Modal */}
      <SavedSessionsModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        sessions={savedSessions}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
        activeSessionId={activeSessionId}
      />

      <header className="app-header">
        <div className="header-brand">
          <div className="logo-mark">✈</div>
          <div>
            <h1 className="app-title">Trip Planner</h1>
            <p className="app-tagline">Structured, interactive AI itineraries</p>
          </div>
        </div>

        <button
          type="button"
          className="header-saved-btn"
          onClick={() => setIsSessionsModalOpen(true)}
          title="View and reload saved trip sessions"
        >
          📁 Saved Trips ({savedSessions.length})
        </button>
      </header>

      <main className="app-main">
        {/* Input Section */}
        <section className="input-section" aria-label="Trip description input">
          <div className="input-card glass">
            <label className="input-label" htmlFor="trip-input">
              Where are you going? ✨
            </label>
            <textarea
              id="trip-input"
              ref={textareaRef}
              className="trip-textarea"
              placeholder="e.g. 5 days in Tokyo — I love street food, hidden spots, and anime culture. Travelling solo on a budget."
              value={inputValue}
              onChange={(e) => {
                if (e.target.value.length <= maxChars) setInputValue(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={4}
              aria-label="Describe your trip"
            />
            <div className="input-footer">
              <span className={`char-count ${charCount > maxChars * 0.9 ? "warn" : ""}`}>
                {charCount}/{maxChars}
              </span>
              <span className="keyboard-hint">⌘↵ to generate</span>
              <button
                id="generate-btn"
                className="generate-btn"
                onClick={handleSubmit}
                disabled={isLoading || !inputValue.trim()}
                aria-label="Generate itinerary"
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner" aria-hidden="true" />
                    Planning…
                  </>
                ) : (
                  <>✨ Plan my trip</>
                )}
              </button>
            </div>
          </div>

          <div className="examples-section">
            <p className="examples-label">Try an example:</p>
            <TripInput onSubmit={handleExampleClick} isLoading={isLoading} />
          </div>
        </section>

        {/* Output Section */}
        <section className="output-section" aria-label="Generated itinerary">
          {/* Warnings & Partial Recovery Banner */}
          {warnings.length > 0 && (
            <div className="warnings-bar" role="status">
              <div className="warnings-header">
                <strong>⚠️ Notice: Sanitized AI Output</strong>
              </div>
              <ul className="warnings-list">
                {warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {status === "idle" && (
            <div className="empty-state">
              <div className="empty-globe">🌍</div>
              <h2 className="empty-title">Your interactive itinerary will appear here</h2>
              <p className="empty-subtitle">
                Describe your dream trip above and click <strong>✨ Plan my trip</strong>
              </p>
              <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={loadDemo}
                  style={{
                    padding: "0.6rem 1.2rem",
                    background: "rgba(244, 63, 94, 0.15)",
                    border: "1px solid rgba(244, 63, 94, 0.4)",
                    color: "#fda4af",
                    borderRadius: "9999px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  ✨ Or explore interactive demo itinerary
                </button>
              </div>
              <div className="empty-features">
                <div className="feature-chip">📅 Day-by-day structure</div>
                <div className="feature-chip">🔀 Drag to reorder</div>
                <div className="feature-chip">📂 Click stops to expand</div>
                <div className="feature-chip">✕ Remove with Undo</div>
                <div className="feature-chip">🔁 AI refinement loop</div>
                <div className="feature-chip">💾 Save & reload sessions</div>
              </div>
            </div>
          )}

          {status === "loading" && <LoadingState />}

          {status === "error" && (
            <ErrorBanner error={error} onRetry={retry} onLoadDemo={loadDemo} />
          )}

          {status === "success" && itinerary && (
            <ItineraryView
              itinerary={itinerary}
              onReorderDays={reorderDays}
              onReorderStops={reorderStops}
              onRemoveStop={removeStop}
              onRemoveDay={removeDay}
              onRefine={refine}
              onClear={clearSession}
              onSaveSession={saveCurrentSession}
              onOpenSavedSessions={() => setIsSessionsModalOpen(true)}
              savedSessionsCount={savedSessions.length}
              isLoading={isLoading}
            />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Powered by Groq AI · Built with React + Vite</p>
      </footer>
    </div>
  );
}
