# Base Racers Vision & Next Steps

This plan outlines the next development milestones to evolve Base Racers into a pixel-art, multiplayer, web3-ready experience inspired by the provided garage and neon city visuals.

## Visual Direction
- Establish a **shared pixel-art palette** (e.g., 16–24 colors) to match the garage and neon city references.
- Build a **garage scene** (title/settings) with reflective floors, wall tool racks, and stacked tires; reuse assets across menus.
- Create **neon city race tracks** with parallax skyscrapers, billboards, and moon backdrop; favor chunky pixels and saturated contrasts.
- Define **car sprite sheets** (top-down and rear-quarter views) at consistent resolutions; include placeholder decals for crypto/web3 branding.
- Add **UI/HUD pixel fonts** and iconography for speed, position, and lap indicators.

## Multiplayer & Networking
- Expand the WebSocket server to support **rooms/lobbies**, player join/leave events, and broadcast intervals with rate limiting.
- Implement **client prediction + server reconciliation** for steering/acceleration to reduce perceived latency.
- Sync **race state**: countdowns, lap tracking, checkpoints, and finish events; validate inputs server-side.
- Add **spectator mode** for late joiners; show ghost opponents for asynchronous play.

## Gameplay & AI
- Implement **AI rivals** with waypoint-driven racing lines; expose difficulty presets (cautious, balanced, aggressive).
- Add **collision and slipstream** mechanics; tune off-road penalties and centrifugal force for curves/hills.
- Include **boost/collectibles** aligned with billboard themes; ensure deterministic behavior for multiplayer fairness.

## Web3 Hooks (Optional, Stubbed First)
- Abstract **wallet/session** handling behind an adapter; start with a mock provider for offline testing.
- Design **NFT/asset metadata** interfaces (car skins, billboards) without on-chain writes until audited.
- Gate **cosmetics** behind signed messages; keep core racing free-to-play.

## Tooling & Quality
- Convert remaining globals to **ES modules**; remove blanket ESLint disables in favor of targeted rules.
- Add **CI workflows** (lint, tests, build) and **pre-commit hooks** for consistent quality gates.
- Expand **unit/integration tests**: physics (projection, collisions), networking (room flows), UI (tweak panel), and rendering snapshots.
- Provide **npm scripts** for dev (`npm start`), multiplayer dev server (`npm run dev:net`), and tests (`npm test`).

## Asset Pipeline
- Set up **Aseprite + TexturePacker** (or free alternatives) for sprite atlas generation; commit source `.ase` files.
- Define **sprite slicing metadata** compatible with existing `sprites.js`; add preview thumbnails to `/images`.
- Implement **resolution scaling** (low-res canvas scaled up with `image-rendering: pixelated`) to keep crisp edges.

## Milestone Breakdown
1. **Foundations (Week 1)**: finalize palette, set up asset pipeline, convert globals to modules, remove eslint disables.
2. **Networking Core (Weeks 2–3)**: lobby/room support, message schema, client prediction, authoritative reconciliation.
3. **Gameplay Depth (Weeks 3–4)**: AI rivals, collision/slipstream, boost items, lap logic with checkpoints.
4. **Visual Polish (Weeks 4–5)**: garage menu scene, neon city track set, HUD/UI pixel fonts, billboard variants.
5. **Web3 Layer (Weeks 5–6, optional)**: mock wallet, signed sessions, cosmetic NFT metadata; security review before enabling writes.

## Immediate Next Steps (Actionable)
- **Convert remaining globals to modules**: wrap `Dom`, `Util`, and renderer helpers into ES modules; replace the blanket eslint-disable with targeted fixes.
- **Tighten multiplayer loop**: define message schema (join/leave, state update, chat/ping), implement server-side room registry, and add basic validation/rate limits.
- **Client networking hook-up**: wire the WebSocket stub to send player inputs and render other racers; add client prediction and reconciliation toggles in the UI.
- **Placeholder pixel art pass**: organize existing sprites into an atlas with `image-rendering: pixelated` scaling; drop the assets into `/images` for early visual cohesion.
- **Tests & CI**: expand Jest (or native node) coverage for physics and networking flows, and add a GitHub Actions workflow to run `npm test`/`npm run lint` on pushes.
- **Web3 adapter spike (optional)**: prototype a mock wallet connector and sign/verify flow for cosmetic unlocks without committing to on-chain writes.

## Success Criteria
- Stable **60 FPS** on desktop with pixel-perfect scaling.
- **<120 ms** effective input latency with client prediction in multiplayer lobbies of up to 8 racers.
- **95%+** lint/test pass rate in CI; zero blanket ESLint disables.
- Cohesive pixel-art presentation matching the garage and neon city inspirations.
