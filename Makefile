.PHONY: help
help: ## Show available targets
	@grep -E '^[a-zA-Z_.]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-24s\033[0m %s\n", $$1, $$2}'

# ── setup ─────────────────────────────────────────────────────────────────

.PHONY: setup
setup: ## Bootstrap project: copy .env.example → .env for all apps
	@for f in apps/*/.env.example; do \
		dest=$$(dirname $$f)/.env; \
		if [ ! -f $$dest ]; then \
			cp $$f $$dest; \
			echo "created $$dest"; \
		else \
			echo "skip $$dest (exists)"; \
		fi; \
	done

.PHONY: install
install: ## Install all dependencies (frozen lockfile)
	@pnpm install --frozen-lockfile

.PHONY: generate.gap
generate.gap: ## Generate Prisma client (GAP / PostgreSQL)
	@pnpm --filter api-express-prisma-pg exec prisma generate

.PHONY: db.up
db.up: ## Start PostgreSQL + MySQL + Redis via Docker Compose
	@docker compose up -d

.PHONY: db.down
db.down: ## Stop DB containers
	@docker compose down

.PHONY: db.reset
db.reset: db.down db.up ## Recreate DB containers (data wiped)

# ── dev ───────────────────────────────────────────────────────────────────

.PHONY: dev
dev: ## Start all apps in dev mode (turbo)
	@pnpm turbo run dev

.PHONY: dev.gap
dev.gap: ## Start GAP backend + frontend
	@pnpm turbo run dev --filter=api-express-prisma-pg --filter=web-react-vite

.PHONY: dev.sp
dev.sp: ## Start Scalable Path backend + frontend
	@pnpm turbo run dev --filter=api-nestjs-typeorm-mysql --filter=web-react-vite

# ── db migrations ─────────────────────────────────────────────────────────

.PHONY: migrate.gap
migrate.gap: ## Run Prisma migrations (GAP / PostgreSQL) + generate client
	@pnpm --filter api-express-prisma-pg exec prisma migrate dev
	@pnpm --filter api-express-prisma-pg exec prisma generate

.PHONY: migrate.gap.reset
migrate.gap.reset: ## Reset Prisma DB and re-run all migrations
	@pnpm --filter api-express-prisma-pg exec prisma migrate reset --force

.PHONY: migrate.sp
migrate.sp: ## Run TypeORM migrations (Scalable Path / MySQL)
	@pnpm --filter api-nestjs-typeorm-mysql run migration:run

.PHONY: migrate.sp.revert
migrate.sp.revert: ## Revert last TypeORM migration
	@pnpm --filter api-nestjs-typeorm-mysql run migration:revert

# ── build ─────────────────────────────────────────────────────────────────

.PHONY: build
build: ## Build all apps (turbo)
	@pnpm turbo run build

.PHONY: typecheck
typecheck: ## Type-check all apps (turbo)
	@pnpm turbo run typecheck

# ── lint / fix ────────────────────────────────────────────────────────────

.PHONY: lint
lint: ## Biome lint all (report only)
	@pnpm turbo run lint

.PHONY: fix
fix: ## Biome auto-fix all (lint + format)
	@pnpm biome check --write .

# ── test ──────────────────────────────────────────────────────────────────

.PHONY: test
test: ## Run all tests (turbo)
	@pnpm turbo run test

.PHONY: test.coverage
test.coverage: ## Run all tests with coverage (turbo)
	@pnpm turbo run test:coverage

.PHONY: audit
audit: ## Security audit — fails on moderate+ vulnerabilities
	@pnpm audit --audit-level=moderate

# ── ci ────────────────────────────────────────────────────────────────────

.PHONY: ci
ci: setup install build typecheck lint test audit ## Full CI check
