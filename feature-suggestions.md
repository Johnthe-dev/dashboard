# Focal — Feature Suggestions

This file lists six features to consider adding as new modules or core functionality. Each entry includes a brief description and relevant implementation notes for the Focal monorepo architecture.

---

## Modules

### 1. Habit Tracker
A grid of days × habits where each cell is checked off on completion. Common in Notion, Streaks, and similar apps.

- Data shape: array of habits (name, color), plus a set of completed `YYYY-MM-DD` × habit-id pairs
- Persisted via a new repository interface in `packages/logic/src/interfaces/`
- UI: ruled-paper grid aesthetic; fits naturally with the stationery design language
- Reuses the same persistence pattern as TodoList

### 2. Pomodoro / Focus Timer
Cycles automatically between work and break intervals, tracks session count, and resets on demand. Distinct from the existing CountdownTimer.

- State: current phase (work/break), seconds remaining, completed session count
- The circular canvas ring from CountdownTimer could be reused or adapted
- No external dependencies

### 3. Quick Links
A pinboard of named URLs — acts like a mini bookmark bar styled as a sticky note. The most common feature in browser start-page dashboards (Momentum, Start.me, Bonjourr).

- Data shape: ordered array of `{ label: string, url: string }`
- Simple to build; high daily utility
- Inline add/edit/delete UX; no external dependencies

### 4. Mini Calendar
A compact month-at-a-glance view with optional event dots. Standard in dashboards from Google to Fantastical sidebars.

- No external API needed
- Optional: allow user to mark dates with a dot/label (stored in persistence layer)
- Pairs naturally with CountdownTimer for deadline awareness

### 5. Weather
Current conditions + a 3-day forecast strip. Found in virtually every ambient dashboard (Momentum, Widgetsmith, iOS Today view).

- Recommended API: **Open-Meteo** — free, no API key required, no account needed
- Requires geolocation permission or a user-entered location
- The only suggested module with an external dependency

---

## Core Functionality

### 6. Export / Import as JSON
Allows the entire dashboard state (module layout, content, themes) to be exported as a JSON file and re-imported on another machine. Enables backup, sharing, and cross-device portability.

- Export: serialize the full IndexedDB state from `packages/persistence-web` to a JSON blob and trigger a file download
- Import: parse the JSON, validate the shape, and write it back into IndexedDB (with a confirmation prompt to avoid accidental overwrites)
- No new repository interface needed — this is a snapshot of all existing repositories
- A good place for the UI: a button in the global FAB group or a settings panel
