
# DispatchPulse — System Specification & Architecture Document

## 1. Project Overview & Identity

- **Project Name:** DispatchPulse
- **Tagline:** Real-Time Service Health Monitoring & AI-Assisted Incident Triage Platform
- **Architecture:** Decoupled Monorepo (`/backend` Django REST API + `/frontend` React Vite SPA)
- **Target Audience:** Engineering teams, SREs, on-call responders, and public status viewers
- **Stack & Environment:** Python 3.12+, Django 5.x, DRF, SQLite (`db.sqlite3`), React 19 + Vite

---

## 2. Core Engineering Principles: DO NOT OVER-ENGINEER

- **Keep It Simple & Focused:** Build only what directly serves the core problem (uptime monitoring, incident tracking, AI triage). Avoid unnecessary layers, premature abstractions, microservices, or complex caching until strictly needed.
- **Pragmatic Architecture:** Prefer clean, straightforward Django patterns (standard models, clean DRF ViewSets, simple serializers) over convoluted design patterns.
- **Zero Hallucinated Scope:** Stick strictly to the agreed milestones. Do not introduce extra libraries, complex worker queues, or bloated dependencies unless essential.
- **Tutor-Paced Execution:** No jumping ahead. Wait for explicit user confirmation before executing commands, writing new files, or advancing milestones.

---

## 3. Technology Stack & Tooling

### Backend

- **Framework:** Python 3.12 / Django 5.x
- **API Engine:** Django REST Framework (DRF)
- **Database:** SQLite (`db.sqlite3`)
- **Auth:** DRF TokenAuthentication / SessionAuth with custom user model
- **Network Requests:** `requests` (for live URL status pinging)
- **AI Triage:** Free-tier Groq API (`llama-3.3-70b-versatile`) / Gemini Flash via structured JSON output + local heuristic rule engine fallback
- **CORS:** `django-cors-headers`

### Frontend

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Modern SRE Workspace theme, Dark Mode default with Light toggle)
- **Icons:** Lucide React (`lucide-react`)
- **State & Data Fetching:** TanStack Query (React Query v5) + Axios
- **Routing:** React Router v6

---

## 4. UI Design System (Modern SRE Workspace — Dual Theme)

### Dark Mode (Default — Linear / Raycast Inspired)
- **App Canvas:** `#0B0D14` (Deep obsidian charcoal)
- **Sidebar Surface:** `#10131E` (Matte navy charcoal with `border-r border-white/5`)
- **Cards & Surfaces:** `#151926` (Elevated micro-surfaces with `border border-white/5`)
- **Card Hover Surface:** `#1C2133` (Subtle interactive lift on hover)
- **Primary Text:** `#F8FAFC` (Slate 50 — clean high-contrast crisp text)
- **Secondary Text:** `#94A3B8` (Slate 400 — muted information text)
- **Muted Borders:** `1px solid rgba(255, 255, 255, 0.08)` (Ultra-fine borders)

### Light Mode (Toggleable — Clean SaaS Neutral)
- **App Canvas:** `#F8FAFC` (Slate 50 / soft neutral cool gray)
- **Sidebar & Card Surfaces:** `#FFFFFF` (Pure white containers with `shadow-sm`)
- **Borders & Dividers:** `1px solid #E2E8F0` (Slate 200)
- **Primary Text:** `#0F172A` (Slate 900 — deep readable navy)
- **Secondary Text:** `#64748B` (Slate 500)
- **Brand Accent:** `#4F46E5` (Indigo blue)

### Semantic Accent Tokens
- **Operational / Normal:** `#10B981` (Emerald Glow — 100% healthy status)
- **Degraded / Warning:** `#F59E0B` (Amber warning indicator)
- **Critical Outage (P1):** `#F43F5E` (Crimson Pulse with `animate-ping` beacon indicator)
- **Telemetry Latency:** `#06B6D4` (Electric Cyan for latency ms values and telemetry sparks)
- **AI Triage Accent:** `#8B5CF6` (Vibrant Violet for AI suggestions, badges, and copilot drawers)

