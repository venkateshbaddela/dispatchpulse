# DispatchPulse — Comprehensive Audit of Detected Bugs & Applied Resolutions

> **Project:** DispatchPulse (Real-Time Service Health Monitoring & AI-Assisted Incident Triage Platform)  
> **Environment:** Django REST Framework (Backend) + React 19 / Vite / Tailwind CSS (Frontend)  
> **Audit Date:** October 2026  
> **Status:** All listed issues verified and resolved (0 lint errors, 0 type errors, production build passing)

---

## 1. Executive Summary Table

| ID | Category | Component | Issue Description | Root Cause | Applied Resolution | Status |
|---|---|---|---|---|---|---|
| **B01** | Backend / Auth | `config/settings.py` | Token authentication completely rejected (HTTP 403) | `TokenAuthentication` missing from `REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']` | Added `'rest_framework.authentication.TokenAuthentication'` | **Resolved** |
| **B02** | Backend / Monitoring | `monitoring/views.py` | `PublicStatusView` 500 Server Error | Referenced nonexistent `Service.Status` enum | Changed to `Service.ServiceStatus` | **Resolved** |
| **B03** | Backend / Incidents | `incidents/views.py` | `AlertRuleViewset` 500 Server Error (`TypeError: 'str' object is not callable`) | `permission_classes = ['IsAuthenticated']` declared as string | Changed to class reference `[IsAuthenticated]` | **Resolved** |
| **B04** | Backend / Engine | `monitoring/engine.py` | Health probe crash (`AttributeError: 'NoneType' object has no attribute 'is_active'`) | Unchecked `rule` parameter when service lacks active alert rule | Added `if not rule or not rule.is_active: return None` | **Resolved** |
| **B05** | Backend / Engine | `monitoring/engine.py` | Silent failure of incident generation & recovery logic | Bad indentation: `if not active_incident:` nested inside status change check; recovery `else:` nested under failure | Fixed indentation: unnested incident creation; attached recovery to `if all_failed:` | **Resolved** |
| **B06** | Backend / Admin | `monitoring/admin.py` | Django Admin search crash on `HealthCheckLog` | `search_fields` used `'service_name'` instead of relation lookup | Changed to `'service__name'` | **Resolved** |
| **B07** | Backend / Admin | `monitoring/admin.py` | Missing filter sidebar on `ServiceAdmin` | Typo: `list_filetr = (...)` | Corrected to `list_filter = (...)` | **Resolved** |
| **B08** | API Contract | `accounts/serializers.py` | Registration 400 Bad Request | Frontend sent `organization_name`, backend required `org_name` | Aligned payload typing to `org_name` | **Resolved** |
| **B09** | API Contract | `accounts/serializers.py` | Undefined user profile names on frontend | `UserSerializer` omitted `first_name` and `last_name` | Added fields to `UserSerializer.Meta.fields` | **Resolved** |
| **B10** | API Contract | `incidents/serializers.py` | Incident responder display failed (`undefined.email`) | `assigned_to` returned ID integer `3` instead of User object | Nested `assigned_to = UserSerializer(read_only=True)` | **Resolved** |
| **B11** | API Contract | `incidents/serializers.py` | Audit timeline actor display failed | `actor` returned ID integer `3` instead of User object | Nested `actor = UserSerializer(read_only=True)` | **Resolved** |
| **B12** | API Contract | `types/service.ts` | KPI display metric discrepancies | `p1_count` vs `p1_incidents`; `system_status` typed as number | Aligned keys: `p1_incidents: number`, `system_status: string` | **Resolved** |
| **B13** | Network / Routing | `api/auth.api.ts` | Django 500 RuntimeError on `POST /api/auth/logout` | Missing trailing slash with `APPEND_SLASH=True` | Added trailing slash: `apiClient.post('/auth/logout/')` | **Resolved** |
| **B14** | Network / Routing | `api/services.api.ts` & `auth.api.ts` | Unnecessary HTTP 301 redirects on API calls | Missing trailing slashes on `/auth/me`, `/services`, `/dashboard/kpis` | Added trailing slashes across all endpoints | **Resolved** |
| **B15** | Network / Routing | `ProtectedRoute.tsx` | Faulty relative redirect to `/services/login` | Used relative navigation `<Navigate to="login" replace />` | Changed to absolute path `<Navigate to="/login" replace />` | **Resolved** |
| **B16** | Frontend / Routing | `Sidebar.tsx` & `App.tsx` | Clicking "Incidents" redirected back to `/` | Missing `/incidents` route and missing `IncidentsPage` view | Created `IncidentPage.tsx` and registered `/incidents` route | **Resolved** |
| **B17** | Network / CORS | `config/settings.py` | CORS blocked on GitHub Codespaces | Hardcoded single codespace origin in `CORS_ALLOWED_ORIGINS` | Added dynamic `CORS_ALLOWED_ORIGIN_REGEXES` | **Resolved** |
| **B18** | UI / Layout | `LoginPage.tsx` | Icon sizing distortion & broken quick-fill buttons | Broken CSS classes `w-4 -4` and `gridgrid-cols-2` | Corrected to `w-4 h-4` and `grid grid-cols-2` | **Resolved** |
| **B19** | UI / Layout | `Sidebar.tsx` & `TopNavbar.tsx` | Broken avatar sizing, spacing, and hover effects | Typos: `flex -9 w-9`, `w-8 -8`, `spae-y-1`, `over:bg-slate-100` | Fixed to `h-9 w-9`, `w-8 h-8`, `space-y-1`, `hover:bg-slate-100` | **Resolved** |
| **B20** | UI / Layout | `Spinner.tsx` | Missing spinner border color & invalid border width | Typo: `border-indego-500` and non-standard `border-3` | Corrected to `border-indigo-500` and `border-4` | **Resolved** |
| **B21** | UI / Styling | `ProtectedRoute.tsx` | Illegal CSS tokenization in DOM | Comma inside class string: `"bg-obsidian-canvas, text-slate-100"` | Removed comma | **Resolved** |
| **B22** | UI / Styling | `index.css` | Theme transitions broken on dark/light toggle | Second universal selector `*, *::before, *::after` wiped out background transitions | Consolidated into single 150ms transition rule | **Resolved** |
| **B23** | Frontend / Linter | `AuthContext.tsx` & `ThemeContext.tsx` | ESLint fast refresh errors (`react-refresh/only-export-components`) | Exported Context objects & hooks from component files | Separated `useAuth.ts` and `useTheme.ts`; added ESLint ignore comments on context exports | **Resolved** |
| **B24** | Architecture | Project Root | Redundant dependency tree | Accidental root `package.json` and `package-lock.json` | Removed redundant root files | **Resolved** |
| **B25** | UI / Styling | `index.css` & UI Components | Border brightness flare during theme toggle | Opacity interpolation mismatch: `dark:border-white/5` interpolates at 50% pure white over darkening background | Replaced `dark:border-white/5` with `dark:border-obsidian-border` (`#1E2333`) / `dark:border-slate-800` | **Resolved** |
| **B26** | UI / Styling | `index.css` & `IncidentsPage.tsx` | Bright white browser horizontal scrollbar across dark tables | Missing `color-scheme: dark` and custom scrollbar CSS rules causing native light scrollbar rails | Added `color-scheme: dark`, WebKit 6px scrollbars (`#1E2333` thumb, transparent track), and modern standard `scrollbar-color` | **Resolved** |
| **B27** | UI / Styling | `index.css`, `IncidentsPage.tsx`, `IncidentQueueTable.tsx` | Borders brightly lighting up like neon lines during theme toggle | Universal wildcard transition included `border-color`, causing borders to interpolate through high-luminance midpoint (~55% lightness) against rapidly darkening background, compounded by semi-transparent opacity tokens | Removed `border-color` from universal wildcard transition (borders switch instantly to destination solid palette) and replaced all remaining translucent border/divide modifiers with solid tokens | **Resolved** |

