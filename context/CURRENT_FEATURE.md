# Feature Tracking: F04 — Incident & Timeline Models

## Feature Overview
- **Branch:** `feat/f04-incident-models`
- **Milestone:** Milestone 1 — Project Skeleton & Database Schema
- **Status:** Complete & Verified

## Completed Changes
1. **App Initialization & Settings:**
   - Created `incidents` Django app.
   - Registered `'incidents'` inside `INSTALLED_APPS` in `backend/config/settings.py`.
2. **Schema & Model Implementation (`backend/incidents/models.py`):**
   - `Incident`: UUID PK, `Organization` FK (CASCADE), `monitoring.Service` FK (PROTECT), `assigned_to` FK (SET_NULL), `ai_summary` JSONField, `Severity`, `Status`, and `ErrorType` choices.
   - `IncidentLog`: BigAutoField PK, `Incident` FK (CASCADE), `actor` FK (SET_NULL), `EventType` choices, and `note`.
   - `AlertRule`: BigAutoField PK, `Service` FK (CASCADE), `consecutive_failures`, `timeout_ms`, and `is_active`.
3. **Database Migrations:**
   - Generated and applied `incidents/migrations/0001_initial.py`.
4. **Django Admin Registration:**
   - Registered `Incident` (with `IncidentLogInline`), `IncidentLog`, and `AlertRule` in `backend/incidents/admin.py`.
5. **Interactive Verification:**
   - Ran `manage.py check`, migration consistency checks, and Django shell assertion verifying `models.PROTECT` blocks service deletion when linked to an incident.

## Immediate Next Step
- Commit changes, merge `feat/f04-incident-models` into `main`, and advance to **F05: Demo Seed Data Command** (`python manage.py seed_demo_data`).