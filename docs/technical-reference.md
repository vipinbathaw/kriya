# Technical Reference

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 24 |
| Backend | Express | 5.x |
| Database | MySQL | 8.0 |
| Query Builder | Knex | 3.x |
| Frontend | React | 19.x |
| Build Tool | Vite | 6.x |
| Styling | Tailwind CSS | 4.x |
| Routing | React Router | 7.x |
| Server State | TanStack React Query | 5.x |
| Client State | Zustand | 5.x |
| Forms | React Hook Form + Zod | |
| Auth | JWT + bcrypt | |
| Encryption | AES-256-GCM (Node crypto) | |
| Email | Resend | |
| Logging | Pino | |
| Testing | Vitest + Testing Library + MSW | |
| Containerization | Docker + Compose | |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server + client in watch mode |
| `npm run build` | TypeScript compile + Vite build |
| `npm test` | Run all tests (server + client) |
| `npm run lint` | Lint all TypeScript files |
| `npm run format` | Format all files with Prettier |
| `npm run docker:up` | Start MySQL + Adminer containers |
| `npm run docker:down` | Stop containers |
| `npm run docker:reset` | Destroy and recreate DB volume |
| `npm run migrate --workspace=server` | Run DB migrations |
| `npm run seed --workspace=server` | Seed test data |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `3000` | Server port (inside the container it is always `3000`; the host port is `SERVER_PORT`) |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `DB_HOST` | No | `localhost` | MySQL host |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_USER` | No | `kriya` | MySQL user |
| `DB_PASSWORD` | No | `kriya_password` | MySQL password |
| `DB_NAME` | No | `kriya_dev` | Database name |
| `JWT_SECRET` | **Yes** | — | JWT signing key (min 32 chars) |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRY` | No | `7d` | Refresh token TTL |
| `ENCRYPTION_KEY` | **Yes** | — | AES-256-GCM key (64 hex chars) |
| `RESEND_API_KEY` | No | — | Resend API key (for email). If omitted in production, new accounts are auto-verified |
| `APP_URL` | No | `http://localhost:5173` | Public frontend URL (used in verification email links) |

Compose-level variables (`.env.prod`): `SERVER_PORT` (host port for the API, bound to `127.0.0.1`), `CLIENT_PORT` (host port for the web client, bound to `127.0.0.1`), `DB_ROOT_PASSWORD`.

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register (rate-limited: 3/hr). In production with a Resend key configured, returns `verificationRequired: true` and does **not** log the user in |
| POST | `/api/auth/login` | No | Login (rate-limited: 5/15min) |
| POST | `/api/auth/resend-verification` | No | Resend the verification email (rate-limited: 3/hr) |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | Cookie | Logout |
| GET | `/api/auth/me` | JWT | Current user profile |
| GET | `/api/auth/verify-email` | No | Verify email (query: `token`) |
| GET | `/api/health` | No | Health check |
| GET/POST/PUT/DELETE | `/api/notes` | JWT | Notes CRUD |
| GET/POST/PUT/DELETE | `/api/finance` | JWT | Finance CRUD |
| GET | `/api/finance/summary` | JWT | Finance summary |
| GET/POST/DELETE | `/api/nutrition` | JWT | Nutrition CRUD |
| GET/PUT | `/api/settings/profile` | JWT | User profile |
| GET/PUT | `/api/ai/configs` / `/api/ai/configs/:module` | JWT | AI configuration |
| GET/POST/DELETE | `/api/ai/keys` / `/api/ai/keys/:provider` | JWT | API key management |
| GET | `/api/ai/providers` | JWT | Available AI providers |

## Email Verification Flow

- When a `RESEND_API_KEY` is configured (production), `POST /api/auth/register` creates the account, sends a verification email, and returns `{ user, verificationRequired: true }` with **no** access token and no session cookie — the user is not logged in.
- `POST /api/auth/login` returns `403 EMAIL_NOT_VERIFIED` until the account is verified, so unverified accounts cannot use the app.
- `POST /api/auth/resend-verification` regenerates the token and re-sends the email (it silently succeeds for unknown/already-verified addresses to avoid account enumeration).
- In development, or when no Resend key is configured, accounts are auto-verified and registration logs the user in immediately (existing behavior).

## AI Providers

| Provider | Models | Notes |
|----------|--------|-------|
| OpenAI | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo` | Requires API key. Default: `gpt-4o-mini` |
| Anthropic | `claude-sonnet-4-20250514`, `claude-haiku-3-5-20241022` | Requires API key. Default: `claude-haiku-3-5-20241022` |
| Mock | `mock` | Built-in, no key needed (development only) |

## Testing

```bash
# All tests
npm test

# Server only
npm run test --workspace=server

# Client only
npm run test --workspace=client

# Coverage
npm run test:coverage --workspace=server
npm run test:coverage --workspace=client
```

## Linting & Formatting

```bash
# Check code quality
npm run lint

# Auto-format
npm run format
```

Uses ESLint (flat config) with TypeScript rules and Prettier for consistent formatting.

## Architecture Patterns

### Monorepo
npm workspaces with a shared package (`packages/shared`) containing Zod schemas and TypeScript types consumed by both client and server for end-to-end type safety.

### Cursor-based Pagination
All list endpoints use cursor pagination for consistent performance. The client accumulates pages in state and renders the full list.

### Async Nutrition Queue
AI parsing is asynchronous. Creating a nutrition entry immediately returns with `status=pending`. A background worker (`nutrition-queue.service.ts`) polls every 3 seconds for pending entries, processes them through the AI adapter, and updates the status. The frontend polls via `refetchInterval`.

### AI Adapter Pattern
The AI layer (`server/src/ai/adapter.ts`) implements a Strategy pattern with a provider registry. Services never call AI providers directly — they go through the abstract `AIProvider` interface. Adding a new provider requires zero changes to business logic.

### AI Tag Generation (Notes & Finance)
Notes and finance entries use AI tag generation when the module's AI toggle is enabled **and** an API key is stored for the selected provider. Tags are generated synchronously with the create/update request; if AI is disabled, no key is present, or the provider call fails, tags fall back to rule-based extraction (`generateSimpleTags`) so saves are never blocked.

### API Key Encryption
User API keys are encrypted at rest using AES-256-GCM via Node's `crypto` module. Only the first 8 characters of the key are stored as a preview for user recognition. Keys are decrypted in-memory per-request and never logged.

### RDA-based Nutrition Display
The client defines complete RDA standards for 29 nutrients. The dashboard shows 7 main nutrients with full-width progress bars. The nutrition list page has collapsible sections for the full 29-nutrient breakdown. "Max" nutrients (sodium, sugar, saturated fat) turn red when RDA % exceeds 100%.

## Roadmap

- [ ] Account deletion
- [ ] Search/filter on notes and finance entries
- [ ] Data export (CSV/JSON)
- [ ] Additional RDA reference charts
- [ ] Mobile push notifications
- [ ] OAuth/social login
- [ ] Dark mode system preference auto-detection
