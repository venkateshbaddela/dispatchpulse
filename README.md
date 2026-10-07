# DispatchPulse

<div align="center">

**Real-Time Service Health Monitoring, Telemetry Dashboard & AI-Assisted Incident Triage Platform**

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.x-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15+-A30000?style=flat)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-25%20Passed-10B981?style=flat)](https://github.com/venkateshbaddela/dispatchpulse)

</div>

---

## ⚡ Overview

**DispatchPulse** is a modern, full-stack Site Reliability Engineering (SRE) observability and incident response platform. It delivers real-time HTTP endpoint telemetry, automated failure threshold tripping, instant P1 alerting, and automated AI-powered incident root-cause triage.

Built as a decoupled monorepo featuring a high-performance **Django REST Framework** backend and a **React 19 + TypeScript + Tailwind CSS v4** single-page application.

---

## 🏗️ System Architecture

```
                          ┌─────────────────────────────────────┐
                          │     React 19 + Vite Frontend        │
                          │   (Tailwind v4 Obsidian Theme)      │
                          └──────────────────┬──────────────────┘
                                             │  Axios + TanStack Query
                                             ▼
                          ┌─────────────────────────────────────┐
                          │    Django REST Framework API        │
                          │   (Token Auth + Tenant Scoping)     │
                          └──────┬───────────┬───────────┬──────┘
                                 │           │           │
                 ┌───────────────┘           │           └────────────────┐
                 ▼                           ▼                            ▼
      ┌─────────────────────┐     ┌─────────────────────┐      ┌────────────────────┐
      │   Telemetry Engine  │     │   AI Triage Pipeline│      │    SSRF Guardrail  │
      │ Concurrent Pinger   │     │ Structured JSON     │      │ RFC 1918 / Cloud   │
      │ 30-Check History    │     │ Root-Cause Diagnosis│      │ Metadata Shield    │
      └──────────┬──────────┘     └──────────┬──────────┘      └──────────┬─────────┘
                 │                           │                            │
                 └───────────────────┬───────┴────────────────────────────┘
                                     ▼
                          ┌─────────────────────────────────────┐
                          │           SQLite Database           │
                          │  Multi-Tenant Organizations & Logs  │
                          └─────────────────────────────────────┘
```

---

## ✨ Key Platform Features

### 1. Real-Time Telemetry Engine & 30-Check Telemetry Bars
- **Concurrent Polling:** Multi-threaded worker pool (`ThreadPoolExecutor`) dispatches parallel health checks without blocking requests.
- **Micro-Precision Latency:** Measures millisecond response latency using `time.perf_counter()`.
- **Interactive Segmented Bars:** Displays color-graded status segments for each service target with average latency tooltips.

### 2. Automated AI Incident Triage Pipeline
- **Instant Root-Cause Analysis:** Generates structured diagnostic insights (`root_cause`, `recommended_fix`, `confidence`) directly from stack traces.
- **Monospace Stack Trace Terminal:** Formatted terminal views with one-click copy capability.
- **Idempotent Audit Log:** Automatically updates the incident activity timeline without redundant entry clutter.

### 3. Incident Lifecycle State Machine
- **Strict SRE Status Transitions:** Enforces `TRIGGERED` ➔ `ACKNOWLEDGED` ➔ `RESOLVED` workflows.
- **Priority Matrix:** Categorizes incidents from `P1 - Critical` down to `P4 - Low`.
- **On-Call Assignment:** Tracks active on-call responders with visual pulse badges.
- **Full-Text Filterable Queue:** Filter by service, severity, status, and search raw logs.

### 4. Alert Rules Configuration UI & Threshold Tuning
- **Dynamic Threshold Customization:** Fine-tune `consecutive_failures` (1 to 20 drops) and HTTP `timeout_ms` (500ms to 60,000ms) per service.
- **Zero-Unconfigured Baseline:** Newly registered services automatically provision baseline production rules (3 drops, 5s timeout).
- **Rule Activation Toggle:** Enable or silence automated alerting per service with safety indicators.

### 5. Chaos & Outage Simulator
- **Live Failure Injection:** On-demand chaos engineering button on the Dashboard.
- **Realistic Outage Presets:**
  - `500 Server Crash` (SIGSEGV / OOM runtime panic)
  - `Database Pool Exhaustion` (`FATAL: remaining connection slots reserved`)
  - `504 Gateway Timeout` (Upstream ingress timeout > 10,000ms)
  - `401 Auth Key Mismatch` (Rotated JWKS signature verification failure)
  - `P99 Latency Surge` (Disk I/O wait > 4,850ms)
- Automatically trips service status to `MAJOR_OUTAGE`, triggers a P1 incident, and routes to AI Triage.

### 6. SSRF-Protected Public Website Availability Checker (`/is-it-down`)
- **Instant URL Diagnostics:** Ephemeral availability probe returning HTTP status, round-trip latency, and destination IP.
- **Security Perimeter Guard:** Strictly enforces `http`/`https` schemes, validates DNS resolution, and blocks private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.1`), and cloud metadata (`169.254.169.254`).
- **IP Rate Limiting:** Enforces burst limit of 20 requests/minute per client IP.

### 7. Public Status Page (`/status/:slug`)
- Unauthenticated, clean dashboard for external customers showing real-time service health and active outage announcements.

### 8. Modern SRE Workspace Design System
- **Dual Theme Support:** Deep Obsidian dark mode default (`#0B0D14`) with a clean, toggleable SaaS light mode.
- **Snappy 75ms Interactions:** Clamped sub-75ms hover transitions and tactile active micro-scaling.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend API** | Python 3.12, Django 5.x, Django REST Framework (DRF) |
| **Database** | SQLite (`db.sqlite3`) |
| **Authentication** | DRF Token Authentication (`Authorization: Token <key>`) |
| **Frontend SPA** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, Lucide React icons |
| **State & Fetching** | TanStack Query v5 (React Query), Axios |
| **Routing** | React Router v6 |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python:** 3.12+
- **Node.js:** 20+
- **npm:** 10+

### 1. Clone Repository
```bash
git clone https://github.com/venkateshbaddela/dispatchpulse.git
cd dispatchpulse
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed demo dataset
python manage.py migrate
python manage.py seed_demo_data

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be live at `http://localhost:8000/`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend application will be live at `http://localhost:5173/`.

---

## 👥 Demo User Credentials

The database comes pre-seeded with sample services, telemetry logs, and demo accounts:

| Email | Role | Password | Description |
|---|---|---|---|
| `admin@dispatchpulse.local` | `ADMIN` | `password123` | Full workspace admin privileges |
| `alex.chen@dispatchpulse.local` | `RESPONDER` | `password123` | Active On-Call SRE responder |
| `sarah.connor@dispatchpulse.local` | `RESPONDER` | `password123` | Secondary incident responder |

---

## 🧪 Verification & Test Suite

### Backend Test Suite (25 Tests Passing)
```bash
cd backend
python manage.py test
```
Covers:
- SSRF boundary validation & attack payload rejection.
- Public rate limiting.
- Alert rule CRUD, tenant scoping, and auto-provisioning.
- Outage simulator scenario generation and health log ingestion.
- AI triage log deduplication.
- Incident multi-filter querysets and pagination.

### Frontend Quality Verification
```bash
cd frontend
npm run lint       # ESLint check (0 errors, 0 warnings)
npx tsc -b         # TypeScript type-checker
npm run build      # Production bundle compilation
```

---

## 📂 Project Structure

```
dispatchpulse/
├── backend/
│   ├── accounts/          # Custom User model, Organization, Token Auth
│   ├── config/            # Django settings, root URLs, WSGI
│   ├── incidents/         # Incident, IncidentLog, AlertRule, AI Triage, Simulator
│   └── monitoring/        # Service, HealthCheckLog, Concurrent Pinger, SSRF Guard
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios API client modules
│   │   ├── components/    # Reusable UI components, Modals, Layouts
│   │   ├── context/       # AuthContext, ThemeContext
│   │   ├── pages/         # Dashboard, Services, Incidents, Is It Down?, Status
│   │   └── types/         # TypeScript interfaces & domain types
│   └── index.html
├── context/               # Architecture specs, decisions & feature logs
└── README.md
```

