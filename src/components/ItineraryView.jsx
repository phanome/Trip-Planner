import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DayCard from "./DayCard";

function SortableDay({ day, onRemoveDay, onRemoveStop }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: day.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DayCard
        day={day}
        onRemoveDay={onRemoveDay}
        onRemoveStop={onRemoveStop}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function ItineraryView({
  itinerary,
  onReorderDays,
  onReorderStops,
  onRemoveStop,
  onRemoveDay,
  onRefine,
  onClear,
  onSaveSession,
  onOpenSavedSessions,
  savedSessionsCount,
  isLoading,
}) {
  const [refineText, setRefineText] = useState("");
  const [copied, setCopied] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const isDayDrag = activeId.startsWith("day-") && !activeId.includes("::");

    if (isDayDrag) {
      const days = itinerary.days;
      const fromIndex = days.findIndex((d) => d.id === activeId);
      const toIndex = days.findIndex((d) => d.id === overId);
      if (fromIndex !== -1 && toIndex !== -1) {
        onReorderDays(fromIndex, toIndex);
      }
    } else {
      const [activeDayId] = activeId.split("::");
      const [overDayId] = overId.split("::");

      if (activeDayId !== overDayId) return;

      const day = itinerary.days.find((d) => d.id === activeDayId);
      if (!day) return;

      const fromIndex = day.stops.findIndex((s) => `${activeDayId}::${s.id}` === activeId);
      const toIndex = day.stops.findIndex((s) => `${activeDayId}::${s.id}` === overId);
      if (fromIndex !== -1 && toIndex !== -1) {
        onReorderStops(activeDayId, fromIndex, toIndex);
      }
    }
  }

  const handleCopySummary = () => {
    let md = `# ${itinerary.tripTitle}\n**Destination**: ${itinerary.destination} (${itinerary.totalDays} days)\n\n`;
    itinerary.days.forEach((d) => {
      md += `## Day ${d.dayNumber}: ${d.title}\n`;
      d.stops.forEach((s) => {
        md += `- **${s.name}** [${s.type}] (${s.duration || "N/A"}) - ${s.description}\n`;
        if (s.tips) md += `  *Tip: ${s.tips}*\n`;
      });
      md += "\n";
    });

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleRefineSubmit = (e) => {
    e.preventDefault();
    if (!refineText.trim() || isLoading) return;
    onRefine(refineText.trim());
    setRefineText("");
  };

  return (
    <div className="itinerary-view">
      <div className="itinerary-header">
        <div className="itinerary-title-block">
          <h1 className="itinerary-title">{itinerary.tripTitle}</h1>
          <p className="itinerary-subtitle">
            📍 {itinerary.destination} · {itinerary.totalDays} day{itinerary.totalDays !== 1 ? "s" : ""} · {itinerary.days.reduce((acc, d) => acc + d.stops.length, 0)} total stops
          </p>
        </div>

        <div className="itinerary-actions">
          <button
            type="button"
            className="action-pill-btn highlight"
            onClick={onSaveSession}
            title="Save this trip session locally to reload later"
          >
            💾 Save Trip
          </button>
          <button
            type="button"
            className="action-pill-btn"
            onClick={onOpenSavedSessions}
            title="Open saved trip sessions"
          >
            📁 Saved ({savedSessionsCount})
          </button>
          <button
            type="button"
            className="action-pill-btn"
            onClick={handleCopySummary}
            title="Copy formatted markdown itinerary to clipboard"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
          <button
            type="button"
            className="action-pill-btn danger"
            onClick={onClear}
            title="Reset and start a fresh itinerary"
          >
            ✕ Reset
          </button>
        </div>
      </div>

      {/* Interactive Refinement Loop */}
      <div className="refinement-card glass">
        <form onSubmit={handleRefineSubmit} className="refinement-form">
          <label htmlFor="refine-input" className="refine-label">
            ✨ Tweak with AI (Refinement Loop):
          </label>
          <div className="refine-input-row">
            <input
              id="refine-input"
              type="text"
              className="refine-input"
              placeholder="e.g. 'Add a budget ramen spot to Day 1', 'Make Day 2 more relaxed'..."
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="refine-btn"
              disabled={isLoading || !refineText.trim()}
            >
              {isLoading ? "Updating…" : "Update"}
            </button>
          </div>
        </form>
      </div>

      <div className="reorder-banner">
        <span>💡 Tip: Click any stop to expand details. Drag ⠿ to reorder stops or days.</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={itinerary.days.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="days-list">
            {itinerary.days.map((day) => (
              <SortableDay
                key={day.id}
                day={day}
                onRemoveDay={onRemoveDay}
                onRemoveStop={onRemoveStop}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
