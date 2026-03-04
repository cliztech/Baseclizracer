# Active Context

## Current Focus
Enhancing Gameplay Depth with Remote Player Collision.

## Recent Decisions
- Refactored `net.mjs` to buffer messages before connection is `OPEN`, solving race conditions.
- Removed implicit "Auto-join default" in `server/Lobby.mjs` to enforce explicit room joining.
- Verified networking integrity with `test/networking.test.mjs`.

## Next Atomic Steps
- [ ] Implement remote player collision in `v4.final.js`.
- [ ] Create `test/collision.test.mjs` to verify collision logic.
