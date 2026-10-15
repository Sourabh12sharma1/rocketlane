# Rocketlane Resume Builder — Design Spec

**Date:** 2026-10-15  
**Status:** Approved for implementation planning  
**Scope:** Resume building as a first-class feature inside the existing Rocketlane product (not a separate product or site).

## Goal

Users can sign in to Rocketlane, choose a resume template, fill data manually or import from PDF/paste, edit with a live preview, save to the database, and export a PDF. The marketing homepage CTAs open into this product flow.

## Non-goals (this slice)

- Public portfolio site / custom domain hosting
- Outreach email drafting
- Job board / application tracking backend
- Real SMS provider (Twilio etc.) — use dev OTP logged to server console in v1
- OAuth (Google) — deferred
- More than three templates

## Decisions locked in

| Topic | Choice |
|--------|--------|
| Product framing | Feature inside current Rocketlane UI + brand |
| Start path | Blank form **or** import (PDF / paste), same editor |
| Templates | 3 fixed: Classic, Modern, Compact; switch anytime, data preserved |
| Sections | Full: contact, summary, experience, education, skills, projects, links, certifications, languages, custom |
| Import / export | Import: paste text or PDF (best-effort parse). Export: PDF |
| Auth | Email + password + mobile OTP |
| Stack | Existing Vite + React 19 + Tailwind v4 frontend; new FastAPI + PostgreSQL backend |
| Architecture | Same React app for marketing + `/app` product routes; separate `backend/` service |

## User flow

1. Marketing homepage (`/`) — existing Rocketlane landing; CTAs link into the product.
2. Sign up / log in (`/app/signup`, `/app/login`) — email, password, phone; OTP verification (dev OTP in v1).
3. Resume hub (`/app/resume`) — list user’s resumes; create new.
4. New resume (`/app/resume/new`) — pick template → choose **Fill blank** or **Upload PDF / paste**.
5. Editor (`/app/resume/:id`) — left: section form; right: live preview for selected template; template switcher; Save; Download PDF.
6. Data persists in PostgreSQL under the authenticated user.

## Architecture

```
┌─────────────────────────────┐     /api/* (Vite proxy)     ┌──────────────────────────┐
│  Vite + React (Rocketlane)  │ ──────────────────────────► │  FastAPI + PostgreSQL    │
│  /              marketing   │                             │  auth, resumes, import,  │
│  /app/*         product UI  │ ◄────────────────────────── │  export PDF              │
└─────────────────────────────┘          JWT                └──────────────────────────┘
```

### Frontend

- Keep current homepage and design system (Space Grotesk / DM Sans, existing CSS variables).
- Add client-side routing for `/app/*` (lightweight router; no new framework required beyond what the app needs).
- Auth: store JWT (e.g. memory + `localStorage`); send `Authorization: Bearer` on API calls.
- Vite dev proxy: `/api` → `http://localhost:8000` so UI + API feel like one origin in development.
- Template preview components: Classic, Modern, Compact — same content model, different layout/CSS.

### Backend (`backend/`)

- FastAPI app with CORS for local Vite origin; production CORS for deployed frontend origin.
- PostgreSQL via SQLAlchemy (or equivalent) + Alembic migrations.
- Password hashing (bcrypt/argon2); JWT access tokens.
- OTP: generate code, store hashed/short-lived; in v1 print/log code to server console (no SMS). Phone verified flag on user.
- Resume CRUD; content stored as structured JSON matching the section model.
- Import endpoint: accept multipart PDF and/or plain text; return structured draft fields (best-effort). PDF text extraction via `pypdf` (or `pdfplumber` if layout needs it); structure via deterministic section heuristics (not an LLM requirement for v1).
- Export endpoint: render selected template HTML → PDF server-side (e.g. WeasyPrint or equivalent); return file download.

### Data model (high level)

**users**

- `id`, `email` (unique), `password_hash`, `phone`, `email_verified`, `phone_verified`, `created_at`

**otp_challenges** (or equivalent)

- `id`, `user_id`, `channel` (`sms`), `code_hash`, `expires_at`, `consumed_at`

**resumes**

- `id`, `user_id`, `title`, `template_id` (`classic` | `modern` | `compact`), `content` (JSONB), `created_at`, `updated_at`

**Resume content JSON** (logical shape)

- `contact`: name, email, phone, location, links[]
- `summary`: string
- `experience[]`: company, title, start, end, bullets[]
- `education[]`: school, degree, start, end, details
- `skills[]`: string or { name, level }
- `projects[]`: name, url, description, bullets[]
- `links[]`: label, url
- `certifications[]`: name, issuer, date
- `languages[]`: name, proficiency
- `custom[]`: title, body (or items[])

## API surface (v1)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create account (email, password, phone) |
| POST | `/api/auth/login` | Issue JWT |
| POST | `/api/auth/otp/request` | Send/dev-log OTP to phone |
| POST | `/api/auth/otp/verify` | Mark phone verified |
| GET | `/api/resumes` | List current user’s resumes |
| POST | `/api/resumes` | Create resume (template_id, optional title) |
| GET | `/api/resumes/{id}` | Get one resume |
| PUT | `/api/resumes/{id}` | Update title, template_id, content |
| DELETE | `/api/resumes/{id}` | Delete |
| POST | `/api/resumes/import` | PDF and/or text → structured content |
| GET | `/api/resumes/{id}/export.pdf` | PDF download for current template |

All resume routes require auth. Users may only access their own resumes.

## UI integration with existing Rocketlane

- Homepage CTAs (hero, “Your resume, as a site”, plan buttons where appropriate) navigate to `/app/signup` or `/app/resume` when already logged in.
- Product chrome under `/app` reuses Rocketlane colors/type; no separate brand.
- Marketing page remains static/front-end-only for non-auth content; product features require backend.

## Local run (target after implementation)

```bash
# Terminal 1 — API
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — UI
npm run dev
```

- UI: `http://localhost:5173`
- API: `http://localhost:8000` (via `/api` proxy from the UI)

## Error handling

- Auth failures: 401 with clear message; frontend redirects to login.
- Validation: 422 with field errors for forms.
- Import: always return best-effort structured data + warnings list if parse is partial; never fail the whole flow if some sections are empty.
- Export: 404 if resume missing; 500 with logged detail if PDF render fails.
- OTP: expire unused codes; rate-limit request endpoint.

## Testing

- Frontend: extend Vitest — template picker renders, editor sections present, unauthenticated `/app/resume` redirects to login.
- Backend: pytest — register/login, CRUD ownership, import returns expected keys for sample text, export returns `application/pdf`.
- Guard: marketing tests that assert no leaked reference-site copy remain intact.

## Security notes

- Never store plaintext passwords or OTP codes.
- JWT secret and DB URL from environment only.
- File upload size limits on PDF import.
- Sanitize/escape content when rendering PDF to avoid injection into HTML→PDF pipelines.

## Rollout order (implementation guidance)

1. Backend skeleton + users + JWT + Postgres
2. Dev OTP endpoints
3. Resume CRUD + content schema
4. Frontend `/app` routing, auth screens, wire to API
5. Template picker + editor + live preview (3 templates)
6. Import (paste + PDF) and export PDF
7. Homepage CTA wiring into `/app`

## Open follow-ups (explicitly later)

- Real SMS OTP provider
- Google OAuth
- Portfolio publish from resume content
- Additional templates beyond the three
