# Rocketlane API

FastAPI service for auth and resumes (CRUD, text/PDF import, PDF export).

## Prerequisites

- Python 3.11+
- PostgreSQL — either `docker compose up -d` in this directory (maps **5432**) or an existing instance (set `DATABASE_URL` in `.env`, e.g. `localhost:5433`)

## Setup

```bash
cd backend
docker compose up -d
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Health: [http://localhost:8000/api/health](http://localhost:8000/api/health)

Run the Vite app from the repo root (`npm run dev`) so `/api` is proxied to this server.

## Tests

```bash
source .venv/bin/activate
PYTHONPATH=. pytest
```