### Visual Hierarchy & Layout Architecture
- **Top Row Bento Grid (Summary Metrics):** 4 elevated summary cards with prominent numbers and trend pills (Total Services, Active Incidents, MTTA/MTTR, System Uptime).
- **Interactive Service Bars (30-Check Telemetry):** Under each monitored service card, display an interactive 30-segment latency/uptime bar with micro-tooltips.
- **Incident Queue Table:** Filterable table by severity (`P1`–`P4`), status pills (`Triggered`, `Acknowledged`, `Resolved`), and responder avatar chips with online/on-call indicators.
- **AI Incident Investigation Terminal:** A dedicated copilot drawer/card with a violet gradient border, streaming typewriter-style AI root-cause diagnosis, and monospace stack trace tags.
- **Keyboard Shortcuts & Chrome:** Integrated `⌘K` / `Ctrl+K` search bar indicator in top navigation.

---

## 5. Application Pages & Route Structure

1. **Public Landing Page (`/`):**
   - Modern SRE presentation gateway with platform overview, feature bento grid, and architecture walkthrough.
   - Embedded interactive "Check Any Website" availability probe widget.
   - Universal authentication access gate with instant redirects.
2. **Dashboard (`/dashboard`):**
   - KPI stat cards: Active Incidents, Overall System Status, Average Ping Latency, Open P1s.
   - Quick "Simulate Crash / Webhook" test button with 5 scenario drills.
   - Interactive 30-check service bars and filterable data table of active incidents.
3. **Services Management (`/services`):**
   - Grid cards of all monitored services (_Auth API, Stripe Gateway, Database_).
   - 30-check segmented uptime/latency visual bar with tooltip diagnostics under each service.
   - Service registration and alert rule editing modals with configurable cadence options (15s, 30s, 60s, 300s).
   - "Ping All Now" batch health probe button with live response telemetry.
4. **Dedicated Incident Archive & Queue (`/incidents`):**
   - Full multi-filter incident center (filter by severity P1-P4, status TRIGGERED/ACKNOWLEDGED/RESOLVED, and service target).
   - Real-time search by title or stack trace logs with incident pagination.
5. **Incident Detail & Triage (`/incidents/:id`):**
   - Header with status lifecycle buttons: `Triggered` ➔ `Acknowledged` ➔ `Resolved`.
   - Raw stack trace terminal block (`font-mono`) with one-click clipboard copy.
   - Responder assignment dropdown delegating incidents to registered team members.
   - **"Auto-Triage with AI"** copilot terminal card triggering automated analysis:
     - Root-cause diagnosis (`root_cause`)
     - Immediate recommended remediation steps (`recommended_fix`)
     - Diagnostic confidence score (`confidence`)
     - Automatic graceful fallback to deterministic rule engine when LLM keys are absent.
   - Activity Timeline (log of every state change, note, and assignment).
6. **Team & On-Call Directory (`/team`):**
   - Team roster directory displaying user roles (`ADMIN`, `RESPONDER`, `VIEWER`).
   - Active on-call responder shift toggle (`is_on_call`).
   - Workspace member invitation modal.
7. **Public Status Page (`/status/:org_slug`):**
   - Ultra-clean view for external customers: "All Systems Operational" or "Partial Outage Detected".
   - Per-service status and 30-check uptime history bars.
8. **Public Website Availability Checker ("Is It Down Right Now?") (`/is-it-down`):**
   - Unauthenticated instant URL probe tool for any public domain or endpoint (e.g. Netflix, GitHub).
   - Live probe diagnostics: HTTP status code, round-trip latency (ms), resolved IP address, reachable indicator, and SSRF security check.
   - Conversion banner encouraging visitors to set up 24/7 monitoring and AI incident triage on DispatchPulse.
