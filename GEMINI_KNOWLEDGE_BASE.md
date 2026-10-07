# DispatchPulse — Master Knowledge Base & Context for Gemini Gems

> **Purpose:** Upload this document directly to your Gemini Chat Gem's **Knowledge Base**.  
> It provides the LLM with exact, up-to-date context of the entire codebase, database schemas, API contracts, frontend architecture, and critical anti-patterns resolved during development so that new chat sessions never hallucinate or regress on resolved issues.

---

## 1. Persona & Pair Programming Protocol

You are the **Senior Full-Stack Architect & Pair Programming Tutor** for **DispatchPulse**.

### Guiding Principles:
1. **Tutor-Paced Execution:** The human developer writes and types the code manually in an educational environment. Do **not** generate huge unprompted code dumps or jump across roadmap features without the developer's confirmation.
2. **Explain "Why" & "How":** Always explain the architectural rationale, data flow, and trade-offs before presenting concise code blocks.
3. **No Breaking Changes:** Never contradict or overwrite the established schemas, conventions, and architectural contracts documented below.
4. **Minimal Dependencies:** Stick to the existing tech stack (Django REST Framework + React 19 + Vite + Tailwind CSS v4 + React Query + Lucide React). Do not introduce unnecessary external libraries.

---

## 2. Project Status & Feature Roadmap

| Feature ID | Scope / Description | Current Status |
|---|---|---|
| **F00** | Monorepo scaffolding, `.gitignore`, Python virtualenv, and base configs | **Completed** |
| **F01** | `accounts` app (Custom `User` with email auth, `Organization` model) | **Completed** |
| **F02** | DRF Token Authentication & Codespace CORS configuration | **Completed** |
| **F03** | `monitoring` app (`Service`, `HealthCheckLog`, custom Django admin) | **Completed** |
| **F04** | `incidents` app (`Incident`, `IncidentLog`, `AlertRule` models & admin) | **Completed** |
| **F05** | Demo data seeder management command (`python manage.py seed_demo_data`) | **Completed** |
| **F06** | Telemetry engine (`monitoring/engine.py` concurrent pinger & incident evaluator) | **Completed** |
| **F07** | DRF API ViewSets, Serializers & incident lifecycle actions (`acknowledge`, `resolve`) | **Completed** |
| **F08** | React 19 + Vite + Tailwind v4 setup with dual Obsidian Dark/Light theme | **Completed** (`main`) |
| **F09** | Frontend Operational Dashboard (KPI Bento cards, 30-check latency bars, Incident Table) | **Completed** (`main`) |
| **F10** | Incident Detail Drawer, AI Triage UI & Public Status Page (`/status/:slug`) | **Completed** (`main`) |
| **F11** | Automated AI Incident Triage Pipeline (Groq / Gemini structured JSON triage worker) | **Completed** (`main`) |
| **F12** | Services Management & Interactive Operations (`/services` grid, target CRUD modal, "Ping All Now" batch probe) | **Next Milestone** |
| **F13** | Dedicated Incident Archive & Queue Center (`/incidents` full filterable table by severity/status/service, search & pagination) | **Upcoming** |
| **F14** | Public Instant Website Availability Checker ("Is It Down Right Now?" `/is-it-down`, `POST /api/public/probe/` with SSRF protection & rate limiting) | **Upcoming** |
| **F15** | Alert Rules Configuration UI & Outage Simulator ("Simulate Crash / Webhook" trigger, dynamic threshold tuning) | **Upcoming** |

---

## 3. Monorepo Architecture & Directory Map

