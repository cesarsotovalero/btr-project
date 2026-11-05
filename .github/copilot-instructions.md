# BTR — Copilot Instructions

Beat The Risk (BTR): agentic AI web platform for credit-risk assessment at Skandinaviska Enskilda Banken (SEB).

Monorepo with three services + a worker.

## Architecture

```
project-api/   FastAPI (Python 3.13, async, uv)  — port 8000
project-ui/    Vanilla JS SPA served by Express  — port 3000
project-worker/ Background job runner (Python)
PostgreSQL 16  — port 5433 (host) / 5432 (container)
```

All services run via `docker-compose.yml`. For local dev: `make dev` (starts everything) or `make dev-api` / `make dev-ui` individually.

Local environment overrides live in `.env.local` (git-ignored). See `.env.example` for all variables.

## Package Management

- **Always use `uv`**, never pip. Install deps: `uv sync`. Add a package: `uv add <pkg>`. Run anything: `uv run <cmd>`.
- pyproject.toml is the single source of truth for Python deps.

## Code Style

- Ruff (lint + format), target Python 3.13, line-length 88, rules: E F I N W UP.
- Type hints on all function signatures. Use `from __future__ import annotations`.
- Async everywhere in the API layer — `async def` endpoints, `AsyncSession` for DB.
- Import paths start with `app.` (e.g. `from app.models.case import Case`). The `src/` directory is on Python path.

## Database

- SQLAlchemy 2.0 async ORM. Base class in `app.database`. Models in `app.models/`.
- Migrations via Alembic in `project-api/alembic/versions/`. Always create a migration for schema changes: `uv run alembic revision --autogenerate -m "description"`, then review.
- Migrations use dialect-agnostic types (`sa.String(36)` for IDs, `sa.JSON`) — never use `postgresql.UUID` or `postgresql.JSON`.
- Tests use `sqlite+aiosqlite:///:memory:` — keep models compatible with SQLite (no Postgres-only types in ORM; use Alembic `op.execute` for Postgres-specific DDL).

## 8-Agent Pipeline

```
intake → extraction → [CHECKPOINT] → reconciliation
  → [regulation + risk_process + esg in parallel]
  → [CHECKPOINT] → historical → decision → [CHECKPOINT]
```

- Agents live in `app.agents/`. Each is a standalone `async` function: `run_<name>_agent(case_id, context)`.
- `workflow.py` orchestrates the pipeline, creates `AgentRun` records, persists findings/evidence, and inserts `WorkflowCheckpoint` rows that pause execution for human approval.
- Three checkpoint gates satisfy GDPR Art. 22 / EU AI Act human-oversight requirements.

## LLM Abstraction

- `app.llm.base.LLMProvider` — abstract base class. Two implementations: `MockLLMProvider` (deterministic, used in tests and default Docker), `GeminiLLMProvider` (Vertex AI).
- Selected via `LLM_BACKEND` env var (`mock` | `gemini`). Factory in `app.llm.__init__.get_llm_provider()`.
- When adding a new LLM method: add abstract method to `base.py`, implement in both `mock_provider.py` and `gemini_provider.py`.

## API

- Routers live in `app.api/`. Auth uses bcrypt + PyJWT bearer tokens (`POST /api/auth/login` → JWT).
- Pydantic v2 schemas in `app.schemas/`. Request models use `Base` suffix, responses use `Response` suffix by convention.
- CORS configured for localhost:3000 and project-ui:3000.

## Frontend

- No frameworks. Vanilla JS with a simple SPA router (`app.js`), API client (`api.js`), shared components (`components.js`).
- Pages in `public/js/pages/`. CSS in `public/css/style.css`. Single `index.html` entry point.
- Express proxy (`server.js`) forwards `/api` to the backend.

### Analyst ChatBot

Context-aware AI chat assistant (`public/js/chat.js`). Calls `POST /api/cases/{case_id}/chat` which loads full case context and delegates to `LLMProvider.answer_case_question()`. Floating button on case pages opens a side panel.

### SEB Green Design System