9. **Authentication Gateway (`/login`):**
   - DRF Token-authenticated login and new organization registration gateway with demo credential quick-fill.

---

## 6. Core Data Model Relationships (Django)

- `accounts.Organization` (Multi-Tenancy Root)
  - has many `accounts.User` (`email`, `role`, `is_on_call`)
  - has many `monitoring.Service` (`name`, `target_url`, `check_interval_sec`, `status`)
    - `monitoring.Service` has many `monitoring.HealthCheckLog` (`status_code`, `latency_ms`, `is_success`, `checked_at`)
    - `monitoring.Service` has many `incidents.AlertRule` (`consecutive_failures`, `timeout_ms`, `is_active`)
  - has many `incidents.Incident` (`title`, `severity`, `status`, `raw_logs`, `ai_summary`)
    - `incidents.Incident` has many `incidents.IncidentLog` (`actor`, `event_type`, `note`, `created_at`)

---

## 7. Detailed Database Schema Blueprint

### 1. Organization (`accounts.Organization`)
- `id`: UUIDField (Primary Key, default=uuid4, editable=False)
- `name`: CharField(max_length=120)
- `slug`: SlugField(max_length=140, unique=True, db_index=True)
- `api_key`: CharField(max_length=64, unique=True, db_index=True)
- `is_active`: BooleanField(default=True)
- `created_at`: DateTimeField(auto_now_add=True)

### 2. User (`accounts.User`)
- Inherits from `AbstractUser`, email authentication (`USERNAME_FIELD = "email"`)
- `organization`: ForeignKey -> `Organization` (on_delete=CASCADE, related_name='members', null=True, blank=True)
- `email`: EmailField(unique=True)
- `role`: CharField(choices=['ADMIN', 'RESPONDER', 'VIEWER'], default='RESPONDER')
- `is_on_call`: BooleanField(default=False)

### 3. Service (`monitoring.Service`)
- `id`: UUIDField (Primary Key, default=uuid4, editable=False)
- `organization`: ForeignKey -> `Organization` (on_delete=CASCADE, related_name='services')
- `name`: CharField(max_length=120)
- `target_url`: URLField(help_text="Live URL to health check")
- `status`: CharField(choices=['OPERATIONAL', 'DEGRADED', 'MAJOR_OUTAGE'], default='OPERATIONAL')
- `check_interval_sec`: PositiveIntegerField(default=60)
- `last_checked_at`: DateTimeField(null=True, blank=True)
- `created_at`: DateTimeField(auto_now_add=True)

### 4. HealthCheckLog (`monitoring.HealthCheckLog`)
- `id`: BigAutoField (Primary Key)
- `service`: ForeignKey -> `Service` (on_delete=CASCADE, related_name='health_logs')
- `status_code`: PositiveSmallIntegerField(null=True, blank=True)
- `latency_ms`: PositiveIntegerField(null=True, blank=True)
- `is_success`: BooleanField(default=True)
- `error_message`: TextField(blank=True, default='')
- `checked_at`: DateTimeField(auto_now_add=True, db_index=True)

