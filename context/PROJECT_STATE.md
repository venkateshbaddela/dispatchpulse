# DispatchPulse — Project State

## 1. System Overview
- **Repository Structure:** Decoupled Monorepo (`/backend` Django REST API + `/frontend` React 19 SPA)
- **Environment:** Python 3.12, Django 5.x, DRF, PostgreSQL, React 19, Vite, Tailwind CSS v4
- **Active Theme:** Obsidian Dark (`#0B0D14`) by default with clean SaaS Light toggle

## 2. Feature Roadmap & Status

| Feature ID | Scope / Description | Status |
|---|---|---|
| **F00** | Monorepo scaffolding, `.gitignore`, virtualenv, and base configs | **Done** |
| **F01** | `accounts` app (Custom `User` with email auth, `Organization` model) | **Done** |
| **F02** | DRF Token Authentication & Codespace CORS configuration | **Done** |
| **F03** | `monitoring` app (`Service`, `HealthCheckLog`, custom admin) | **Done** |
| **F04** | `incidents` app (`Incident`, `IncidentLog`, `AlertRule` models & admin) | **Done** |
| **F05** | Demo data seeder (`python manage.py seed_demo_data`) | **Done** |
| **F06** | Telemetry engine (`monitoring/engine.py` concurrent pinger & evaluator) | **Done** |
| **F07** | DRF API ViewSets, Serializers & incident lifecycle actions (`acknowledge`, `resolve`) | **Done** |
| **F08** | React 19 + Vite setup, Tailwind v4 SRE workspace theme, Auth flow | **Done** |
| **F09** | Frontend Operational Dashboard (KPI Bento cards, 90-day latency bars, Incident Table) | **Next** |
| **F10** | Incident Detail Drawer, AI Triage UI & Public Status Page (`/status/:slug`) | **Upcoming** |
| **F11** | Automated AI Incident Triage Pipeline (Groq / Gemini structured JSON triage worker) | **Upcoming** |

## 3. Database & App Inventory
- `accounts`: `Organization` (UUID PK), `User` (email login, `role`, `is_on_call`)
- `monitoring`: `Service` (`target_url`, `status`, `check_interval_sec`), `HealthCheckLog` (`latency_ms`, `is_success`, `status_code`)
- `incidents`: `Incident` (`severity`, `status`, `raw_logs`, `ai_summary`), `IncidentLog` (`actor`, `event_type`), `AlertRule` (`consecutive_failures_threshold`, `latency_threshold_ms`)

## 4. Key Contracts & Enforced Conventions
- DRF endpoints strictly enforce trailing slashes (`APPEND_SLASH=True`).
- Solid dark borders (`border-slate-200 dark:border-obsidian-border`) used instead of transparent alpha borders.
- Dedicated hook files for ESLint fast-refresh compliance (`context/useAuth.ts`, `context/useTheme.ts`).
- Trailing slashes used on all Axios client calls (`/auth/logout/`, `/dashboard/kpis/`).