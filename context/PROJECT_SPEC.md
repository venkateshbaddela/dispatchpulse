# DispatchPulse — System Specification & Architecture Document

## 1. Project Overview & Identity

- **Project Name:** DispatchPulse
- **Tagline:** Real-Time Service Health Monitoring & AI-Assisted Incident Triage Platform
- **Architecture:** Decoupled Monorepo (`/backend` Django REST API + `/frontend` React Vite SPA)[cite: 1]
- **Target Audience:** Engineering teams, SREs, on-call responders, and public status viewers[cite: 1]
- **Stack & Environment:** Python 3.12, Django 5.x, DRF, PostgreSQL (psycopg), Vite + React

---

## 2. Core Engineering Principles: DO NOT OVER-ENGINEER

- **Keep It Simple & Focused:** Build only what directly serves the core problem (uptime monitoring, incident tracking, AI triage)[cite: 1]. Avoid unnecessary layers, premature abstractions, microservices, or complex caching until strictly needed[cite: 1].
- **Pragmatic Architecture:** Prefer clean, straightforward Django patterns (standard models, clean DRF ViewSets, simple serializers) over convoluted design patterns[cite: 1].
- **Zero Hallucinated Scope:** Stick strictly to the agreed milestones[cite: 1]. Do not introduce extra libraries, complex worker queues, or bloated dependencies unless essential[cite: 1].
- **Tutor-Paced Execution:** No jumping ahead[cite: 1]. Wait for explicit user confirmation before executing commands, writing new files, or advancing milestones[cite: 1].

---

## 3. Technology Stack & Tooling

### Backend

- **Framework:** Python 3.12 / Django 5.x
- **API Engine:** Django REST Framework (DRF)[cite: 1]
- **Database:** PostgreSQL (`psycopg` v3)
- **Auth:** DRF TokenAuthentication / SessionAuth with custom user model[cite: 1]
- **Network Requests:** `requests` (for live URL status pinging)[cite: 1]
- **AI Triage:** Free-tier Groq API (`llama-3.3-70b-versatile`) / Gemini Flash via structured JSON output[cite: 1]
- **CORS:** `django-cors-headers`[cite: 1]

### Frontend

- **Framework:** React 18+ with TypeScript[cite: 1]
- **Build Tool:** Vite[cite: 1]
- **Styling:** Tailwind CSS (Modern Card Workspace theme, Dark Mode default with Light toggle)[cite: 1]
- **Icons:** Lucide React (`lucide-react`)[cite: 1]
- **State & Data Fetching:** TanStack Query (React Query v5) + Axios[cite: 1]
- **Routing:** React Router v6[cite: 1]

---

## 4. UI Design System (Modern SaaS Workspace — Dual Theme)

### Dark Mode (Default)
- **App Canvas:** `#0D0F17` (Deep twilight charcoal)[cite: 1]
- **Sidebar Surface:** `#131622` (Matte navy charcoal)[cite: 1]
- **Cards & Surfaces:** `#1A1D2E` (Elevated card containers)[cite: 1]
- **Borders & Dividers:** `1px solid #262A40` (Subtle container outlines)[cite: 1]
- **Primary Text:** `#F8FAFC` (Slate 50 — clean high-contrast white)[cite: 1]
- **Secondary Text:** `#94A3B8` (Slate 400 — muted gray)[cite: 1]
- **Brand Accent:** `#6366F1` (Indigo electric violet)[cite: 1]

### Light Mode (Toggleable)
- **App Canvas:** `#F8FAFC` (Slate 50 / soft neutral cool gray)[cite: 1]
- **Sidebar & Card Surfaces:** `#FFFFFF` (Pure white containers with `shadow-sm`)[cite: 1]
- **Borders & Dividers:** `1px solid #E2E8F0` (Slate 200)[cite: 1]
- **Primary Text:** `#0F172A` (Slate 900 — deep readable navy)[cite: 1]
- **Secondary Text:** `#64748B` (Slate 500)[cite: 1]
- **Brand Accent:** `#4F46E5` (Indigo blue)[cite: 1]

### Visual Hierarchy & Layout Reference
- **Top Metrics Bar:** 3–4 clean stat counter cards with delta pills (Total Services, Active Incidents, MTTA/MTTR, System Uptime)[cite: 4, 5, 7].
- **Status Pills:** `Operational` (Green), `Degraded` (Amber), `Down/Critical` (Rose)[cite: 1, 3, 5, 6].
- **Severity Tags:** `P1` (Rose), `P2` (Amber), `P3` (Sky Blue), `P4` (Slate)[cite: 1].
- **Geometry:** `rounded-2xl` cards with generous padding[cite: 1], `rounded-xl` buttons[cite: 1], and integrated dark/light theme switch in sidebar[cite: 1, 4, 6].

---

## 5. Application Pages & Route Structure

1. **Dashboard (`/`):**[cite: 1]
   - KPI stat cards: Active Incidents, Overall System Status, Average Ping Latency, Open P1s[cite: 1].
   - Quick "Simulate Crash / Webhook" test button[cite: 1].
   - Filterable data table of active incidents[cite: 1, 7].
