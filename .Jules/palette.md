## 2024-05-23 - Replaced Span with Button for Accessibility
**Learning:** The `Dom` helper in `common.js` binds events by ID, which is great for refactoring. It allowed me to swap a `<span>` for a `<button>` without breaking the JavaScript event binding.
**Action:** When refactoring legacy code, check if event listeners are bound by ID. If so, tag replacement is safe as long as ID is preserved and default styles (border/padding) are reset.