```text
dispatchpulse/
├── backend/                        # Django 5.x + Django REST Framework
│   ├── config/                     # Core settings, WSGI/ASGI, base URL routing
│   │   ├── settings.py             # DRF config, TokenAuth, CORS regex, DB
│   │   └── urls.py                 # Root router wiring all apps to /api/
│   ├── accounts/                   # Authentication & Organization domain
│   │   ├── models.py               # Custom User (email-based), Organization
│   │   ├── serializers.py         # Register, Login, User, Organization serializers
│   │   ├── views.py                # RegisterView, LoginView, LogoutView, CurrentUserView, UserViewSet
│   │   └── admin.py
│   ├── monitoring/                 # Health check & Service telemetry domain
│   │   ├── models.py               # Service, HealthCheckLog
│   │   ├── engine.py               # Concurrent HTTP pinger & threshold trigger
│   │   ├── serializers.py         # ServiceSerializer, HealthCheckLogSerializer
│   │   ├── views.py                # ServiceViewSet (action: ping), DashboardKPIView, PublicStatusView
│   │   └── admin.py
│   └── incidents/                  # Incident lifecycle & Alert rule domain
│       ├── models.py               # Incident, IncidentLog, AlertRule
│       ├── serializers.py         # IncidentSerializer, IncidentLogSerializer, AlertRuleSerializer
│       ├── views.py                # IncidentViewSet (actions: acknowledge, resolve), AlertRuleViewSet
│       └── admin.py
│
├── frontend/                       # React 19 + TypeScript + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── api/                    # Axios API client & typed endpoint modules
│   │   │   ├── client.ts           # Axios instance with auth interceptor
│   │   │   ├── auth.api.ts         # login, register, logout, getMe
│   │   │   ├── services.api.ts     # getServices, pingService, getDashboardKPIs
│   │   │   └── incidents.api.ts    # getIncidents, acknowledgeIncident, resolveIncident
│   │   ├── components/
│   │   │   ├── layout/             # AppLayout, Sidebar, TopNavbar, ProtectedRoute
│   │   │   └── ui/                 # Badge, Button, Input, Spinner
│   │   ├── context/                # Global React contexts & hooks
│   │   │   ├── AuthContext.tsx     # AuthProvider (session state & login/logout methods)
│   │   │   ├── useAuth.ts          # useAuth hook (separated for ESLint fast-refresh)
│   │   │   ├── ThemeContext.tsx    # ThemeProvider (dark/light toggle with localStorage)
│   │   │   └── useTheme.ts         # useTheme hook (separated for ESLint fast-refresh)
│   │   ├── pages/                  # Route views
│   │   │   ├── auth/LoginPage.tsx  # Authentication view with demo quick-login credentials
│   │   │   ├── Dashboard.tsx       # Main operations overview
│   │   │   ├── ServicesPage.tsx    # Monitored service targets
│   │   │   ├── IncidentsPage.tsx   # Active incident triage board
│   │   │   └── IncidentDetailsPage.tsx
│   │   ├── types/                  # Shared TypeScript interfaces (auth, service, incident, org)
│   │   ├── index.css               # Tailwind v4 import, @theme obsidian tokens, base transitions
│   │   ├── App.tsx                 # QueryClient, Theme/AuthProvider, BrowserRouter, Route declarations
│   │   └── main.tsx                # React 19 root render
│   ├── vite.config.ts              # Vite config with @tailwindcss/vite plugin & proxy
│   └── package.json
```

---

## 4. Backend Database Schemas & Data Models

### 1. `accounts` App
* **`Organization` (`accounts.Organization`):**
  * `id`: UUID (Primary Key, `default=uuid.uuid4`, non-editable)
  * `name`: `CharField(max_length=150)`
  * `slug`: `SlugField(unique=True)`
  * `created_at`: `DateTimeField(auto_now_add=True)`
* **`User` (`accounts.User`):**
  * **Crucial:** `USERNAME_FIELD = 'email'`. There is **NO `username`** field on this model!
  * `id`: BigAutoField
  * `email`: `EmailField(unique=True)`
  * `first_name`: `CharField(max_length=150, blank=True)`
  * `last_name`: `CharField(max_length=150, blank=True)`
  * `organization`: `ForeignKey(Organization, on_delete=CASCADE, related_name='members', null=True, blank=True)`
  * `role`: `CharField(choices=['ADMIN', 'RESPONDER', 'VIEWER'], default='RESPONDER')`
  * `is_on_call`: `BooleanField(default=False)`
  * `is_active`: `BooleanField(default=True)`
  * `is_staff`: `BooleanField(default=False)`

### 2. `monitoring` App
* **`Service` (`monitoring.Service`):**
  * `id`: UUID (Primary Key, `default=uuid.uuid4`)
  * `organization`: `ForeignKey(Organization, on_delete=CASCADE, related_name='services')`
  * `name`: `CharField(max_length=120)`
  * `target_url`: `URLField()`
  * `status`: `CharField(choices=ServiceStatus.choices, default='OPERATIONAL')`
    * **Enum:** `Service.ServiceStatus`: `OPERATIONAL`, `DEGRADED`, `MAJOR_OUTAGE`
  * `check_interval_sec`: `PositiveIntegerField(default=60)`
  * `last_checked_at`: `DateTimeField(null=True, blank=True)`
  * `created_at`: `DateTimeField(auto_now_add=True)`
* **`HealthCheckLog` (`monitoring.HealthCheckLog`):**
  * `id`: BigAutoField
  * `service`: `ForeignKey(Service, on_delete=CASCADE, related_name='health_logs')`
  * `status_code`: `PositiveSmallIntegerField(null=True, blank=True)`
  * `latency_ms`: `PositiveIntegerField(null=True, blank=True)`
  * `is_success`: `BooleanField(default=True)`
  * `error_message`: `TextField(blank=True, default='')`
  * `checked_at`: `DateTimeField(auto_now_add=True, db_index=True)`

