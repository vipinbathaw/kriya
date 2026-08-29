# Production Deployment Guide

## Prerequisites

- Docker Engine 24+
- Docker Compose v2+
- A VPS with a public IP and (recommended) a domain pointing to it

## Environment Variables

Copy the example env file and fill in all values:

```bash
cp .env.prod.example .env.prod
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_ROOT_PASSWORD` | MySQL root password | `secure-root-pw` |
| `DB_USER` | MySQL application user | `kriya` |
| `DB_PASSWORD` | MySQL application password | `secure-user-pw` |
| `DB_NAME` | Database name | `kriya_prod` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `random-secret-at-least-32-characters-long` |
| `ENCRYPTION_KEY` | AES-256-GCM key (64 hex chars) | `0123456789abcdef...` |
| `CORS_ORIGIN` | **Public origin** users reach the app from | `https://kriya.example.com` |
| `APP_URL` | **Public base URL** used in email links | `https://kriya.example.com` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_ACCESS_EXPIRY` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token lifetime |
| `DB_PORT` | `3306` | MySQL port (container internal) |
| `SERVER_PORT` | `3000` | Host port for the API container (bound to `127.0.0.1`) |
| `CLIENT_PORT` | `8080` | Host port for the client container (bound to `127.0.0.1`; keep off `80` so a host reverse proxy can listen there) |
| `RESEND_API_KEY` | — | Resend API key for verification emails |

> **Container binding note.** The API always binds to `0.0.0.0` *inside* its container (hardcoded in `docker-compose.prod.yml`) so the client nginx can reach it over the Docker network. Only the HOST-side `SERVER_PORT`/`CLIENT_PORT` ports are bound to `127.0.0.1`. `HOST` is not a `.env.prod` variable.

> **CORS_ORIGIN / APP_URL matter.** If these do not match the origin the browser actually uses, login will fail CORS checks and email verification links will point at the wrong host. Set both to your real public origin (e.g. `https://kriya.example.com`), not `http://localhost`.

> **Email verification.** `RESEND_API_KEY` is optional. When it is omitted, new accounts are **auto-verified** so the app remains usable out of the box (a warning is logged). When it is set, new registrations must click the verification link before they can log in.

## Step-by-Step Deployment

### 1. Generate Secrets

```bash
# Generate ENCRYPTION_KEY (must be 64 hex chars)
openssl rand -hex 32

# Generate JWT_SECRET (at least 32 characters)
openssl rand -base64 48
```

### 2. Configure Environment

Edit `.env.prod` with your values, especially:
- `JWT_SECRET` — use a long random string
- `ENCRYPTION_KEY` — use output from `openssl rand -hex 32`
- `DB_ROOT_PASSWORD` and `DB_PASSWORD` — use strong passwords
- `CORS_ORIGIN` and `APP_URL` — set to your real public origin

### 3. Build and Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

### 4. Run Migrations

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec server \
  npx tsx node_modules/.bin/knex migrate:latest --knexfile dist/config/database.js
```

### 5. Verify Deployment

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Check server health (direct API access)
curl http://127.0.0.1:3000/api/health

# Check client is serving (via the published client port)
curl http://127.0.0.1:8080
```

## Serving Behind a Reverse Proxy (Nginx on the VPS)

This is the recommended production topology: a host-level Nginx terminates TLS and proxies to the Kriya client container. Both `CLIENT_PORT` and `SERVER_PORT` are bound to `127.0.0.1` by the compose file, so nothing is exposed to the public internet except through your reverse proxy.

```
Internet ──► Host Nginx (:443 TLS) ──► 127.0.0.1:8080 (kriya-client, proxies /api to server:3000)
```

Example host Nginx site config:

```nginx
server {
    listen 80;
    server_name kriya.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kriya.example.com;

    ssl_certificate     /etc/letsencrypt/live/kriya.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kriya.example.com/privkey.pem;

    # The client container already proxies /api to the API server, so a single
    # upstream is enough. Proxy everything to the client nginx.
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Notes:
- Keep `CLIENT_PORT` off `80`/`443` so host Nginx (and certbot) can bind those ports.
- The API is reachable directly on `127.0.0.1:${SERVER_PORT}` (default `3000`) for health checks and troubleshooting; normal traffic should go through the client nginx.
- TLS termination at the host Nginx means the browser sees HTTPS, which the auth cookie's `Secure` flag requires. **Without HTTPS the refresh-token cookie will not be sent and sessions will not persist.**
- If you change `CLIENT_PORT`, update the `proxy_pass` above to match.
- If you prefer to proxy `/api` directly to the API container instead of through the client nginx, add a `location /api { proxy_pass http://127.0.0.1:${SERVER_PORT}; }` block — both approaches work.

## Updating

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Run any new migrations
docker compose -f docker-compose.prod.yml --env-file .env.prod exec server \
  npx tsx node_modules/.bin/knex migrate:latest --knexfile dist/config/database.js
```

## Changing Environment Variables

Env vars are passed to the containers at creation time, so after editing `.env.prod` you only need to recreate the affected container — **no volume/data changes, never `down -v`**:

```bash
# Recreate any containers whose environment changed
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Notes:
- `up -d` compares the resolved config with the running containers and recreates only those that changed (e.g. `kriya-server` when you add `RESEND_API_KEY`). `--build` is only needed when the code/image changed.
- Setting `RESEND_API_KEY` (plus a reachable `APP_URL`) switches on email verification: new registrations must verify before logging in. Existing auto-verified accounts are unaffected.
- Verify the server picked it up:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.prod exec server \
    sh -c 'echo "resend=${RESEND_API_KEY:+set} app_url=$APP_URL"'
  ```

## Rolling Update

For zero-downtime updates, you would need to extend the setup with:
- Multiple server replicas behind a load balancer
- Database connection pooling
- Health-check-gated deployments

The current setup is designed for single-instance deployments and will have brief downtime during restarts.

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs server
docker compose -f docker-compose.prod.yml logs db
```

### Database connection refused
Ensure the `DB_HOST` in `.env.prod` is set to `db` (the Docker service name).

### Migrations fail
```bash
# Check DB is healthy
docker compose -f docker-compose.prod.yml exec db mysqladmin ping

# Run migrations with verbose output
docker compose -f docker-compose.prod.yml exec server \
  npx tsx node_modules/.bin/knex migrate:latest --knexfile dist/config/database.js --verbose
```

### Login fails with a CORS error
`CORS_ORIGIN` in `.env.prod` does not match the origin in the browser address bar (include the `https://` and do not add a trailing slash).

### Logged out immediately / session does not persist
The refresh-token cookie is `Secure` in production. The site must be served over HTTPS (see the reverse-proxy section above). Browsers will drop the cookie on plain HTTP.
