# System Patterns

## Architecture
- Pattern: Modular ES Modules (Decomposed Monolith)
- Data Flow: Unidirectional (Update Loop -> Render Loop)
- State Ownership: Explicit (Game loop manages state, UI reflects state via Tweak UI)

## Code Laws
- Early returns only
- No files >200 lines without justification (complexity is technical debt)
- One responsibility per function
- ES Modules for all script files; no global pollution.

## Component Structure
- `game.mjs`: Core game loop and state management.
- `render.mjs`: Canvas rendering logic.
- `dom.mjs`: DOM manipulation helpers.
- `util.mjs`: Math and utility functions.
- `net.mjs`: Networking layer (WebSockets).
- `tweak-ui.mjs`: Configuration UI logic.
