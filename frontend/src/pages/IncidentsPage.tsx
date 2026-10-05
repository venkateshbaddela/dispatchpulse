import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { incidentsApi, type GetIncidentsParams } from "../api/incidents.api";
import { servicesApi } from "../api/services.api";
import type { Incident, IncidentSeverity, IncidentStatus } from "../types/incident";
import type { Service } from "../types/service";

const formatElapsed = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const getSeverityBadge = (severity: IncidentSeverity) => {
  switch (severity) {
    case "P1":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-rose-500" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
          </span>
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

export const IncidentsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Actioning Incident state
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Monitored Services for dropdown
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: servicesApi.getServices,
  });

  // Construct Query Params
  const queryParams = useMemo(() => {
    const params: GetIncidentsParams = {};
    if (statusFilter === "ACTIVE") {
      params.status = "TRIGGERED,ACKNOWLEDGED";
    } else if (statusFilter !== "ALL") {
      params.status = statusFilter;
    }
    if (severityFilter !== "ALL") {
      params.severity = severityFilter;
    }
    if (serviceFilter !== "ALL") {
      params.service = serviceFilter;
    }
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    return params;
  }, [statusFilter, severityFilter, serviceFilter, debouncedSearch]);

  // Fetch Incidents Queue
  const {
    data: incidents = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Incident[]>({
    queryKey: ["incidents-archive", queryParams],
    queryFn: () => incidentsApi.getIncidents(queryParams),
    refetchInterval: 30000,
  });

  const invalidateIncidents = () => {
    queryClient.invalidateQueries({ queryKey: ["incidents-archive"] });
    queryClient.invalidateQueries({ queryKey: ["active-incidents"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
  };

  const ackMutation = useMutation({
    mutationFn: (id: string) => incidentsApi.acknowledgeIncident(id),
    onMutate: (id) => setActioningId(id),
    onSettled: () => {
      setActioningId(null);
      invalidateIncidents();
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => incidentsApi.resolveIncident(id),
    onMutate: (id) => setActioningId(id),
    onSettled: () => {
      setActioningId(null);
      invalidateIncidents();
    },
  });

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    severityFilter !== "ALL" ||
    serviceFilter !== "ALL" ||
    searchInput.trim() !== "";

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setSeverityFilter("ALL");
    setServiceFilter("ALL");
    setSearchInput("");
    setDebouncedSearch("");
  };

  // Status Tab configurations
  const statusTabs = [
    { id: "ALL", label: "All Incidents" },
    { id: "ACTIVE", label: "Active Queue", alert: true },
    { id: "TRIGGERED", label: "Triggered" },
    { id: "ACKNOWLEDGED", label: "Acknowledged" },
    { id: "RESOLVED", label: "Resolved" },
  ];

  // Quick statistics calculated on visible incidents
  const stats = useMemo(() => {
    const total = incidents.length;
    const critical = incidents.filter((i) => i.severity === "P1").length;
    const active = incidents.filter((i) => i.status !== "RESOLVED").length;
    const triaged = incidents.filter((i) => i.ai_summary && i.ai_summary.root_cause).length;
    return { total, critical, active, triaged };
  }, [incidents]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Incident Archive & Queue Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-tenant telemetry incidents, real-time SRE triage queue, and post-mortem archive.
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-obsidian-card hover:bg-slate-50 dark:hover:bg-obsidian-hover text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-border transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-indigo-500" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SRE Stats Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total in View</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{stats.total}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Active Unresolved
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{stats.active}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> P1 Critical
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{stats.critical}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
          <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Triaged
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{stats.triaged}</p>
        </div>
      </div>

      {/* SRE Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs space-y-4">
        {/* Row 1: Status Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-obsidian-border pb-3">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover"
                }`}
              >
                {tab.id === "TRIGGERED" && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                {tab.id === "ACKNOWLEDGED" && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                {tab.id === "RESOLVED" && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Search Input, Severity Filter, Service Filter, and Reset Action */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Debounced Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, logs, error type, or service..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setDebouncedSearch("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Severity Dropdown */}
          <div className="w-full md:w-44">
            <select
              value={severityFilter}
              aria-label="Filter by Severity"
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>

          {/* Service Dropdown */}
          <div className="w-full md:w-52">
            <select
              value={serviceFilter}
              aria-label="Filter by Service"
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-obsidian-canvas border border-slate-200 dark:border-obsidian-border text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-colors cursor-pointer truncate"
            >
              <option value="ALL">All Services ({services.length})</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-hover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-border transition-colors cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Incident Archive Queue Table */}
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
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto space-y-2">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Incident Archive Nominal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No active or past incidents recorded for this workspace. All services are healthy.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-obsidian-canvas border-b border-slate-200 dark:border-obsidian-border text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Incident Title & Service</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">AI Triage</th>
                  <th className="px-5 py-3.5">Triggered</th>
                  <th className="px-5 py-3.5">Responder</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-obsidian-border">
                {incidents.map((incident) => {
                  const isActioning = actioningId === incident.id;
                  const isTriggered = incident.status === "TRIGGERED";
                  const isResolved = incident.status === "RESOLVED";

                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-obsidian-hover/50 transition-colors"
                    >
                      {/* 1. Severity */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getSeverityBadge(incident.severity)}
                      </td>

                      {/* 2. Title, Error Type & Service */}
                      <td className="px-5 py-4 min-w-[260px]">
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block"
                        >
                          {incident.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-obsidian-canvas px-1.5 py-0.5 rounded border border-slate-200 dark:border-obsidian-border">
                            {incident.error_type}
                          </span>
                          {incident.service_name && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                              <Radio className="w-3 h-3 text-indigo-500" />
                              {incident.service_name}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(incident.status)}
                      </td>

                      {/* 4. AI Triage */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {incident.ai_summary && incident.ai_summary.root_cause ? (
                          <div className="flex flex-col gap-0.5 max-w-[220px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 w-fit">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Triaged ({Math.round((incident.ai_summary.confidence ?? 0.8) * 100)}%)</span>
                            </span>
                            <span
                              className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono"
                              title={incident.ai_summary.root_cause}
                            >
                              {incident.ai_summary.root_cause}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-600 italic">
                            Pending triage
                          </span>
                        )}
                      </td>

                      {/* 5. Triggered Elapsed */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatElapsed(incident.created_at)}
                        </span>
                      </td>

                      {/* 6. Responder */}
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

                      {/* 7. Quick Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                        {isTriggered && (
                          <button
                            type="button"
                            onClick={() => ackMutation.mutate(incident.id)}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <CheckSquare className="w-3 h-3" />
                            Ack
                          </button>
                        )}
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => resolveMutation.mutate(incident.id)}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Resolve
                          </button>
                        )}
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-hover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-border transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer row showing count summary */}
        {!isLoading && incidents.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 dark:bg-obsidian-canvas border-t border-slate-200 dark:border-obsidian-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing {incidents.length} {incidents.length === 1 ? "incident" : "incidents"}
            </span>
            <span className="font-mono text-[11px]">
              Real-time telemetry queue &bull; Auto-sync 30s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};