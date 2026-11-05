.PHONY: help dev dev-api dev-ui dev-worker test test-api lint format \
       db-up db-wait db-migrate db-seed db-reset \
       docker-up docker-down docker-logs clean

# ─── Default Target ───────────────────────────────────────────
help:
	@echo ""
	@echo "  BTR — Beat The Risk"
	@echo "  ────────────────────────────────────────"
	@echo ""
	@echo "  Local development (requires Docker for Postgres):"
	@echo "    make dev            Start DB + API + UI locally"
	@echo "    make dev-api        Start only the API server"
	@echo "    make dev-ui         Start only the UI server"
	@echo ""
	@echo "  Database:"
	@echo "    make db-up          Start Postgres container only"
	@echo "    make db-wait        Wait for Postgres to be ready"
	@echo "    make db-migrate     Run Alembic migrations (local)"
	@echo "    make db-seed        Seed sample data (local)"
	@echo "    make db-reset       Drop + re-migrate + re-seed"
	@echo ""
	@echo "  Testing & quality:"
	@echo "    make test           Run all tests (SQLite, no Docker needed)"
	@echo "    make lint           Lint and format check"
	@echo "    make format         Auto-format code"
	@echo ""
	@echo "  Docker (production-like):"
	@echo "    make docker-up      Full stack via Docker Compose"
	@echo "    make docker-down    Stop and remove containers + volumes"
	@echo "    make docker-logs    Tail logs for all services"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean          Kill dev processes, remove local DB files"
	@echo ""

# ─── Environment ──────────────────────────────────────────────
# Load .env.local if it exists (developer overrides)
ifneq (,$(wildcard .env.local))
  include .env.local
  export
endif

POSTGRES_PASSWORD  ?=
DATABASE_URL       ?= postgresql+asyncpg://btr:$(POSTGRES_PASSWORD)@localhost:5433/btr
LLM_BACKEND        ?= gemini
VERTEX_AI_PROJECT  ?=
VERTEX_AI_LOCATION ?= europe-west1
GOOGLE_APPLICATION_CREDENTIALS ?= $(HOME)/.config/gcloud/application_default_credentials.json
UPLOAD_DIR         ?= ./uploads
API_URL            ?= http://localhost:8000

# ─── Local Development ───────────────────────────────────────
dev: db-up db-wait db-migrate db-seed
	@echo "\n✅ Database ready. Starting API + UI...\n"
	@trap 'kill 0' INT TERM; \
	  $(MAKE) dev-api & \
	  $(MAKE) dev-ui & \
	  wait

dev-api:
	@docker stop btr-project-worker-1 >/dev/null 2>&1 || true
	cd project-api && \
	  PYTHONPATH=src \
	  DATABASE_URL="$(DATABASE_URL)" \
	  LLM_BACKEND="$(LLM_BACKEND)" \
	  VERTEX_AI_PROJECT="$(VERTEX_AI_PROJECT)" \
	  VERTEX_AI_LOCATION="$(VERTEX_AI_LOCATION)" \
	  GOOGLE_APPLICATION_CREDENTIALS="$(GOOGLE_APPLICATION_CREDENTIALS)" \
	  UPLOAD_DIR="$(UPLOAD_DIR)" \
	  uv run uvicorn app.main:app --reload --port 8000

dev-ui:
	cd project-ui && npm install --silent && API_URL="$(API_URL)" npm start

# ─── Database ─────────────────────────────────────────────────
db-up:
	@docker compose up -d db
	@echo "⏳ Postgres container starting..."

db-wait:
	@echo "⏳ Waiting for Postgres to accept connections..."
	@until docker compose exec -T db pg_isready -U btr -d btr >/dev/null 2>&1; do \
	  sleep 1; \
	done
	@echo "✅ Postgres is ready"

db-migrate:
	cd project-api && \
	  PYTHONPATH=src \
	  DATABASE_URL="$(DATABASE_URL)" \
	  uv run alembic upgrade head
	@echo "✅ Migrations applied"

db-seed:
	cd project-api && \
	  PYTHONPATH=src \
	  DATABASE_URL="$(DATABASE_URL)" \
	  UPLOAD_DIR="$(UPLOAD_DIR)" \
	  uv run python -m app.seed.seed_data
	@echo "✅ Seed data loaded"

db-reset:
	cd project-api && \
	  PYTHONPATH=src \
	  DATABASE_URL="$(DATABASE_URL)" \
	  uv run alembic downgrade base
	@$(MAKE) db-migrate
	@$(MAKE) db-seed
	@echo "✅ Database reset complete"

# ─── Testing & Quality ───────────────────────────────────────
test: test-api

test-api:
	cd project-api && uv run pytest src/tests/ -v

lint:
	cd project-api && uv run ruff check src/
	cd project-api && uv run ruff format --check src/

format:
	cd project-api && uv run ruff check --fix src/
	cd project-api && uv run ruff format src/

# ─── Docker (production-like) ────────────────────────────────
docker-up:
	docker compose up --build -d
	@echo "✅ Stack is up → http://localhost:3000"

docker-down:
	docker compose down -v

docker-logs:
	docker compose logs -f

# ─── Cleanup ──────────────────────────────────────────────────
clean:
	@echo "🧹 Cleaning up..."
	-@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	-@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	-@rm -f project-api/btr_dev.db
	@echo "✅ Clean"
