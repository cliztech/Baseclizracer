## 2025-05-18 - Semantic Buttons vs Spans
**Learning:** Interactive elements implemented as `<span>` tags (like the mute button) lack keyboard accessibility and screen reader support by default.
**Action:** Replace `<span>` with `<button>` for interactive controls, ensuring to reset default button styles (border, background) to maintain the visual design while gaining native accessibility features like focus handling and key press support.

## 2025-05-18 - Visible Focus Indicators
**Learning:** Default white focus outlines are invisible on white backgrounds, failing accessibility requirements.
**Action:** Ensure custom focus indicators (e.g., `outline`) have sufficient contrast against the background color. Use contrasting colors (like black on white) instead of relying on browser defaults or matching the background.
