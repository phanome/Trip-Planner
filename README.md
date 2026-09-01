# AI Trip Planner — Interactive Travel Companion

A fast, responsive React application that converts free-form travel ideas into rich, structured, day-by-day itineraries using Groq's high-speed AI inference API. Built from the ground up to guarantee resilient error recovery, zero unhandled crashes, and an interactive drag-and-drop user experience.

---

## Quickstart

### 1. Setup Environment
Ensure your `.env` file in the project root contains your Groq API Key:
```env
VITE_GROQ_API_KEY=gsk_...
```

### 2. Install & Run
```bash
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

# Architecture & Evaluation Overview

## 1. React & Frontend Architecture 
- **Functional Components & Hooks**: Clean component hierarchy with single-responsibility design (`TripInput`, `ItineraryView`, `DayCard`, `StopItem`, `ErrorBanner`, `LoadingState`).
- **State Machine Hook (`useItinerary`)**: Centralizes the `idle | loading | success | error` lifecycle.
- **Race Condition & Stale Response Protection**: Every request is assigned a monotonic `requestId`. If a user re-submits while a request is in flight, earlier responses are automatically discarded.
- **Lifecycle & Memory Management**: An `AbortController` is attached to every fetch and cleaned up on unmount or subsequent requests via `useEffect`.
- **Drag-and-Drop Reordering**: Integrated with `@dnd-kit/core` and `@dnd-kit/sortable` supporting both day-level reordering and stop-level reordering within days.
- **Session Persistence**: Automatic sync with `localStorage` allowing users to restore previous itineraries across page reloads.

## 2. AI Integration & Data Handling 
- **Inference Engine**: Groq Cloud API with OpenAI-compatible chat completions and JSON mode.
- **Enforced JSON Response Schema**: The system instructions and JSON mode enforce strict JSON conforming to:
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

### 4. UI/UX & Product Sense (15%)
- **Collapsible Stops**: Stop cards are compact by default; clicking any stop smoothly expands rich details (insider tips, estimated costs, duration, address).
- **Undo Toast on Removal**: Deleting any stop or day triggers a 5-second toast with an instant `↩ Undo` button.
- **Dark Glassmorphism Design System**: Custom Vanilla CSS with radial gradient glow blobs, typography (Inter + Outfit), and smooth micro-interactions.
- **Copy Summary & Markdown Export**: One-click formatted markdown export to share or save itineraries.
- **Mobile Responsive**: Fully responsive layout with touch-friendly drag constraints.

# 5. Communication & Understanding 
- Comprehensive documentation detailing engineering choices, safety boundaries, and prompt-structure co-design.

---

##  Stack

- **Framework**: React 19 + Vite 6
- **AI SDK**: `@google/generative-ai` (`gemini-3.6-flash`)
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Styling**: Vanilla CSS tokens & glassmorphism system
- **Typography**: Google Fonts (*Inter* & *Outfit*)

---

##  Time Spent Breakdown
- **AI Engine**: Groq Cloud API (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `groq/compound`)
- **Drag and Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

---

## Breakdown of Implementation Time

| Task Area | Est. Time Spent |
|---|---|
| Initial Architecture, Types & Error Handling Setup | ~25 min |
| Structured Schema & Groq API Integration | ~30 min |
| Component Structure, DnD Kit Integration & Polish | ~45 min |
| Verification, Resilience Testing & Documentation | ~20 min |
| **Total** | **~2 hours** |

---

## Known Tradeoffs & Future Production Improvements
- **Client-side API Key**: In production environments, the Groq API call should be routed through a backend server / edge function to protect API credentials.
