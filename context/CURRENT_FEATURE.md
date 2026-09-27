# Current Feature & Sprint Tracker

## 1. Active Focus
- **Current Feature:** F03 — Monitor Target & Heartbeat Models
- **Milestone:** Milestone 1 — Project Skeleton & Database Schema
- **Status:** Ready to Start
- **Primary Goal:** Implement Service and HealthCheckLog models for target tracking and time-series ping metrics.

---

## 2. Feature Roadmap & Statuses

| ID | Feature Description | Milestone | Status |
| :--- | :--- | :--- | :--- |
| F00 | AI Context Planning & Workflow Alignment | M1 | `Completed` |
| F01 | Custom User & Organization Schema | M1 | `Completed` |
| F02 | Django REST Framework & CORS Setup | M1 | `Completed` |
| F03 | Monitor Target & Heartbeat Models | M1 | `Ready to Start` |
| F04 | Incident Triage & Alert Schema | M1 | `Not Started` |
| F05 | Vite + React Dark Twilight Shell | M2 | `Not Started` |

---

## 3. Implementation Progress (F02: DRF & CORS Setup)
- [x] Add `rest_framework` and `corsheaders` to `INSTALLED_APPS`
- [x] Configure `CorsMiddleware` in `settings.py`
- [x] Configure default REST_FRAMEWORK authentication and permission classes
- [x] Set `CORS_ALLOWED_ORIGINS` and `CORS_ALLOW_CREDENTIALS`
- [x] Verify configuration with `python manage.py check`

---

## 4. History & Decisions
- **2026-09-26 — Workflow Simplification:**
  - Evaluated external notebook tools versus direct chat tutoring.
  - Decision: To follow the "Do Not Over-Engineer" rule, dropped external notebook synchronization to eliminate workflow friction[cite: 1].
- **2026-09-27 — F01 Schema Finalization:**
  - Built custom `User` subclassing `AbstractUser` and `Organization` multi-tenant root[cite: 2].
  - Applied initial database migrations.
- **2026-09-27 — F02 DRF & CORS Configuration:**
  - Configured DRF session authentication and origin permissions for the Vite React frontend.