# Super Node — Domain-Driven Clean Architecture

> **Real-time sports data middleware** built with **Bun** + **ElysiaJS**, organized
> following Domain-Driven Design (DDD) principles with Clean Architecture layers.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                        │
│   ElysiaJS Routes │ Middleware │ Error Handling │ Swagger Docs   │
├─────────────────────────────────────────────────────────────────┤
│                       APPLICATION LAYER                         │
│   Use Cases │ DTOs │ Mappers │ Ports (Interfaces)               │
├─────────────────────────────────────────────────────────────────┤
│                         DOMAIN LAYER                            │
│   Entities │ Value Objects │ Aggregate Roots │ Domain Events     │
│   Repository Interfaces │ Domain Services                       │
├─────────────────────────────────────────────────────────────────┤
│                      INFRASTRUCTURE LAYER                       │
│   Redis Cache │ HTTP Client │ Provider Adapters │ Repositories   │
│   Pino Logger │ Event Bus                                       │
└─────────────────────────────────────────────────────────────────┘
```

### The Dependency Rule

> **Inner layers never depend on outer layers.**

- `Domain` → depends on nothing (pure business logic)
- `Application` → depends on `Domain` + its own ports
- `Infrastructure` → implements `Domain` and `Application` ports
- `Presentation` → depends on `Application` use cases
- `Config` → composition root, wires everything together

---

## Folder Structure

```
src/
├── index.ts                          # Entry point / Composition Root
│
├── config/                           # Configuration & DI
│   ├── env.ts                        # Environment variable loading
│   ├── container.ts                  # Dependency Injection container
│   └── index.ts
│
├── domain/                           # 🧠 Core Business Logic (no dependencies)
│   ├── common/                       # DDD Building Blocks
│   │   ├── entity.ts                 # Base Entity class
│   │   ├── value-object.ts           # Base Value Object class
│   │   ├── aggregate-root.ts         # Aggregate Root with domain events
│   │   ├── domain-event.ts           # Domain Event interface
│   │   └── index.ts
│   │
│   └── sport/                        # Sport Bounded Context
│       ├── entities/
│       │   ├── match.ts              # Match aggregate root
│       │   ├── market.ts             # Market entity
│       │   ├── sport-event.ts        # Sport Event entity
│       │   └── index.ts
│       ├── value-objects/
│       │   ├── odds.ts               # Odds value object
│       │   ├── score.ts              # Score value object
│       │   ├── match-status.ts       # Match status value object
│       │   └── index.ts
│       ├── repositories/             # Repository Interfaces (Ports)
│       │   ├── match-repository.ts
│       │   ├── market-repository.ts
│       │   ├── event-repository.ts
│       │   └── index.ts
│       ├── services/                 # Domain Services
│       │   ├── odds-validation.service.ts
│       │   └── index.ts
│       └── index.ts
│
├── application/                      # 🔧 Orchestration & Use Cases
│   ├── ports/                        # Interface Definitions (Driven Ports)
│   │   ├── logger.ts
│   │   ├── cache-service.ts
│   │   ├── data-provider.ts
│   │   ├── event-bus.ts
│   │   └── index.ts
│   ├── dtos/                         # Data Transfer Objects
│   │   ├── match.dto.ts
│   │   └── index.ts
│   ├── mappers/                      # Entity ↔ DTO Mappers
│   │   ├── match.mapper.ts
│   │   └── index.ts
│   ├── use-cases/                    # Application Use Cases
│   │   ├── match/
│   │   │   ├── get-live-matches.use-case.ts
│   │   │   ├── get-match-detail.use-case.ts
│   │   │   ├── sync-provider-data.use-case.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
│
├── infrastructure/                   # 🔌 Concrete Implementations (Adapters)
│   ├── logging/
│   │   ├── pino-logger.ts            # Pino implementation of Logger port
│   │   └── index.ts
│   ├── cache/
│   │   ├── redis-cache.service.ts    # Redis implementation of CacheService port
│   │   ├── in-memory-cache.service.ts # In-memory fallback
│   │   └── index.ts
│   ├── persistence/
│   │   └── in-memory/                # In-memory repository implementations
│   │       ├── in-memory-match.repository.ts
│   │       ├── in-memory-market.repository.ts
│   │       └── index.ts
│   ├── events/
│   │   ├── in-memory-event-bus.ts    # In-memory event bus
│   │   └── index.ts
│   ├── http/
│   │   ├── http-client.ts            # HTTP client with retries
│   │   └── index.ts
│   ├── providers/                    # External Data Provider Adapters
│   │   ├── betfair/
│   │   │   ├── betfair.provider.ts
│   │   │   └── index.ts
│   │   ├── sportradar/
│   │   │   ├── sportradar.provider.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
│
├── presentation/                     # 🌐 HTTP / API Layer
│   ├── middleware/
│   │   ├── error-handler.ts          # Global error handling
│   │   ├── request-logger.ts         # Request logging with timing
│   │   └── index.ts
│   ├── routes/
│   │   ├── match.routes.ts           # Match API endpoints
│   │   ├── health.routes.ts          # Health check endpoints
│   │   └── index.ts
│   └── index.ts
│
└── shared/                           # 🧰 Shared Kernel
    ├── types/
    │   └── result.ts                 # Result<T, E> monad
    ├── errors/
    │   └── domain-errors.ts          # Error factory functions
    ├── utils/
    │   ├── date.ts                   # Date utilities
    │   └── guard.ts                  # Type guard utilities
    ├── constants/
    │   └── index.ts                  # App-wide constants
    └── index.ts
