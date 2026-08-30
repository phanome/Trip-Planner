export default function LoadingState() {
  return (
    <div className="loading-state" aria-live="polite" aria-label="Generating your itinerary">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <span className="spinner-globe">✈️</span>
      </div>
      <p className="loading-title">Planning your adventure…</p>
      <p className="loading-subtitle">Curating stops, tips, and hidden gems</p>
      <div className="skeleton-days">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-day" style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line long"></div>
            <div className="skeleton-stops">
              {[1, 2, 3].map((j) => (
                <div key={j} className="skeleton-stop" style={{ animationDelay: `${(i + j) * 0.1}s` }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
