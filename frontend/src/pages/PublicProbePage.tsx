import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Radio,
  Server,
  ShieldCheck,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/useTheme";
import { useAuth } from "../context/useAuth";
import { Logo } from "../components/ui/Logo";
import { PublicProbeWidget } from "../components/public/PublicProbeWidget";

export const PublicProbePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-obsidian-canvas text-slate-900 dark:text-slate-100">
      {/* Top Navbar */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" showText={true} />
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Instant Availability Tool
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-obsidian-hover hover:text-slate-900 dark:text-slate-100 transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Sign In / Console
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-10">
        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Global Real-Time Edge Probe</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Is It Down Right Now?
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Check live website availability, DNS resolution, and HTTP response latency instantly from our telemetry network.
          </p>
        </div>

        {/* Modular Probe Widget */}
        <PublicProbeWidget showDeepLink={false} />

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-obsidian-border">
          <div className="p-4 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border space-y-2">
            <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Zero-Trust SSRF Defense</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All destination IPs are verified against loopback, private RFC 1918, and internal cloud metadata before sockets connect.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border space-y-2">
            <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sub-Second Diagnostics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Measures precise round-trip connection handshake, TLS negotiation latency, and upstream HTTP response codes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border space-y-2">
            <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Continuous Monitoring</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upgrade to DispatchPulse Console to run automated 30s telemetry checks, alert rules, and AI incident root-cause triage.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Looking for Automated 24/7 Monitoring?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
              Deploy continuous telemetry polling, on-call paging rotations, and Gemini AI incident root-cause triage.
            </p>
          </div>
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <span>{isAuthenticated ? "Go to Dashboard" : "Launch Console"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 shrink-0 border-t border-slate-200 dark:border-obsidian-border flex items-center justify-between px-6 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-obsidian-canvas">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} DispatchPulse Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link to="/login" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
            Sign In
          </Link>
          <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
            Console
          </Link>
        </div>
      </footer>
    </div>
  );
};
