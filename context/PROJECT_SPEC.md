cat << 'EOF' > PROJECT_SPEC.md
# DispatchPulse — System Specification & Architecture Document

## 1. Project Overview & Identity
- **Project Name:** DispatchPulse
- **Tagline:** Real-Time Service Health Monitoring & AI-Assisted Incident Triage Platform
- **Architecture:** Decoupled Monorepo (`/backend` Django REST API + `/frontend` React Vite SPA)
- **Target Audience:** Engineering teams, SREs, on-call responders, and public status viewers
- **Budget:** $0 (Free-tier models: Groq Llama 3 / Gemini Flash, SQLite local / PostgreSQL prod)

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
- **Database:** SQLite (local dev) / PostgreSQL (production configuration ready)
- **Auth:** DRF TokenAuthentication / SessionAuth with custom user model
- **Network Requests:** `requests` (for live URL status pinging)
- **AI Triage:** Free-tier Groq API (`llama-3.3-70b-versatile`) / Gemini Flash via structured JSON output
- **CORS:** `django-cors-headers`

### Frontend
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Modern Card Workspace theme, Dark Mode default with Light toggle)
- **Icons:** Lucide React (`lucide-react`)
- **State & Data Fetching:** TanStack Query (React Query v5) + Axios
- **Routing:** React Router v6

---

## 4. UI Design System (Modern SaaS Workspace — Dual Theme)

### Dark Mode (Default)
- **App Canvas:** `#0D0F17` (Deep twilight charcoal)
- **Sidebar Surface:** `#131622` (Matte navy charcoal)
- **Cards & Surfaces:** `#1A1D2E` (Elevated card containers)
- **Borders & Dividers:** `1px solid #262A40` (Subtle container outlines)
- **Primary Text:** `#F8FAFC` (Slate 50 — clean high-contrast white)
- **Secondary Text:** `#94A3B8` (Slate 400 — muted gray)
- **Brand Accent:** `#6366F1` (Indigo electric violet)

### Light Mode (Toggleable)
- **App Canvas:** `#F8FAFC` (Slate 50 / soft neutral cool gray)
- **Sidebar & Card Surfaces:** `#FFFFFF` (Pure white containers with `shadow-sm`)
- **Borders & Dividers:** `1px solid #E2E8F0` (Slate 200)
- **Primary Text:** `#0F172A` (Slate 900 — deep readable navy)
- **Secondary Text:** `#64748B` (Slate 500)
- **Brand Accent:** `#4F46E5` (Indigo blue)

### Status Pills & Severity Badges
- **Operational / Healthy (Green):**
  - Dark: `bg-emerald-500/15 text-emerald-400 border border-emerald-500/30`
  - Light: `bg-emerald-50 text-emerald-700 border border-emerald-200`
- **Degraded / Warning (Amber/Peach):**
  - Dark: `bg-amber-500/15 text-amber-300 border border-amber-500/30`
  - Light: `bg-amber-50 text-amber-700 border border-amber-200`
- **Critical Outage (Rose/Red):**
  - Dark: `bg-rose-500/15 text-rose-400 border border-rose-500/30`
  - Light: `bg-rose-50 text-rose-700 border border-rose-200`
- **Severity Tags:** `P1` (Rose), `P2` (Amber), `P3` (Sky Blue), `P4` (Slate)

### Geometry & Polish
- **Cards:** `rounded-2xl` with generous padding
- **Buttons & Controls:** `rounded-xl font-medium px-4 py-2 transition-all duration-150`
- **Status Pills:** `rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1.5`
- **Navigation:** Left sidebar with an integrated theme toggle (Dark / Light switcher)

---

## 5. Application Pages & Route Structure
1. **Dashboard (`/`):**
   - 4 KPI stat cards: Active Incidents, Overall System Status, Average Ping Latency, Open P1s.
   - Quick "Simulate Crash / Webhook" test button.
   - Filterable data table of active incidents.
2. **Services Management (`/services`):**
   - Grid cards of all monitored services (*Auth API, Stripe Gateway, Database*).
   - Shows live target URL (e.g., `https://httpbin.org/status/500`).
   - "Ping All Now" manual trigger button with millisecond latency badges.
3. **Incident Detail & Triage (`/incidents/:id`):**
   - Header with status lifecycle buttons: `Triggered` ➔ `Acknowledged` ➔ `Resolved`.
   - Raw stack trace terminal block (`font-mono`).
   - **"Auto-Triage with AI"** card triggering automated analysis:
     - Root-cause diagnosis (1 sentence)
     - Severity assessment (`P1`-`P4`)
     - Immediate recommended remediation steps
   - Activity Timeline (log of every state change, note, and assignment).
4. **Public Status Page (`/status/:org_slug`):**
   - Ultra-clean view for external customers: "All Systems Operational" or "Partial Outage Detected".
   - 90-day history uptime bars.

