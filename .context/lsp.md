# Repo Structure & Language Standards

## Tech Stack
- **Runtime:** Node.js (Latest Stable)
- **Frontend:** Vanilla JS (ES Modules preferred), HTML5 Canvas
- **Backend:** Node.js + `ws` (WebSockets)
- **Styling:** CSS3 (`common.css` shared)
- **Testing:** Native Node Test Runner (`node --test`), Playwright (Python for verification)

## File Organization
- **Root:** Game versions (`v1`...`v4`), Entry points (`index.html`), Configs
- **Modules:** `*.mjs` (Modern ES modules: `dom.mjs`, `game.mjs`, `tweak-ui.mjs`)
- **Legacy:** `common.js` (Global scope helpers - deprecated but active)
- **Assets:** `images/`, `music/`
- **Context:** `.context/` (System memory)

## Coding Conventions
- **Indentation:** 2 spaces.
- **Semicolons:** Always.
- **Variables:** `const` > `let` > `var`. (Note: Legacy code uses `var`, new code uses `const/let`).
- **Imports:** Explicit extensions required (`.mjs`).
- **No Build Step:** The frontend runs natively in modern browsers. Do not introduce Webpack/Vite unless architectural shift is approved.

## Linting & Formatting
- **Linter:** ESLint 9+ (Flat Config).
- **Command:** `pnpm eslint .`
