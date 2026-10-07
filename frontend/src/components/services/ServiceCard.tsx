import React from "react";
import {
  Activity,
  Bell,
  Clock,
  Edit2,
  ExternalLink,
  RefreshCw,
  Sliders,
  Trash2,
  Zap,
} from "lucide-react";
import { LatencyBar } from "../dashboard/LatencyBar";
import { ServiceStatusBadge } from "../ui/ServiceStatusBadge";
import type { Service } from "../../types/service";

interface ServiceCardProps {
  service: Service;
  isPinging: boolean;
  isDeleting: boolean;
  onPing: (id: string) => void;
  onOpenAlerts: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isPinging,
  isDeleting,
  onPing,
  onOpenAlerts,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-colors shadow-xs">
      <div>
        {/* Top Bar: Name & Status Pill */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {service.name}
          </h3>
          <ServiceStatusBadge status={service.status} size="sm" />
        </div>

        {/* Endpoint URL */}
        <a
          href={service.target_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors mb-4 truncate max-w-full"
        >
          <span className="truncate">{service.target_url}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>

        {/* Metadata Row: Polling Cadence & Latency */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-obsidian-canvas border border-slate-100 dark:border-obsidian-border">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Interval</span>
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Every {service.check_interval_sec}s
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-obsidian-canvas border border-slate-100 dark:border-obsidian-border">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
              <Activity className="w-3 h-3 text-cyan-500" />
              <span>Latency</span>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-800 dark:text-cyan-400">
              {service.latest_check?.latency_ms != null
                ? `${service.latest_check.latency_ms} ms`
                : "Pending"}
            </span>
          </div>
        </div>

        {/* Latency Telemetry Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="inline-flex items-center gap-1 font-medium">
              <Zap className="w-3 h-3 text-indigo-500" />
              Telemetry Health
            </span>
            <span>
              {service.last_checked_at
                ? new Date(service.last_checked_at).toLocaleTimeString()
                : "Never"}
            </span>
          </div>
          <LatencyBar
            service_status={service.status}
            avgLatencyMs={service.latest_check?.latency_ms ?? 45}
            recent_checks={service.recent_checks}
          />
        </div>

        {/* Alert Threshold Info Chip */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-4 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-obsidian-canvas border border-slate-100 dark:border-obsidian-border">
          <div className="flex items-center gap-1.5 font-medium">
            <Bell className="w-3 h-3 text-amber-500" />
            <span>Alert Rule</span>
          </div>
          {service.alert_rule ? (
            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {service.alert_rule.is_active ? (
                `${service.alert_rule.consecutive_failures} fails • ${(service.alert_rule.timeout_ms / 1000).toFixed(0)}s`
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic">Disabled</span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">Default (3 fails • 5s)</span>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-obsidian-border">
        <button
          type="button"
          onClick={() => onPing(service.id)}
          disabled={isPinging || isDeleting}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-canvas dark:hover:bg-obsidian-hover text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-obsidian-border transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-indigo-500" : ""}`}
          />
          <span>{isPinging ? "Pinging..." : "Ping Now"}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenAlerts(service)}
            disabled={isDeleting}
            title="Tune Alert Rules"
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-obsidian-hover transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(service)}
            disabled={isDeleting}
            title="Edit Service"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(service)}
            disabled={isDeleting}
            title="Delete Service"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
