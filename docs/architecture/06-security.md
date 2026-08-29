# Security Architecture

## Overview
Security is paramount because users entrust us with their AI API keys — credentials that can incur costs and access external services.

## API Key Encryption

### Encryption Algorithm
- **Algorithm**: AES-256-GCM
- **Key**: 256-bit key stored in `ENCRYPTION_KEY` environment variable
- **IV**: Random 96-bit IV generated per encryption
- **Auth Tag**: 128-bit GCM authentication tag

### Flow
```
Encryption:
  plaintext_key + ENCRYPTION_KEY + random_iv
    → AES-256-GCM → ciphertext + auth_tag
    → Store: { ciphertext, iv, auth_tag, key_preview }

Decryption:
  { ciphertext, iv, auth_tag } + ENCRYPTION_KEY
    → AES-256-GCM → plaintext_key
    → Use in AI adapter (in-memory, request-scoped)
```

### Key Preview
- Only first 8 characters of the API key stored for UI display
- Users can recognize which key is configured without exposing the full key

### Key Rotation
- Users can add new keys; old keys deactivated (never deleted for audit)
- Encryption key rotation supported via env var change + migration script

## Authentication

### Password Security
- bcrypt with cost factor 12
- Minimum password length: 8 characters
- Rate limiting on login: 5 attempts per 15 minutes per IP

### JWT Tokens
- Access token: 15 minutes, stored in memory (JS variable)
- Refresh token: 7 days, stored in httpOnly, Secure, SameSite=Strict cookie (path `/api/auth`)
- Refresh token rotation: on every refresh the old token row is deleted from `refresh_tokens` and a new one issued
- JWT secret stored in `JWT_SECRET` env var (min 256-bit)

### Token Revocation
- On logout, the refresh token row is deleted from the `refresh_tokens` table (revocation by deletion, not a blacklist)
- Refresh validation always checks the hashed token against the `refresh_tokens` table
- Expired refresh token rows are removed as they are encountered; no sensitive data is retained

### Email Verification
- When `RESEND_API_KEY` is configured, registration does **not** issue a session — the account is created as unverified and a verification email is sent
- `login` refuses unverified accounts with `403 EMAIL_NOT_VERIFIED`
- `POST /api/auth/resend-verification` regenerates the token and re-sends the email; it silently succeeds for unknown/already-verified addresses to prevent account enumeration
- If no Resend key is configured (dev, or self-host without email), accounts are auto-verified so the app remains usable

## Request Security

### Headers
```typescript
// Helmet.js middleware provides:
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN (Helmet default)
- Strict-Transport-Security (enabled when served over HTTPS)
```

### Rate Limiting
```typescript
// Per-endpoint rate limits
{ path: '/api/auth/login',    limit: 5,  windowMs: 15 * 60 * 1000 }
{ path: '/api/auth/register', limit: 3,  windowMs: 60 * 60 * 1000 }
{ path: '/api/*',             limit: 100, windowMs: 60 * 1000 }  // General
```

### Input Validation
- All inputs validated with Zod schemas
- HTML/special characters sanitized
- No raw SQL — always parameterized queries via Knex
- Request size limits: 1MB default

## Database Security
- MySQL runs in Docker; in production the DB port is **not** exposed to the host (`docker-compose.prod.yml` publishes no ports for `db`). In development `docker-compose.yml` exposes `3306:3306` for local tooling
- Database user has minimum required privileges
- The app connects over the private Docker network; TLS between app and DB is not enabled by default (add `ssl` to the Knex connection in `server/src/config/database.ts` if your MySQL requires it)
- No sensitive data in logs (Pino redaction covers auth headers, cookies, passwords, API keys, and tokens)

## Production Hardening Checklist
- [ ] HTTPS enforced (TLS 1.3)
- [ ] Helmet.js enabled
- [ ] CORS restricted to known origins
- [ ] Rate limiting configured
- [ ] No sensitive data in error responses
- [ ] Docker containers run as non-root user
- [ ] Secrets via environment variables (not in code)
- [ ] Regular dependency audits (`npm audit`)
- [ ] DB backups encrypted
- [ ] Security headers verified
