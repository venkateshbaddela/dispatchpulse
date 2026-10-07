import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { incidentsApi, type GetIncidentsParams } from "../api/incidents.api";
import { servicesApi } from "../api/services.api";
import { IncidentFilters } from "../components/incidents/IncidentFilters";
import { IncidentArchiveTable } from "../components/incidents/IncidentArchiveTable";
import type { Incident } from "../types/incident";
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
              Incident Archive &amp; Queue Center
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
          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{stats.total}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Queue</p>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{stats.active}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">P1 Critical</p>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">{stats.critical}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">AI Triaged</p>
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">{stats.triaged}</p>
        </div>
      </div>

      {/* Modular Filters Bar */}
      <IncidentFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        serviceFilter={serviceFilter}
        setServiceFilter={setServiceFilter}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setDebouncedSearch={setDebouncedSearch}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        services={services}
      />

      {/* Modular Incident Archive Queue Table */}
      <IncidentArchiveTable
        incidents={incidents}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        actioningId={actioningId}
        onAcknowledge={(id) => ackMutation.mutate(id)}
        onResolve={(id) => resolveMutation.mutate(id)}
        formatElapsed={formatElapsed}
      />
    </div>
  );
};