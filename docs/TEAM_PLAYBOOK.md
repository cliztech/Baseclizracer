# Base Racers Team Playbook

This playbook defines the skills, knowledge, leadership structure, technology choices, and critical files needed to build and scale **Base Racers** into a resilient web3 multiplayer game studio.

## 1) Vision and Principles
- Deliver a **pixel-art, arcade, multiplayer street racer** with optional web3 hooks (wallet login, cosmetic ownership) that works well on desktop and mobile browsers.
- Prioritize **fair, fast, and reliable online play**; web3 is additive, not required to enjoy the game.
- Build in **small, testable increments** with observability, player safety, and content pipelines from day one.

## 2) Team Topology
- **Executive & Product**
  - Executive Producer: scope, budget, milestones, external partners.
  - Creative Director: game vision, tone, narrative/world-building.
  - Product Manager/Owner: backlog, KPIs, player research, roadmap.
- **Engineering Squads**
  - **Client Gameplay**: rendering, input, physics, UI/HUD, accessibility, offline mode.
  - **Netcode & Backend**: matchmaking, rooms, authoritative simulation, anti-cheat, persistence, web3 services.
  - **Platform/DevEx**: CI/CD, tooling, build pipelines, automation, security, observability, test harnesses.
- **Art & Audio**
  - Pixel art lead, animators, technical artist (asset pipeline, shaders, palette management), audio designer (music/SFX/VO pipeline).
- **QA & Player Experience**
  - Test automation, performance profiling, network/fuzz tests, live-ops dashboards, community feedback loops.

## 3) Core Skills and Knowledge Base
- **Engineering**: JavaScript/TypeScript, Phaser/Canvas/WebGL, WebSocket and WebRTC patterns, server-authoritative multiplayer, deterministic/lockstep vs. client-prediction models, cryptography basics, security (XSS/CSRF, replay protection), build tooling (Vite/Webpack), CI/CD (GitHub Actions), containerization.
- **Art**: pixel-art workflow (Aseprite/Piskel), palette discipline, sprite sheet packing, VFX timing, UI/UX for low-res displays, accessibility contrast guidelines.
- **Audio**: looped track design, dynamic mixing, audio budget for web, latency minimization.
- **Product/Design**: free-to-play ethics, progression balancing, economy design (if web3), retention/engagement metrics, live-ops cadence.
- **QA/Performance**: profiling (FPS, memory, GC), network simulation, automated regression, cross-browser/device matrices.

## 4) Technology Stack (Recommended)
- **Client**: ES modules, Phaser (or optimized Canvas), TypeScript, WebSocket client, optional Wallet SDK abstraction.
- **Backend**: Node.js, WebSocket or Socket.io for rooms, Redis for session/state fan-out, PostgreSQL for persistence, optional NFT/asset bridge service with rate limiting and audit logs.
- **Infrastructure**: Docker, IaC (Terraform), CDN for assets, feature flags/remote config, observability (OpenTelemetry, structured logs, metrics), error tracking (Sentry).
- **CI/CD**: GitHub Actions running lint, tests, type-check, bundle-size checks, and deploy to staging/production.

## 5) Scalability, Reliability, and Security
- **Matchmaking & Rooms**: shardable room service, server-authoritative state, replay protection, disconnect/rollback handling, deterministic seeding for races.
- **Performance Budgets**: target <16ms/frame on client; set sprite/memory budgets per scene; define max concurrent players per room and scale horizontally.
- **Security**: input validation on all sockets, rate limits, anti-cheat (speed checks, trajectory validation), web3 signing/verification isolated from gameplay loop, secure key management.
- **Observability & Runbooks**: dashboards for latency/FPS/error rates; on-call playbooks for deploy rollback, matchmaking incidents, and wallet provider outages.

## 6) Critical Files and Knowledge Artifacts
Create and maintain these files/directories to keep the studio aligned:
- **`CONTRIBUTING.md`**: branching strategy, code review rules, commit/PR templates, DCO/license guidelines.
- **`CODE_OF_CONDUCT.md`**: community and team interaction standards.
- **`docs/GAME_DESIGN_DOC.md`**: core loop, controls, track list, progression, monetization (if any), accessibility, success metrics.
- **`docs/TECH_DESIGN.md`**: architecture diagrams, protocols (rooms, inputs, snapshots), data models, API surface, auth flows.
- **`docs/ART_BIBLE.md`**: palettes, sprite sizes, animation timing, UI style, SFX/music direction, export settings, naming conventions.
- **`docs/NETCODE_SPEC.md`**: authoritative vs. client-prediction model, tick rates, reconciliation, lag compensation, anti-cheat rules, replay format.
- **`docs/WEB3_INTEGRATION.md`** (optional): wallet support matrix, custody model, signing flows, smart contract scope, compliance notes.
- **`docs/TEST_STRATEGY.md`**: unit/e2e/load tests, device/browser matrix, network simulations, acceptance criteria.
- **`docs/OPS/RUNBOOKS/*.md`**: deployment steps, incident response, rollback, key rotation, provider outage playbooks.
- **`docs/CONTENT_PIPELINE.md`**: asset ingestion, versioning, sprite packing, localization steps, QA checklists.
- **`docs/ACCESSIBILITY.md`**: standards (WCAG targets), color contrast, input remapping, captions, haptics/audio cues.
- **`docs/RISK_REGISTER.md`**: top risks (scaling, security, legal), mitigations, owners, review cadence.
- **`docs/ROADMAP.md`** (or extend existing): milestones, resourcing, dependencies, KPI gates.

## 7) Operating Rituals
- Weekly cross-squad sync (prod, engineering, art) with demo and perf/quality dashboard review.
- Bi-weekly backlog grooming and risk review; monthly postmortem on incidents and major launches.
- Release train with canary/staged rollout; freeze criteria defined per milestone.

## 8) Success Metrics
- **Stability**: crash-free sessions %, average RTT, packet loss, server tick drift.
- **Performance**: median/95th FPS, frame pacing variance, bundle size, cold-start time.
- **Engagement**: race completion rate, rematch rate, session length, retention.
- **Fairness & Safety**: cheat detection rate, false-positive rate, report/appeal SLAs.

## 9) Immediate Actions to Stand Up the Team
- Draft the listed docs (start with `CONTRIBUTING.md`, `docs/GAME_DESIGN_DOC.md`, `docs/TECH_DESIGN.md`, `docs/ART_BIBLE.md`, `docs/NETCODE_SPEC.md`).
- Define ownership for each squad and appoint leads.
- Set up CI/CD with lint, tests, type-check, and bundle-size budgets.
- Establish asset pipeline (palette, sprite packing, export scripts) and integrate placeholder art until final assets arrive.
- Build matchmaking/room prototype with observability hooks and security checks.

Use this playbook as a living document—update it as the studio, technology, and Base Racers evolve.
