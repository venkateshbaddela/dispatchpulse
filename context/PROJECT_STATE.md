# DispatchPulse — Current Project State & Agent Context

> **Target Audience:** AI Coding Assistants & Human Developer  
> **Last Updated:** October 2026  
> **Active Branch:** `main` (Preparing `feat/f12-services-management`)  
> **Master Reference Files:** [`GEMINI_KNOWLEDGE_BASE.md`](file:///workspaces/dispatchpulse/GEMINI_KNOWLEDGE_BASE.md) | [`ERRORS_AND_BUGS_SOLVED.md`](file:///workspaces/dispatchpulse/ERRORS_AND_BUGS_SOLVED.md) | [`MODELS_DESIGN.md`](file:///workspaces/dispatchpulse/MODELS_DESIGN.md)

---

## 1. Quick Context for AI Coding Agents

* **What is DispatchPulse?** A real-time service health monitoring, telemetry dashboard, and AI-assisted incident triage platform.
* **Tech Stack:**
  * **Backend:** Python 3.12+ / Django 5.x / Django REST Framework (DRF) / SQLite (`db.sqlite3`) / DRF `TokenAuthentication`.
  * **Frontend:** React 19 / TypeScript / Vite / Tailwind CSS v4 / React Router DOM / `@tanstack/react-query` / Lucide React / Axios.
* **Workspace Architecture:** Monorepo with `/backend` and `/frontend`.
  * Run backend: `python manage.py runserver 0.0.0.0:8000` (from `/backend`).
  * Run frontend: `npm run dev` (from `/frontend`).
* **Developer Protocol:** The human developer writes and types the code manually to learn. Keep code snippets focused, minimal, and explain the architectural "why" and "how".

---

## 2. Feature Roadmap & Execution Status

| Feature ID | Scope / Focus | Status | Git Branch / Commit |
|---|---|---|---|
| **F00** | Monorepo scaffolding, `.gitignore`, virtualenv, and base configs | **Completed** | `main` |
| **F01** | `accounts` app (Custom `User` with email auth, `Organization` model) | **Completed** | `main` |
| **F02** | DRF Token Authentication & Codespaces CORS configuration | **Completed** | `main` |
| **F03** | `monitoring` app (`Service`, `HealthCheckLog`, custom Django admin) | **Completed** | `main` |
| **F04** | `incidents` app (`Incident`, `IncidentLog`, `AlertRule` models & admin) | **Completed** | `main` |
| **F05** | Demo data seeder management command (`python manage.py seed_demo_data`) | **Completed** | `main` |
| **F06** | Telemetry engine (`monitoring/engine.py` concurrent pinger & alert runner) | **Completed** | `main` |
| **F07** | DRF API ViewSets, Serializers & incident lifecycle actions (`acknowledge`, `resolve`) | **Completed** | `main` |
| **F08** | React 19 + Vite Setup & Tailwind modern SRE Obsidian workspace theme | **Completed** | `main` (`68f9ae6`) |
| **F09** | Frontend Operational Dashboard (KPI Bento cards, 30-check latency bars, Incident Table) | **Completed** | `main` (`15a7fe7`) |
| **F10** | Incident Detail Drawer, AI Triage UI & Public Status Page (`/status/:slug`) | **Completed** | `main` (`8aa8ecf`) |
| **F11** | Automated AI Incident Triage Pipeline (Groq / Gemini structured JSON output worker + trigger UI) | **Completed** | `main` |
| **F12** | Services Management & Interactive Operations (`/services` grid, target CRUD modal, "Ping All Now" batch probe) | **Completed** | `main` (`8aa550f`, `d39c3b4`) |
| **F13** | Dedicated Incident Archive & Queue Center (`/incidents` full filterable table by severity/status/service, search & pagination) | **Completed** | `main` (`4ad10e9`) |
| **F14** | Public Instant Website Availability Checker ("Is It Down Right Now?" `/is-it-down`, `POST /api/public/probe/` with SSRF protection & rate limiting) | **Completed** | `feat/f14-public-site-checker` |
| **F15** | Alert Rules Configuration UI & Outage Simulator ("Simulate Crash / Webhook" trigger, dynamic threshold tuning) | **Completed** | `feat/f15-alert-rules-simulator` |
| **F16** | Team & On-Call Directory and Incident Assignment Delegation (`/team`, role management, shift toggle, assignee selector) | **Completed** | `main` |
| **F17** | Public Landing Page with "Is It Down?" Access & Universal Authentication Gateway (`/`, `/is-it-down`, `/dashboard`, strict workspace auth gating) | **Completed** | `main` |

---

## 3. Active Architecture & Critical Conventions

### Backend Guardrails (DRF)
1. **Trailing Slashes Rule:** Django runs with `APPEND_SLASH=True`. **Every API endpoint URL must end with a trailing slash `/`** (e.g., `/api/auth/login/`, `/api/services/`, `/api/dashboard/kpis/`).
2. **Auth Header Format:** Uses DRF Token Auth: `Authorization: Token <token_key>`.
3. **No `username` field:** `accounts.User` uses `email` as `USERNAME_FIELD`. Never query or write `user.username`.
4. **Nested Serializers:** Foreign key user fields in incidents (`assigned_to`, `actor`) return nested `UserSerializer` objects, not raw integer IDs.
5. **Registration Payload:** Frontend must send `org_name` (not `organization_name`).
6. **SSRF & Public Probe Guardrails:** Any unauthenticated public probing endpoints (e.g. F14) must validate target URLs against private/internal IP ranges (RFC 1918, loopback, cloud metadata 169.254.169.254) and enforce strict DRF rate limiting.

### Frontend Guardrails (React 19 + Tailwind v4)
1. **Tailwind v4 Setup:** Uses `@import "tailwindcss";` with `@theme` block in `frontend/src/index.css`.
2. **Dark Mode Variant:** Must use `@custom-variant dark (&:where(.dark, .dark *));`.
3. **Obsidian Dark Palette Tokens:**
   * Canvas: `--color-obsidian-canvas: #0B0D14`
   * Sidebar: `--color-obsidian-sidebar: #10131E`
   * Card: `--color-obsidian-card: #151926`
   * Hover: `--color-obsidian-hover: #1C2133`
   * Border: `--color-obsidian-border: #1E2333`
4. **Border Styling Rule (B25 Fix):**
   * **NEVER** use `dark:border-white/5` (semi-transparent white flares bright during 150ms transitions).
   * **ALWAYS** use solid dark borders: `border-slate-200 dark:border-obsidian-border` (or `dark:border-slate-800`).
5. **Fast Refresh Rule (ESLint):** Never export hooks or Context instances from React component files. Hooks must live in `src/context/useAuth.ts` and `src/context/useTheme.ts`.
6. **Routing:** Always use absolute route redirects (e.g. `<Navigate to="/login" replace />`), never relative paths.
7. **FOUC & Dark Mode Reload Rule:** To eliminate light-theme flickering on reload in dark mode, `index.html` executes a synchronous `<script>` in `<head>` applying `dark` to `document.documentElement` before DOM parsing, while `index.css` sets base canvas background colors on `html` and `body`. Root wrappers must avoid `transition-colors duration-*` on initial load.