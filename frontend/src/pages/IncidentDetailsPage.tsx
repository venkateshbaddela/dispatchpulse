import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Server,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Copy,
  Check,
  Activity,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { incidentsApi } from "../api/incidents.api";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/useAuth";
import { type IncidentSeverity, type IncidentStatus } from "../types/incident";
import { Badge, type BadgeVariant } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const {
    data: incident,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["incident", id],
    queryFn: () => incidentsApi.getIncidentById(id!),
    enabled: !!id,
    refetchInterval: 15000,
  });

  const invalidateIncidentState = () => {
    queryClient.invalidateQueries({ queryKey: ["incident", id] });
    queryClient.invalidateQueries({ queryKey: ["incidents"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
  };

  const ackMutation = useMutation({
    mutationFn: () => incidentsApi.acknowledgeIncident(id!),
    onSuccess: invalidateIncidentState,
  });

  const resolveMutation = useMutation({
    mutationFn: () => incidentsApi.resolveIncident(id!),
    onSuccess: invalidateIncidentState,
  });

  const triageMutation = useMutation({
    mutationFn: () => incidentsApi.triageIncident(id!),
    onSuccess: invalidateIncidentState,
  });

  const { user: currentUser } = useAuth();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.getUsers,
  });

  const assignMutation = useMutation({
    mutationFn: (assignToId: number | null) =>
      incidentsApi.assignIncident(id!, assignToId),
    onSuccess: invalidateIncidentState,
  });

  const sortedUsers = [...users].sort((a, b) => {
    if (a.is_on_call === b.is_on_call) {
      return a.email.localeCompare(b.email);
    }
    return a.is_on_call ? -1 : 1;
  });

  const handleCopyLogs = async () => {
    if (incident?.raw_logs) {
      await navigator.clipboard.writeText(incident.raw_logs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSeverityBadgeVariant = (
    severity: IncidentSeverity,
  ): BadgeVariant => {
    switch (severity) {
      case "P1":
        return "crimson";
      case "P2":
        return "amber";
      case "P3":
        return "violet";
      case "P4":
      default:
        return "neutral";
    }
  };

  const getStatusBadgeVariant = (status: IncidentStatus): BadgeVariant => {
    switch (status) {
      case "TRIGGERED":
        return "crimson";
      case "ACKNOWLEDGED":
        return "amber";
      case "RESOLVED":
        return "emerald";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !incident) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Incident Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The requested incident record does not exist or has been archived.
        </p>
        <Button className="mt-6" onClick={() => navigate("/incidents")}>
          Return to Queue
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & /actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/incidents"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Active Incidents
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
              {incident.title}
            </h1>
            <Badge variant={getSeverityBadgeVariant(incident.severity)}>
              {incident.severity}
            </Badge>
            <Badge variant={getStatusBadgeVariant(incident.status)}>
              {incident.status}
            </Badge>
          </div>
        </div>

        {/* Lifecycle Mutation Action Buttons */}
        <div className="flex items-center gap-2">
          {incident.status === "TRIGGERED" && (
            <Button
              variant="secondary"
              isLoading={ackMutation.isPending}
              onClick={() => ackMutation.mutate()}
            >
              Acknowledge
            </Button>
          )}
          {incident.status !== "RESOLVED" && (
            <Button
              variant="primary"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              isLoading={resolveMutation.isPending}
              onClick={() => resolveMutation.mutate()}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Resolve Incident
            </Button>
          )}
        </div>
      </div>

      {/* Main 2-Column Response Layout */}
      <div className="grid grid-cols-1 gap-6 g:grid-cols-3">
        {/* Left 2 Columns: Diagnostics, AI Triage & Stack Trace */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI Copilot Triage Terminl Card */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/10 p-5 dark:border-purple-500/20 dark:bg-purple-950/20 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-950 dark:text-purple-200">
                    AI Diagnostic Triage
                  </h3>
                  <p className="text-xs text-purple-800 dark:text-purple-400">
                    Automated root-cause analysis and remediation synthesis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {incident.ai_summary?.confidence && (
                  <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                    {Math.round(incident.ai_summary.confidence * 100)}% Confidence
                  </span>
                )}
                <Button
                  variant="violet"
                  size="sm"
                  className="gap-1.5"
                  isLoading={triageMutation.isPending}
                  onClick={() => triageMutation.mutate()}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {incident.ai_summary?.root_cause ? "Re-Triage with AI" : "Auto-Triage with AI"}
                </Button>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  Identified Root Cause
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {incident.ai_summary?.root_cause ||
                    "AI diagnostic triage is awaiting execution or currently analyzing error patterns..."}
                </p>
              </div>

              <div className="">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  Recommended Remediation
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {incident.ai_summary?.recommended_fix ||
                    "Follow standard runbook procedures for this error classification."}
                </p>
              </div>
            </div>
          </div>

          {/* Raw Stack "Trace / Telemetry Log Viewer" */}
          <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-obsidian-border">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-500 " />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Raw Telemetry & Stack Trace
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleCopyLogs}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="-3.5 w-3.5 " />
                    <span>Copy Logs</span>
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4">
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-400 max-h-96 selection:bg-emerald-900 selection:text-white">
                <code>
                  {incident.raw_logs ||
                    "// No raw trace logs recorded for this event."}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Rigt 1 Column: Metadata & Activity Timeline */}
        <div className="space-y-4">
          {/* Metadata Card */}
          <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Incident Context
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Server className="h-4 w-4 " /> Service
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {incident.service_name || incident.service}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <ShieldAlert className="h-4 w-4" /> Error Type
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {incident.error_type}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-obsidian-border/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <UserIcon className="h-4 w-4" /> Assigned To
                  </span>
                  {!incident.assigned_to && currentUser && (
                    <button
                      type="button"
                      onClick={() => assignMutation.mutate(currentUser.id)}
                      disabled={assignMutation.isPending}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Claim Incident
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={incident.assigned_to ? String(incident.assigned_to.id) : ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      assignMutation.mutate(val ? Number(val) : null);
                    }}
                    disabled={assignMutation.isPending}
                    aria-label="Assign responder"
                    className="w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-card px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">⚪ Unassigned</option>
                    {sortedUsers.map((u) => {
                      const isCurrentUser = currentUser?.id === u.id;
                      const displayName = u.first_name || u.last_name
                        ? `${u.first_name} ${u.last_name}`.trim()
                        : u.email;
                      const label = `${u.is_on_call ? "🟢" : "⚪"} ${displayName}${u.is_on_call ? " (On-Call)" : ""}${isCurrentUser ? " - You" : ""}`;
                      return (
                        <option key={u.id} value={u.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Clock className="h-4 w-4" /> Created At
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {new Date(incident.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Audit TimeLine */}
          <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Activity Timeline
            </h3>

            {!incident.logs || incident.logs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No timeline logs recorded yet.
              </p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-obsidian-border">
                {incident.logs.map((log) => (
                  <div className="relative" key={log.id}>
                    {/* Timeline Node Dot */}
                    <div className="absolute left-[-1.85rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 dark:border-obsidian-card" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {log.event_type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {log.note}
                      </p>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        by {log.actor ? log.actor.email : "System Automation"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