2. **Services Management (`/services`):**[cite: 1]
   - Grid cards of all monitored services (_Auth API, Stripe Gateway, Database_)[cite: 1].
   - Shows live target URL (e.g., `https://httpbin.org/status/500`)[cite: 1].
   - "Ping All Now" manual trigger button with millisecond latency badges[cite: 1].
3. **Incident Detail & Triage (`/incidents/:id`):**[cite: 1]
   - Header with status lifecycle buttons: `Triggered` ➔ `Acknowledged` ➔ `Resolved`[cite: 1].
   - Raw stack trace terminal block (`font-mono`)[cite: 1].
   - **"Auto-Triage with AI"** card triggering automated analysis:[cite: 1]
     - Root-cause diagnosis (1 sentence)[cite: 1]
     - Severity assessment (`P1`-`P4`)[cite: 1]
     - Immediate recommended remediation steps[cite: 1]
   - Activity Timeline (log of every state change, note, and assignment)[cite: 1].
4. **Public Status Page (`/status/:org_slug`):**[cite: 1]
   - Ultra-clean view for external customers: "All Systems Operational" or "Partial Outage Detected"[cite: 1].
   - 90-day history uptime bars[cite: 1].

---

## 6. Core Data Model Relationships (Django)

- `accounts.Organization` (Multi-Tenancy Root)[cite: 1]
  - has many `accounts.User` (`email`, `role`, `is_on_call`)[cite: 1]
  - has many `monitoring.Service` (`name`, `target_url`, `check_interval_sec`, `status`)[cite: 1]
    - `monitoring.Service` has many `monitoring.HealthCheckLog` (`status_code`, `latency_ms`, `is_success`, `checked_at`)[cite: 1]
    - `monitoring.Service` has many `incidents.AlertRule` (`consecutive_failures`, `timeout_ms`, `is_active`)
  - has many `incidents.Incident` (`title`, `severity`, `status`, `raw_logs`, `ai_summary`)[cite: 1]
    - `incidents.Incident` has many `incidents.IncidentLog` (`actor`, `event_type`, `note`, `created_at`)

    [ Organization ] (Multi-Tenancy Root)
│
├──< [ User ] (email, role: ADMIN | RESPONDER | VIEWER)
│
├──< [ Service ] (name, target_url, check_interval, status: OPERATIONAL | DEGRADED | MAJOR_OUTAGE)
│         │
│         ├──< [ HealthCheckLog ] (status_code, latency_ms, is_success, checked_at)
│         └──< [ AlertRule ] (consecutive_failures, timeout_ms, is_active)
│
└──< [ Incident ] (title, severity: P1-P4, status: TRIGGERED | ACKNOWLEDGED | RESOLVED)
│
└──< [ IncidentLog ] / [ TimelineEvent ] (incident, actor, event_type, note, created_at)

---

## 7. Detailed Database Schema Blueprint

### 1. Organization (`accounts.Organization`)
- `id`: UUIDField (Primary Key, default=uuid4, editable=False)[cite: 1]
- `name`: CharField(max_length=120)[cite: 1]
- `slug`: SlugField(max_length=140, unique=True, db_index=True)[cite: 1]
- `api_key`: CharField(max_length=64, unique=True, db_index=True)[cite: 1]
- `is_active`: BooleanField(default=True)[cite: 1]
- `created_at`: DateTimeField(auto_now_add=True)[cite: 1]

### 2. User (`accounts.User`)
- Inherits from `AbstractUser`, email authentication (`USERNAME_FIELD = "email"`)[cite: 1]
- `organization`: ForeignKey -> `Organization` (on_delete=CASCADE, related_name='members', null=True, blank=True)[cite: 1]
- `email`: EmailField(unique=True)[cite: 1]
- `role`: CharField(choices=['ADMIN', 'RESPONDER', 'VIEWER'], default='RESPONDER')[cite: 1]
- `is_on_call`: BooleanField(default=False)[cite: 1]

### 3. Service (`monitoring.Service`)
- `id`: UUIDField (Primary Key, default=uuid4, editable=False)[cite: 1]
- `organization`: ForeignKey -> `Organization` (on_delete=CASCADE, related_name='services')[cite: 1]
- `name`: CharField(max_length=120)[cite: 1]
- `target_url`: URLField(help_text="Live URL to health check")[cite: 1]
- `status`: CharField(choices=['OPERATIONAL', 'DEGRADED', 'MAJOR_OUTAGE'], default='OPERATIONAL')[cite: 1]
- `check_interval_sec`: PositiveIntegerField(default=60)[cite: 1]
- `last_checked_at`: DateTimeField(null=True, blank=True)[cite: 1]
- `created_at`: DateTimeField(auto_now_add=True)[cite: 1]

