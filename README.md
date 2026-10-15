# Rocketlane

Job-search landing page plus a resume builder under `/app` (auth, templates, import, PDF export).

Stack: Vite + React 19 + Tailwind v4 (UI), FastAPI + PostgreSQL (API). The dev server proxies `/api` to the backend on port 8000.

## Run locally (two terminals)

### Terminal 1 — API + database

```bash
cd backend
docker compose up -d          # Postgres (default port 5432 in compose)
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit DATABASE_URL if you use local Postgres on another port (e.g. 5433)
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

See [backend/README.md](backend/README.md) for backend-only details.

### Terminal 2 — UI

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign up at `/app/signup`, then build or import a resume at `/app/resume`.

## Tests

```bash
npm test
cd backend && PYTHONPATH=. pytest
```

## Deploy (landing only)

`vercel.json` targets the static Vite build (`npm run build`, output `dist`). The resume app expects the API wherever you host it, with CORS configured.
