# Lessons & Heuristics

## 2025-01-28 - Canvas Loading States
**Insight:** Text-based "Loading..." indicators are often obscured by canvas initialization or persist in the DOM, confusing screen readers.
**Heuristic:** Always wrap loading text in a semantic container (`#loading`) and programmatically hide it (`display: none`) upon game loop initialization. Use `Dom.hide()` for cleanliness.

## 2025-01-27 - Keyboard Event Conflict
**Insight:** Global key listeners for game controls conflict with native form inputs.
**Heuristic:** Global key handlers must explicitly filter `ev.target.tagName` for `INPUT`, `SELECT`, `TEXTAREA`.

## 2025-01-25 - Active Navigation State
**Insight:** `aria-current="page"` is superior to `.active` classes.
**Heuristic:** Use ARIA attributes for state; style based on attributes.

## 2025-01-22 - Visual Keyboard Hints
**Insight:** Users scan better with visual keys.
**Heuristic:** Use `<kbd>` tags for control instructions.
