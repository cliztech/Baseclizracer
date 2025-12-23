## 2025-05-23 - Accessible Mute Button
**Learning:** Legacy apps often use `div` or `span` for interactive controls, breaking accessibility. Converting to native `<button>` elements provides free keyboard support (Tab, Enter/Space) and semantic role, but requires CSS resets to match original design.
**Action:** Always check interactive elements for semantic correctness. If converting legacy elements, be prepared to strip default browser styles (border, background, padding) and add visible focus indicators (`:focus-visible`).
