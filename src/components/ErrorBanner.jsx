import { useState } from "react";
import { saveCustomApiKey, getApiKey } from "../api/groq";

export default function ErrorBanner({ error, onRetry, onLoadDemo }) {
  const [showDetails, setShowDetails] = useState(false);
  const [keyInput, setKeyInput] = useState(() => getApiKey() || "");
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (keyInput.trim()) {
      saveCustomApiKey(keyInput.trim());
      setKeySaved(true);
      if (onRetry) onRetry();
    }
  };

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
      title: "Groq API Key Required",
      body: "Please provide a valid Groq API key (starts with gsk_) to generate itineraries with AI.",
    },
  };

  const meta = messages[error?.type] || messages.api;

  return (
    <div className="error-banner" role="alert">
      <span className="error-icon">{meta.icon}</span>
      <div className="error-content">
        <strong className="error-title">{meta.title}</strong>
        <p className="error-body">{meta.body}</p>

        {error?.type === "config" && (
          <form className="api-key-inline-form" onSubmit={handleSaveKey}>
            <input
              type="password"
              className="api-key-input"
              placeholder="Paste Groq key (gsk_...) here"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setKeySaved(false);
              }}
            />
            <button type="submit" className="api-key-save-btn">
              {keySaved ? "✓ Saved!" : "Save & Retry"}
            </button>
          </form>
        )}

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

      <div className="error-actions">
        {onLoadDemo && (
          <button
            type="button"
            className="demo-btn"
            onClick={onLoadDemo}
            title="Preview all interactive features with sample Iceland data"
          >
            ✨ Load Demo Trip
          </button>
        )}
        {error?.type !== "config" && onRetry && (
          <button className="retry-btn" onClick={onRetry} aria-label="Retry generating itinerary">
            ↺ Retry
          </button>
        )}
      </div>
    </div>
  );
}