---

## 6. Core Data Model Relationships (Django)
[ Organization ] (Multi-Tenancy Root)
│
├──< [ User ] (email, role: ADMIN | RESPONDER | VIEWER)
│
├──< [ Service ] (name, target_url, check_interval, status: OPERATIONAL | DEGRADED | DOWN)
│         │
│         └──< [ HealthCheckLog ] (status_code, response_time_ms, timestamp)
│
└──< [ Incident ] (title, severity: P1-P4, status: TRIGGERED | ACKNOWLEDGED | RESOLVED)
│         ├── service (FK -> Service)
│         ├── raw_logs (TextField)
│         └── ai_summary (JSONField: {root_cause, severity, fix})
│
└──< [ TimelineEvent ] (incident, user, action, note, created_at)

---

## 7. Detailed Database Schema Blueprint

### 1. Organization (Multi-Tenancy Anchor)
- `id`: UUIDField (Primary Key, default=uuid4, editable=False)
- `name`: CharField(max_length=120)
- `slug`: SlugField(max_length=140, unique=True, db_index=True)
- `api_key`: CharField(max_length=64, unique=True, db_index=True)
- `is_active`: BooleanField(default=True)
- `created_at`: DateTimeField(auto_now_add=True)

### 2. User (Custom Auth Model)
- Inherits from `AbstractUser`
- `organization`: ForeignKey -> `Organization` (on_delete=CASCADE, related_name='members', null=True, blank=True)
- `email`: EmailField(unique=True)
- `role`: CharField(choices=['ADMIN', 'RESPONDER', 'VIEWER'], default='RESPONDER')
- `is_on_call`: BooleanField(default=False)

### 3. Service (Monitored Systems & Targets)
- `id`: UUIDField (Primary Key, default=uuid4, editable=False)
- `organization`: ForeignKey -> `Organization` (on_delete=CASCADE, related_name='services')
- `name`: CharField(max_length=120)
- `target_url`: URLField(help_text="Live URL to health check, e.g. https://httpbin.org/status/200")
- `status`: CharField(choices=['OPERATIONAL', 'DEGRADED', 'MAJOR_OUTAGE'], default='OPERATIONAL')
- `check_interval_sec`: PositiveIntegerField(default=60)
- `last_checked_at`: DateTimeField(null=True, blank=True)
- `created_at`: DateTimeField(auto_now_add=True)

### 4. HealthCheckLog (Time-Series Metric Ingestion)
- `id`: BigAutoField (Primary Key)
- `service`: ForeignKey -> `Service` (on_delete=CASCADE, related_name='health_logs')
- `status_code`: PositiveSmallIntegerField(null=True, blank=True)
- `latency_ms`: PositiveIntegerField(null=True, blank=True)
- `is_success`: BooleanField(default=True)
- `error_message`: TextField(blank=True, default='')
- `checked_at`: DateTimeField(auto_now_add=True, db_index=True)

### 5. Incident (Failure Events & Triage Lifecycle)
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

### 6. TimelineEvent (Immutable Audit Trail)
- `id`: BigAutoField (Primary Key)
- `incident`: ForeignKey -> `Incident` (on_delete=CASCADE, related_name='timeline')
- `actor`: ForeignKey -> `User` (on_delete=models.SET_NULL, null=True, blank=True)
- `event_type`: CharField(choices=['TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED', 'COMMENT', 'AI_TRIAGE'])
- `note`: TextField()
- `created_at`: DateTimeField(auto_now_add=True, db_index=True)

---

## 8. Development Milestones & Feature Branches

- **Feature 1 (`feat/skeleton-and-models`):** 
  Project initialization, virtualenv, custom User & Organization models, Service and Incident schemas, migrations, and `seed_demo_data` command.
- **Feature 2 (`feat/health-pinger-and-api`):** 
  URL ping worker function, DRF ViewSets for services and incidents, status transition endpoints.
- **Feature 3 (`feat/ai-triage-engine`):** 
  AI triage service module (Groq / Gemini free tier with structured JSON output), fallback mock for zero-API-key testing.
- **Feature 4 (`feat/react-dashboard-ui`):** 
  Vite setup, Tailwind workspace dual theme, KPI cards, Incident operational table, Service monitoring cards.
- **Feature 5 (`feat/incident-detail-and-public-status`):** 
  Incident detail drawer/page, interactive AI triage trigger, public `/status/:slug` page, and README documentation.

---

## 9. Tutor & Execution Protocol
1. Line-by-line code explanations before and after every file creation.
2. Terminal verification after every step.
3. Atomic Git commit commands provided at the end of every feature branch.
4. `PROJECT_STATE.md` maintained continuously to guarantee instant resume capability across sessions.
EOF
