import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Cpu,
  Globe,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import heroImg from "../../assets/hero.png";

export const LandingHero: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-slate-200 dark:border-obsidian-border bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50 dark:from-obsidian-canvas dark:via-obsidian-card/30 dark:to-obsidian-canvas">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
            <span>Service Health Monitoring &amp; AI Incident Triage</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Service Health Telemetry &amp;{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              AI Incident Triage
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Concurrent HTTP health checks, millisecond latency measurements, AI-assisted stack trace diagnosis, and team on-call rostering.
          </p>

          {/* Primary Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>{isAuthenticated ? "Go to Dashboard" : "Open Console (Sign In Required)"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <a
              href="#is-it-down"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-obsidian-card hover:bg-slate-100 dark:hover:bg-obsidian-hover text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-obsidian-border text-sm font-semibold transition-all shadow-xs"
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Check Any Website (Free)</span>
            </a>
          </div>

          {/* Real Platform Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>SSRF-Protected URL Probing</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Concurrent Health Probes</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-500" />
              <span>AI Triage &amp; Heuristic Fallback</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span>Team On-Call Rostering</span>
            </div>
          </div>
        </div>

        {/* Isometric Platform Showcase Preview */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-indigo-500/20 via-slate-200/50 to-transparent dark:from-indigo-500/10 dark:via-obsidian-card/40 dark:to-transparent border border-slate-200 dark:border-obsidian-border shadow-2xl">
          <div className="rounded-xl overflow-hidden bg-white dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Hero Mockup Image */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <img
                src={heroImg}
                alt="DispatchPulse Telemetry Command Console"
                className="w-full max-w-[280px] sm:max-w-[340px] h-auto object-contain drop-shadow-2xl rounded-xl transition-transform hover:scale-102 duration-300"
              />
            </div>

            {/* Dashboard Console Preview (Matches real KPI cards & service telemetry) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-obsidian-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                    Workspace Dashboard Preview
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  OPERATIONAL
                </span>
              </div>

              {/* 4 Real KPI Cards (Matches KPICards.tsx) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">System Status</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">HEALTHY</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Services</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">3 Active</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Incidents</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">0 Open</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Avg Latency</div>
                  <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">42 ms</div>
                </div>
              </div>

              {/* 30-Check Telemetry Bar (Matches ServiceCard.tsx) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <Server className="w-3.5 h-3.5 text-indigo-500" />
                    Core API Gateway Health
                  </span>
                  <span>30-Check History</span>
                </div>
                <div className="flex items-center gap-1 h-5 pt-0.5">
                  {Array.from({ length: 30 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 rounded-xs transition-all ${
                        idx === 22
                          ? "h-4 bg-amber-500"
                          : "h-5 bg-emerald-500 dark:bg-emerald-400 hover:opacity-80"
                      }`}
                      title={idx === 22 ? "Degraded check: 210ms" : "Operational: 32ms"}
                    />
                  ))}
                </div>
              </div>

              {/* AI Triage Snippet Preview (Matches IncidentTriageCard.tsx) */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">AI Diagnostic Triage:</span>
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.2 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                      85% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    Analyzes stack traces and error types to identify root causes and suggest actionable remediation steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
