import { useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StopItem from "./StopItem";

function SortableStop({ stop, dayId, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `${dayId}::${stop.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <StopItem
        stop={stop}
        onRemove={() => onRemove(dayId, stop.id)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function DayCard({ day, onRemoveDay, onRemoveStop, dragHandleProps }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`day-card ${collapsed ? "collapsed" : ""}`}>
      <div className="day-header">
        <span className="day-drag-handle" {...dragHandleProps} title="Drag to reorder day">
          ⠿
        </span>
        <div className="day-title-block" onClick={() => setCollapsed((c) => !c)}>
          <span className="day-label">Day {day.dayNumber}</span>
          <h2 className="day-title">{day.title}</h2>
          <span className="stop-count">{day.stops.length} stops</span>
        </div>
        <div className="day-actions">
          <button
            className="collapse-btn"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand day" : "Collapse day"}
          >
            {collapsed ? "▼" : "▲"}
          </button>
          <button
            className="remove-day-btn"
            onClick={() => onRemoveDay(day.id)}
            aria-label={`Remove Day ${day.dayNumber}`}
            title="Remove this day"
          >
            🗑
          </button>
        </div>
      </div>

      <div className="day-body">
        <SortableContext
          items={day.stops.map((s) => `${day.id}::${s.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="stops-list">
            {day.stops.map((stop) => (
              <SortableStop
                key={stop.id}
                stop={stop}
                dayId={day.id}
                onRemove={onRemoveStop}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
