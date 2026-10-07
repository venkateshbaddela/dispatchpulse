# DispatchPulse — Architecture Decision Log (ADR)

## ADR-001: Database Strategy
- **Decision:** Use SQLite (`db.sqlite3`) via `django.db.backends.sqlite3` as the primary database engine.
- **Reasoning:** Zero-friction local development, instant portability across developer environments, and robust native JSON support in Python/Django without external database server overhead.

## ADR-002: User Authentication & Multi-Tenancy Anchor
- **Decision:** Custom `accounts.User` inheriting from `AbstractUser` with `USERNAME_FIELD = "email"` and explicit `fieldsets` / `add_fieldsets` extending `BaseUserAdmin`. `accounts.Organization` serves as the multi-tenant root with UUID primary keys.
- **Reasoning:** Standard SaaS login model; UUID keys prevent tenant enumeration.

## ADR-003: Monitoring Telemetry Isolation
- **Decision:** `monitoring.Service` uses UUID PK and references `Organization` (`CASCADE`). `monitoring.HealthCheckLog` uses `BigAutoField` and indexed `checked_at` (`db_index=True`), with nullable `status_code` and `latency_ms`.
- **Reasoning:** Time-series tables scale into millions of rows; nullable status codes allow recording network/DNS timeouts without database constraint errors.

## ADR-004: Incident Model Foreign Key Integrity
- **Decision:** In `incidents.Incident`, the `service` foreign key uses `on_delete=models.PROTECT`, while `assigned_to` uses `on_delete=models.SET_NULL`.
- **Reasoning:** Monitored services with historical incidents must never be hard-deleted. Responders leaving the organization should not destroy historical triage records.

## ADR-005: Pair-Programming & Chat Handoff Protocol
- **Decision:** Strict tutor-paced execution. After every feature merge, halt for a dedicated Q&A session before creating branches or executing commands.
- **Reasoning:** Ensures conceptual understanding and prevents drift across new chat sessions.

## ADR-006: Demo Seed Data & Telemetry Ingestion Strategy
- **Decision:** The `seed_demo_data` command uses idempotent `get_or_create` / `update_or_create` patterns with an opt-in `--flush` flag for safe resets. Historical time-series telemetry (`HealthCheckLog`) is ingested using `bulk_create` rather than single-row inserts.
- **Reasoning:** Prevents database state corruption across repeated runs while avoiding thousands of separate database write operations for telemetry logs.