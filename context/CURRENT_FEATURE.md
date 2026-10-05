# Current Feature: F14 — Public Instant Website Availability Checker ("Is It Down Right Now?" `/is-it-down`)

## Status: COMPLETED

### Completed Objectives
- [x] **Backend SSRF Protection Engine (`backend/monitoring/ssrf.py`):**
  - Robust URL parsing and scheme restriction (strictly enforces `http` and `https`, rejects `file`, `ftp`, `gopher`, `data`, etc.).
  - DNS resolution using `socket.getaddrinfo` with IPv4/IPv6 support.
  - Comprehensive IP boundary validation: blocks private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.1`), link-local/cloud metadata (`169.254.169.254`), reserved, and multicast ranges.
- [x] **Ephemeral Availability Probe Engine (`backend/monitoring/engine.py`):**
  - Added `probe_ephemeral_url(target_url, timeout_seconds=5.0)`.
  - Ephemeral memory-only execution that does not pollute the `HealthCheckLog` database table.
  - High-precision latency calculation using `time.perf_counter()`.
  - Custom `DispatchPulse-Probe/1.0` User-Agent header with redirect following and status categorization (2xx/3xx/4xx vs 5xx / timeouts).
- [x] **Unauthenticated Public Endpoint & Rate Limiting (`backend/monitoring/views.py` & `backend/config/urls.py`):**
  - Added `PublicProbeThrottle(AnonRateThrottle)` enforcing a burst limit of 20 requests/minute per client IP.
  - Implemented `PublicProbeView` (`POST /api/public/probe/`) with `permission_classes = [AllowAny]`.
  - Enforced strict trailing slash convention (`/api/public/probe/`).
  - Implemented 9 unit tests in `backend/monitoring/tests.py` covering valid HTTP probe, private IP rejection, loopback rejection, AWS metadata rejection, invalid scheme rejection, and API view behavior.
- [x] **Frontend API Client & Typing (`frontend/src/types/service.ts` & `frontend/src/api/services.api.ts`):**
  - Defined `PublicProbeResult` TypeScript interface (`target_url`, `is_up`, `status_code`, `latency_ms`, `resolved_ip`, `checked_at`, `error`).
  - Added `servicesApi.probePublicUrl(url)` calling `POST /public/probe/`.
- [x] **Public Availability Checker UI (`frontend/src/pages/PublicProbePage.tsx`):**
  - Responsive Obsidian SRE design system layout adhering to solid borders (`border-slate-200 dark:border-obsidian-border`).
  - Quick-preset chips for testing popular services (GitHub, Cloudflare, Google, Netflix, AWS).
  - Diagnostic metrics grid:
    - Availability status banner (Operational vs Unreachable / Degraded).
    - Status code pill with HTTP semantics explanation.
    - Latency gauge with color-graded millisecond response time.
    - Resolved IP card showing public destination IP.
    - SSRF security notice explaining protected perimeter boundaries.
  - Conversion / Growth CTA card linking visitors to DispatchPulse 24/7 automated alerting.
- [x] **Navigation & Route Registration (`frontend/src/App.tsx` & `frontend/src/components/layout/Sidebar.tsx`):**
  - Added `/is-it-down` public route in `App.tsx`.
  - Added "Is It Down?" nav item with Globe icon in `Sidebar.tsx`.

### Verification Gates Passed
- [x] `npm run lint` passes with 0 errors / 0 warnings (`eslint .`).
- [x] `npx tsc -b` compiles cleanly with 0 type errors.
- [x] `npm run build` succeeds generating optimized production bundles.
- [x] Django system checks pass with 0 issues (`python manage.py check`).
- [x] Django unit tests pass with 15/15 tests OK (`python manage.py test monitoring incidents`).
- [x] Live end-to-end `curl` verification against running dev server:
  - `https://example.com` -> 200 OK, latency 238ms, resolved IP.
  - `http://127.0.0.1:8000` -> 400 Bad Request, SSRF loopback security warning.
  - `http://169.254.169.254/...` -> 400 Bad Request, cloud metadata security warning.
  - `http://192.168.1.1` -> 400 Bad Request, private IP security warning.
  - `file:///etc/passwd` -> 400 Bad Request, unsupported scheme warning.

---

### Transition Gate & Remaining Roadmap Backlog

- **Immediate Next Feature:** **F15 — Alert Rules Configuration UI & Outage Simulator**
  - Alert rule thresholds customization (`consecutive_failures`, `timeout_ms`).
  - Dashboard "Simulate Crash / Webhook" trigger to verify alert transitions and AI triage pipeline.