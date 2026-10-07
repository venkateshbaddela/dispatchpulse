import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { servicesApi } from "../api/services.api";
import { incidentsApi } from "../api/incidents.api";
import { useAuth } from "../context/useAuth";
import { KPICards } from "../components/dashboard/KPICards";
import { ServicesList } from "../components/dashboard/ServicesList";
import { Activity, Flame, ShieldAlert, ExternalLink } from "lucide-react";
import { IncidentQueueTable } from "../components/dashboard/IncidentQueueTable";
import { OutageSimulatorModal } from "../components/dashboard/OutageSimulatorModal";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // 1. Fetch Top Bento KPI Summary (30s background polling)
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: servicesApi.getDashboardKpis,
    refetchInterval: 30000,
  });

  // 2. Fetch Monitored Target Services (30s background polling)
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.getServices,
    refetchInterval: 30000,
  });

  // 3. Fetch Active Incidents Queue (TRIGGERED & ACKNOWLEDGED only, 30s polling)
  const { data: activeIncidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['active-incidents'],
    queryFn: () => incidentsApi.getIncidents({ status: 'TRIGGERED,ACKNOWLEDGED' }),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            System Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry, service health checks, and active incident response.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          {user?.organization?.slug && (
            <Link
              to={`/status/${user.organization.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`View live public customer status page (/status/${user.organization.slug})`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-card dark:hover:bg-obsidian-hover text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-border transition-colors shadow-xs"
            >
              <span>Public Status Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors cursor-pointer shadow-xs"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Simulate Outage</span>
          </button>
        </div>
      </div>

      {/* 1. Top Bento KPI Cards */}
      <section>
        <KPICards kpis={kpis} isLoading={kpisLoading}/>
      </section>
      
      {/* 2. Monitored Services & Telemetry Uptime Bars */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Monitored Services
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Auto-refreshes every 30s
          </span>
        </div>

        <ServicesList services={services} isLoading={servicesLoading} />
      </section>

      {/* 3. Active Incident Response Queue */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-obsidian-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Active Incident Queue
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Requires on-call triage
          </span>
        </div>

        <IncidentQueueTable
          incidents={activeIncidents}
          isLoading={incidentsLoading}
        />
      </section>

      {/* Chaos & Outage Simulator Modal */}
      <OutageSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        services={services}
      />
    </div>
  );
};

