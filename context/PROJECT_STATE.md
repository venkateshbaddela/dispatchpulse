# DispatchPulse — Project State Ledger

## Architecture & Environment
- **Root Directory:** `/workspaces/dispatchpulse/`
- **Backend Directory:** `/workspaces/dispatchpulse/backend/` (Virtual environment: `.venv`)
- **Frontend Directory:** `/workspaces/dispatchpulse/frontend/` (Pending Vite setup)
- **Active Branch:** `feat/f03-monitor-models`
- **Stack:** Python 3.14 / 3.12, Django 6.x / 5.x, DRF, django-cors-headers, PostgreSQL ready (psycopg 3.3.6), Vite + React.

## Milestone 1: Project Skeleton & Core Architecture
- [x] **F00: Project Scaffolding & Virtualenv** (Backend and base structure initialized)
- [x] **F01: Tenant & Custom Auth Schema** (`accounts.Organization`, custom `accounts.User` with email auth, migrated and admin configured)
- [x] **F02: DRF & CORS Configuration** (`rest_framework`, `corsheaders` middleware registered and verified)
- [x] **F03: Monitoring & Heartbeat Schema** (`monitoring.Service`, `monitoring.HealthCheckLog`, migrations applied, admin registered, shell tested)
- [x] **F04: Incident & Timeline Schema** (`incidents.Incident`, `incidents.IncidentLog`, `incidents.AlertRule`)
- [ ] **F05: Demo Seed Data Command** (`python manage.py seed_demo_data`)

## Current Working Focus
- F03 completed and verified. Ready to commit to Git and proceed to F04.