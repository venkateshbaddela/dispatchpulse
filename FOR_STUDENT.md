Act as my Senior Full-Stack Architect & Pair-Programming Tutor for DispatchPulse.
  
    TUTOR PROTOCOL:
    - Do NOT touch, create, or modify any files directly. 
    - I write and type all code manually in GitHub Codespaces on the left to learn.  
    - Keep code snippets focused and minimal, and explain the architectural "why" and
  "how".
    - Strict conventions: All Django/DRF endpoints must end in a trailing slash (/), 
  User model has no username field (uses email), dark borders must use solid tokens  
  (never dark:border-white/5).
  
    CURRENT REPO STATE:
    - Features F00 through F10 are completed and merged into main.
    - Master reference files: context/PROJECT_STATE.md, context/CURRENT_FEATURE.md,  
  GEMINI_KNOWLEDGE_BASE.md.
    - Active branch: feat/f11-ai-triage-pipeline
  
    OBJECTIVE:
    We are starting Feature F11: Automated AI Incident Triage Pipeline (Groq / Gemini
  structured JSON worker & frontend triage trigger).
  
    Please guide me through Step 1: building backend/incidents/ai.py with structured 
  JSON extraction and heuristic fallbacks. Show me the code snippet so I can type it 
  into Codespaces.

