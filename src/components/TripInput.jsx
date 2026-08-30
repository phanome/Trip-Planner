const EXAMPLES = [
  "5 days in Tokyo — I love street food, anime culture, and hidden local spots. Travelling solo.",
  "A romantic 3-day weekend in Paris with my partner. We enjoy art, good wine, and scenic walks.",
  "Road trip through Iceland for 7 days — Northern Lights, waterfalls, and volcanic landscapes.",
  "4 days in New York City, first time visitor. Mix of iconic sights and local Brooklyn vibes.",
];

export default function TripInput({ onSubmit, isLoading }) {
  return (
    <div style={{ width: "100%" }}>
      <div className="example-chips">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            className="chip"
            onClick={() => onSubmit(ex)}
            disabled={isLoading}
            type="button"
          >
            {ex.slice(0, 48)}…
          </button>
        ))}
      </div>
    </div>
  );
}
