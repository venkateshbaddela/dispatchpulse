import React from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  Radio,
  RotateCcw,
  Sparkles,
  User,
} from "lucide-react";
import { SeverityBadge } from "../ui/SeverityBadge";
import type { Incident, IncidentStatus } from "../../types/incident";

interface IncidentArchiveTableProps {
  incidents: Incident[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  actioningId: string | null;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  formatElapsed: (isoDate: string) => string;
}

const getStatusBadge = (status: IncidentStatus) => {
  switch (status) {
    case "TRIGGERED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3 h-3" />
          Triggered
        </span>
      );
    case "ACKNOWLEDGED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3" />
          Acknowledged
        </span>
      );
    case "RESOLVED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          Resolved
        </span>
      );
    default:
      return null;
  }
};

export const IncidentArchiveTable: React.FC<IncidentArchiveTableProps> = ({
  incidents,
  isLoading,
  hasActiveFilters,
  onResetFilters,
  actioningId,
  onAcknowledge,
  onResolve,
  formatElapsed,
}) => {
  return (
    <div className="rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs overflow-hidden">
      {isLoading ? (
        <div className="p-8 space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
          <div className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
          <div className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="py-14 px-6 text-center">
          {hasActiveFilters ? (
            <div className="max-w-sm mx-auto space-y-3">
              <Filter className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                No matching incidents found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                There are no incidents matching your current search and filter combination.
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            </div>
          ) : (
            <div className="max-w-sm mx-auto space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Incident Queue Clear
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No incidents have been recorded yet for your organization.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-obsidian-border bg-slate-50/75 dark:bg-obsidian-card/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident Title &amp; Target</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">AI Triage Root Cause</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Triggered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-obsidian-border">
              {incidents.map((incident) => {
                const isActioning = actioningId === incident.id;
                const hasAi = incident.ai_summary && incident.ai_summary.root_cause;

                return (
                  <tr
                    key={incident.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-obsidian-hover/40 transition-colors group"
                  >
                    {/* Severity Pill */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                      <SeverityBadge severity={incident.severity} />
                    </td>

                    {/* Title & Service Target */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="space-y-0.5 max-w-sm">
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors line-clamp-1"
                        >
                          {incident.title}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <Radio className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="font-mono truncate">{incident.service_name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                      {getStatusBadge(incident.status)}
                    </td>

                    {/* AI Triage Synthesis */}
                    <td className="py-3.5 px-4 align-middle">
                      {hasAi ? (
                        <div className="flex items-start gap-1.5 max-w-xs text-[11px] text-slate-700 dark:text-slate-300">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 leading-relaxed">
                            {incident.ai_summary.root_cause}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-600">
                          Pending Triage
                        </span>
                      )}
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                      {incident.assigned_to ? (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                            {incident.assigned_to.first_name
                              ? incident.assigned_to.first_name[0].toUpperCase()
                              : incident.assigned_to.email[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                            {incident.assigned_to.first_name ||
                              incident.assigned_to.email.split("@")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Triggered Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {formatElapsed(incident.created_at)}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {incident.status === "TRIGGERED" && (
                          <button
                            type="button"
                            onClick={() => onAcknowledge(incident.id)}
                            disabled={isActioning}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Acknowledge incident"
                          >
                            Ack
                          </button>
                        )}
                        {incident.status !== "RESOLVED" && (
                          <button
                            type="button"
                            onClick={() => onResolve(incident.id)}
                            disabled={isActioning}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                            title="Resolve incident"
                          >
                            <CheckSquare className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                        )}
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover transition-colors"
                          title="View Incident Detail & AI Diagnostics"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
