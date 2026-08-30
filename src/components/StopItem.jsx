import { useState } from "react";

const TYPE_META = {
  attraction: { emoji: "🏛️", label: "Attraction", color: "#6c8cff" },
  food: { emoji: "🍽️", label: "Food & Drink", color: "#ff8c69" },
  hotel: { emoji: "🏨", label: "Stay", color: "#a78bfa" },
  transport: { emoji: "🚆", label: "Transport", color: "#60c0a0" },
  activity: { emoji: "🎯", label: "Activity", color: "#fbbf24" },
  shopping: { emoji: "🛍️", label: "Shopping", color: "#f472b6" },
  nature: { emoji: "🌿", label: "Nature", color: "#34d399" },
};

export default function StopItem({ stop, onRemove, dragHandleProps }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const meta = TYPE_META[stop.type] || TYPE_META.attraction;

  const toggleExpand = (e) => {
    // Avoid toggling when clicking drag handle or remove button
    if (e.target.closest(".drag-handle") || e.target.closest(".remove-btn")) {
      return;
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={`stop-item ${isExpanded ? "expanded" : "collapsed"}`}>
      <div
        className="stop-header clickable"
        onClick={toggleExpand}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
      >
        <span
          className="drag-handle"
          {...dragHandleProps}
          title="Drag to reorder stop"
          aria-label="Drag stop"
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </span>

        <span
          className="stop-type-badge"
          style={{ background: meta.color + "22", color: meta.color }}
        >
          {meta.emoji} {meta.label}
        </span>

        <span className="stop-name">{stop.name}</span>

        <div className="stop-meta-inline">
          {stop.duration && stop.duration !== "—" && (
            <span className="meta-chip">⏱ {stop.duration}</span>
          )}
          {stop.costRange && stop.costRange !== "—" && (
            <span className="meta-chip">💰 {stop.costRange}</span>
          )}
        </div>

        <span className="expand-indicator" title={isExpanded ? "Collapse details" : "Expand details"}>
          {isExpanded ? "▲" : "▼"}
        </span>

        <button
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Remove stop"
          aria-label={`Remove ${stop.name}`}
        >
          ✕
        </button>
      </div>

      {isExpanded && (
        <div className="stop-details animate-expand">
          {stop.address && <p className="stop-address">📍 {stop.address}</p>}
          {stop.description && <p className="stop-description">{stop.description}</p>}
          {stop.tips && (
            <div className="stop-tip">
              <span className="tip-label">💡 Tip</span>
              <span>{stop.tips}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
