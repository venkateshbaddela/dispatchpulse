# Feature Tracking: F03 — Monitoring Target & Heartbeat Models

## Feature Overview
- **Branch:** `feat/f03-monitor-models`
- **Milestone:** Milestone 1 — Project Skeleton & Database Schema
- **Status:** Complete & Verified

## Completed Changes
1. **App Initialization & Settings:**
   - Created `monitoring` Django app.
   - Registered `'monitoring'` inside `INSTALLED_APPS` in `backend/config/settings.py`.
2. **Schema & Model Implementation (`backend/monitoring/models.py`):**
   - `Service`: UUID primary key, `Organization` FK (CASCADE), `target_url`, `ServiceStatus` choices (`OPERATIONAL`, `DEGRADED`, `MAJOR_OUTAGE`), `check_interval_sec`, `last_checked_at`, and `created_at`.
   - `HealthCheckLog`: BigAutoField PK, `Service` FK (CASCADE), nullable `status_code` & `latency_ms`, `is_success`, `error_message`, and `checked_at` (`db_index=True`).
3. **Database Migrations:**
   - Generated `monitoring/migrations/0001_initial.py`.
   - Applied migration successfully to the database.
4. **Django Admin Registration:**
   - Registered `Service` and `HealthCheckLog` in `backend/monitoring/admin.py`.
   - Registered `Organization` and custom `User` in `backend/accounts/admin.py` with custom `fieldsets` and `add_fieldsets`.
5. **Interactive Verification:**
   - Verified `Organization`, `User`, `Service`, and `HealthCheckLog` creation and reverse relations via `python manage.py shell`.

## Immediate Next Step
- Commit changes on `feat/f03-monitor-models`, merge to `main`, and begin **F04: Incident & Timeline Models** (`incidents` app).