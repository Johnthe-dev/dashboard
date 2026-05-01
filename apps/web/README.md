# Focal

A personal productivity dashboard and developer utility suite. Modules live on a free-form canvas that you drag, resize, and theme independently. A separate Dev Tools section provides eight browser-based utilities for everyday programming tasks.

---

## Table of Contents

- [Getting started](#getting-started)
- [Dashboard](#dashboard)
  - [Canvas controls](#canvas-controls)
  - [Global controls](#global-controls)
  - [Modules](#modules)
- [Dev Tools](#dev-tools)
  - [Utilities](#utilities)
- [Data & persistence](#data--persistence)
- [Developer documentation](#developer-documentation)

---

## Getting started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9 (workspaces support required)

### Install and run

```bash
# from the repo root
npm install
npm run web          # starts dev server at http://localhost:5173
```

### Build

```bash
npm run build:web    # type-checks then produces dist/ inside apps/web
```

Output: `~435 kB` JS / `~80 kB` CSS unminified; `~133 kB` / `~12 kB` gzipped.

---

## Dashboard

### Canvas controls

| Action | How |
|---|---|
| **Add a module** | Click the **+** button (bottom-right) |
| **Move a module** | Drag by the module header |
| **Resize a module** | Drag the resize handle (bottom-right corner of the module) |
| **Remove a module** | Click **✕** in the module header |
| **Change a module's theme** | Click the coloured dot in the header |

### Global controls

All four action buttons sit in the bottom-right corner of the dashboard, stacked vertically above the main **+** button.

| Button | What it does |
|---|---|
| **⋯** | Opens the Export / Import panel |
| **◑ (split circle)** | Opens the global theme picker — sets every module to the same theme at once |
| **◑ (half-dark)** | Toggles dark mode (canvas switches from warm parchment to dark grey) |
| **Aa** | Toggles large text mode — scales all text up ~30%, useful on 4K displays |

A **?** button is fixed to the bottom-left corner. Click it to restart the onboarding tour at any time.

### Onboarding tour

The first time you open Focal a short tour walks through each UI element. It highlights the current element with a spotlight, explains what it does, and lets you step forward/back or skip. Press **Escape** at any time to dismiss it.

---

## Modules

Each module is self-contained, persists its own data in IndexedDB, and supports eight colour themes. Themes are picked per module by clicking the coloured dot in the header.

### Countdown Timer

A circular ring timer inspired by the Time Timer format. The ring drains as time elapses and turns a highlight colour when the countdown reaches zero.

**How to use:**
1. Set the duration in the number input (minutes).
2. Click **Start** to begin. The ring draws down clockwise from the top.
3. Use **Pause**, **Reset**, or change the duration mid-run.

**Accessibility:** An off-screen live region announces the remaining time every minute so screen readers stay informed without being spammed.

---

### To-Do List

A checklist with optional subtasks per item.

**How to use:**
- Type a task in the input at the top and press **Enter** or click **+** to add it.
- Click the checkbox to mark a task done (it dims and gains a strikethrough).
- Click the **⊕** button to the right of a task to expand its subtask panel. The button turns into a `done/total` counter once subtasks exist.
- In the subtask panel, type in the dashed input and press **Enter** to add a subtask.
- The **Clear X completed** button at the bottom removes all checked tasks at once.

---

### Note Pad

A plain freeform text area — type anything. Content saves automatically on every keystroke.

---

### Time Tracker

Tracks elapsed time across multiple named projects simultaneously. Each row is an independent stopwatch.

**How to use:**
- Click **+ Add project** and type a name to create a tracker.
- Click the ▶ button to start timing; click ⏸ to pause. Multiple projects can run at the same time.
- Hover a row to reveal the rename (✎) and delete (✕) buttons.
- The total elapsed time across all running projects is shown at the bottom.

---

### Habit Tracker

A 7-day × N-habits grid. Each cell represents one habit on one day. Filled cells are completed; empty cells are not.

**How to use:**
- Click **+ Add habit** at the top, type a name, and press **Enter**. A colour is assigned automatically from an 8-colour preset palette.
- Click any cell in today's column (or any past day) to toggle its completion.
- Hover a habit name in the header to reveal its **✕** delete button.

---

### Pomodoro Timer

An auto-cycling focus timer. Work sessions (25 min) alternate with short breaks (5 min). After every four work sessions a long break (15 min) fires instead.

**How to use:**
1. Click **Start**. The SVG ring counts down and the phase label shows **WORK**, **BREAK**, or **LONG BREAK**.
2. Four dot indicators below the ring fill as work sessions are completed.
3. The timer advances to the next phase automatically when time runs out.
4. Use **Pause**, **Reset** (returns to the beginning of the current phase), or **Skip** (jumps to the next phase immediately).

> **Note:** Session count resets when the page is reloaded — Pomodoro state is intentionally not persisted.

---

### Quick Links

A sticky-note-style bookmark bar. Click any link to open it in a new tab.

**How to use:**
- Fill in the **Label** and **URL** fields at the bottom and press **Enter** or **+** to add a link. The `https://` protocol is prepended automatically if omitted.
- Hover a link row to reveal the **✎** edit button and **✕** delete button.
- Click **✎** to edit the label or URL inline; press **Enter** or click **✓** to save, **Escape** to cancel.

---

### Mini Calendar

A compact month-at-a-glance view. Navigate months with the **‹** and **›** arrows. Today's date is highlighted with a filled accent circle.

**How to use:**
- Click any date in the current month to toggle a mark (a small dot appears below the number).
- Marked dates persist in IndexedDB so they survive page reloads.
- Days outside the displayed month are shown at reduced opacity and are not interactive.

---

### Lava Lamp

An ambient metaball animation. Blobs rise and fall, merging when they meet. Colours are driven by the module's active theme. Respects `prefers-reduced-motion`.

---

### Kaleidoscope

A 12-segment mirrored kaleidoscope. Geometric shapes orbit and connect, reflected across each wedge boundary for a symmetrical pattern.

**Controls (shown on hover):**
- **−** / **+** buttons zoom the source pattern in or out.
- Scroll the mouse wheel while hovering to zoom continuously.

Respects `prefers-reduced-motion`.

---

### Wave Box

An animated ocean scene with two modes, toggled by buttons that appear on hover.

| Mode | Character |
|---|---|
| **Ripples** | Three gentle sine waves with low amplitude and slow speed |
| **Waves** | Three larger waves with a second harmonic for sharper crests, plus white foam particles at each crest |

Respects `prefers-reduced-motion`.

---

### Date Display

Shows the current day of the week, day number, and abbreviated month name. Updates automatically at midnight. Font size scales responsively with the module's width using `clamp`.

---

## Dev Tools

Navigate to **Dev Tools** via the link in the top-left corner of the dashboard (next to "Focal"). Use the tab bar at the top to switch between tools. Click **← Focal** to return to the dashboard.

All tools are browser-only — no data is sent anywhere.

---

## Utilities

### JSON Prettifier / Validator

Formats and validates JSON text.

| Button | Action |
|---|---|
| **Format** | Parses the input and re-serialises it with 2-space indentation |
| **Minify** | Parses and re-serialises with no whitespace |
| **Validate** | Checks whether the input is valid JSON without modifying the output panel |
| **Clear** | Resets both panels |
| **Copy** | Copies the formatted output to the clipboard |

A status bar below the input shows `✓ Valid JSON` (green) or the parse error message (red) after any operation.

---

### JWT Decoder

Decodes the header and payload of a JWT token. Paste a token (three base64url-encoded segments separated by dots) into the textarea and click **Decode** or press `Ctrl+Enter`.

The three decoded sections are displayed below:

- **Header** — algorithm and token type
- **Payload** — claims; `exp`, `iat`, and `nbf` fields are automatically converted to human-readable UTC dates alongside the raw epoch value
- **Signature** — the raw base64url string

> **Note:** This tool only decodes — it does not verify the signature. Verification requires the server-side secret or public key.

---

### Base64 Encoder / Decoder

Converts text to and from Base64.

- Use the **Encode** / **Decode** mode toggle to switch direction.
- Check **URL-safe (RFC 4648)** to use `-` and `_` instead of `+` and `/`, with padding stripped — the standard for JWT and URL-embedded data.
- The **→** button runs the operation; **⇄** swaps the output back into the input and flips the mode.

---

### Epoch / Timestamp Converter

Two independent converters on one screen.

**Epoch → Date:**
1. Enter a Unix timestamp in the left input.
2. Select **s** (seconds) or **ms** (milliseconds) with the unit toggle.
3. Results show UTC, local time, ISO 8601, and a relative description ("3 days ago").
4. Click **Now** to populate with the current timestamp.

**Date → Epoch:**
1. Use the datetime-local picker to choose a date and time.
2. Results show the epoch in both seconds and milliseconds, plus a relative description.
3. Click **Now** to populate with the current moment.

---

### Regex Tester

Tests regular expressions against a string with live match highlighting.

**Controls:**
- Type a pattern into the `/pattern/` input. The flags area shows the active flag string.
- Toggle individual flags with the **g i m s** buttons.
- Switch between **Test** mode (highlighted matches) and **Replace** mode (substitution output).

**Test mode:** Matches are highlighted in amber in the read-only result panel. A match list below shows each match's text, character range, and any capture groups.

**Replace mode:** Enter a replacement string (supports `$1`, `$2`, etc. for capture groups). The result panel shows the full string after substitution.

---

### Diff Tool

Compares two blocks of text line-by-line using an LCS algorithm.

- Paste the original text on the left and the modified text on the right.
- Switch to **JSON** mode to auto-parse and pretty-print both sides before diffing — whitespace-only differences are normalised away.
- Click **⇄ Swap** to reverse left and right.
- The diff output shows line numbers for both sides, `+`/`−` prefixes, and green/red row backgrounds. A stats bar at the top shows counts of added, removed, and unchanged lines.

> Input is capped at 3 000 lines per side to keep the LCS table from becoming prohibitively large.

---

### URL Encoder / Decoder

Two tabs:

**Encode / Decode:**
- Select **Encode** to run `encodeURIComponent` on the input, or **Decode** to run `decodeURIComponent`.
- The output panel updates on each button click and includes a **Copy** button.

**Parse URL:**
- Paste any URL into the input field. `https://` is prepended automatically if no scheme is present.
- The breakdown table shows: protocol, hostname, port, username/password (if present), pathname, and hash.
- Query parameters are expanded into a separate key / value table.

---

### Hash Generator

Generates four hash digests from an input string simultaneously.

| Algorithm | Implementation |
|---|---|
| MD5 | Pure JavaScript (Web Crypto API does not support MD5) |
| SHA-1 | Web Crypto API (`crypto.subtle.digest`) |
| SHA-256 | Web Crypto API |
| SHA-512 | Web Crypto API |

Type or paste text, then click **Generate hashes** or press `Ctrl+Enter`. Toggle **Uppercase** to switch the hex output between lower and upper case. Each row has its own **Copy** button.

---

## Data & persistence

### Storage

All dashboard data is stored in **IndexedDB** (`dashboard-db`, current schema version: 3). Nothing is sent to a server.

| Store | Key | Contains |
|---|---|---|
| `grid-layout` | `"items"` | Module positions, sizes, kinds, and theme IDs |
| `todos` | auto-increment `id` | To-do items and their subtasks |
| `notes` | `moduleId` | Note pad content per module |
| `projects` | auto-increment `id` | Time tracker entries per module |
| `countdowns` | `moduleId` | Countdown timer duration and state |
| `habits` | `moduleId` | Habit definitions and completion records |
| `quick-links` | `moduleId` | Link lists per module |
| `calendars` | `moduleId` | Marked dates per calendar module |

### Cleanup on module removal

When a module is deleted from the dashboard, its associated store entries are deleted immediately before the grid layout is updated. Visual/stateless modules (Lava Lamp, Kaleidoscope, Wave Box, Date Display, Pomodoro) have no store entries to clean up.

### Export and import

Open the **⋯** settings panel (bottom-right) to export or import the full dashboard state.

**Export** serialises all stores to a JSON file named `focal-backup-YYYY-MM-DD.json` and triggers a browser download.

**Import** reads a backup file, shows a confirmation prompt, clears all current data, and restores from the file. The page reloads automatically to pick up the restored state. Import requires a file with `"version": 1` at the root.

---

## Developer documentation

### Monorepo structure

```
focal/
├── packages/
│   ├── logic/              # Platform-agnostic types, interfaces, hooks, constants
│   └── persistence-web/    # IndexedDB implementations of the repository interfaces
└── apps/
    └── web/                # React + Vite application
```

### Key technology versions

| Package | Version |
|---|---|
| React | 19.2.5 |
| TypeScript | 6.0.3 |
| Vite | 8.0.8 |
| TanStack Router | 1.168.25 |
| react-grid-layout | 2.2.3 |
| idb | (latest at install time) |

### Architecture rule: logic / UI separation

Business logic must never live in UI components.

- **`packages/logic/src/`** — all hooks, types, interfaces, and constants. Zero React Native or browser-specific imports. Platform-agnostic.
- **`packages/persistence-web/src/`** — IndexedDB implementations of the repository interfaces. The only place that touches `idb`.
- **`apps/web/src/`** — React components and SCSS only. Components call hooks from `@focal/logic`; they do not query storage directly.

When adding a new module or feature that persists data, follow this sequence:

1. Define the data shape in `packages/logic/src/types/`
2. Add the repository interface in `packages/logic/src/interfaces/`
3. Write the hook in `packages/logic/src/hooks/` using `usePersistence()`
4. Implement the repository in `packages/persistence-web/src/db/`
5. Bump `DB_VERSION` in `packages/persistence-web/src/db/schema.ts` and add an `if (oldVersion < N)` upgrade block in `client.ts`
6. Instantiate the repository in `WebPersistenceProvider.tsx` and add it to the context value
7. Add the new repo key to `PersistenceContextValue` in `PersistenceContext.tsx`
8. Export new types, interfaces, and hooks from `packages/logic/src/index.ts`
9. Build the UI component in `apps/web/src/`

### Repository pattern

Each data domain has:
- An interface in `packages/logic/src/interfaces/` (e.g. `ITodoRepository`)
- An IndexedDB implementation in `packages/persistence-web/src/db/` (e.g. `IdbTodoRepository`)

All repositories follow the same method conventions:

| Method pattern | Purpose |
|---|---|
| `getX(moduleId)` | Load a single module's data on mount |
| `putX(record)` | Upsert — used for both create and update |
| `deleteX(id \| moduleId)` | Remove one record |
| `deleteXsByModule(moduleId)` | Remove all records for a module (called on module removal) |
| `getAllXs()` | Full-store read used by the export hook |
| `clearAllXs()` | Full-store wipe used by the import hook |

### Adding a new dashboard module

1. Add the `ModuleKind` string literal to `packages/logic/src/types/modules.ts`
2. Add the registry entry to `packages/logic/src/constants/modules.ts` (`label`, `description`, `defaultW/H`, `minW/H`, `maxW/H`)
3. If the module persists data: follow the repository pattern above; add a `deleteXByModule` call to the `cleanupModuleData` switch in `useGrid.ts`
4. Create `apps/web/src/components/modules/YourModule/YourModule.tsx` and `YourModule.module.scss`
5. Add `case 'your-module': return <YourModule .../>` to the switch in `Dashboard.tsx`

### Routing

Routes are defined in `apps/web/src/router.tsx` using TanStack Router's code-based API. The route tree is:

```
/ (root — bare Outlet)
├── /                 → Dashboard (App.tsx)
└── /utilities        → UtilitiesLayout (sticky nav + Outlet)
    ├── /             → redirects to /utilities/json
    ├── /json
    ├── /jwt
    ├── /base64
    ├── /epoch
    ├── /regex
    ├── /diff
    ├── /url
    └── /hash
```

When adding a new utility: create a route with `createRoute`, add it as a child of `utilitiesRoute`, add a new entry to the `TOOLS` array in `UtilitiesLayout.tsx`.

### Theming system

Eight colour themes are defined in two places that must stay in sync:

| File | Role |
|---|---|
| `packages/logic/src/constants/themes.ts` | Source of truth — `THEME_COLORS` record and `THEMES` array with swatch colours |
| `apps/web/src/styles/_themes.scss` | CSS custom properties (`.theme-sticky-yellow { --module-bg: ...; }`) |

Theme CSS variables available inside any module:

```
--module-bg          background colour
--module-header-bg   header strip colour
--module-text        primary text
--module-text-muted  secondary / placeholder text
--module-accent      buttons, highlights, focus rings
--module-border      borders and dividers
--module-input-bg    input field backgrounds
```

Theme swatches are rendered as `linear-gradient(135deg, headerBg 50%, text 50%)` — a diagonal split that remains visible regardless of which theme the module currently uses.

### Canvas modules

`LavaLamp`, `Kaleidoscope`, `CountdownTimer` ring, and `WaveBox` draw to an HTML5 Canvas.

**CSS custom properties do not work inside Canvas 2D drawing calls.** `ctx.fillStyle = 'var(--module-accent)'` is treated as an invalid colour string and silently falls back to black. Instead, pass colour values directly from `THEME_COLORS[themeId]` or read computed styles with:

```ts
getComputedStyle(canvasElement).getPropertyValue('--module-accent').trim()
```

SVG elements (used in `PomodoroTimer`) do resolve CSS custom properties correctly.

### Dark mode

Dark mode is toggled by adding/removing the `dark-mode` class on `document.documentElement`. An inline script in `index.html` applies the class synchronously before React boots to prevent a flash of the wrong background:

```html
<script>
  if (localStorage.getItem('focal-dark-mode') === 'true')
    document.documentElement.classList.add('dark-mode')
</script>
```

Canvas backgrounds that depend on theme colours use `THEME_COLORS[themeId]` directly and are unaffected by the dark-mode canvas background change.

### SCSS conventions

- One SCSS Module per component (`ComponentName.module.scss`).
- Global variables and mixins live in `apps/web/src/styles/`. The Vite config prepends `@import 'variables'; @import 'mixins';` to every module file automatically — do not add these imports manually.
- **Do not use `@use` at the top of a module file.** Because `additionalData` injects `@import` rules first, any `@use` directive would violate the "must come before all other rules" constraint and cause a build error.
- Use SCSS variables (`$space-*`, `$text-*`, `$radius-*`, `$font-ui`, `$font-mono`, `$shadow-module`) and CSS custom properties (`var(--module-*)`, `var(--canvas-*)`, `var(--util-*)`) as appropriate.
- Do not write inline styles in JSX unless the value is genuinely dynamic and theme-driven (e.g. a swatch gradient computed at runtime).

### Accessibility (WCAG 2.1 AAA)

All UI must meet WCAG 2.1 Level AAA:

- Text contrast minimum 7:1 (normal text), 4.5:1 (large text ≥ 18 pt or ≥ 14 pt bold).
- Every `<input>` and `<button>` must have an accessible name via visible text, `aria-label`, or `aria-labelledby`.
- Every interactive element must have an explicit `:focus-visible` style — do not rely on browser defaults alone.
- Canvas elements must have `role="img"` and `aria-label` describing their current state.
- Continuously running animations (`LavaLamp`, `Kaleidoscope`, `WaveBox`) must check `window.matchMedia('(prefers-reduced-motion: reduce)')` and pause or freeze when it matches.
- Timer countdowns should use `aria-live="polite"` on a visually-hidden element, announcing at a reasonable cadence (e.g. once per minute, not every second).