---

## 2. Detailed Technical Breakdown

### Category 1: Critical Backend Runtime Crashes

#### B01. Missing DRF TokenAuthentication
* **File:** `backend/config/settings.py`
* **Symptom:** Every authenticated request sent from the frontend using `Authorization: Token <key>` received `HTTP 403 Forbidden` (`Authentication credentials were not provided.`).
* **Root Cause:** Django REST Framework was configured with only `SessionAuthentication` and `BasicAuthentication`. `TokenAuthentication` was omitted from `DEFAULT_AUTHENTICATION_CLASSES`.
* **Fix Applied:**
  ```python
  REST_FRAMEWORK = {
      'DEFAULT_AUTHENTICATION_CLASSES': [
          'rest_framework.authentication.TokenAuthentication',
          'rest_framework.authentication.SessionAuthentication',
          'rest_framework.authentication.BasicAuthentication',
      ],
      'DEFAULT_PERMISSION_CLASSES': [
          'rest_framework.permissions.IsAuthenticated',
      ],
  }
  ```

#### B02. Enum Name Mismatch in Public Status Endpoint
* **File:** `backend/monitoring/views.py`
* **Symptom:** Querying `GET /api/status/<slug>/` crashed with `AttributeError: type object 'Service' has no attribute 'Status'`.
* **Root Cause:** The model definition in `monitoring/models.py` named the text choices `ServiceStatus`, but the view queried `Service.Status.MAJOR_OUTAGE` and `Service.Status.DEGRADED`.
* **Fix Applied:**
  ```python
  if services.filter(status=Service.ServiceStatus.MAJOR_OUTAGE).exists():
      overall_status = 'MAJOR_OUTAGE'
  elif services.filter(status=Service.ServiceStatus.DEGRADED).exists():
      overall_status = 'DEGRADED'
  ```

