# Rocketlane Resume Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship resume building as a Rocketlane `/app` feature with FastAPI + PostgreSQL auth, three templates, PDF/paste import, save, and PDF export — UI and API runnable together locally.

**Architecture:** Keep the existing Vite marketing homepage. Add `/app/*` product routes in the same React app. New `backend/` FastAPI service owns auth (email/password + dev mobile OTP), resume CRUD, import, and PDF export. Vite proxies `/api` → `http://localhost:8000`.

**Tech Stack:** React 19, Vite 6, Tailwind v4, react-router-dom, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, PyJWT, passlib/bcrypt, pypdf, WeasyPrint, pytest, Vitest.

## Global Constraints

- Resume builder is a **feature inside Rocketlane**, not a separate product or brand.
- Templates v1: exactly `classic`, `modern`, `compact`.
- Auth: email + password + mobile OTP; v1 OTP is **logged to server console** (no Twilio).
- Import: paste text and/or PDF; export: PDF.
- Content sections: contact, summary, experience, education, skills, projects, links, certifications, languages, custom.
- Preserve existing marketing copy originality tests; do not copy reference-site text.
- Secrets and `DATABASE_URL` / `JWT_SECRET` from environment only.
- Spec: `docs/superpowers/specs/2026-10-15-resume-builder-design.md`.

---

## File structure (target)

```
backend/
  docker-compose.yml          # Postgres only
  requirements.txt
  .env.example
  alembic.ini
  alembic/
  app/
    main.py                   # FastAPI app, CORS, /api prefix routers
    config.py
    db.py
    models.py                 # User, OtpChallenge, Resume
    schemas.py                # Pydantic models
    auth.py                   # password hash, JWT, deps
    routers/
      auth.py
      resumes.py
    services/
      otp.py
      import_resume.py
      export_pdf.py
      empty_content.py
  tests/
    conftest.py
    test_auth.py
    test_resumes.py
    test_import_export.py

src/
  main.tsx                    # BrowserRouter
  lib/
    api.ts                    # fetch helpers + token
    auth.tsx                  # AuthProvider
    resumeTypes.ts            # shared content types + emptyContent()
  components/
    AppShell.tsx
    RequireAuth.tsx
    resume/
      TemplatePicker.tsx
      ResumeForm.tsx
      ResumePreview.tsx
      templates/
        Classic.tsx
        Modern.tsx
        Compact.tsx
  routes/
    index.tsx                 # marketing (CTA links)
    app/
      Login.tsx
      Signup.tsx
      VerifyOtp.tsx
      ResumeList.tsx
      ResumeNew.tsx
      ResumeEditor.tsx
```

---

### Task 1: Backend scaffold + Postgres + health check

**Files:**
- Create: `backend/docker-compose.yml`
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/app/db.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_health.py`
- Modify: `.gitignore` (add `backend/.venv/`, `backend/.env`)

**Interfaces:**
- Produces: `app.main:app` FastAPI instance; `GET /api/health` → `{"status":"ok"}`; `get_settings()` reading `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`.

- [ ] **Step 1: Write the failing health test**

```python
# backend/tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m venv .venv && source .venv/bin/activate && pip install fastapi uvicorn pydantic-settings httpx pytest && PYTHONPATH=. pytest tests/test_health.py -v`

Expected: FAIL (module `app.main` missing or route missing)

- [ ] **Step 3: Implement scaffold**

`backend/docker-compose.yml`:
```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: rocketlane
      POSTGRES_PASSWORD: rocketlane
      POSTGRES_DB: rocketlane
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

`backend/requirements.txt`:
```
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
sqlalchemy>=2.0.36
psycopg[binary]>=3.2.0
alembic>=1.14.0
pydantic-settings>=2.6.0
passlib[bcrypt]>=1.7.4
bcrypt<4.1.0
PyJWT>=2.9.0
python-multipart>=0.0.12
pypdf>=5.0.0
weasyprint>=63.0
httpx>=0.27.0
pytest>=8.3.0
```

`backend/app/config.py`:
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "postgresql+psycopg://rocketlane:rocketlane@localhost:5432/rocketlane"
    jwt_secret: str = "dev-only-change-me"
    jwt_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:5173"
    otp_ttl_seconds: int = 300
    max_upload_bytes: int = 5 * 1024 * 1024

def get_settings() -> Settings:
    return Settings()
```

