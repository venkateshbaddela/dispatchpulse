import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Moon,
  XCircle,
  Zap,
} from "lucide-react";
import { servicesApi } from "../api/services.api";
import { useTheme } from "../context/useTheme";
import { Logo } from "../components/ui/Logo";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import type { PublicProbeResult } from "../types/service";

const SAMPLE_TARGETS = [
  { name: "GitHub", url: "github.com" },
  { name: "Google", url: "google.com" },
  { name: "Cloudflare", url: "cloudflare.com" },
  { name: "Stripe API", url: "api.stripe.com" },
  { name: "OpenAI", url: "openai.com" },
];

export const PublicProbePage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [urlInput, setUrlInput] = useState("");
  const [lastCheckedUrl, setLastCheckedUrl] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<PublicProbeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const probeMutation = useMutation({
    mutationFn: (target: string) => servicesApi.probePublicUrl(target),
    onMutate: (target) => {
      setLastCheckedUrl(target);
      setProbeResult(null);
      setErrorMessage(null);
    },
    onSuccess: (data) => {
      setProbeResult(data);
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { error?: string; detail?: string } } };
      const serverError =
        axiosError?.response?.data?.error ||
        axiosError?.response?.data?.detail ||
        "Failed to probe target URL. Please verify the address and try again.";
      setErrorMessage(serverError);
    },
  });

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) return;
    probeMutation.mutate(clean);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
    probeMutation.mutate(sampleUrl);
  };

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

          <Link
            to="/login"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Sign In / Console
          </Link>
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

        {/* Search / Target URL Input Bar */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-sm space-y-4">
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter domain or URL (e.g. github.com, api.stripe.com)..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={probeMutation.isPending || !urlInput.trim()}
              className="gap-2 shrink-0 py-2.5 px-6 font-semibold cursor-pointer"
            >
              {probeMutation.isPending ? (
                <>
                  <Spinner size="sm" />
                  <span>Probing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Check Availability</span>
                </>
              )}
            </Button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-obsidian-border">
            <span className="text-xs font-medium text-slate-400">Popular targets:</span>
            {SAMPLE_TARGETS.map((sample) => (
              <button
                key={sample.url}
                type="button"
                onClick={() => handleSelectSample(sample.url)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-obsidian-canvas hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-border transition-colors cursor-pointer"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Display Area */}
        {probeMutation.isPending && (
          <div className="p-8 rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border text-center space-y-3 shadow-xs">
            <Spinner size="lg" className="mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Probing target endpoint...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Resolving DNS &amp; measuring round-trip latency for {lastCheckedUrl}
            </p>
          </div>
        )}

        {/* SSRF Security Error Alert */}
        {errorMessage && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>Probe Request Blocked</span>
            </div>
            <p className="text-xs leading-relaxed">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Successful or Diagnostic Probe Result */}
        {probeResult && (
          <div className="rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs overflow-hidden space-y-6 p-6">
            {/* Main Status Header Pill */}
            <div
              className={`p-4 rounded-xl flex items-center justify-between border ${
                probeResult.is_up
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {probeResult.is_up ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-500 shrink-0" />
                )}
                <div>
                  <h3 className="text-base font-bold">
                    {probeResult.is_up
                      ? "It's Just You! The website is UP and reachable."
                      : "Website is DOWN or Unreachable"}
                  </h3>
                  <p className="text-xs opacity-90 font-mono mt-0.5">
                    {probeResult.target_url}
                  </p>
                </div>
              </div>

              {probeResult.status_code && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/60 dark:bg-black/30 border border-current">
                  HTTP {probeResult.status_code}
                </span>
              )}
            </div>

            {/* Diagnostic Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Service Health
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {probeResult.is_up ? "Operational" : "Outage / Error"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Response Latency
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {probeResult.latency_ms !== null ? `${probeResult.latency_ms} ms` : "Timed Out"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-cyan-500" />
                  Resolved IP
                </span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mt-1 truncate" title={probeResult.resolved_ip || "None"}>
                  {probeResult.resolved_ip || "Unresolved"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  SSRF Protection
                </span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Verified Safe
                </p>
              </div>
            </div>

            {/* Error Detail Callout if any */}
            {probeResult.error && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <span>{probeResult.error}</span>
              </div>
            )}
          </div>
        )}

        {/* Growth & Conversion CTA Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 dark:border-indigo-500/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Want 24/7 Automated Monitoring for this Endpoint?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                DispatchPulse probes your microservices, APIs, and web apps continuously with 90-day telemetry history, automated AI incident root-cause triage, and on-call alerting.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-sm transition-colors"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-obsidian-border text-center text-xs text-slate-500 dark:text-slate-400">
        <p>DispatchPulse &bull; Real-time Telemetry, Service Health &amp; AI Incident Triage</p>
      </footer>
    </div>
  );
};
