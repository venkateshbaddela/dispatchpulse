import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { incidentsApi } from "../api/incidents.api";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/useAuth";
import { type IncidentSeverity, type IncidentStatus } from "../types/incident";
import { Badge, type BadgeVariant } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { IncidentTriageCard } from "../components/incident-detail/IncidentTriageCard";
import { IncidentLogsViewer } from "../components/incident-detail/IncidentLogsViewer";
import { IncidentContextCard } from "../components/incident-detail/IncidentContextCard";
import { IncidentTimeline } from "../components/incident-detail/IncidentTimeline";

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

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

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.getUsers,
  });

  const invalidateIncidentState = () => {
    queryClient.invalidateQueries({ queryKey: ["incident", id] });
    queryClient.invalidateQueries({ queryKey: ["incidents-archive"] });
    queryClient.invalidateQueries({ queryKey: ["active-incidents"] });
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

  const assignMutation = useMutation({
    mutationFn: (assignToId: number | null) =>
      incidentsApi.assignIncident(id!, assignToId),
    onSuccess: invalidateIncidentState,
  });

  const getSeverityBadgeVariant = (severity: IncidentSeverity): BadgeVariant => {
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
      {/* Top Breadcrumb & Actions Bar */}
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Diagnostics, AI Triage & Stack Trace */}
        <div className="space-y-6 lg:col-span-2">
          <IncidentTriageCard
            ai_summary={incident.ai_summary}
            isTriaging={triageMutation.isPending}
            onTriage={() => triageMutation.mutate()}
          />

          <IncidentLogsViewer raw_logs={incident.raw_logs} />
        </div>

        {/* Right 1 Column: Metadata & Activity Timeline */}
        <div className="space-y-4">
          <IncidentContextCard
            incident={incident}
            currentUser={currentUser}
            users={users}
            onAssign={(userId) => assignMutation.mutate(userId)}
            isAssigning={assignMutation.isPending}
          />

          <IncidentTimeline logs={incident.logs} />
        </div>
      </div>
    </div>
  );
};