### 3. `incidents` App
* **`Incident` (`incidents.Incident`):**
  * `id`: UUID (Primary Key, `default=uuid.uuid4`)
  * `organization`: `ForeignKey(Organization, on_delete=CASCADE, related_name='incidents')`
  * `service`: `ForeignKey(Service, on_delete=PROTECT, related_name='incidents')`
  * `assigned_to`: `ForeignKey(User, on_delete=SET_NULL, null=True, blank=True, related_name='assigned_incidents')`
  * `title`: `CharField(max_length=255)`
  * `error_type`: `CharField(choices=['DATABASE', 'API_TIMEOUT', 'AUTH_SECURITY', 'SERVER_CRASH', 'PERFORMANCE'])`
  * `severity`: `CharField(choices=['P1', 'P2', 'P3', 'P4'], default='P3')`
  * `status`: `CharField(choices=['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'], default='TRIGGERED')`
  * `raw_logs`: `TextField()`
  * `ai_summary`: `JSONField(default=dict, blank=True)` — Schema: `{"root_cause": str, "recommended_fix": str, "confidence": float}`
  * `acknowledged_at`: `DateTimeField(null=True, blank=True)`
  * `resolved_at`: `DateTimeField(null=True, blank=True)`
  * `created_at`: `DateTimeField(auto_now_add=True, db_index=True)`
* **`IncidentLog` (`incidents.IncidentLog`):**
  * `id`: BigAutoField
  * `incident`: `ForeignKey(Incident, on_delete=CASCADE, related_name='logs')`
  * `actor`: `ForeignKey(User, on_delete=SET_NULL, null=True, blank=True)`
  * `event_type`: `CharField(choices=['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED', 'COMMENT', 'AI_TRIAGE'])`
  * `note`: `TextField()`
  * `created_at`: `DateTimeField(auto_now_add=True, db_index=True)`
* **`AlertRule` (`incidents.AlertRule`):**
  * `id`: BigAutoField
  * `service`: `OneToOneField(Service, on_delete=CASCADE, related_name='alert_rule')`
  * `consecutive_failures_threshold`: `PositiveSmallIntegerField(default=3)`
  * `latency_threshold_ms`: `PositiveIntegerField(default=2000)`
  * `is_active`: `BooleanField(default=True)`
  * `created_at`: `DateTimeField(auto_now_add=True)`

---

## 5. API Contracts, Endpoints & Serializer Nuances

### Strict DRF Rule: Trailing Slashes
Django is configured with `APPEND_SLASH=True`. **Every single API route MUST end with a trailing slash `/`**.
* Calling `POST /api/auth/logout` without a slash causes an unhandled `RuntimeError: You called this URL via POST, but the URL doesn't end in a slash`.
* Calling `GET` endpoints without trailing slashes results in unnecessary `301 Moved Permanently` redirects.

### Authentication
* **Type:** `rest_framework.authentication.TokenAuthentication`.
* **Header format:** `Authorization: Token <token_key>`.
* The token key is stored in frontend `localStorage` under `'dispatchpulse_token'`.

### Endpoint Directory

| Method | Endpoint | Description | Auth Required | Key Payload / Response Notes |
|---|---|---|---|---|
| `POST` | `/api/auth/register/` | Register new user & org | No | Payload: `{ email, password, org_name, first_name?, last_name? }` (**note: `org_name`, NOT `organization_name`**) |
| `POST` | `/api/auth/login/` | Authenticate user | No | Payload: `{ email, password }` $\rightarrow$ Returns `{ token, user }` |
| `POST` | `/api/auth/logout/` | Invalidate token | Yes | Returns `{ detail: "Successfully logged out." }` |
| `GET` | `/api/auth/me/` | Current user profile | Yes | Returns full `User` object with `organization` |
| `GET` | `/api/dashboard/kpis/` | High-level metrics | Yes | Returns `{ total_services, active_incidents, system_status, avg_latency_ms, p1_incidents }` (**note: `p1_incidents` is a number, `system_status` is a string**) |
| `GET` | `/api/status/<slug:slug>/` | Public status board | No | Uses `Service.ServiceStatus` to evaluate overall state |
| `GET/POST`| `/api/services/` | Monitored services | Yes | Includes computed `latest_check` log object |
| `POST` | `/api/services/{id}/ping/` | Instant manual probe | Yes | Executes single ping probe and returns fresh log |
| `GET` | `/api/incidents/` | Incident triage queue | Yes | Returns nested `assigned_to` and `actor` as `UserSerializer` objects |
| `POST` | `/api/incidents/{id}/acknowledge/` | Acknowledge incident | Yes | Sets status to `ACKNOWLEDGED`, sets `acknowledged_at`, creates `IncidentLog` |
| `POST` | `/api/incidents/{id}/resolve/` | Resolve incident | Yes | Sets status to `RESOLVED`, sets `resolved_at`, creates `IncidentLog` |
| `GET/POST`| `/api/alert-rules/` | Alert thresholds | Yes | Scoped to authenticated user's organization |
| `POST` | `/api/incidents/{id}/triage/` | *(Planned F11)* Auto-triage with AI | Yes | LLM structured JSON output, updates `ai_summary`, writes `AI_TRIAGE` log |
| `POST` | `/api/services/ping-all/` | *(Planned F12)* Concurrent batch probe | Yes | Triggers `probe_all_services_concurrently` across all organization services |
| `POST` | `/api/public/probe/` | *(Planned F14)* Public instant URL probe | No | Unauthenticated ephemeral probe with SSRF validation and IP rate limiting |

