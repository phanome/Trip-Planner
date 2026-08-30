# ✈️ AI Trip Planner — Interactive Travel Companion

A fast, responsive React application that converts free-form travel ideas into rich, structured, day-by-day itineraries using Google Gemini's structured output API. Built from the ground up to guarantee resilient error recovery, zero unhandled crashes, and an interactive drag-and-drop user experience.

---

# Quickstart

# 1. Setup Environment
Ensure your `.env` file in the project root contains your Gemini API Key:
```env
VITE_GEMINI_API_KEY=AQ.Ab8RN6KoYYonvVC41-dPbcp8SkuM7nQT1Bj9bJ7HUiwdGZlgVA
```


# 2. Install & Run
```bash
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

# Architecture & Evaluation Overview

# 1. React & Frontend Architecture 
- **Functional Components & Hooks**: Clean component hierarchy with single-responsibility design (`TripInput`, `ItineraryView`, `DayCard`, `StopItem`, `ErrorBanner`, `LoadingState`).
- **State Machine Hook (`useItinerary`)**: Centralizes the `idle | loading | success | error` lifecycle.
- **Race Condition & Stale Response Protection**: Every request is assigned a monotonic `requestId`. If a user re-submits while a request is in flight, earlier responses are automatically discarded.
- **Lifecycle & Memory Management**: An `AbortController` is attached to every fetch and cleaned up on unmount or subsequent requests via `useEffect`.
- **Drag-and-Drop Reordering**: Integrated with `@dnd-kit/core` and `@dnd-kit/sortable` supporting both day-level reordering and stop-level reordering within days.
- **Session Persistence**: Automatic sync with `localStorage` allowing users to restore previous itineraries across page reloads.

# 2. AI Integration & Data Handling 
- **Model**: `gemini-3.6-flash` via the `@google/generative-ai` SDK.
- **Enforced JSON Response Schema**: Rather than relying purely on text prompting, the API specifies a formal `responseSchema` (`SchemaType.OBJECT`) which forces the model at the token decoding level to produce strict JSON conforming to:
  ```json
  {
    "tripTitle": "string",
    "destination": "string",
    "totalDays": "number",
    "days": [
      {
        "dayNumber": "number",
        "title": "string",
        "stops": [
          {
            "id": "string",
            "name": "string",
            "type": "attraction | food | hotel | transport | activity | shopping | nature",
            "description": "string",
            "duration": "string",
            "costRange": "string",
            "tips": "string",
            "address": "string"
          }
        ]
      }
    ]
  }
  ```
- **Refinement Loop (Stretch Goal)**: Follow-up modifications (e.g. *"Add a ramen place on Day 1"*) are sent alongside the existing itinerary JSON to preserve structure and edit incrementally.

# 3. Handling Bad AI Output & Edge Cases 
The app employs a multi-tier defense system against unpredictable AI output:

| Scenario / Bad Output | Handling & Recovery Strategy |
|---|---|
| **Markdown-Wrapped Output** | Strips ````json ... ```` formatting automatically before parsing. |
| **Malformed JSON / Truncated Text** | Employs regex sub-object extraction (`{...}` / `[...]`) with typed `parse` error fallback. |
| **Missing Fields / Auto-Healing** | `parseItinerary` generates fallback slugs, default stop types, and cleans missing descriptions without crashing. |
| **Partial Days / Invalid Stops** | Skips defective stops/days while keeping valid ones, rendering a **Notice Banner** with specific skipped item warnings. |
| **Network & Quota Failures** | Categorized into typed errors (`network`, `api`, `config`, `schema`, `parse`) with one-click **↺ Retry**. |
| **Technical Debug Accordion** | Errors contain an expandable technical debug drawer for inspectability without confusing regular users. |

### 4. UI/UX & Product Sense 
- **Collapsible Stops**: Stop cards are compact by default; clicking any stop smoothly expands rich details (insider tips, estimated costs, duration, address).
- **Undo Toast on Removal**: Deleting any stop or day triggers a 5-second toast with an instant `↩ Undo` button.
- **Dark Glassmorphism Design System**: Custom Vanilla CSS with radial gradient glow blobs, typography (Inter + Outfit), and smooth micro-interactions.
- **Copy Summary & Markdown Export**: One-click formatted markdown export to share or save itineraries.
- **Mobile Responsive**: Fully responsive layout with touch-friendly drag constraints.

# 5. Communication & Understanding 
- Comprehensive documentation detailing engineering choices, safety boundaries, and prompt-structure co-design.

---

# Stack

- **Framework**: React 19 + Vite 6
- **AI SDK**: `@google/generative-ai` (`gemini-3.6-flash`)
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Styling**: Vanilla CSS tokens & glassmorphism system
- **Typography**: Google Fonts (*Inter* & *Outfit*)

---

# Time Spent Breakdown

| Area | Effort |
|---|---|
| Architecture & State Machine Design (`useItinerary`) | ~30 min |
| Structured Schema & Gemini SDK Integration | ~30 min |
| Resilient JSON Sanitizer & Auto-healing (`parseItinerary`) | ~35 min |
| Interactive Components (`ItineraryView`, `DayCard`, `StopItem`) | ~45 min |
| Drag-and-Drop Implementation (`@dnd-kit`) | ~30 min |
| Collapsible Stops, Undo Toasts & Refinement Loop | ~30 min |
| Design System, Micro-animations & Mobile Responsiveness | ~40 min |
| Testing, Edge-case verification & Documentation | ~20 min |
| **Total** | **~4.3 hours** |

---

# Known Limitations
- **Cross-day Dragging**: Stops can be reordered within a given day; cross-day drag-and-drop can be enabled by unifying drop containers in a future release.
- **Client-side API Key**: In production environments, the Gemini API call should be routed through a backend server / edge function to protect API credentials.