For Student:
   Step 1 (backend/incidents/ai.py) is completed.
    Please guide me through Step 2: creating the DRF triage action in
  backend/incidents/views.py.

  1.
   Act as my Senior Full-Stack Architect & Pair-Programming Tutor for DispatchPulse.   
  
    TUTOR PROTOCOL:
    - Do NOT touch, create, or modify any files directly unless explicitly instructed.  
    - I write and type all code manually in GitHub Codespaces on the left to learn.     
    - Keep code snippets focused and minimal, and explain the architectural "why" and   
  "how".
    - Strict conventions: 
      * All Django/DRF endpoints must end in a trailing slash (/).
      * Custom User model has NO username field (uses email as USERNAME_FIELD).         
      * Dark borders must use solid tokens (e.g., dark:border-obsidian-border or        
  dark:border-slate-800, never dark:border-white/5).
  
    CURRENT REPO STATE:
    - Features F00 through F11 are COMPLETED and merged into main (HEAD commit: c8aa246).
    - Master reference files: context/PROJECT_STATE.md, context/CURRENT_FEATURE.md,     
  GEMINI_KNOWLEDGE_BASE.md.
    - Next target branch: feat/f12-services-management
  
    OBJECTIVE:
    We are starting Feature F12: Services Management & Interactive Operations (/services
  workspace):
    - Interactive monitored services grid replacing current placeholder.
    - Service target registration / edit modal (target_url, check_interval_sec).        
    - "Ping All Now" batch probe action calling the backend telemetry engine.           
  
    Please introduce Feature F12, outline its architectural steps, and guide me through 
  Step 1.



  3. 20266-10-05:
   
    Act as my Senior Full-Stack Architect & Pair-Programming Tutor for DispatchPulse.           
  
    TUTOR PROTOCOL:
    - Do NOT touch, create, or modify any files directly unless explicitly instructed.          
    - I write and type all code manually in GitHub Codespaces on the left to learn.             
    - Keep code snippets focused and minimal, and explain the architectural "why" and "how".    
    - Strict conventions:
      * All Django/DRF endpoints must end in a trailing slash (/).
      * Custom User model has NO username field (uses email as USERNAME_FIELD).
      * Dark borders must use solid tokens (e.g., dark:border-obsidian-border or dark:border-   
  slate-800, never dark:border-white/5).
  
    CURRENT REPO STATE:
    - Features F00 through F12 are COMPLETED and merged into main (HEAD commit: d39c3b4).       
    - Master reference files: context/PROJECT_STATE.md, context/CURRENT_FEATURE.md,             
  GEMINI_KNOWLEDGE_BASE.md.
    - Next target branch: feat/f13-incident-queue-page
  
    OBJECTIVE:
    We are starting Feature F13: Dedicated Incident Archive & Queue Center (/incidents):        
    1. Backend: Enhance IncidentViewSet.get_queryset in backend/incidents/views.py with case-   
  insensitive search and service_id filtering.
    2. Frontend API: Update incidentsApi.getIncidents in frontend/src/api/incidents.api.ts to   
  support service and search query params.
    3. Interactive UI: Replace frontend/src/pages/IncidentsPage.tsx with an SRE Filter Toolbar  
  (Status tabs, Severity dropdown, Service dropdown, debounced Search) + full interactive       
  Incident Archive Queue table.
  
    Please introduce Feature F13, create the branch, and guide me through Step 1 (Backend       
  QuerySet enhancements). Show me the code snippet so I can type it into Codespaces. 


  4.
    Hi! I'm ready to start Feature F15: Alert Rules Configuration UI & Outage Simulator.
  
    Our repository is clean, on branch `main`, and fully pushed to GitHub with Feature F14 completed.
  
    Let's work on F15:
    1. Create and switch to branch `feat/f15-alert-rules-simulator`.
    2. Give me a clear step-by-step architectural breakdown of what we are building for F15 (Alert Rules UI & Chaos / Outage Simulator) before writing code.
    3. Show me the code and explain how each part works as we develop it.


    today:

        I'm back from my break! Let's build Feature F16: Team & On-Call Directory and Incident       
  Assignment Delegation.
  
    I want to build this in a tutor-student style where I write and drive the code:
    1. Break down the implementation into clear, incremental steps.
    2. In each step, explain the concepts, tell me which file to open, and give me the exact code
  snippets or changes to apply.
    3. Help me test and verify each part before moving on to the next.
  
    Let's start with Step 1! What are we building first?


    blueprint:
    Here is the complete blueprint and visual design preview for the Sidebar Profile Aesthetic     
  Upgrade, the Team & On-Call Page, and the Incident Assignment Workflow before we start writing 
  code.                                                                                          
  ──────                                                                                         
  ### 1. Sidebar Bottom User Profile (Aesthetic Upgrade)                                         
                                                                                                 
  #### The Problem Right Now                                                                     
                                                                                                 
  • Line 64 in Sidebar.tsx:64 has unstyled text (text-slate-900 dark:text-slate-200) without a   
  font size, making the email and role blend together awkwardly with zero visual hierarchy.      
  • The avatar is a plain gray square circle with no depth.                                      
  • Squeezed layout between the text and the On-Call badge.                                      
                                                                                                 
  #### The New Sleek Design (Linear / Vercel style)                                              
                                                                                                 
    ┌────────────────────────────────────────────────────────┐                                   
    │ ┌────┐  alex.sre@acme.com                              │                                   
    │ │ A  │  ● On-Call  •  Admin                            │                                   
    │ └────┘                                                 │                                   
    │ [ 🚪 Sign Out                                        ] │                                   
    └────────────────────────────────────────────────────────┘                                   
                                                                                                 
  • Avatar: Soft gradient accent container (bg-gradient-to-tr from-indigo-500 to-cyan-500 text-  
  white font-semibold shadow-xs) with a clean status dot indicator.                              
  • Top Line: text-xs font-semibold text-slate-800 dark:text-slate-100 truncate (email or first  
  name).                                                                                         
  • Subtitle Line: Micro-chip hierarchy (text-[11px] text-slate-400 dark:text-slate-500):        
      • Shows role pill: Admin / Responder / Viewer.                                             
      • If is_on_call = true: Displays a live glowing emerald indicator (🟢 On-Call).            
  • Sign Out Button: Polished ghost button with smooth hover state (hover:bg-rose-500/10         
  hover:text-rose-500 transition-all duration-75).                                               
  ──────                                                                                         
  ### 2. New Team & On-Call Page (/team)                                                         
                                                                                                 
  We will add a dedicated "Team & On-Call" tab to the navigation sidebar:                        
                                                                                                 
    ┌────────────────────────────────────────────────────────────────────────────────────────┐   
    │ Team & Responders                                             [ + Add Team Member ]    │   
    │ Manage organization members, roles, and live on-call duty rotations.                   │   
    ├────────────────────────────────────────────────────────────────────────────────────────┤   
    │  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐          │   
    │  │ 👥 Total Members     │  │ 🟢 Active On-Call    │  │ 🚨 Active Responders │          │   
    │  │ 5 Engineers          │  │ 2 on duty            │  │ 1 handling P1s       │          │   
    │  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘          │   
    ├────────────────────────────────────────────────────────────────────────────────────────┤   
    │  MEMBER               ROLE        ON-CALL SHIFT      ACTIVE LOAD         ACTIONS       │   
    │                                                                                        │   
    │  👤 Alex Rivera       [ ADMIN ]   🟢 On-Duty         1 Active (P1)      [ Off-Duty ]   │   
    │     alex@acme.com                                                       [ Role ▾ ]     │   
    │                                                                                        │   
    │  👤 Sarah Chen        [ RESP ]    ⚪ Off-Duty        0 Active           [ Go On-Call ] │   
    │     sarah@acme.com                                                      [ Role ▾ ]     │   
    │                                                                                        │   
    │  👤 Marcus Vance      [ VIEWER ]  ⚪ Off-Duty        0 Active           [ Role ▾ ]     │   
    │     marcus@acme.com                                                                    │   
    └────────────────────────────────────────────────────────────────────────────────────────┘   
                                                                                                 
  #### Key Capabilities:                                                                         
                                                                                                 
  1. Live On-Call Toggle: Responders can switch their shift with one click (Go On-Call ↔ Off-    
  Duty).                                                                                         
  2. Role Management: Admins can change a member's role (ADMIN, RESPONDER, VIEWER).              
  3. Active Workload Tracking: Displays how many open P1/P2/P3 incidents each responder is       
  currently handling.                                                                            
  4. Invite Modal (Admins only): Add new teammates to the tenant organization (Email, Role,      
  Password).                                                                                     
  ──────                                                                                         
  ### 3. Incident Details Assignment Dropdown (/incidents/:id)                                   
                                                                                                 
  In IncidentDetailsPage.tsx, the static text "Assigned To: Unassigned" in the Incident Context  
  card will become an interactive Responder Selector:                                            
                                                                                                 
    ┌──────────────────────────────────────────────────────────┐                                 
    │  Incident Context                                        │                                 
    │  Service:          Authentication Service                │                                 
    │  Error Type:       SERVER_CRASH                          │                                 
    │                                                          │                                 
    │  Assigned To:      [ 🟢 Sarah Chen (On-Call)  ▾ ]        │                                 
    │                    └─ ⚪ Unassigned                      │                                 
    │                    └─ 🟢 Sarah Chen (On-Call)            │                                 
    │                    └─ 🟢 Alex Rivera (On-Call - You)     │                                 
    │                    └─ ⚪ Marcus Vance                    │                                 
    │                                                          │                                 
    │  Created At:       Today at 2:15 PM                      │                                 
    └──────────────────────────────────────────────────────────┘                                 
                                                                                                 
  • On-Call Priority: Engineers who are currently on-call are sorted at the top with a 🟢 On-Call
  badge.                                                                                         
  • 1-Click "Claim" Button: If an incident is unassigned, a quick button allows the logged-in    
  engineer to claim it immediately.                                                              
  • Audit Trail: Every assignment, reassignment, or unassignment automatically logs to the       
  incident timeline:                                                                             
  │ "Incident assigned to sarah@acme.com by alex@acme.com."                                      
                                                                                                 
  ──────                                                                                         
  ### 4. Implementation Steps & Files                                                            
                                                                                                 
   Step │ Scope                      │ Files Touched / Created
  ──────┼────────────────────────────┼───────────────────────────────────────────────────────────
   1    │ Sidebar Redesign           │ Sidebar.tsx
   2    │ Backend APIs               │ views.py (Add assign action)views.py (Add toggle-on-call,
        │                            │ perform_create, update)serializers.py (Add
        │                            │ active_incidents_count)
   3    │ Frontend API               │ auth.api.ts, incidents.api.ts
   4    │ Team Page                  │ Create TeamPage.tsx, add route in App.tsx
   5    │ Incident Assignee Selector │ IncidentDetailsPage.tsx
   6    │ Automated Tests            │ tests.py
  ──────                                                                                         
  Please let me know if you are satisfied with this plan, and I will proceed with building it!   