### 4. HealthCheckLog (`monitoring.HealthCheckLog`)
- `id`: BigAutoField (Primary Key)[cite: 1]
- `service`: ForeignKey -> `Service` (on_delete=CASCADE, related_name='health_logs')[cite: 1]
- `status_code`: PositiveSmallIntegerField(null=True, blank=True)[cite: 1]
- `latency_ms`: PositiveIntegerField(null=True, blank=True)[cite: 1]
- `is_success`: BooleanField(default=True)[cite: 1]
- `error_message`: TextField(blank=True, default='')[cite: 1]
- `checked_at`: DateTimeField(auto_now_add=True, db_index=True)[cite: 1]

### 5. Incident (`incidents.Incident`)
- `id`: UUIDField (Primary Key, default=uuid4, editable=False)[cite: 1]
- `organization`: ForeignKey -> `Organization` (on_delete=CASCADE, related_name='incidents')[cite: 1]
- `service`: ForeignKey -> `Service` (on_delete=models.PROTECT, related_name='incidents')[cite: 1]
- `assigned_to`: ForeignKey -> `User` (on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_incidents')[cite: 1]
- `title`: CharField(max_length=255)[cite: 1]
- `error_type`: CharField(choices=['DATABASE', 'API_TIMEOUT', 'AUTH_SECURITY', 'SERVER_CRASH', 'PERFORMANCE'])[cite: 1]
- `severity`: CharField(choices=['P1', 'P2', 'P3', 'P4'], default='P3')[cite: 1]
- `status`: CharField(choices=['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED'], default='TRIGGERED')[cite: 1]
- `raw_logs`: TextField(help_text="Stack trace or raw failure output")[cite: 1]
- `ai_summary`: JSONField(default=dict, blank=True)[cite: 1]
  - Schema: `{"root_cause": str, "recommended_fix": str, "confidence": float}`[cite: 1]
- `acknowledged_at`: DateTimeField(null=True, blank=True)[cite: 1]
- `resolved_at`: DateTimeField(null=True, blank=True)[cite: 1]
- `created_at`: DateTimeField(auto_now_add=True, db_index=True)[cite: 1]

### 6. IncidentLog (`incidents.IncidentLog`)
- `id`: BigAutoField (Primary Key)[cite: 1]
- `incident`: ForeignKey -> `Incident` (on_delete=CASCADE, related_name='logs')[cite: 1]
- `actor`: ForeignKey -> `User` (on_delete=models.SET_NULL, null=True, blank=True)[cite: 1]
- `event_type`: CharField(choices=['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED', 'COMMENT', 'AI_TRIAGE'])[cite: 1]
- `note`: TextField()[cite: 1]
- `created_at`: DateTimeField(auto_now_add=True, db_index=True)[cite: 1]

### 7. AlertRule (`incidents.AlertRule`)
- `id`: BigAutoField (Primary Key)
- `service`: ForeignKey -> `Service` (on_delete=CASCADE, related_name='alert_rules')
- `consecutive_failures`: PositiveSmallIntegerField(default=3)
- `timeout_ms`: PositiveIntegerField(default=5000)
- `is_active`: BooleanField(default=True)
- `created_at`: DateTimeField(auto_now_add=True)

### 6. TimelineEvent (Immutable Audit Trail)
- `id`: BigAutoField (Primary Key)
- `incident`: ForeignKey -> `Incident` (on_delete=CASCADE, related_name='timeline')
- `actor`: ForeignKey -> `User` (on_delete=models.SET_NULL, null=True, blank=True)
- `event_type`: CharField(choices=['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED', 'COMMENT', 'AI_TRIAGE'])
- `note`: TextField()
- `created_at`: DateTimeField(auto_now_add=True, db_index=True)

---

## 8. Atomic Feature Roadmap

- **F00:** Repo scaffolding, `.gitignore`, virtualenv, and base config.
- **F01:** `accounts` app (`Organization`, custom `User` with email authentication)[cite: 1].
- **F02:** DRF & CORS configuration[cite: 1].
- **F03:** `monitoring` app (`Service`, `HealthCheckLog`, custom admin)[cite: 1].
- **F04 (Current):** `incidents` app (`Incident`, `IncidentLog`, `AlertRule`, admin wiring).
- **F05:** Seed demo data script (`seed_demo_data`)[cite: 1].
- **F06:** Automated HTTP Health Pinger engine & alert threshold trigger[cite: 1].
- **F07:** DRF API ViewSets, Serializers & incident lifecycle actions[cite: 1].
- **F08:** AI Triage Worker (Groq / Gemini free-tier structured JSON output)[cite: 1].
- **F09:** React Vite Setup & Tailwind dual-theme workspace[cite: 1].
- **F10:** Frontend Dashboard (KPI cards, Incident Table, Service Grid)[cite: 1, 4, 7].
- **F11:** Incident Detail Drawer, AI Triage UI & Public Status Page (`/status/:slug`)[cite: 1].

---

## 9. Operating Protocol

1. Tutor-Paced Execution: No premature code blocks or branch jumps without explicit confirmation[cite: 1].
2. Explain conceptual "why" and "how" before presenting diffs or commands[cite: 1].
3. Minimal dependencies & clean Django/DRF patterns[cite: 1].
4. Git branch isolation per feature (`feat/f0X-...`)[cite: 1].
5. Feature completion pause & mandatory Q&A before advancing.