---

## 6. Frontend Design System & Theme Conventions

### Tailwind CSS v4 Theme Architecture
Tailwind v4 is imported via `@import "tailwindcss";` in `frontend/src/index.css`.

#### 1. Custom Theme Tokens (`@theme` block in `index.css`)
```css
@theme {
  --color-obsidian-canvas: #0B0D14;
  --color-obsidian-sidebar: #10131E;
  --color-obsidian-card: #151926;
  --color-obsidian-hover: #1C2133;
  --color-obsidian-border: #1E2333; /* Critical: Solid dark border token */

  --color-telemetry-emerald: #10B981;
  --color-telemetry-amber: #F59E0B;
  --color-telemetry-crimson: #F43F5E;
  --color-telemetry-cyan: #06B6D4;
  --color-telemetry-violet: #8B5CF6;
}
```

#### 2. Dark Mode Selector
In Tailwind v4, selector-based dark mode requires the `@custom-variant` directive:
```css
@custom-variant dark (&:where(.dark, .dark *));
```
The active theme is toggled by adding or removing the `.dark` class on `document.documentElement` (`<html class="dark">`).

#### 3. Border Styling Rule (CRITICAL)
* **Never use `dark:border-white/5`!** Semi-transparent white borders interpolate at 50% opacity during 150ms transitions, causing a glaring white outline flare against dark backgrounds.
* **Always use solid, palette-matched dark borders:**
  ```tsx
  className="border border-slate-200 dark:border-obsidian-border"
  /* OR */
  className="border border-slate-200 dark:border-slate-800"
  ```

#### 4. Transition Rule
In `index.css`, universal transitions are consolidated to a single 150ms rule:
```css
*,
*::before,
*::after {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

---

## 7. React 19, TypeScript & Linter Rules

1. **Fast Refresh & ESLint Conformance (`react-refresh/only-export-components`):**
   * Never export React hooks (`useAuth`, `useTheme`) from the same file as their Context providers.
   * Dedicated hook files: `context/useAuth.ts` and `context/useTheme.ts`.
   * Add ESLint ignore comments directly above context declarations:
     ```tsx
     // eslint-disable-next-line react-refresh/only-export-components
     export const AuthContext = createContext<AuthContextType | undefined>(undefined);
     ```
2. **Routing:**
   * Always use **absolute** navigation paths (e.g. `<Navigate to="/login" replace />`), never relative paths (e.g. `Navigate to="login"`).
3. **Data Fetching:**
   * React Query (`@tanstack/react-query`) is used for all server telemetry and incident state.
   * Global `staleTime` is set to 30 seconds with `refetchOnWindowFocus: false`.

---

## 8. Hall of Resolved Gotchas (Never Repeat These!)

Before generating code, verify your proposed solution does not repeat any of these solved issues:

* ❌ **Do NOT omit TokenAuthentication:** DRF must have `'rest_framework.authentication.TokenAuthentication'` in `settings.py`.
* ❌ **Do NOT use string literals for DRF permissions:** Write `permission_classes = [IsAuthenticated]`, not `['IsAuthenticated']`.
* ❌ **Do NOT query `Service.Status`:** The enum text choice class is `Service.ServiceStatus`.
* ❌ **Do NOT use single underscore in Django Admin searches across FKs:** Use double underscore (e.g. `search_fields = ('service__name',)`).
* ❌ **Do NOT return raw FK IDs for users in incident responses:** Always nest `UserSerializer(read_only=True)` for `assigned_to` and `actor`.
* ❌ **Do NOT send `organization_name` from frontend registration:** The API serializer field is `org_name`.
* ❌ **Do NOT omit trailing slashes on API endpoints:** All Axios URLs must end in `/` (e.g. `client.post('/auth/logout/')`).
* ❌ **Do NOT use `dark:border-white/5`:** Use `dark:border-obsidian-border` or `dark:border-slate-800`.
* ❌ **Do NOT write relative `<Navigate to="login" />`:** Use `<Navigate to="/login" />`.
* ❌ **Do NOT add extra `package.json` to project root:** Only `frontend/package.json` should exist.
