/**
 * Validates, cleans, and auto-heals raw LLM response.
 * Resilient against missing fields, altered types, markdown wrapping, and malformed lists.
 * Returns { data, warnings } or throws a structured typed error.
 */
export function parseItinerary(rawInput) {
  const warnings = [];
  let raw = rawInput;

  // Handle case where raw input is still a string
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      // Strip markdown code fences if present
      const cleaned = raw
        .replace(/```(?:json)?\s*/gi, "")
        .replace(/```\s*$/g, "")
        .trim();

      try {
        raw = JSON.parse(cleaned);
      } catch {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            raw = JSON.parse(jsonMatch[0]);
          } catch {
            throw {
              type: "parse",
              message: "Unable to parse the AI output as JSON.",
              rawSnippet: cleaned.slice(0, 300),
            };
          }
        } else {
          throw {
            type: "parse",
            message: "No recognizable JSON found in the AI response.",
            rawSnippet: raw.slice(0, 300),
          };
        }
      }
    }
  }

  if (!raw || typeof raw !== "object") {
    throw {
      type: "schema",
      message: "The AI response was not a structured object.",
    };
  }

  // Support both { days: [...] } or direct array of days [...]
  const rawDays = Array.isArray(raw) ? raw : Array.isArray(raw.days) ? raw.days : [];

  if (rawDays.length === 0) {
    throw {
      type: "schema",
      message: "No itinerary days could be extracted from the AI output.",
    };
  }

  const validDays = [];

  rawDays.forEach((day, index) => {
    if (!day || typeof day !== "object") {
      warnings.push(`Day at position ${index + 1} was not formatted properly and was skipped.`);
      return;
    }

    const dayNumber = typeof day.dayNumber === "number" ? day.dayNumber : index + 1;
    const title = day.title || day.theme || `Day ${dayNumber} Exploration`;

    const rawStops = Array.isArray(day.stops)
      ? day.stops
      : Array.isArray(day.activities)
      ? day.activities
      : [];

    const validStops = [];

    rawStops.forEach((stop, stopIdx) => {
      if (!stop || typeof stop !== "object") return;

      const name = stop.name || stop.title || stop.place;
      if (!name) {
        warnings.push(`Day ${dayNumber}: skipped a stop with no title.`);
        return;
      }

      const validTypes = ["attraction", "food", "hotel", "transport", "activity", "shopping", "nature"];
      const rawType = (stop.type || "attraction").toLowerCase();
      const sanitizedType = validTypes.includes(rawType) ? rawType : "attraction";

      validStops.push({
        id: stop.id ? String(stop.id) : `stop-${dayNumber}-${stopIdx}-${slugify(name)}`,
        name: String(name).trim(),
        type: sanitizedType,
        description: stop.description || stop.details || "No description provided.",
        duration: stop.duration || "—",
        costRange: stop.costRange || stop.cost || "—",
        tips: stop.tips || stop.tip || "",
        address: stop.address || stop.location || "",
      });
    });

    if (validStops.length === 0) {
      warnings.push(`Day ${dayNumber} ("${title}") had no valid stops and was omitted.`);
      return;
    }

    validDays.push({
      id: `day-${dayNumber}-${index}`,
      dayNumber,
      title: String(title).trim(),
      stops: validStops,
    });
  });

  if (validDays.length === 0) {
    throw {
      type: "schema",
      message: "Could not find any usable days or stops in the response.",
    };
  }

  const tripTitle = raw.tripTitle || raw.title || `${raw.destination || "Custom"} Itinerary`;
  const destination = raw.destination || "Destination";

  return {
    data: {
      tripTitle: String(tripTitle).trim(),
      destination: String(destination).trim(),
      totalDays: validDays.length,
      days: validDays,
    },
    warnings,
  };
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
}
