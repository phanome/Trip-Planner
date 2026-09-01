export function getApiKey() {
  if (typeof window !== "undefined") {
    const customKey =
      localStorage.getItem("groq_api_key") ||
      localStorage.getItem("trip_planner_api_key");
    if (customKey?.trim()) return customKey.trim();
  }
  return import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || "";
}

export function saveCustomApiKey(key) {
  if (typeof window !== "undefined") {
    if (key?.trim()) {
      localStorage.setItem("groq_api_key", key.trim());
      localStorage.setItem("trip_planner_api_key", key.trim());
    } else {
      localStorage.removeItem("groq_api_key");
      localStorage.removeItem("trip_planner_api_key");
    }
  }
}

const ITINERARY_JSON_SCHEMA_DESCRIPTION = `
Return ONLY a valid JSON object strictly matching this structure:
{
  "tripTitle": "Short catchy title for the trip",
  "destination": "Main destination(s)",
  "totalDays": 3,
  "days": [
    {
      "dayNumber": 1,
      "title": "Theme or highlight of the day",
      "stops": [
        {
          "id": "unique-slug-like-louvre-museum",
          "name": "Attraction or place name",
          "type": "attraction", // one of: "attraction", "food", "hotel", "transport", "activity", "shopping", "nature"
          "description": "2-3 sentences about what makes this place special",
          "duration": "e.g. 2 hours",
          "costRange": "e.g. $15-25 or Free",
          "tips": "1 practical insider tip for visitors",
          "address": "Short address or neighborhood"
        }
      ]
    }
  ]
}`;

const SYSTEM_PROMPT = `You are an expert travel planner. Given a user's trip description, create a detailed, realistic, day-by-day itinerary.
Rules:
- Generate 1-7 days based on what the user describes (default to 3 days if unspecified)
- Each day should have 3-6 stops
- Be specific: use real place names, realistic costs, and practical tips
- Spread activities logically (breakfast -> morning -> lunch -> afternoon -> dinner -> evening)
- Mix attraction types for variety (attraction, food, activity, nature, shopping)
- Make the tripTitle catchy and memorable
- IDs must be unique slugs (kebab-case, no spaces)

${ITINERARY_JSON_SCHEMA_DESCRIPTION}`;

const REFINE_SYSTEM_PROMPT = `You are an expert travel planner. You are given an EXISTING itinerary JSON and a user's modification request.
Modify the itinerary according to the user's instructions while preserving other good parts.
Return the updated itinerary JSON conforming strictly to the requested schema.

${ITINERARY_JSON_SCHEMA_DESCRIPTION}`;

/**
 * Call Groq Cloud API with model fallback and JSON parsing.
 */
async function callGroq(prompt, systemInstruction, signal) {
  const key = getApiKey();
  if (!key) {
    return {
      data: null,
      error: {
        type: "config",
        message: "No Groq API key configured. Enter your key (starts with gsk_) or set VITE_GROQ_API_KEY in your .env file.",
      },
    };
  }

  const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound"];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.5,
        }),
        signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMessage = errJson?.error?.message || response.statusText;

        if (response.status === 401 || response.status === 403) {
          return {
            data: null,
            error: {
              type: "config",
              message: "Invalid Groq API key. Please check your key.",
            },
          };
        }

        if (response.status === 429) {
          return {
            data: null,
            error: {
              type: "api",
              message: "Groq API rate limit reached. Please wait a moment and try again.",
            },
          };
        }

        // Try next fallback model if model not available
        if (response.status === 404 || errMessage.toLowerCase().includes("does not exist")) {
          lastError = errMessage;
          continue;
        }

        return {
          data: null,
          error: {
            type: "api",
            message: `Groq API error: ${errMessage}`,
            details: errMessage,
          },
        };
      }

      const resData = await response.json();
      const content = resData?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response received from Groq API.");
      }

      return parseRawOutput(content);
    } catch (err) {
      if (err.name === "AbortError") {
        return { data: null, error: { type: "aborted" } };
      }
      lastError = err;
    }
  }

  return {
    data: null,
    error: {
      type: "network",
      message: `Failed to connect to Groq: ${lastError?.message || "Unknown error"}`,
    },
  };
}

/**
 * Parse raw JSON text safely
 */
function parseRawOutput(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const match = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        return {
          data: null,
          error: {
            type: "parse",
            message: "The AI returned malformed data. Please try again.",
            raw: rawText.slice(0, 500),
          },
        };
      }
    } else {
      return {
        data: null,
        error: {
          type: "parse",
          message: "The AI returned an unexpected format. Please try again.",
          raw: rawText.slice(0, 500),
        },
      };
    }
  }

  return { data: parsed, error: null };
}

/**
 * Generate a new itinerary from a user prompt using Groq.
 */
export async function generateItinerary(userPrompt, signal) {
  return callGroq(userPrompt, SYSTEM_PROMPT, signal);
}

/**
 * Refine an existing itinerary using a follow-up modification prompt.
 */
export async function refineItinerary(currentItinerary, refinementPrompt, signal) {
  const contents = `Current Itinerary JSON:\n${JSON.stringify(currentItinerary)}\n\nUser Modification Request:\n${refinementPrompt}`;
  return callGroq(contents, REFINE_SYSTEM_PROMPT, signal);
}