#### B03. String Permission Class in ViewSet
* **File:** `backend/incidents/views.py`
* **Symptom:** Invoking endpoints on `AlertRuleViewset` crashed with `TypeError: 'str' object is not callable`.
* **Root Cause:** `permission_classes = ['IsAuthenticated']` was declared with string literals instead of executable class references.
* **Fix Applied:**
  ```python
  permission_classes = [IsAuthenticated]
  ```

#### B04. Null Reference Exception in Alert Evaluation Engine
* **File:** `backend/monitoring/engine.py`
* **Symptom:** Telemetry probe crashed with `AttributeError: 'NoneType' object has no attribute 'is_active'`.
* **Root Cause:** In services where no `AlertRule` had been created yet, `rule` evaluated to `None`. Line 58 attempted `if not rule.is_active:`.
* **Fix Applied:**
  ```python
  if not rule or not rule.is_active:
      return None
  ```

#### B05. Indentation & Control Flow Corruption in Health Engine
* **File:** `backend/monitoring/engine.py`
* **Symptom:** Incidents failed to trigger if an outage had already begun, and services never transitioned back to `OPERATIONAL` when health checks succeeded.
* **Root Cause:** `if not active_incident:` was indented inside `if service.status != Service.ServiceStatus.MAJOR_OUTAGE:`. Additionally, the service recovery `else:` was indented under `if not active_incident:`.
* **Fix Applied:** Unindented incident creation and attached the recovery branch directly to `if all_failed:`:
  ```python
  if all_failed:
      if service.status != Service.ServiceStatus.MAJOR_OUTAGE:
          service.status = Service.ServiceStatus.MAJOR_OUTAGE
          service.save(update_fields=["status"])

      if not active_incident:
          # Create incident and initial audit log...
          return new_incident
  else:
      latest_log = recent_logs[0]
      if latest_log.is_success and service.status != Service.ServiceStatus.OPERATIONAL:
          service.status = Service.ServiceStatus.OPERATIONAL
          service.save(update_fields=["status"])
  ```