### 5. Incident (`incidents.Incident`)
- `id`: UUIDField (Primary Key, default=uuid4, editable=False)
- `organization`: ForeignKey -> `Organization` (on_delete=CASCADE, related_name='incidents')
- `service`: ForeignKey -> `Service` (on_delete=models.PROTECT, related_name='incidents')
- `assigned_to`: ForeignKey -> `User` (on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_incidents')
- `title`: CharField(max_length=255)
- `error_type`: CharField(choices=['DATABASE', 'API_TIMEOUT', 'AUTH_SECURITY', 'SERVER_CRASH', 'PERFORMANCE'])
- `severity`: CharField(choices=['P1', 'P2', 'P3', 'P4'], default='P3')
- `status`: CharField(choices=['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'], default='TRIGGERED')
- `raw_logs`: TextField(help_text="Stack trace or raw failure output")
- `ai_summary`: JSONField(default=dict, blank=True)
  - Schema: `{"root_cause": str, "recommended_fix": str, "confidence": float}`
- `acknowledged_at`: DateTimeField(null=True, blank=True)
- `resolved_at`: DateTimeField(null=True, blank=True)
- `created_at`: DateTimeField(auto_now_add=True, db_index=True)

### 6. IncidentLog (`incidents.IncidentLog`)
- `id`: BigAutoField (Primary Key)
- `incident`: ForeignKey -> `Incident` (on_delete=CASCADE, related_name='logs')
- `actor`: ForeignKey -> `User` (on_delete=models.SET_NULL, null=True, blank=True)
- `event_type`: CharField(choices=['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED', 'COMMENT', 'AI_TRIAGE'])
- `note`: TextField()
- `created_at`: DateTimeField(auto_now_add=True, db_index=True)

### 7. AlertRule (`incidents.AlertRule`)
- `id`: BigAutoField (Primary Key)
- `service`: ForeignKey -> `Service` (on_delete=CASCADE, related_name='alert_rules')
- `consecutive_failures`: PositiveSmallIntegerField(default=3)
- `timeout_ms`: PositiveIntegerField(default=5000)
- `is_active`: BooleanField(default=True)
- `created_at`: DateTimeField(auto_now_add=True)

---

## 8. Atomic Feature Roadmap

- **F00:** Repo scaffolding, `.gitignore`, virtualenv, and base config. [DONE]
- **F01:** `accounts` app (`Organization`, custom `User` with email authentication). [DONE]
- **F02:** DRF & CORS configuration. [DONE]
- **F03:** `monitoring` app (`Service`, `HealthCheckLog`, custom admin). [DONE]
- **F04:** `incidents` app (`Incident`, `IncidentLog`, `AlertRule`, admin wiring). [DONE]
- **F05:** Seed demo data script (`seed_demo_data`). [DONE]
- **F06:** Automated HTTP Health Pinger engine & alert threshold trigger. [DONE]
- **F07:** DRF API ViewSets, Serializers & incident lifecycle actions. [DONE]
- **F08:** React Vite Setup & Tailwind modern SRE workspace theme. [DONE]
- **F09:** Frontend Dashboard (KPI cards, Incident Table, 30-check Service Bars). [DONE]
- **F10:** Incident Detail Drawer & Public Status Page (`/status/:slug`). [DONE]
- **F11:** Automated AI Incident Triage Pipeline (Groq / Gemini free-tier structured JSON output worker + deterministic heuristic fallback + trigger UI). [DONE]
- **F12:** Services Management & Interactive Operations (`/services` grid cards, target CRUD modal, "Ping All Now" batch health probe). [DONE]
- **F13:** Dedicated Incident Archive & Queue Center (`/incidents` full filterable table by severity/status/service, search & pagination). [DONE]
- **F14:** Public Instant Website Availability Checker ("Is It Down Right Now?" `/is-it-down` page, `POST /api/public/probe/` with SSRF protection & rate limiting). [DONE]
- **F15:** Alert Rules Configuration UI & Outage Simulator ("Simulate Crash / Webhook" trigger, dynamic threshold tuning). [DONE]
- **F16:** Team & On-Call Directory and Incident Assignment Delegation (`/team`, role management, shift toggle, assignee selector). [DONE]
- **F17:** Public Landing Page with "Is It Down?" Access & Universal Authentication Gateway (`/`, `/is-it-down`, `/dashboard`, strict workspace auth gating). [DONE]
---

## 9. Operating Protocol

1. Tutor-Paced Execution: No premature code blocks or branch jumps without explicit confirmation.
2. Explain conceptual "why" and "how" before presenting diffs or commands.
3. Minimal dependencies & clean Django/DRF patterns.
4. Git branch isolation per feature (`feat/f0X-...`).
5. Feature completion pause & mandatory Q&A before advancing.