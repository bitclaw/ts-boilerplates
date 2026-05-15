.PHONY: help
help: ## Show available targets
	@echo ""
	@echo "\033[1mQuick Start\033[0m"
	@echo "  1. make setup          copy .env.example → .env (all apps)"
	@echo "  2. make db.up          start PostgreSQL + MySQL + Redis"
	@echo "  3. make migrate.gap    Prisma migrations + generate client + seed (GAP)"
	@echo "     make migrate.sp     TypeORM migrations (SP)"
	@echo "  4. make dev.gap        start GAP stack  (Express + React)"
	@echo "     make dev.sp         start SP stack   (NestJS + React)"
	@echo "  5. make ci.gap         typecheck + lint + test for GAP stack only"
	@echo "     make ci.sp          typecheck + lint + test for SP stack only"
	@echo ""
	@echo "\033[1mTest DB (one-time setup)\033[0m"
	@echo "  make db.test.setup     create app_test PostgreSQL DB"
	@echo "  make migrate.gap.test  run migrations against app_test"
	@echo ""
	@echo "\033[1mAll Targets\033[0m"
	@grep -E '^[a-zA-Z_.]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'
	@echo ""

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

.PHONY: db.test.setup
db.test.setup: ## Create app_test PostgreSQL database (run once after db.up)
	@docker compose exec postgres psql -U postgres -c "CREATE DATABASE app_test;" 2>/dev/null && echo "created app_test" || echo "app_test already exists"

.PHONY: migrate.gap.test
migrate.gap.test: ## Run Prisma migrations against test DB
	@DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_test" \
		pnpm --filter api-express-prisma-pg exec prisma migrate deploy

.PHONY: db.test.setup.sp
db.test.setup.sp: ## Create app_test MySQL DB and grant access to app user (run once after db.up)
	@docker compose exec mysql mysql -u root -proot -e \
	  "CREATE DATABASE IF NOT EXISTS app_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; \
	   GRANT ALL PRIVILEGES ON app_test.* TO 'app'@'%'; \
	   FLUSH PRIVILEGES;" \
	  2>/dev/null && echo "app_test ready" || echo "error: check db.up"

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
migrate.gap: ## Run Prisma migrations (GAP / PostgreSQL) + generate client + seed
	@pnpm --filter api-express-prisma-pg exec prisma migrate dev
	@pnpm --filter api-express-prisma-pg exec prisma generate
	@pnpm --filter api-express-prisma-pg run db:seed

.PHONY: seed.gap
seed.gap: ## Seed GAP database (demo@example.com / password123)
	@pnpm --filter api-express-prisma-pg run db:seed

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

.PHONY: typecheck.gap
typecheck.gap: ## Type-check GAP stack only (Express + React)
	@pnpm turbo run typecheck --filter=api-express-prisma-pg --filter=web-react-vite

.PHONY: typecheck.sp
typecheck.sp: ## Type-check SP stack only (NestJS + React)
	@pnpm turbo run typecheck --filter=api-nestjs-typeorm-mysql --filter=web-react-vite

# ── lint / fix ────────────────────────────────────────────────────────────

.PHONY: lint
lint: ## Biome lint all (report only)
	@pnpm turbo run lint

.PHONY: lint.gap
lint.gap: ## Biome lint GAP stack only
	@pnpm turbo run lint --filter=api-express-prisma-pg --filter=web-react-vite

.PHONY: lint.sp
lint.sp: ## Biome lint SP stack only
	@pnpm turbo run lint --filter=api-nestjs-typeorm-mysql --filter=web-react-vite

.PHONY: fix
fix: ## Biome auto-fix all (lint + format)
	@pnpm biome check --write .

.PHONY: fix.gap
fix.gap: ## Biome auto-fix GAP stack only
	@pnpm biome check --write apps/api-express-prisma-pg apps/web-react-vite

.PHONY: fix.sp
fix.sp: ## Biome auto-fix SP stack only
	@pnpm biome check --write apps/api-nestjs-typeorm-mysql apps/web-react-vite

# ── test ──────────────────────────────────────────────────────────────────

.PHONY: test
test: ## Run all tests (turbo)
	@pnpm turbo run test

.PHONY: test.gap
test.gap: ## Run tests for GAP stack only
	@pnpm turbo run test --filter=api-express-prisma-pg --filter=web-react-vite

.PHONY: test.sp
test.sp: ## Run tests for SP stack only
	@pnpm turbo run test --filter=api-nestjs-typeorm-mysql --filter=web-react-vite

.PHONY: test.coverage
test.coverage: ## Run all tests with coverage (turbo)
	@pnpm turbo run test:coverage

.PHONY: audit
audit: ## Security audit — fails on moderate+ vulnerabilities
	@pnpm audit --audit-level=moderate

# ── ci ────────────────────────────────────────────────────────────────────

.PHONY: ci
ci: setup install build typecheck lint test audit ## Full CI check

.PHONY: ci.gap
ci.gap: typecheck.gap lint.gap test.gap ## CI check for GAP stack only (Express + React)

.PHONY: ci.sp
ci.sp: typecheck.sp lint.sp test.sp ## CI check for SP stack only (NestJS + React)

# ── NestJS scaffold (SP stack) ────────────────────────────────────────────

.PHONY: gen.module.sp
gen.module.sp: ## Generate NestJS module (SP): make gen.module.sp NAME=blogs
	@pnpm --filter api-nestjs-typeorm-mysql exec nest g module $(NAME) --no-spec

.PHONY: gen.controller.sp
gen.controller.sp: ## Generate NestJS controller (SP): make gen.controller.sp NAME=blogs
	@pnpm --filter api-nestjs-typeorm-mysql exec nest g controller $(NAME) --no-spec

.PHONY: gen.service.sp
gen.service.sp: ## Generate NestJS service (SP): make gen.service.sp NAME=blogs
	@pnpm --filter api-nestjs-typeorm-mysql exec nest g service $(NAME) --no-spec

.PHONY: gen.resource.sp
gen.resource.sp: ## Generate full NestJS CRUD resource (SP): make gen.resource.sp NAME=blogs
	@pnpm --filter api-nestjs-typeorm-mysql exec nest g resource $(NAME) --no-spec

.PHONY: gen.guard.sp
gen.guard.sp: ## Generate NestJS guard (SP): make gen.guard.sp NAME=jwt-auth
	@pnpm --filter api-nestjs-typeorm-mysql exec nest g guard $(NAME) --no-spec
