import { useState } from "react";

export default function ErrorBanner({ error, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);

  const messages = {
    network: {
      icon: "📡",
      title: "Connection Problem",
      body: "Couldn't reach the AI service. Check your internet connection.",
    },
    parse: {
      icon: "🔧",
      title: "Unexpected Response Format",
      body: "The AI returned an invalid or interrupted response. Retrying usually resolves this.",
    },
    schema: {
      icon: "📋",
      title: "Invalid Itinerary Structure",
      body: "The AI's response was missing key itinerary fields. Please try regenerating.",
    },
    api: {
      icon: "⚠️",
      title: "AI Service Error",
      body: error?.message || "Something went wrong while contacting the AI model.",
    },
    config: {
      icon: "🔑",
      title: "Missing API Key",
      body: "Add your VITE_GEMINI_API_KEY to the .env file and restart the server.",
    },
  };

  const meta = messages[error?.type] || messages.api;

  return (
    <div className="error-banner" role="alert">
      <span className="error-icon">{meta.icon}</span>
      <div className="error-content">
        <strong className="error-title">{meta.title}</strong>
        <p className="error-body">{meta.body}</p>

        {(error?.message || error?.rawSnippet) && (
          <div className="error-debug-section">
            <button
              type="button"
              className="debug-toggle-btn"
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {showDetails ? "Hide technical details ▴" : "Show technical details ▾"}
            </button>

            {showDetails && (
              <div className="debug-details-box">
                {error.message && (
                  <p>
                    <strong>Message:</strong> {error.message}
                  </p>
                )}
                {error.rawSnippet && (
                  <pre className="debug-raw-snippet">
                    <code>{error.rawSnippet}</code>
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {error?.type !== "config" && onRetry && (
        <button className="retry-btn" onClick={onRetry} aria-label="Retry generating itinerary">
          ↺ Retry
        </button>
      )}
    </div>
  );
}
