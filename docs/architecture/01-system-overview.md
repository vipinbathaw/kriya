# System Overview — Kriya

## Project Vision
Kriya is a personal life-management platform with three core modules — Notes, Finance, and Nutrition — all optionally enhanced with AI. Built for hobby-scale use but architected for platform-scale growth, including future cross-platform mobile apps.

## Architecture Principles
1. **Modularity** — Each module (Notes, Finance, Nutrition) is independently developed, tested, and deployable.
2. **AI as Plugin** — AI providers are behind an adapter interface; switching providers requires zero changes to business logic.
3. **Security First** — User API keys are encrypted at rest; the platform never touches provider APIs on behalf of users without their keys.
4. **Mobile-Friendly** — The web UI is responsive; API layer is designed to also serve a future React Native mobile app.
5. **Docker-Native** — Everything runs in containers for dev and prod parity.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Mobile (Future)                    │
│                 React Native App                     │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS / REST + WebSockets
                     ▼
┌─────────────────────────────────────────────────────┐
│               Web Client (React + Vite)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Notes   │ │ Finance  │ │      Nutrition       │ │
│  │  Module  │ │  Module  │ │       Module         │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │           Shared UI (Tailwind CSS v4)             ││
│  │   TanStack Query · React Router · Zustand       ││
│  └──────────────────────────────────────────────────┘│
└────────────────────┬─────────────────────────────────┘
                     │ HTTP REST (JSON)
                     ▼
┌─────────────────────────────────────────────────────┐
│            API Gateway / Load Balancer               │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  Express.js API                      │
│  ┌───────┐ ┌───────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Auth  │ │Notes  │ │ Finance  │ │  Nutrition   │ │
│  │Module │ │Module │ │ Module   │ │   Module     │ │
│  └───┬───┘ └───┬───┘ └────┬─────┘ └──────┬───────┘ │
│      │         │          │              │          │
│      └─────────┴──────────┴──────────────┘          │
│  ┌──────────────────────────────────────────────────┐│
│  │          Services Layer                          ││
│  │  ┌────────────────┐ ┌────────────────────────┐  ││
│  │  │ Tag Generator  │ │  AI Adapter Layer      │  ││
│  │  │ (Rule-based)   │ │  ┌──────────────────┐  │  ││
│  │  │                │ │  │  OpenAI Provider  │  │  ││
│  │  │                │ │  ├──────────────────┤  │  ││
│  │  │                │ │  │  Anthropic Prov.  │  │  ││
│  │  │                │ │  └──────────────────┘  │  ││
│  │  └────────────────┘ └────────────────────────┘  ││
│  └──────────────────────────────────────────────────┘│
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                 MySQL 8 Database                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Users   │ │  Notes   │ │  finance_entries     │ │
│  │  api_keys│ │  tags    │ │  tags                 │ │
│  │  settings│ │  note_tags││  finance_tags        │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │  nutrition_entries · nutrition_items             ││
│  │  ai_providers · user_ai_configs                 ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## Technology Decisions

| Layer       | Technology              | Rationale                                    |
|-------------|------------------------|----------------------------------------------|
| Backend     | Node.js v24 + Express  | Requirement                                  |
| Database    | MySQL 8                | Requirement                                  |
| ORM         | Knex.js                | Lightweight, excellent migration support     |
| Frontend    | React + Vite + TS      | Requirement + Fast DX                        |
| UI          | Tailwind CSS v4         | Utility-first, dark mode via CSS variables    |
| State Mgmt  | TanStack Query + Zustand | Server state + client state separation      |
| Auth        | JWT + bcrypt           | Stateless, scalable                          |
| API Keys    | AES-256-GCM encryption | Industry-standard encryption at rest          |
| Validation  | Zod                    | Runtime type safety (shared with frontend)   |
| Testing     | Vitest + Supertest     | Fast, modern test runner                     |
| Container   | Docker + Compose       | Requirement                                  |

## Directory Structure
```
kriya/
├── docs/                    # All documentation
│   ├── architecture/        # System design docs
│   ├── api/                 # API specs (OpenAPI)
├── packages/shared/         # Shared Zod schemas + TypeScript types
├── server/                  # Backend (Express)
│   └── src/
│       ├── config/          # App configuration
│       ├── middleware/      # Auth, validation, error handling
│       ├── routes/          # Route definitions
│       ├── controllers/     # HTTP request/response handling
│       ├── validators/      # Zod schema re-exports
│       ├── services/        # Business logic
│       ├── repositories/    # Data access layer
│       ├── ai/              # AI adapter & providers
│       │   ├── providers/   # Provider implementations
│       │   ├── adapter.ts   # Provider registry
│       │   └── types.ts     # AI-related types
│       └── utils/           # Helpers
├── client/                  # Frontend (React + Vite)
│   └── src/
│       ├── components/      # UI components by module
│       ├── pages/           # Page-level components
│       ├── hooks/           # Custom hooks
│       ├── services/        # API client
│       ├── stores/          # Zustand stores
│       └── constants/       # RDA standards etc.
├── deploy/                  # Production deployment guides
├── docker/                  # MySQL init scripts
├── k8s/                     # Kubernetes manifests (future)
├── docker-compose.yml       # Dev environment
└── README.md
```

## Data Flow
1. User makes request → React app → HTTP (JSON) → Express
2. Express validates (Zod) → Routes → Service → Repository
3. Service calls Repository → MySQL (via Knex)
4. If AI feature: Service → AI Adapter → External AI Provider
5. Response flows back through the chain

## Key Design Decisions
- No ORM abstraction beyond Knex query builder (keep it close to SQL)
- AI adapter uses Strategy pattern + Registry for provider discovery
- Tags generated via rule-based fallback when AI is disabled
- API keys encrypted with AES-256-GCM; encryption keys managed via env vars
- All monetary values stored in smallest unit (paise/cents) as BIGINT
