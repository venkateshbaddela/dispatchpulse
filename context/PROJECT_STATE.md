# DispatchPulse — Project State Anchor

## Current Status
- **Active Milestone:** Milestone 1 — Project Skeleton & Core Architecture
- **Active Focus:** F03 — Monitor Target & Heartbeat Models
- **Completed Steps:**
  - Python virtual environment `.venv` active with required packages installed
  - Django project `config` and `accounts` app scaffolded
  - Custom `Organization` and `User` models defined in `accounts/models.py`
  - `AUTH_USER_MODEL = 'accounts.User'` registered and migrated
  - DRF and `django-cors-headers` middleware configured and verified
- **Immediate Next Step:** Scaffold the `monitoring` app and define `Service` and `HealthCheckLog` models for F03.

## Environment Context
- Root Directory: `dispatchpulse/`
- Backend Directory: `dispatchpulse/backend/` (Virtual environment: `.venv`)
- Frontend Directory: `dispatchpulse/frontend/` (Pending Vite initialization)