`backend/app/db.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

class Base(DeclarativeBase):
    pass

engine = create_engine(get_settings().database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

`backend/app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings

app = FastAPI(title="Rocketlane API")
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}
```

`backend/.env.example`:
```
DATABASE_URL=postgresql+psycopg://rocketlane:rocketlane@localhost:5432/rocketlane
JWT_SECRET=change-me-in-production
CORS_ORIGINS=http://localhost:5173
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && source .venv/bin/activate && PYTHONPATH=. pytest tests/test_health.py -v`  
Expected: PASS

- [ ] **Step 5: Start Postgres**

Run: `cd backend && docker compose up -d`  
Expected: container healthy/running on `5432`

- [ ] **Step 6: Commit**

```bash
git add backend .gitignore
git commit -m "feat(backend): scaffold FastAPI health endpoint and Postgres compose"
```

---

### Task 2: Users + register/login JWT

**Files:**
- Create: `backend/app/models.py`
- Create: `backend/app/schemas.py`
- Create: `backend/app/auth.py`
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/auth.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/script.py.mako`
- Create: `backend/alembic/versions/001_users.py`
- Create: `backend/tests/test_auth.py`
- Modify: `backend/app/main.py` (include auth router)
- Modify: `backend/tests/conftest.py`

**Interfaces:**
- Produces:
  - `User(id: UUID, email: str, password_hash: str, phone: str, email_verified: bool, phone_verified: bool, created_at)`
  - `POST /api/auth/register` body `{email, password, phone}` → `{access_token, token_type: "bearer", user: {id, email, phone, phone_verified}}`
  - `POST /api/auth/login` body `{email, password}` → same shape
  - `get_current_user(db, credentials) -> User`
  - `hash_password(str) -> str`, `verify_password(plain, hash) -> bool`, `create_access_token(user_id: str) -> str`

- [ ] **Step 1: Write failing auth tests**

```python
# backend/tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    r = client.post("/api/auth/register", json={
        "email": "a@example.com",
        "password": "secret123",
        "phone": "+15551234567",
    })
    assert r.status_code == 201
    body = r.json()
    assert "access_token" in body
    assert body["user"]["email"] == "a@example.com"
    assert body["user"]["phone_verified"] is False

    r2 = client.post("/api/auth/login", json={"email": "a@example.com", "password": "secret123"})
    assert r2.status_code == 200
    assert "access_token" in r2.json()

def test_login_bad_password():
    client.post("/api/auth/register", json={
        "email": "b@example.com", "password": "secret123", "phone": "+15550001111",
    })
    r = client.post("/api/auth/login", json={"email": "b@example.com", "password": "wrong"})
    assert r.status_code == 401
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `cd backend && source .venv/bin/activate && pip install -r requirements.txt && PYTHONPATH=. pytest tests/test_auth.py -v`  
Expected: FAIL (routes missing)

- [ ] **Step 3: Implement models, auth helpers, router, migration**

`User` and later models in `models.py` using `Mapped`, `mapped_column`, UUID primary keys (`uuid4`), unique email.

Auth router registers user (409 if email exists), hashes password with passlib bcrypt, returns JWT (HS256, `sub=str(user.id)`).

Wire Alembic `env.py` to `Base.metadata` and `get_settings().database_url`. Generate/write migration creating `users` table.

`conftest.py`: ensure tables exist for tests (`Base.metadata.create_all(bind=engine)` in session-scoped fixture) OR run alembic upgrade before tests. Prefer `create_all` in tests for speed; still keep Alembic for real deploys.

Include router in `main.py`: `app.include_router(auth.router, prefix="/api/auth", tags=["auth"])`.

- [ ] **Step 4: Run migrations + tests**

Run:
```bash
cd backend && source .venv/bin/activate
alembic upgrade head
PYTHONPATH=. pytest tests/test_auth.py -v
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "feat(backend): email/password register and login with JWT"
```

---

### Task 3: Mobile OTP (dev console)

**Files:**
- Modify: `backend/app/models.py` (add `OtpChallenge`)
- Modify: `backend/app/schemas.py`
- Modify: `backend/app/routers/auth.py`
- Create: `backend/app/services/otp.py`
- Create: `backend/alembic/versions/002_otp.py`
- Modify: `backend/tests/test_auth.py`

**Interfaces:**
- Produces:
  - `POST /api/auth/otp/request` (Bearer) → `{ok: true, expires_in: int}`; logs `DEV OTP for {phone}: {code}` via `logging`
  - `POST /api/auth/otp/verify` (Bearer) body `{code: str}` → `{phone_verified: true}`
  - Codes hashed (sha256), TTL from settings, single-use

- [ ] **Step 1: Write failing OTP tests**

```python
def _token():
    r = client.post("/api/auth/register", json={
        "email": "otp@example.com", "password": "secret123", "phone": "+15557654321",
    })
    return r.json()["access_token"]