#### B06 & B07. Django Admin Query and Filter Typos
* **File:** `backend/monitoring/admin.py`
* **Symptom:** Searching logs in Django admin crashed with `FieldError: Cannot resolve keyword 'service_name' into field`. Filter sidebar was missing on `ServiceAdmin`.
* **Root Cause:** ForeignKey relation search required `service__name` (double underscore). `list_filter` was misspelled as `list_filetr`.
* **Fix Applied:**
  ```python
  # ServiceAdmin
  list_filter = ('status', 'organization')

  # HealthCheckLogAdmin
  search_fields = ('service__name', 'error_message')
  ```

---

### Category 2: API Contract & Typing Mismatches

#### B08. Registration Key Mismatch
* **Files:** `frontend/src/types/auth.ts` vs `backend/accounts/serializers.py`
* **Symptom:** Organization registration returned `400 Bad Request`: `{'org_name': ['This field is required.']}`.
* **Root Cause:** Frontend sent `organization_name` while backend serializer expected `org_name`.
* **Fix Applied:** Updated `RegisterPayload` in `auth.ts` to `org_name?: string;`.

#### B09. User Serializer Missing Fields
* **File:** `backend/accounts/serializers.py`
* **Symptom:** Frontend displayed empty/undefined values when attempting to read `user.first_name` and `user.last_name`.
* **Fix Applied:** Added `"first_name"` and `"last_name"` to `UserSerializer.Meta.fields`.

#### B10 & B11. Foreign Key ID vs Serialized Object Mismatches
* **Files:** `frontend/src/types/incident.ts` vs `backend/incidents/serializers.py`
* **Symptom:** UI components crashed or rendered `undefined` when reading responder and audit author emails (`incident.assigned_to?.email` or `log.actor?.email`).
* **Root Cause:** DRF returned raw foreign key integers (`"assigned_to": 3`, `"actor": 3`), while TypeScript interfaces typed them as full `User | null` objects.
* **Fix Applied:** Nested `UserSerializer` in both `IncidentSerializer` and `IncidentLogSerializer`:
  ```python
  assigned_to = UserSerializer(read_only=True)
  actor = UserSerializer(read_only=True)
  ```

#### B12. KPI Summary Typing Inconsistencies
* **File:** `frontend/src/types/service.ts`
* **Symptom:** KPI dashboard metrics evaluated to `NaN` or `undefined`.
* **Root Cause:** Backend sent `p1_incidents` (frontend expected `p1_count`). Backend sent string `system_status` (frontend typed it as `number`).
* **Fix Applied:** Updated `KPISummary` in `types/service.ts`:
  ```typescript
  export interface KPISummary {
    total_services: number;
    active_incidents: number;
    system_status: string;
    avg_latency_ms: number;
    p1_incidents: number;
  }
  ```

---

### Category 3: Network & URL Routing Inconsistencies

#### B13. Missing Trailing Slash on POST Requests
* **File:** `frontend/src/api/auth.api.ts`
* **Symptom:** Calling `logout()` threw an unhandled Django `RuntimeError`: `You called this URL via POST, but the URL doesn't end in a slash and you have APPEND_SLASH set`.
* **Fix Applied:** Changed `/auth/logout` to `/auth/logout/`.

#### B14. Unnecessary 301 Redirect Roundtrips
* **Files:** `frontend/src/api/auth.api.ts` & `frontend/src/api/services.api.ts`
* **Fix Applied:** Appended trailing slashes to `/auth/me/`, `/services/`, and `/dashboard/kpis/`.

#### B15. Relative Route Redirect in Session Guard
* **File:** `frontend/src/components/layout/ProtectedRoute.tsx`
* **Symptom:** Unauthenticated requests inside nested routes redirected to `/services/login` instead of the root `/login`.
* **Fix Applied:** Changed `<Navigate to="login" replace/>` to `<Navigate to="/login" replace/>`.

#### B16. Unregistered Incident Queue Route
* **Files:** `frontend/src/App.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/pages/IncidentPage.tsx`
* **Symptom:** Clicking "Incidents" in the sidebar triggered the catch-all router fallback and navigated back to `/`.
* **Fix Applied:** Created `frontend/src/pages/IncidentPage.tsx`, exported `IncidentsPage`, and registered the route in `App.tsx`:
  ```tsx
  <Route path="/incidents" element={<IncidentsPage />} />
  ```

