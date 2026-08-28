# Production Deployment Guide

## Prerequisites

- Docker Engine 24+
- Docker Compose v2+

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
| `CORS_ORIGIN` | Frontend URL for CORS | `http://your-domain.com` |
| `CLIENT_PORT` | Host port for the client | `80` |
| `SERVER_PORT` | Host port for the Express server | `3000` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_ACCESS_EXPIRY` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token lifetime |
| `DB_PORT` | `3306` | MySQL port |
| `CLIENT_PORT` | `80` | Host-mapped port for the client container (binds to 127.0.0.1) |
| `SERVER_PORT` | `3000` | Host-mapped port for the server container (binds to 127.0.0.1) |

## Step-by-Step Deployment

### 1. Generate Secrets

```bash
# Generate ENCRYPTION_KEY (must be 64 hex chars)
openssl rand -hex 32

# Generate JWT_SECRET (at least 32 characters, use a password generator)
```

### 2. Configure Environment

Edit `.env.prod` with your values, especially:
- `JWT_SECRET` — use a long random string
- `ENCRYPTION_KEY` — use output from `openssl rand -hex 32`
- `DB_ROOT_PASSWORD` and `DB_PASSWORD` — use strong passwords

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

# Check server health
curl http://localhost:3000/api/health

# Check client is serving
curl http://localhost
```

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
