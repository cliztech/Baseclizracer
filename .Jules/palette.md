# Palette's Journal - Critical Learnings

## 2025-01-22 - Visual Keyboard Hints
**Learning:** Replacing text descriptions of keys (e.g., "arrow keys") with visual `<kbd>` tags significantly improves scanability and delight without cluttering the UI. The CSS style mimicking physical keys is a reusable pattern.
**Action:** Use the `<kbd>` style from `common.css` for any future keyboard shortcuts or control instructions.

## 2025-01-23 - Keyboard Event Conflict
**Learning:** Global key listeners for game controls can conflict with native form inputs, causing accidental game actions (like crashing a car) while adjusting settings. This is a subtle but critical usability/accessibility issue.
**Action:** Always check `ev.target.tagName` in global key handlers and ignore events originating from `INPUT`, `SELECT`, or `TEXTAREA`.