```

---

## Key Design Patterns

### 1. **Result Monad** (`shared/types/result.ts`)

No exceptions in domain/application layers. All operations return `Result<T, E>`.

### 2. **Repository Pattern** (`domain/*/repositories/`)

Domain defines interfaces; infrastructure provides implementations. Easy to swap storage.

### 3. **Use Case Pattern** (`application/use-cases/`)

Each use case is a single class with an `execute()` method. Stateless, depends only on ports.

### 4. **Port/Adapter (Hexagonal)** (`application/ports/` + `infrastructure/`)

Application defines what it needs (ports). Infrastructure provides implementations (adapters).

### 5. **Domain Events** (`domain/common/domain-event.ts`)

Aggregate roots raise events. The event bus dispatches them to handlers.

### 6. **Dependency Injection** (`config/container.ts`)

Manual DI — explicit wiring, no magic decorators or reflection.

---

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun test

# Type check
bun run typecheck
```

### API Endpoints

| Method | Path                | Description                     |
| ------ | ------------------- | ------------------------------- |
| GET    | `/`                 | Server info                     |
| GET    | `/swagger`          | Interactive API documentation   |
| GET    | `/api/health`       | Liveness check                  |
| GET    | `/api/ready`        | Readiness check (deep)          |
| GET    | `/api/matches/live` | Get live matches (query: sport) |
| GET    | `/api/matches/:id`  | Get match with markets          |
| POST   | `/api/matches/sync` | Trigger provider sync           |

---

## Adding New Features

### Adding a new Bounded Context

1. Create `src/domain/<context>/` with entities, value objects, repositories
2. Create `src/application/use-cases/<context>/` with use cases
3. Create `src/presentation/routes/<context>.routes.ts` for API endpoints
4. Wire in `src/config/container.ts`
5. Register routes in `src/index.ts`

### Adding a new Data Provider

1. Create `src/infrastructure/providers/<provider>/`
2. Implement the `DataProvider` interface
3. Register in `src/config/container.ts`

### Swapping to a Database

1. Create `src/infrastructure/persistence/<database>/`
2. Implement repository interfaces (e.g., `MatchRepository`)
3. Update `src/config/container.ts` to use the new implementation

---

## Environment Variables

Copy `.env.example` to `.env` and configure as needed.
See `src/config/env.ts` for all available options.
