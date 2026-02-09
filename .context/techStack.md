# Tech Stack

## Core

- Language: JavaScript (ES2022 Modules)
- Framework: Vanilla JS (No frontend framework)
- Runtime: Browser (Client), Node.js (Server/Test)

## Dependencies

- `ws`: WebSocket server/client.
- `http-server`: Static file serving.

## Testing

- Runner: Node.js native test runner (`node --test`)
- Verification: Playwright (Python) for visual regression/verification.
- Linting: ESLint (Flat Config)

## Constraints

- No build steps for frontend (runs directly from source).
- Deterministic builds only.