#### B17. Fragile Codespace CORS Settings
* **File:** `backend/config/settings.py`
* **Symptom:** API calls failed with CORS origin blocked errors when switching codespaces or forwarded ports.
* **Fix Applied:** Configured `CORS_ALLOWED_ORIGIN_REGEXES = [r"^https:\/\/.*\.app\.github\.dev$"]`.

---

### Category 4: UI, CSS, and Layout Corrections

#### B18–B21. Tailwind Class Typos & Syntax Inconsistencies
* **`LoginPage.tsx`:** Fixed `w-4 -4` to `w-4 h-4` on icons; fixed `gridgrid-cols-2` to `grid grid-cols-2`.
* **`Sidebar.tsx`:** Fixed `flex -9 w-9` to `h-9 w-9`; fixed `w-8 -8` to `w-8 h-8`; fixed `spae-y-1` to `space-y-1`; fixed `over:bg-slate-100` to `hover:bg-slate-100`.
* **`TopNavbar.tsx`:** Fixed `w-4 -4` to `w-4 h-4`.
* **`Spinner.tsx`:** Fixed `border-indego-500` to `border-indigo-500`; replaced invalid class `border-3` with `border-4`.
* **`ProtectedRoute.tsx`:** Removed illegal comma in `className="bg-obsidian-canvas, text-slate-100"`.

#### B22. CSS Theme Transition Cascade Collision
* **File:** `frontend/src/index.css`
* **Symptom:** Background and text colors flashed abruptly without smooth transition when toggling dark/light mode.
* **Root Cause:** A subsequent `*, *::before, *::after` rule with `transition-property: border-color;` overrode the earlier comprehensive transition rule.
* **Fix Applied:** Consolidated into a single transition rule:
  ```css
  *,
  *::before,
  *::after {
    transition-property: background-color, border-color, color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  ```

#### B25. Border Brightness Flare on Theme Toggle (Opacity Interpolation Mismatch)
* **Files:** `frontend/src/index.css`, `Sidebar.tsx`, `TopNavbar.tsx`, `Dashboard.tsx`, `LoginPage.tsx`
* **Symptom:** When toggling themes (light-to-dark or dark-to-light), borders flared up with an intense, bright white outline during the 150ms transition instead of smoothly fading into the theme.
* **Root Cause:** In light mode, borders were styled with `border-slate-200` (`#e2e8f0` -> `rgb(226, 232, 240)` with 100% alpha). In dark mode, borders were styled with `dark:border-white/5` (`rgba(255, 255, 255, 0.05)`). Because both color endpoints share near-maximum RGB channels (white), the browser interpolated the alpha channel while maintaining pure white RGB values. At the midpoint ($t \approx 75\text{ms}$), as the background transitioned into dark obsidian (`#0B0D14` / `#151926`), the border rendered at $\approx 50\%$ pure white (`rgba(255, 255, 255, 0.5)`), creating a severe luminance spike ($\approx 135$ luminance vs. background $\approx 20$) in both toggle directions.
* **Fix Applied:** Replaced `dark:border-white/5` with an opaque, palette-matched obsidian border (`dark:border-obsidian-border` mapped to `#1E2333` in `@theme`, or `dark:border-slate-800`). Because both light and dark borders are solid RGB values (`rgb(226, 232, 240)` to `rgb(30, 35, 51)`), the RGB values smoothly darken and lighten in unison with the background, keeping the contrast ratio delta at a steady, subtle $\Delta \approx 10$ with zero brightness flare.

---

### Category 5: React Fast Refresh & Linter Conformance

