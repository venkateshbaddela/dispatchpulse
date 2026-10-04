import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { incidentsApi } from "../../api/incidents.api";
import { type Incident, type IncidentSeverity } from "../../types/incident";
import { Link } from "react-router-dom";

interface IncidentQueueTableProps {
  incidents: Incident[];
  isLoading: boolean;
}

const formatElapsed = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

export const IncidentQueueTable: React.FC<IncidentQueueTableProps> = ({
  incidents,
  isLoading,
}) => {
  const queryClient = useQueryClient();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const invalidateDasboard = () => {
    queryClient.invalidateQueries({ queryKey: ["active-incidents"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
  };

  const ackMutation = useMutation({
    mutationFn: (id: string) => incidentsApi.acknowledgeIncident(id),
    onMutate: (id) => setActiveActionId(id),
    onSettled: () => {
      setActiveActionId(null);
      invalidateDasboard();
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => incidentsApi.resolveIncident(id),
    onMutate: (id) => setActiveActionId(id),
    onSettled: () => {
      setActiveActionId(null);
      invalidateDasboard();
    },
  });

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case "P1":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            P1 Critical
          </span>
        );
      case "P2":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            P2 High
          </span>
        );
      case "P3":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            P3 Medium
          </span>
        );
      case "P4":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            P4 Low
          </span>
        );
    }
  };

  

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border p-6 animate-pulse space-y-4">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-24 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
        <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Incident Queue Nominal
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Zero active incidents requiring immediate triage.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-obsidian-canvas border-b border-slate-200 dark:border-obsidian-border text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Severity</th>
              <th className="px-5 py-3.5">Incident Title</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Triggered</th>
              <th className="px-5 py-3.5">Responder</th>
              <th className="px-5 py-3.5 text-right">Quick Triage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-obsidian-border/70">
            {incidents.map((incident) => {
              const isActioning = activeActionId === incident.id;
              const isAcknowledged = incident.status === "ACKNOWLEDGED";

              return (
                <tr
                  key={incident.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-obsidian-hover/50 transition-colors"
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getSeverityBadge(incident.severity)}
                  </td>
                  <td className="px-5 py-4">
                    <Link 
                    to={`/incidents/${incident.id}`}
                    className="font-semibold text-slate-900 dark:text-slate-100">
                      {incident.title}
                    </Link>
                    <div className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                      {incident.error_type}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                        isAcknowledged
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatElapsed(incident.created_at)}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs">
                    {incident.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                          {incident.assigned_to.first_name?.[0] ||
                            incident.assigned_to.email[0].toUpperCase()}
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">
                          {incident.assigned_to.first_name ||
                            incident.assigned_to.email}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 italic">
                        <User className="w-3 h-3" />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                    {!isAcknowledged && (
                      <button
                        type="button"
                        onClick={() => ackMutation.mutate(incident.id)}
                        disabled={isActioning}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <CheckSquare className="w-3 h-3" />
                        Ack
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => resolveMutation.mutate(incident.id)}
                      disabled={isActioning}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Resolve
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
