## 2024-05-23 - Semantic Controls
**Learning:** Replacing `<span>` controls with `<button>` elements immediately enables keyboard accessibility (Tab, Enter/Space) and screen reader support without complex JavaScript polyfills.
**Action:** Always inspect custom UI controls (icons, toggles) to see if they are semantic buttons. If not, refactor to `<button>` and reset CSS styles (border, background, padding) to maintain visual design while gaining native accessibility.