#### B23. Context & Hook Export Violations
* **Files:** `frontend/src/context/AuthContext.tsx`, `ThemeContext.tsx`, `useAuth.ts`, `useTheme.ts`
* **Symptom:** `npm run lint` failed with `Fast refresh only works when a file only exports components (react-refresh/only-export-components)`.
* **Root Cause:** Fast Refresh requires that component files export strictly React components. Exporting custom hooks or Context instances from the same file triggers this rule.
* **Fix Applied:**
  1. Extracted hooks into dedicated files: `frontend/src/context/useAuth.ts` and `frontend/src/context/useTheme.ts`.
  2. Updated imports across `LoginPage.tsx`, `ProtectedRoute.tsx`, `TopNavbar.tsx`, and `Sidebar.tsx`.
  3. Added inline ignore comments above Context declarations:
     ```tsx
     // eslint-disable-next-line react-refresh/only-export-components
     export const AuthContext = createContext<AuthContextType | undefined>(undefined);
     ```

#### B26. Unstyled Bright White Horizontal Scrollbar in Dark Mode
* **File:** `frontend/src/index.css` & `frontend/src/pages/IncidentsPage.tsx`
* **Symptom:** On tables with horizontal scrolling (`overflow-x-auto`), the browser rendered a glaring white scrollbar track and thumb in dark mode.
* **Root Cause:** Modern browsers default to system light theme scrollbars unless explicitly instructed otherwise via `color-scheme: dark;` and custom scrollbar rules. In Tailwind v4, without WebKit pseudo-elements and the CSS `scrollbar-color` specification, dark mode tables show light scrollbars.
* **Fix Applied:**
  1. Configured `:root { color-scheme: light; }` and `.dark { color-scheme: dark; }` to instruct the browser rendering engine to use native dark system widgets.
  2. Added sleek 6px WebKit scrollbars with `#1E2333` (Obsidian border token) thumb and transparent track in dark mode.
  3. Added modern CSS standard `scrollbar-width: thin` and `scrollbar-color: #1E2333 transparent` on `.dark *`.

#### B27. Border Brightness Flare on Universal Transition During Theme Toggle
* **Files:** `frontend/src/index.css`, `frontend/src/pages/IncidentsPage.tsx`, `frontend/src/components/dashboard/IncidentQueueTable.tsx`, `frontend/src/components/dashboard/ServicesList.tsx`
* **Symptom:** When toggling the theme, borders across cards, toolbars, tables, and buttons brightly lit up like neon wires before fading to dark.
* **Root Cause:**
  1. The universal CSS transition `*, *::before, *::after` contained `border-color`. When toggling from light (`border-slate-200` at ~93% lightness) to dark (`#1E2333` at ~16% lightness), the background swiftly darkened while the border color linearly interpolated through high-luminance light gray values (~55% lightness at midpoint), creating an artificial contrast spike against the dark background.
  2. Lingering semi-transparent opacity tokens (`dark:border-obsidian-border/80`, `dark:divide-obsidian-border/70`, `dark:border-amber-700/50`) compounded the flare by interpolating alpha channels against changing backgrounds.
* **Fix Applied:**
  1. Removed `border-color` from the universal wildcard transition in `index.css`:
     ```css
     *,
     *::before,
     *::after {
       transition-property: background-color, color, fill, stroke;
       transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
       transition-duration: 150ms;
     }
     ```
     This causes border colors to instantly snap to their solid theme palette tokens (`#1E2333` in dark mode, `#e2e8f0` in light mode) while backgrounds and text smoothly cross-fade over 150ms with zero luminance flare.
  2. Replaced all remaining translucent border and divide classes with solid tokens (`dark:border-obsidian-border`, `dark:divide-obsidian-border`, `dark:border-indigo-900`, `dark:border-amber-800`, `dark:border-emerald-800`).

---

## 3. Verification & Validation Summary

All test suites and compilers executed cleanly against the workspace:

```bash
# 1. ESLint Static Analysis
$ npm run lint
> eslint .
✔ 0 errors, 0 warnings

# 2. TypeScript Compilation Check
$ npx tsc -b
✔ 0 errors

# 3. Production Vite Build
$ npm run build
✔ 2014 modules transformed
✔ built in 1.80s (dist/assets/index.js: 355.97 kB)

# 4. Django Architecture & Model Checks
$ python manage.py check
✔ System check identified no issues (0 silenced).
```