def test_otp_verify_flow(monkeypatch, caplog):
    import logging
    caplog.set_level(logging.INFO)
    token = _token()
    r = client.post("/api/auth/otp/request", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    # Extract 6-digit code from logs
    import re
    m = re.search(r"DEV OTP for .+: (\d{6})", caplog.text)
    assert m, caplog.text
    code = m.group(1)
    r2 = client.post(
        "/api/auth/otp/verify",
        headers={"Authorization": f"Bearer {token}"},
        json={"code": code},
    )
    assert r2.status_code == 200
    assert r2.json()["phone_verified"] is True
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement OTP service + endpoints + migration**

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(backend): mobile OTP request/verify with console dev codes"
```

---

### Task 4: Resume content schema + CRUD

**Files:**
- Modify: `backend/app/models.py` (`Resume`)
- Modify: `backend/app/schemas.py` (`ResumeContent`, create/update/out)
- Create: `backend/app/services/empty_content.py`
- Create: `backend/app/routers/resumes.py`
- Create: `backend/alembic/versions/003_resumes.py`
- Create: `backend/tests/test_resumes.py`
- Modify: `backend/app/main.py`

**Interfaces:**
- Produces:
  - `empty_content() -> dict` with all section keys empty/default
  - `template_id`: Literal[`classic`,`modern`,`compact`]
  - `GET /api/resumes` → list of `{id, title, template_id, updated_at}`
  - `POST /api/resumes` body `{template_id, title?}` → full resume with empty content
  - `GET /api/resumes/{id}` → full
  - `PUT /api/resumes/{id}` body `{title?, template_id?, content?}` → full
  - `DELETE /api/resumes/{id}` → 204
  - Ownership: 404 if not owner (do not leak existence)

- [ ] **Step 1: Write failing CRUD tests** (create, list, get, update template+content, delete, other-user 404)

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement model, schemas, router, migration**

`empty_content()`:
```python
def empty_content() -> dict:
    return {
        "contact": {"name": "", "email": "", "phone": "", "location": "", "links": []},
        "summary": "",
        "experience": [],
        "education": [],
        "skills": [],
        "projects": [],
        "links": [],
        "certifications": [],
        "languages": [],
        "custom": [],
    }
```

- [ ] **Step 4: Run tests — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(backend): resume CRUD with template and JSON content"
```

---

### Task 5: Import paste + PDF

**Files:**
- Create: `backend/app/services/import_resume.py`
- Modify: `backend/app/routers/resumes.py` (`POST /api/resumes/import`)
- Create: `backend/tests/test_import_export.py` (import cases first)
- Create: `backend/tests/fixtures/sample_resume.txt`

**Interfaces:**
- Produces: `POST /api/resumes/import` multipart fields `text` (optional) and/or `file` (optional PDF); auth required; response `{content: ResumeContent, warnings: string[]}`. Always 200 with best-effort content if any input present; 400 if neither provided. Max file size from settings.

Heuristics: split on common headings (`EXPERIENCE`, `EDUCATION`, `SKILLS`, `PROJECTS`, `SUMMARY`, `CERTIFICATIONS`, `LANGUAGES`); first non-empty lines → contact name/email/phone via regex.

- [ ] **Step 1: Write failing import tests** (paste text with headings fills sections; empty file rejected; oversized rejected)

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement `parse_resume_text` + PDF extract via `pypdf` + route**

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(backend): best-effort resume import from paste and PDF"
```

---

### Task 6: Export PDF

**Files:**
- Create: `backend/app/services/export_pdf.py`
- Modify: `backend/app/routers/resumes.py` (`GET /api/resumes/{id}/export.pdf`)
- Modify: `backend/tests/test_import_export.py`

**Interfaces:**
- Produces: `GET /api/resumes/{id}/export.pdf` → `application/pdf` bytes; HTML escape all user strings; three simple HTML layouts matching template_id.

- [ ] **Step 1: Write failing export test** (create resume, export, assert `content-type` includes `pdf`, body starts with `%PDF`)

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement WeasyPrint HTML→PDF for classic/modern/compact**

If WeasyPrint system deps fail in CI/sandbox, document OS packages (`libpango`, `libcairo`) in `backend/README.md` and still implement; tests may skip with clear message only if import fails — prefer making them pass on the primary Linux env.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(backend): export resume PDF for selected template"
```

---

### Task 7: Frontend routing, API client, Vite proxy

**Files:**
- Modify: `package.json` (add `react-router-dom`)
- Modify: `vite.config.ts` (proxy `/api`)
- Modify: `src/main.tsx`
- Create: `src/lib/api.ts`
- Create: `src/lib/auth.tsx`
- Create: `src/lib/resumeTypes.ts`
- Create: `src/components/RequireAuth.tsx`
- Create: `src/components/AppShell.tsx`
- Create: `src/routes/app/Login.tsx` (placeholder “Login” heading OK for this task)
- Create: `tests/app-routing.test.tsx`
- Modify: existing tests if `Home` mount path changes

**Interfaces:**
- Produces:
  - `apiFetch(path, options)` — prefixes `/api`, attaches Bearer from `localStorage` key `rocketlane_token`
  - `AuthProvider` with `{token, user, login, logout, setSession}`
  - Routes: `/` → Home; `/app/login`, `/app/signup`, `/app/verify-otp`, `/app/resume`, `/app/resume/new`, `/app/resume/:id`
  - `RequireAuth` redirects to `/app/login`

Vite proxy:
```ts
server: {
  port: 5173,
  proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } },
},
```

- [ ] **Step 1: Write failing routing test** — render app at `/app/resume` without token → ends up showing Login (or navigate to login)

- [ ] **Step 2: Install router + implement files**

Run: `npm install react-router-dom`

- [ ] **Step 3: Run `npm test` — all pass including existing marketing tests**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(web): add /app routing, auth context, and API proxy"
```

---

### Task 8: Auth screens wired to backend

**Files:**
- Create/Modify: `src/routes/app/Signup.tsx`
- Create/Modify: `src/routes/app/Login.tsx`
- Create/Modify: `src/routes/app/VerifyOtp.tsx`
- Create: `tests/auth-screens.test.tsx`

**Interfaces:**
- Signup posts `/api/auth/register`, stores token, navigates to `/app/verify-otp`
- Login posts `/api/auth/login`, stores token, navigates to `/app/resume` (or verify-otp if `phone_verified` false — prefer always offering verify until verified)
- VerifyOtp: request OTP button → verify form → on success `/app/resume`
- Match Rocketlane visual language (existing card/border/shadow utilities)

- [ ] **Step 1: Write Vitest** that Signup form fields exist and submit calls `fetch` (mock)

- [ ] **Step 2: Implement screens**

- [ ] **Step 3: `npm test` PASS**

- [ ] **Step 4: Manual smoke** (backend + UI running): register → see OTP in API logs → verify → land on resume list

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(web): signup, login, and OTP verify screens"
```

---

### Task 9: Resume list + new (template + blank/import start)

**Files:**
- Create: `src/routes/app/ResumeList.tsx`
- Create: `src/routes/app/ResumeNew.tsx`
- Create: `src/components/resume/TemplatePicker.tsx`
- Create: `tests/resume-new.test.tsx`

**Interfaces:**
- List: GET `/api/resumes`, “New resume” → `/app/resume/new`
- New: TemplatePicker (`classic`|`modern`|`compact`) → choose **Fill blank** (POST create → navigate editor) or **Upload / paste** (show file + textarea → POST import → POST create with content → editor)

- [ ] **Step 1: Failing test** — TemplatePicker shows three templates

- [ ] **Step 2: Implement list + new flow**

- [ ] **Step 3: `npm test` PASS**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(web): resume list and template start with blank or import"
```

---

### Task 10: Editor form + three live previews

**Files:**
- Create: `src/routes/app/ResumeEditor.tsx`
- Create: `src/components/resume/ResumeForm.tsx`
- Create: `src/components/resume/ResumePreview.tsx`
- Create: `src/components/resume/templates/Classic.tsx`
- Create: `src/components/resume/templates/Modern.tsx`
- Create: `src/components/resume/templates/Compact.tsx`
- Create: `tests/resume-editor.test.tsx`

**Interfaces:**
- Load GET `/api/resumes/:id`
- Left: editable sections for full content model; Right: preview for `template_id`
- Template switcher updates local state; Save PUT `/api/resumes/:id`
- Debounce optional; explicit Save button required

- [ ] **Step 1: Failing test** — editor shows Contact and Summary fields for mock resume

- [ ] **Step 2: Implement form + three template components**

- [ ] **Step 3: `npm test` PASS**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(web): resume editor with classic/modern/compact live preview"
```

---

### Task 11: Export download + import from editor + homepage CTAs

**Files:**
- Modify: `src/routes/app/ResumeEditor.tsx` (Download PDF button)
- Modify: `src/routes/index.tsx` (hero / resume section CTAs → `/app/signup` or `/app/resume`)
- Modify: `src/components/PlanSignup.tsx` (optional: primary action link to signup instead of waitlist-only — keep waitlist if preferred; at minimum add “Build resume” path on hero)
- Modify: `README.md` (run UI + backend together)
- Create: `backend/README.md`
- Modify: `tests/home.test.tsx` if CTA text/href assertions needed

**Interfaces:**
- Download: `GET /api/resumes/:id/export.pdf` with Bearer → blob download `resume.pdf`
- Homepage “Build resume” / resume feature CTA uses `<Link to="/app/signup">` (or `/app/resume` when token present)

- [ ] **Step 1: Wire export button + homepage links**

- [ ] **Step 2: Update READMEs with two-terminal run instructions**

```bash
# Terminal 1
cd backend && docker compose up -d
source .venv/bin/activate && alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Terminal 2
npm run dev
```

- [ ] **Step 3: `npm test` && `cd backend && PYTHONPATH=. pytest` PASS**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: wire PDF export and homepage CTAs into resume app"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Feature inside Rocketlane UI | 7–11 |
| Blank or import → same editor | 9–10 |
| 3 templates, switchable | 9–10, 6 |
| Full sections | 4, 10 |
| Paste + PDF import, PDF export | 5, 6, 11 |
| Email/password + mobile OTP (dev) | 2, 3, 8 |
| FastAPI + PostgreSQL | 1–6 |
| Vite `/api` proxy, joint run | 7, 11 |
| Homepage CTA into `/app` | 11 |
| Tests frontend + backend | each task |

No TBD placeholders. Type names aligned: `template_id`, `empty_content`, `/api/auth/*`, `/api/resumes*`.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-15-resume-builder.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — execute tasks in this session with executing-plans checkpoints  

Which approach?
