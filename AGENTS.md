# Repository Guidelines

## Project Structure & Module Organization
- Backend (FastAPI, Python): `kronos-eam-backend/app/` with submodules like `api/`, `models/`, `schemas/`, `services/`, and `agents/`. Tests live in `kronos-eam-backend/tests/` and additional `test_*.py` files in the backend root.
- Frontend (React + TS): `kronos-eam-react/` (`src/`, `public/`). A secondary WIP app exists at `kronos-e-react/`.
- Docs & Ops: `docs/` (architecture, API), `deploy/` (GCP scripts), and repo-level guides (`README.md`, `PROJECT_STATUS.md`).

## Build, Test, and Development Commands
- Backend dev server: `cd kronos-eam-backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Backend helpers: `./start.sh` (dev), `./run_api.sh` (simple), `./run_migration.sh` (alembic).
- Backend tests: `cd kronos-eam-backend && pytest` or with coverage: `pytest --cov=app tests/`.
- Lint/format (backend): `black app/ && flake8 app/`.
- Frontend dev: `cd kronos-eam-react && npm install && npm start`.
- Frontend build/test: `npm run build` and `npm test`.

## Coding Style & Naming Conventions
- Python: 4-space indent; format with `black`; lint with `flake8`. Modules live under `app/` (e.g., `app/services/plant_service.py`). Tests use `test_*.py`.
- TypeScript/React: follow CRA defaults; ESLint config at `kronos-eam-react/.eslintrc.json`. Components use PascalCase (e.g., `src/components/PlantCard.tsx`).
- Naming: use descriptive, lower_snake_case for Python, camelCase for TS variables, PascalCase for components/classes.

## Testing Guidelines
- Backend: `pytest` with `pytest-asyncio` where needed; prefer `tests/` layout and `test_*.py` naming. Target meaningful coverage using `pytest --cov=app`.
- Frontend: Jest + Testing Library via `npm test`. Name files `*.test.tsx/ts` alongside source or under `src/__tests__/`.

## Commit & Pull Request Guidelines
- Commits: use concise, imperative messages (e.g., "Fix deployment secrets"), optionally include scope ("backend:"). Group related changes.
- PRs: include summary, rationale, test plan (commands + expected results), linked issues, and screenshots for UI changes. Ensure CI passes and lint/formatters are clean.

## Security & Configuration Tips
- Do not commit secrets. Use `kronos-eam-backend/.env.example` as a template; keep local `.env` files out of VCS.
- Validate service config before deploy using scripts in `deploy/` and app `cloudbuild.yaml` files.
