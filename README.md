# Kriya

> A personal life-management platform — track your notes, finances, and nutrition with optional AI-powered analysis.

Full-stack TypeScript monorepo (React + Vite + Tailwind, Express + MySQL + Knex) for self-hosted daily life logging.

## Features

- **Notes** — Tag-based notes with optional AI tag generation
- **Finance** — Credit/debit ledger with monthly/daily summaries; AI-powered tagging
- **Nutrition** — Describe meals in plain text; AI parses 30+ nutrient fields with RDA-based display
- **Dashboard** — At-a-glance finance balance and nutrition RDA progress
- **Bring your own AI key** — OpenAI, Anthropic, or DeepSeek (cheap OpenAI-compatible); keys encrypted at rest (AES-256-GCM); mock provider for dev
- **Auth** — JWT with refresh token rotation; email verification via Resend
- **Theme** — Light/dark/system with OKLCH CSS variables
- **Responsive** — Sidebar on desktop, bottom nav on mobile

## Quick Start

```bash
# Prerequisites: Node.js 24+, Docker 24+

cp .env.example .env              # configure environment
npm run docker:up                  # start MySQL + Adminer
npm install                        # install all workspaces
npm run migrate --workspace=server # create tables
npm run seed --workspace=server    # (optional) test user
npm run dev                        # server :3000 + client :5173
```

Open [http://localhost:5173](http://localhost:5173) — login with `test@kriya.app` / `password123` if seeded.

### Production

```bash
cp .env.prod.example .env.prod
# fill in secrets, and set CORS_ORIGIN / APP_URL to your public origin, then:
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.prod exec server \
  npx tsx node_modules/.bin/knex migrate:latest --knexfile dist/config/database.js
```

The client (`CLIENT_PORT`, default `8080`) and API (`SERVER_PORT`, default `3000`) are bound to `127.0.0.1` only — put Nginx (or another reverse proxy) in front for public HTTPS access.

See [deploy/production.md](deploy/production.md) for detailed deployment.

## Project Structure

```
kriya/
├── client/          # React SPA (Vite + Tailwind)
├── server/          # Express API (routes → services → repositories)
├── packages/shared/ # Zod schemas + TypeScript types (shared client/server)
├── deploy/          # Production deployment guides
├── docker/          # MySQL init scripts
└── docs/            # Architecture docs, OpenAPI spec, technical reference
```

## Built With

Kriya was developed using [OpenCode](https://opencode.ai) and [DeepSeek V4 Flash](https://deepseek.com).

## License

MIT
