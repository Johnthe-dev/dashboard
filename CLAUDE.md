# Focal — Project Guidelines

## Architecture: Logic / UI Separation

Business logic must never live in UI components. The rule:

- **`packages/logic/src/`** — all hooks, types, interfaces, and constants. Zero React Native or browser-specific imports. Platform-agnostic.
- **`packages/persistence-web/src/`** — IndexedDB implementations of the repository interfaces. Only place that touches `idb`.
- **`apps/web/src/`** — React components and SCSS only. Components call hooks from `@focal/logic`; they do not query storage directly or contain business rules.

When adding a feature:
1. Define the data shape in `packages/logic/src/types/`
2. Add the repository interface in `packages/logic/src/interfaces/`
3. Write the hook in `packages/logic/src/hooks/` using `usePersistence()`
4. Implement the repository in `packages/persistence-web/src/db/`
5. Wire the repository into `WebPersistenceProvider`
6. Build the UI component in `apps/web/src/` that calls the hook

Never import from `packages/persistence-web` inside a logic hook. Never import `idb`, `IndexedDB`, or any storage API inside `packages/logic`.

## Design Preferences

**Aesthetic:** Sticky note / stationery. Flat colors, geometric shapes, no gradients, no rounded blobs. Shadows are hard-offset (not blurred): `3px 4px 0px rgba(0,0,0,0.18)`.

**Typography:** DM Sans (UI), DM Mono (code/mono toggle). Defined in `_variables.scss`.

**Spacing scale:** 4 / 8 / 12 / 16 / 24px (`$space-1` through `$space-6`).

**Border radius:** sm=4px, md=8px, lg=12px.

**Themes:** Eight per-module color themes. Source of truth is `THEME_COLORS` in `packages/logic/src/constants/themes.ts` — the values there and in `apps/web/src/styles/_themes.scss` must stay in sync. The `THEMES` array order controls picker display order.

| Theme | Feel |
|---|---|
| sticky-yellow | Warm, default |
| sticky-pink | Soft, playful |
| ocean | Cool blue |
| sage | Fresh green |
| parchment | Neutral, quiet |
| slate | Dark, professional |
| midnight | Dark, focused |
| forest | Dark, calm |

**Swatch dots:** Always rendered as `linear-gradient(135deg, swatch 50%, text 50%)` — a diagonal split showing both the background colour and the text colour. This keeps every theme dot visible regardless of which theme the module currently uses.

**Canvas modules:** Canvas elements (`LavaLamp`, `Kaleidoscope`, `CountdownTimer` ring) must not use CSS custom properties inside canvas drawing calls — CSS variables are not resolved by the Canvas 2D API. Read computed styles with `getComputedStyle(element).getPropertyValue('--module-accent')` or pass `THEME_COLORS[themeId]` values directly.

**SCSS:** Use SCSS Modules per component. Global variables/mixins live in `apps/web/src/styles/`. Do not write inline styles in JSX unless the value is dynamic and theme-driven (e.g. a swatch color).

## Requirements

### Accessibility — WCAG AAA

All UI must meet **WCAG 2.1 Level AAA**. Key rules:

- **Contrast (text):** Minimum 7:1 ratio for normal text, 4.5:1 for large text (≥18pt or ≥14pt bold). Verify every theme combination — some muted text colors may fail.
- **Contrast (UI components):** Interactive elements (buttons, inputs, focus rings) require 3:1 against adjacent colors.
- **Focus indicators:** Visible, high-contrast focus ring on every interactive element. Do not rely on browser defaults alone — define explicit `:focus-visible` styles.
- **Keyboard navigation:** Every interactive element reachable and operable by keyboard alone. No keyboard traps.
- **Canvas alternatives:** Every canvas element must have a text alternative. Use `role="img"` and `aria-label` describing current state, or an off-screen live region that announces changes (e.g. timer ticks).
- **Motion:** Animations that run continuously (LavaLamp, Kaleidoscope) must respect `prefers-reduced-motion`. Pause or reduce animation when the media query matches.
- **Labels:** Every `<input>` and `<button>` must have an accessible name — either visible text, `aria-label`, or `aria-labelledby`. Do not use `title` alone.
- **Live regions:** Timer countdowns should use `aria-live="polite"` on a visually-hidden element so screen readers can announce remaining time at a reasonable cadence (e.g. every minute, not every second).
- **Color independence:** Never convey information by color alone. Pair color with text, icon, or pattern.

When touching any component, check it against these rules before considering the work done.

### Onboarding Walkthrough

A first-run walkthrough introduces users to the key UI elements. Rules:

- **Trigger:** Auto-starts on first visit; `focal-tour-done` in `localStorage` suppresses it on return visits.
- **Restart:** A `?` button (bottom-left, `position: fixed`) lets the tour be reopened at any time.
- **Steps:** Welcome → Add module → Dark mode → Large text → Move & resize → Color themes → Done. Any step whose target element is absent from the DOM is skipped automatically.
- **Architecture:** Walkthrough is pure UI — no entries in `packages/logic`. The `Walkthrough` component is self-contained and manages its own state and localStorage.
- **Spotlight:** A `position: fixed` element with `box-shadow: 0 0 0 9999px rgba(0,0,0,0.55)` dims the surroundings while the target element remains visible.
- **Accessibility:** `role="dialog"` and `aria-modal="true"` on the tooltip card; focus moves to the primary action button on each step change; Escape skips the tour; all controls must meet WCAG AAA contrast.
