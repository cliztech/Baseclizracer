# Palette's Journal - Critical Learnings

## 2025-01-22 - Visual Keyboard Hints
**Learning:** Replacing text descriptions of keys (e.g., "arrow keys") with visual `<kbd>` tags significantly improves scanability and delight without cluttering the UI. The CSS style mimicking physical keys is a reusable pattern.
**Action:** Use the `<kbd>` style from `common.css` for any future keyboard shortcuts or control instructions.

## 2025-01-23 - Keyboard Event Conflict
**Learning:** Global key listeners for game controls can conflict with native form inputs, causing accidental game actions (like crashing a car) while adjusting settings. This is a subtle but critical usability/accessibility issue.
**Action:** Always check `ev.target.tagName` in global key handlers and ignore events originating from `INPUT`, `SELECT`, or `TEXTAREA`.

## 2025-01-24 - Consistent Focus Indicators
**Learning:** Default browser focus rings are inconsistent and often subtle. Applying a high-contrast, design-system-aligned `focus-visible` style (e.g., `outline: 2px solid black`) to all interactive elements improves accessibility and visual consistency.
**Action:** Use the shared `:focus-visible` rule in `common.css` for all interactive elements.

## 2025-01-25 - Active Navigation State
**Learning:** Adding `aria-current="page"` to navigation links is a low-effort, high-impact a11y win. It programmatically communicates position to screen readers and provides a semantic hook for styling the "active" state without relying on class names.
**Action:** Use `[aria-current="page"]` selectors for styling active navigation items instead of `.active` classes.

## 2025-01-26 - Real-time Feedback on Range Inputs
**Learning:** Users engaging with range sliders expect immediate visual feedback. Using the `input` event for state updates while maintaining `change` for commit/cleanup (like blurring to return focus to the game) provides a much more responsive "tweak" experience without sacrificing keyboard safety.
**Action:** Bind `input` events for live value updates on sliders, and use `change` events for final commits or focus management.
