export default function SavedSessionsModal({
  isOpen,
  onClose,
  sessions,
  onLoadSession,
  onDeleteSession,
  activeSessionId,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 id="modal-title" className="modal-title">
              📁 Saved Trip Sessions
            </h2>
            <p className="modal-subtitle">Reload, switch between, or manage your saved itineraries</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close saved trips modal">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {sessions.length === 0 ? (
            <div className="modal-empty-state">
              <span className="empty-icon">📭</span>
              <p>No saved trips yet.</p>
              <p className="subtext">Generate an itinerary and click <strong>💾 Save Trip</strong> to store it here.</p>
            </div>
          ) : (
            <div className="saved-sessions-list">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                const formattedDate = new Date(sess.savedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={sess.id} className={`saved-session-card ${isActive ? "active-session" : ""}`}>
                    <div className="session-info" onClick={() => { onLoadSession(sess); onClose(); }} role="button" tabIndex={0}>
                      <div className="session-title-row">
                        <strong className="session-title">{sess.title}</strong>
                        {isActive && <span className="active-badge">Active</span>}
                      </div>
                      <p className="session-meta">
                        📍 {sess.destination} · 📅 {sess.totalDays} day{sess.totalDays !== 1 ? "s" : ""} · 🎯 {sess.stopsCount} stops
                      </p>
                      <p className="session-date">Saved on {formattedDate}</p>
                    </div>

                    <div className="session-actions">
                      <button
                        className="session-load-btn"
                        onClick={() => {
                          onLoadSession(sess);
                          onClose();
                        }}
                        title="Load this itinerary"
                      >
                        📂 Load
                      </button>
                      <button
                        className="session-delete-btn"
                        onClick={() => onDeleteSession(sess.id)}
                        title="Delete this saved session"
                        aria-label={`Delete ${sess.title}`}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
