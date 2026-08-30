import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ITINERARY_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    tripTitle: { type: SchemaType.STRING, description: "Short catchy title for the trip" },
    destination: { type: SchemaType.STRING, description: "Main destination(s)" },
    totalDays: { type: SchemaType.NUMBER },
    days: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          dayNumber: { type: SchemaType.NUMBER },
          title: { type: SchemaType.STRING, description: "Theme or highlight of the day" },
          stops: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING, description: "unique short slug like 'louvre-museum'" },
                name: { type: SchemaType.STRING },
                type: {
                  type: SchemaType.STRING,
                  enum: ["attraction", "food", "hotel", "transport", "activity", "shopping", "nature"],
                },
                description: { type: SchemaType.STRING, description: "2-3 sentences about this stop" },
                duration: { type: SchemaType.STRING, description: "e.g. '2 hours'" },
                costRange: { type: SchemaType.STRING, description: "e.g. '$10-20 per person' or 'Free'" },
                tips: { type: SchemaType.STRING, description: "1 practical insider tip" },
                address: { type: SchemaType.STRING, description: "Short address or area" },
              },
              required: ["id", "name", "type", "description", "duration", "costRange", "tips"],
            },
          },
        },
        required: ["dayNumber", "title", "stops"],
      },
    },
  },
  required: ["tripTitle", "destination", "totalDays", "days"],
};

const SYSTEM_PROMPT = `You are an expert travel planner. Given a user's trip description, create a detailed, realistic, day-by-day itinerary.
Rules:
- Generate 1-7 days based on what the user describes
- Each day should have 3-6 stops
- Be specific: use real place names, realistic costs, and practical tips
- Spread activities logically (don't put dinner before lunch)
- Mix attraction types for variety
- Make the tripTitle catchy and memorable
- IDs must be unique slugs (kebab-case, no spaces)`;

const REFINE_SYSTEM_PROMPT = `You are an expert travel planner. You are given an EXISTING itinerary JSON and a user's modification request.
Modify the itinerary according to the user's instructions while preserving other good parts.
Return the updated itinerary JSON conforming strictly to the requested schema.`;

/**
 * Execute Gemini request with structured output and AbortSignal race-protection.
 */
async function callGemini(contents, systemInstruction, signal) {
  if (!API_KEY) {
    return {
      data: null,
      error: {
        type: "config",
        message: "No API key found. Add VITE_GEMINI_API_KEY to your .env file.",
      },
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ITINERARY_SCHEMA,
      },
    });

    const resultPromise = model.generateContent(contents);

    // Race against the abort signal
    const result = await Promise.race([
      resultPromise,
      new Promise((_, reject) => {
        if (signal?.aborted) reject(new DOMException("Aborted", "AbortError"));
        signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError"))
        );
      }),
    ]);

    if (signal?.aborted) {
      return { data: null, error: { type: "aborted" } };
    }

    const rawText = result.response.text();
    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Attempt to extract JSON even if enclosed in markdown
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
  } catch (err) {
    if (err.name === "AbortError") {
      return { data: null, error: { type: "aborted" } };
    }

    const isNetwork =
      err.message?.toLowerCase().includes("fetch") ||
      err.message?.toLowerCase().includes("network");

    return {
      data: null,
      error: {
        type: isNetwork ? "network" : "api",
        message: isNetwork
          ? "Network error — check your connection and try again."
          : `API error: ${err.message || "Unknown error"}`,
      },
    };
  }
}

/**
 * Generate a new itinerary from a user prompt.
 */
export async function generateItinerary(userPrompt, signal) {
  return callGemini(userPrompt, SYSTEM_PROMPT, signal);
}

/**
 * Refine an existing itinerary using a follow-up modification prompt.
 */
export async function refineItinerary(currentItinerary, refinementPrompt, signal) {
  const contents = `Current Itinerary JSON:\n${JSON.stringify(currentItinerary)}\n\nUser Modification Request:\n${refinementPrompt}`;
  return callGemini(contents, REFINE_SYSTEM_PROMPT, signal);
}
