# ts-boilerplates

Turborepo monorepo with production-ready TypeScript boilerplate apps.

## Apps

| App | Stack | Port |
|-----|-------|------|
| `api-express-prisma-pg` | Express · Prisma · PostgreSQL | 3001 |
| `api-nestjs-typeorm-mysql` | NestJS · TypeORM · MySQL | 3002 |
| `web-react-vite` | React · Vite | 5173 |

## Prerequisites

- [Node.js](https://nodejs.org) (see `.mise.toml` for version)
- [pnpm](https://pnpm.io)
- [Docker](https://www.docker.com) (for databases)

## Quick Start

```bash
# 1. Install dependencies
make install

# 2. Copy .env.example → .env for all apps
make setup

# 3. Start databases (PostgreSQL · MySQL · Redis)
make db.up

# 4. Run migrations + generate ORM clients
make migrate.gap   # Express / Prisma / PostgreSQL
make migrate.sp    # NestJS / TypeORM / MySQL

# 5. Start dev servers
make dev.gap       # api-express-prisma-pg + web-react-vite
make dev.sp        # api-nestjs-typeorm-mysql + web-react-vite
make dev           # all apps
```

## Environment Variables

Each app has an `.env.example` with defaults that match the Docker Compose config.
`make setup` copies them automatically. Edit after copying as needed.

| App | File |
|-----|------|
| `api-express-prisma-pg` | `apps/api-express-prisma-pg/.env` |
| `api-nestjs-typeorm-mysql` | `apps/api-nestjs-typeorm-mysql/.env` |
| `web-react-vite` | `apps/web-react-vite/.env` |

## Make Targets

```
make help           # Show all available targets
make setup          # Copy .env.example → .env (skips existing)
make install        # Install dependencies (frozen lockfile)
make db.up          # Start PostgreSQL + MySQL + Redis
make db.down        # Stop DB containers
make db.reset       # Recreate DB containers (data wiped)
make dev            # Start all apps
make dev.gap        # Start GAP stack (Express + React)
make dev.sp         # Start SP stack (NestJS + React)
make migrate.gap    # Prisma migrate dev + generate client
make migrate.gap.reset  # Reset Prisma DB, re-run migrations
make generate.gap   # Prisma generate only (no migration)
make migrate.sp     # TypeORM migration:run
make migrate.sp.revert  # TypeORM: revert last migration
make build          # Build all apps
make typecheck      # TypeScript check all apps
make lint           # Biome lint (report only)
make fix            # Biome lint + format (auto-fix)
make test           # Run all tests
make test.coverage  # Run tests with coverage
make audit          # Security audit (fails on moderate+)
make ci             # Full CI: setup → install → build → typecheck → lint → test → audit
```

## Project Structure

```
ts-boilerplates/
├── apps/
│   ├── api-express-prisma-pg/   # Express + Prisma + PostgreSQL API
│   ├── api-nestjs-typeorm-mysql/ # NestJS + TypeORM + MySQL API
│   └── web-react-vite/          # React + Vite frontend
├── packages/                    # Shared packages
├── docker-compose.yml           # PostgreSQL + MySQL + Redis
├── Makefile
├── turbo.json
└── pnpm-workspace.yaml
```
