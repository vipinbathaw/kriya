# Backend Architecture

## Stack
- **Runtime**: Node.js v24
- **Framework**: Express.js (latest)
- **Language**: TypeScript (strict mode)
- **Database**: MySQL 8 via Docker
- **Query Builder**: Knex.js (with migrations/seeds)
- **Validation**: Zod
- **Authentication**: JWT (access + refresh tokens)
- **Encryption**: Node.js crypto (AES-256-GCM)
- **Testing**: Vitest + Supertest
- **Logging**: Pino (structured JSON logging)

## Layered Architecture

```
─── HTTP Request ───► Router ──► Validation ──► Controller ──► Service ──► Repository ──► Database
                              (Zod)           (HTTP I/O)     (logic)      (queries)
```

### Layer Responsibilities

#### 1. Routes (`src/routes/`)
- Define URL paths and HTTP methods
- Attach middleware (auth, rate-limit, validation, etc.)
- Delegate to controllers
- No business logic

```typescript
// Example
router.get('/notes', authenticate, notesController.list);
router.post('/notes', authenticate, validate(createNoteSchema), notesController.create);
```

#### 2. Controllers (`src/controllers/`)
- Parse request input, call services, shape HTTP responses
- Errors are forwarded to the global error handler

#### 3. Validators (`src/validators/`)
- Thin re-exports of shared Zod schemas from `@kriya/shared`

#### 4. Services (`src/services/`)
- All business logic lives here
- Orchestrate multiple repositories
- Call AI adapter when applicable (see `ai-tag-generator.service.ts`, `nutrition-queue.service.ts`)
- Throw typed errors (AppError subclasses)

#### 5. Repositories (`src/repositories/`)
- Pure data access via Knex queries
- No business logic
- Return plain objects (not ORM models)
- One repository per database table

#### 6. Middleware (`src/middleware/`)
- `authenticate.ts` — JWT verification
- `validate.ts` — Zod schema validation
- `errorHandler.ts` — Global error handler
- `rateLimiter.ts` — In-memory rate limiting keyed by IP + path
- `requestLogger.ts` — Pino request logging

## Module Structure

Each module (notes, finance, nutrition) follows the same pattern:

```typescript
server/src/
  routes/
    notes.routes.ts        # Route definitions
  controllers/
    notes.controller.ts    # HTTP request/response handling
  validators/
    notes.validator.ts     # Zod schema re-exports
  services/
    notes.service.ts       # Business logic
  repositories/
    notes.repository.ts    # Database queries
```

## Error Handling

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) { super(message); }
}

// Usage
throw new AppError(404, 'NOTE_NOT_FOUND', 'Note not found');
```

Centralized error handler middleware catches all AppErrors and returns consistent JSON:

```json
{
  "error": {
    "code": "NOTE_NOT_FOUND",
    "message": "Note not found"
  }
}
```

## Authentication Flow
1. User registers/logs in → POST /api/auth/login → returns JWT access token (15min) + refresh token (7d)
2. Access token sent as `Authorization: Bearer <token>` header
3. Refresh token stored in httpOnly cookie
4. When access expires → POST /api/auth/refresh → new access token
5. Logout → invalidate refresh token

## API Key Encryption Flow
1. User enters API key in settings
2. Key encrypted with AES-256-GCM using server-side encryption key (from env)
3. Encrypted ciphertext + auth tag + iv stored in `api_keys` table
4. When needed: service requests key from repository → repository decrypts → passes to AI adapter
5. Key never logged, never returned to client

## Performance Considerations
- Connection pooling via Knex (configured pool size)
- Pagination for all list endpoints (cursor-based)
- Indexed columns: composite `(user_id, created_at)` on notes, `(user_id, entry_date)` on finance/nutrition, plus tag columns
- Rate limiting per IP + endpoint path (in-memory store)
- Request body size limits (1MB default)
