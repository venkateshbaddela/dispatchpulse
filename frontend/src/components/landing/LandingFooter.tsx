import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { Logo } from "../ui/Logo";

export const LandingFooter: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* SYSTEM ARCHITECTURE BREAKDOWN */}
      <section
        id="architecture"
        className="scroll-mt-16 py-16 sm:py-24 border-b border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card/20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-cyan-400">
              System Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              How DispatchPulse Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              DispatchPulse connects multi-threaded Python health check workers, Django REST Framework APIs, and a React 19 single-page application.
            </p>
          </div>

          {/* Architecture Steps Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono text-sm font-bold flex items-center justify-center">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Concurrent Telemetry Probing
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Multi-threaded workers probe HTTP/HTTPS endpoints on-demand or via scheduled daemon. Consecutive failures trip alert rules to transition service health status.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-mono text-sm font-bold flex items-center justify-center">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Diagnostic Incident Triage
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When an incident is investigated, AI diagnostic workers and heuristic fallbacks analyze stack traces to synthesize root-cause hypotheses and remediation guidance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-mono text-sm font-bold flex items-center justify-center">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Team Roster &amp; Incident Resolution
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Designated on-call responders take assignment, transition incidents through Acknowledged and Resolved states, and preserve a full audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CONVERSION CTA BANNER */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Monitoring Your Services
          </h2>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto">
            Test any public endpoint with our availability tool, or sign in to configure service targets and automated incident triage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold shadow-lg transition-colors"
            >
              <span>{isAuthenticated ? "Go to Workspace Dashboard" : "Sign In to Workspace"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#is-it-down"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/20 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Test Site Availability</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link to="/" title="DispatchPulse Home" className="hover:opacity-90 transition-opacity">
              <Logo size="sm" showText={true} />
            </Link>
            <span className="text-slate-400">|</span>
            <span>Real-time Telemetry, Service Health &amp; AI Incident Triage</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#is-it-down" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Is It Down?
            </a>
            <Link to="/login" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Sign In
            </Link>
            <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
              Console
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 mt-6 border-t border-slate-100 dark:border-obsidian-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} DispatchPulse Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono">React 19 &bull; Tailwind v4 &bull; Django REST &bull; SQLite</p>
        </div>
      </footer>
    </>
  );
};
