# Current Feature: F15 — Alert Rules Configuration UI & Outage Simulator

## Status: COMPLETED

### Completed Objectives
- [x] **Backend Alert Rules Enhancements (`backend/incidents/serializers.py`, `backend/incidents/views.py`, `backend/monitoring/serializers.py`, `backend/monitoring/views.py`):**
  - Added `service_name` read-only field to `AlertRuleSerializer`.
  - Added multi-tenant service filtering (`?service=<service_id>`) in `AlertRuleViewset.get_queryset()`.
  - Enforced tenant security in `AlertRuleViewset.perform_create` and `perform_update` (ensures rules can only be configured for services belonging to the user's organization).
  - Embedded `alert_rule` in `ServiceSerializer` (`consecutive_failures`, `timeout_ms`, `is_active`) to deliver service health and threshold configs in a single query.
  - Configured `ServiceViewSet.perform_create` to auto-provision baseline alert rules (`consecutive_failures=3`, `timeout_ms=5000`, `is_active=True`) on service registration.
- [x] **Chaos & Outage Simulator Backend (`backend/incidents/views.py` & `backend/config/urls.py`):**
  - Created `OutageSimulatorView` (`POST /api/simulator/crash/`) supporting multiple realistic chaos presets:
    - `SERVER_CRASH`: 500 Unhandled runtime panic (SIGSEGV / OOM memory limit).
    - `DATABASE`: PostgreSQL connection pool exhaustion (`FATAL: remaining connection slots reserved`).
    - `API_TIMEOUT`: 504 Gateway Timeout (upstream reverse-proxy timeout > 10,000ms).
    - `AUTH_SECURITY`: 401 JWT Signature Mismatch (rotated JWKS public key rejection).
    - `PERFORMANCE`: P99 Latency Surge (> 4850ms latency with heavy I/O wait).
  - Ingests failure `HealthCheckLog` telemetry, updates `service.status` to `MAJOR_OUTAGE`, creates a `TRIGGERED` P1 `Incident` with realistic stack traces, and logs an `IncidentLog` entry.
- [x] **Backend Automated Unit Tests (`backend/incidents/tests.py`):**
  - Added 9 new unit tests (24/24 tests passing across `monitoring` and `incidents`):
    - `test_list_and_filter_alert_rules`
    - `test_patch_alert_rule`
    - `test_tenant_cannot_modify_other_org_rule`
    - `test_service_creation_auto_provisions_default_alert_rule`
    - `test_simulate_crash_requires_service_id`
    - `test_simulate_crash_cross_tenant_forbidden`
    - `test_simulate_server_crash_success`
    - `test_simulate_database_pool_exhaustion`
    - `test_simulate_gateway_timeout`
- [x] **Frontend API Client & Type Definitions (`frontend/src/types/`, `frontend/src/api/`):**
  - Extended `Service` interface with `ServiceAlertRuleInfo` in `frontend/src/types/service.ts`.
  - Added `UpdateAlertRulePayload`, `OutageScenario`, `SimulateCrashPayload`, and `SimulateCrashResponse` in `frontend/src/types/incident.ts`.
  - Added `incidentsApi.getAlertRules`, `incidentsApi.updateAlertRule`, and `incidentsApi.simulateCrash` in `frontend/src/api/incidents.api.ts`.
- [x] **Alert Rules Tuning UI (`frontend/src/components/services/AlertRuleModal.tsx` & `frontend/src/pages/ServicesPage.tsx`):**
  - Modal with sliders and quick-presets for `consecutive_failures` (1 to 20) and `timeout_ms` (500ms to 60,000ms).
  - Automated alerting toggle switch (`is_active`) with safety warning banner when disabled.
  - Service card displays threshold chip (`⚡ Alert Rule: 3 fails • 5s`) and "Tune Alert Rules" sliders button.
- [x] **Outage Simulator UI (`frontend/src/components/dashboard/OutageSimulatorModal.tsx` & `frontend/src/pages/Dashboard.tsx`):**
  - Target service dropdown selector with real-time status.
  - Interactive scenario preset cards (`500 Server Crash`, `DB Pool Exhaustion`, `504 Gateway Timeout`, `401 Auth Mismatch`, `P99 Latency Surge`).
  - Expandable custom stack trace / raw log editor.
  - Prominent "Simulate Outage" header button on Dashboard.
  - Post-injection banner with direct CTA to open the newly spawned incident and trigger AI Triage.

### Verification Gates Passed
- [x] `npm run lint` passes with 0 errors / 0 warnings (`eslint .`).
- [x] `npx tsc -b` compiles cleanly with 0 type errors.
- [x] `npm run build` succeeds generating optimized production bundles.
- [x] Django system checks pass with 0 issues (`python manage.py check`).
- [x] Django unit tests pass with 24/24 tests OK (`python manage.py test`).