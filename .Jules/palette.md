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

## 2025-01-26 - Live Preview for Config Sliders

**Learning:** For game configuration sliders, immediate feedback via `input` events creates a much more responsive feel than `change` events (on release). However, this requires verifying that the update function is performant enough to run per-frame.
**Action:** Use `input` events for lightweight visual tweaks (FOV, camera height) and `change` events for expensive rebuilds (track geometry).

## 2025-01-27 - Skip to Game Link

**Learning:** In keyboard-controlled games where form inputs block game controls (to prevent conflicts), a "Skip to Content" link is essential. It allows users to bypass the form gauntlet and immediately activate the game context. The target container must have `tabindex="-1"` to accept focus programmatically.
**Action:** Add `.skip-link` and ensure game containers are focusable with descriptive ARIA labels.

## 2025-01-28 - Canvas Loading States

**Learning:** Text based "Loading..." indicators placed directly in the HTML can be obscured by the canvas element when it initializes, yet remain in the accessibility tree, confusing screen readers. A dedicated, styled overlay that is programmatically hidden ensures both visibility during load and a clean state after.
**Action:** Wrap loading text in a semantic container (`#loading`) and explicitely hide it (`display: none`) when the game loop starts.

## 2026-01-17 - Double-Bound Controls (Click + Key)

**Learning:** Providing both a visible UI control (button) and a keyboard shortcut (hotkey) for critical game actions (like "Restart") caters to both novice users (mouse discoverability) and power users (keyboard efficiency).
**Action:** When adding game controls, pair a `<button>` with a `KEY` listener and document the shortcut in the UI (e.g., "Press R to restart").

## 2026-01-18 - Reset for Playground UIs

**Learning:** In dense configuration UIs (like the game tweaks), users feel safer exploring extremes when they have a single-click "panic button" to restore known-good state.
**Action:** Always pair complex "tweak" controls with a global reset action.

## 2026-01-20 - Interactive Lists as Controls

**Learning:** For selecting items from a list (like game rooms), converting plain `<li>` elements into semantic, keyboard-accessible controls (`tabindex="0"`, `role="button"`) transforms a passive list into an active, screen-reader-friendly menu without complex ARIA widgets.
**Action:** When list items trigger actions, treat them as buttons or links, ensuring keyboard operability and clear labels.

## 2026-02-15 - Implicit Form Submission

**Learning:** For inputs like chat that need "Enter to submit" behavior, using a semantic `<form>` with a hidden `submit` button is more robust and accessible than custom `keydown` listeners. It handles mobile keyboards ("Go" button) and focus management natively.
**Action:** Wrap single-input UI patterns in `<form>` tags and listen for the `submit` event instead of `keydown`.

## 2026-02-27 - Global Contextual Shortcuts

**Learning:** Implementing a global key listener (e.g., "Enter" to chat) that intelligently respects the current focus state (ignoring other inputs) and application state (only when game is active) allows for seamless mode switching without explicit UI toggles.
**Action:** Use global `keydown` listeners with strict target/state checks to shortcut access to primary secondary actions (like chat or search).

## 2026-03-05 - Visual Feedback for Game Loop States

**Learning:** When pausing a game loop, simply stopping the update logic leaves the user wondering if the application has frozen. A distinct visual overlay (e.g., semi-transparent backdrop with "PAUSED" text) provides immediate confirmation and reassurance that the state is intentional and reversible.
**Action:** Always couple logic-based pauses with a high-contrast visual indicator overlaying the game canvas.
