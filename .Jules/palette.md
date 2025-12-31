# Palette's Journal

## 2025-01-28 - Mute Button Accessibility
**Learning:** The mute button was implemented as a generic `<span>` with a background image, making it inaccessible to keyboard and screen reader users. This pattern is common in older games but critical to fix.
**Action:** Replace interactive `<span>` or `<div>` elements with semantic `<button>` tags, adding `aria-label` for icon-only controls and resetting default button styles to match the visual design.
