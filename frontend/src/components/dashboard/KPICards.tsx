import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Server,
  ShieldAlert,
} from "lucide-react";
import React from "react";
import { type KPISummary } from "../../types/service";

interface KPICardsProps {
  kpis?: KPISummary;
  isLoading: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, isLoading }) => {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border animate-pulse p-5"
          ></div>
        ))}
      </div>
    );
  }

  // System Status Theme Evaluation
  const isOperational = kpis.system_status === "OPERATIONAL";
  const isDegraded = kpis.system_status === "DEGRADED";

  // Latency Thresold Styling
  const getLatencyColor = (ms: number) => {
    if (ms === 0) return "text-slate-400";
    if (ms < 200) return "text-emerald-500 dark:text-emerald-400";
    if (ms < 500) return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Overall System Status */}
      <div className="rounded-xl p-5 bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
          <span>System Status</span>
          {isOperational ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          ) : isDegraded ? (
            <ShieldAlert className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400 animate-pulse"/>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-xl font-extrabold tracking-tight ${
          isOperational
          ? 'text-emerald-600 dark:text-emerald-400'
          : isDegraded
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isOperational
              ? "Operational"
              : isDegraded
                ? "Degraded"
                : "Major Outage"}
          </span>
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              isOperational
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                : isDegraded
                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  : "bg-rose-500 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            }`}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {isOperational
            ? "All core systems nominal"
            : "Active disruptions reported"}
        </p>
      </div>

      {/* 2. Total Monitored Services */}
      <div className="rounded-xl p-5 bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Monitored Services</span>
          <Server className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          {kpis.total_services}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Continuous HTTP health probes
        </p>
      </div>

      {/* 3. Active Incidents & P1 Alret */}
      <div
        className={`rounded-xl p-5 bg-white dark:bg-obsidian-card border transition-colors shadow-xs ${
          kpis.p1_incidents > 0
            ? "border-rose-500/50 dark:border-rose-500/50 bg-rose-50/20 dark:bg-rose-950/10"
            : "border-slate-200 dark:border-obsidian-border"
        } flex flex-col justify-between`}
      >
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Active Incidents</span>
          <AlertTriangle
            className={`w-4 h-4 ${
              kpis.active_incidents > 0 ? "text-amber-500" : "text-slate-400"
            }`}
          />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {kpis.active_incidents}
          </span>
          {kpis.p1_incidents > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30">
              {kpis.p1_incidents} P1 Critical
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {kpis.active_incidents === 0
            ? "No open incident alerts"
            : "Requires responder triage"}
        </p>
      </div>

      {/* 4. Average Response Latency */}
      <div className="rounded-xl p-5 bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
          <span>Average Latency</span>
          <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span
            className={`text-3xl font-extrabold tracking-tight ${getLatencyColor(
              kpis.avg_latency_ms,
            )}`}
          >
            {kpis.avg_latency_ms}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            ms
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Global rolling probe average
        </p>
      </div>
    </div>
  );
};
