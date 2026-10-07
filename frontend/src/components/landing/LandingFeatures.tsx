import React from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Layers,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Activity,
  Flame,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";

export const LandingFeatures: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section
      id="features"
      className="scroll-mt-16 py-16 sm:py-24 border-b border-slate-200 dark:border-obsidian-border bg-slate-50/60 dark:bg-obsidian-canvas"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            <span>Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Core Platform Capabilities
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Monitor endpoints, automate stack trace triage, manage on-call rosters, and simulate outage scenarios.
          </p>
        </div>

        {/* 6 Capabilities Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Services Telemetry Hub */}
          <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-all shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-obsidian-canvas text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-obsidian-border">
                  <Lock className="w-3 h-3" />
                  Auth Required
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Services Telemetry Hub
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Register HTTP/HTTPS endpoints, configure per-service health check cadences (15s to 300s), and trigger single or batch "Ping All Now" operations.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/services" : "/login"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-cyan-400 hover:gap-2 transition-all pt-2"
            >
              <span>Explore Services</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: AI Incident Root-Cause Triage */}
          <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-all shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-obsidian-canvas text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-obsidian-border">
                  <Lock className="w-3 h-3" />
                  Auth Required
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Automated AI Triage Engine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                AI diagnostic workers analyze stack traces and error patterns to identify root causes, confidence scores, and recommended remediation steps.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/incidents" : "/login"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:gap-2 transition-all pt-2"
            >
              <span>View Incident Archive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Chaos & Outage Simulator */}
          <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-all shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-obsidian-canvas text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-obsidian-border">
                  <Lock className="w-3 h-3" />
                  Auth Required
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Chaos Simulator &amp; Drills
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Simulate 500 server crashes, database pool connection exhaustion, and 504 gateway timeouts to train responders without touching live infrastructure.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:gap-2 transition-all pt-2"
            >
              <span>Simulate Outage in Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Team On-Call Directory */}
          <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-all shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-obsidian-canvas text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-obsidian-border">
                  <Lock className="w-3 h-3" />
                  Auth Required
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Team &amp; On-Call Rostering
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Role-based access (ADMIN, RESPONDER, VIEWER), live on-call duty toggle shifts, and 1-click incident assignment delegation.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/team" : "/login"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:gap-2 transition-all pt-2"
            >
              <span>Manage Team Shifts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 5: 30-Check Telemetry Waveform */}
          <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-all shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-obsidian-canvas text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-obsidian-border">
                  <Lock className="w-3 h-3" />
                  Auth Required
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                30-Check Telemetry History
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Interactive latency bars color-coded by performance thresholds with recent probe tooltips, status codes, and exact timestamps.
              </p>
            </div>
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:gap-2 transition-all pt-2"
            >
              <span>Open KPI Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6: SSRF Guardrail & Public Probe */}
          <div className="p-6 rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-all shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Free &amp; Open
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                SSRF Guardrail &amp; Public Probe
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Validates public URLs against loopback addresses (127.0.0.1), private RFC 1918 subnets, and AWS/GCP cloud metadata endpoints.
              </p>
            </div>
            <a
              href="#is-it-down"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:gap-2 transition-all pt-2"
            >
              <span>Try Live Probe</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