The UI uses **SEB Green** (`@sebgroup/green-core`) — the official Web Components library from [github.com/seb-oss/green](https://github.com/seb-oss/green).

**Build step**: `src/green-setup.mjs` imports all needed components and transitional styles. esbuild bundles this into `public/js/green.bundle.js` (IIFE format, loaded synchronously before app scripts). Run `npm run build` to regenerate.

**Prefer Green components over raw HTML where they work well.** Fall back to standard HTML/CSS when a Green component causes layout issues, breaks responsiveness, or hurts the user experience.

Common Green components:

- Buttons → `<gds-button rank="primary|secondary|tertiary">`
- Status/severity chips → `<gds-badge variant="positive|negative|warning|notice|information">`
- Loading states → `<gds-spinner></gds-spinner>`
- Form inputs → `<gds-input>`, `<gds-textarea>`, `<gds-select>`
- Dialogs → `<gds-dialog>`
- Layout → `<gds-flex>`, `<gds-grid>`, `<gds-div>`, `<gds-divider>`
- Typography → `<gds-text>`

**Design tokens**: `<gds-theme color-scheme="light">` wraps the app and provides CSS custom properties. Use `var(--gds-sys-color-*)` tokens in CSS — never hardcode SEB brand colours.

**Adding a new Green component**:

1. Add the import to `src/green-setup.mjs`
2. If it has transitional styles, import and register those too
3. Run `npm run build` to regenerate the bundle
4. Use the component in HTML via its `gds-*` tag name

### Icons (Font Awesome)

The UI uses **[Font Awesome 6](https://fontawesome.com/)** (v6.5.1, loaded from CDN in `index.html`) for all iconography.

- Solid icons: `<i class="fa-solid fa-folder-open"></i>`
- Regular icons: `<i class="fa-regular fa-file"></i>`
- Browse available icons at [fontawesome.com/icons](https://fontawesome.com/icons)
- Font Awesome is the **only** icon library used — do not introduce other icon sets.

### Charts (Apache ECharts)

The UI uses **[Apache ECharts](https://echarts.apache.org/)** for financial/risk visualizations.

**Build step**: `src/echarts-setup.mjs` imports needed ECharts modules and registers a custom `seb` theme. esbuild bundles this into `public/js/echarts.bundle.js` (IIFE, exposes `window.echarts`).

- Always initialise with the SEB theme: `echarts.init(el, 'seb')`.
- Use `Components.initChart(id, option)` / `Components.disposeCharts()` helpers from `components.js`.
- If using a new chart type, add the import to `src/echarts-setup.mjs` and run `npm run build`.

## Testing

- Framework: pytest + pytest-asyncio + httpx `AsyncClient`.
- Fixtures in `src/tests/conftest.py`: `db_session` (in-memory SQLite), `client` (full app with overridden DB).
- Run: `make test` from the repo root (or `cd project-api && uv run pytest`).
- All tests must pass in CI (GitHub Actions) against isolated SQLite — no external services required.

## Key Conventions

1. New agent → create `app/agents/<name>_agent.py`, register in `workflow.py` `AGENT_NAMES`, add to pipeline graph.
2. New model → create `app/models/<name>.py`, export in `app/models/__init__.py`, create Alembic migration.
3. New API route → create or extend router in `app/api/`, register in `main.py` if new file.
4. Environment config → add to `app.config.Settings` (pydantic-settings, reads from env vars).
5. Document parsers live in `app.parsers/` — PDF (pypdf), Excel (openpyxl), PPTX (python-pptx).
6. **Keep documentation in sync.** Whenever a change affects the project's architecture, models, API routes, agents, make targets, environment variables, or dependencies, update **both** `README.md` (root) and `.github/copilot-instructions.md` to reflect the new state.

## Test Data

Fake documents in `project-api/data/test_documents/` (3 cases: Nordvik Energy, FinTech Solutions, Baltic Cement). Regenerate with `uv run python data/generate_test_data.py`. See `data/test_documents/README.md` for details and planted inconsistencies.

## Make Targets

Run `make help` to list all available targets. Key ones: `make dev` (full local stack), `make dev-api`, `make dev-ui`, `make test`, `make db-reset`, `make docker-up`.
`make dev-api` stops `btr-project-worker-1` if present, to prevent duplicate workflow execution in local development.

## Docker

Default `LLM_BACKEND=mock` in Docker. Set `LLM_BACKEND=gemini` + Vertex AI credentials for real inference.
For local `make dev-api`, ADC is expected at `~/.config/gcloud/application_default_credentials.json`
and passed via `GOOGLE_APPLICATION_CREDENTIALS`.
