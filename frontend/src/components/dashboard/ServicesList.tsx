import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ExternalLink, Globe, RefreshCw, Zap } from "lucide-react";
import React, { useState } from "react";
import { servicesApi } from "../../api/services.api";
import { type Service } from "../../types/service";
import { LatencyBar } from "./LatencyBar";
import { ServiceStatusBadge } from "../ui/ServiceStatusBadge";

interface ServicesListProps {
  services: Service[];
  isLoading: boolean;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  isLoading,
}) => {
  const queryClient = useQueryClient();
  const [activePingingId, setActivePingingId] = useState<string | null>(null);

  const pingMutation = useMutation({
    mutationFn: (id: string) => servicesApi.pingService(id),
    onMutate: (id) => setActivePingingId(id),
    onSettled: () => {
      setActivePingingId(null);
      // Invalid both services list and dashboard KPIs to refresh live state
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border animate-pulse p-5"
          />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border">
        <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No services registered yet. Add a service in the Services tab to start
          monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => {
        const isPinging = activePingingId === service.id;

        return (
          <div
            key={service.id}
            className="p-5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-colors shadow-xs"
          >
            {/* Header: Service Name, Target URL & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {service.name}
                  </h3>
                  <ServiceStatusBadge status={service.status} />
                </div>

                {/* Target URL */}
                <a 
                href={service.target_url} 
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
                >
                    <span>{service.target_url}</span>
                    <ExternalLink className="w-3 h-3"/>
                </a>
              </div>

              {/* action Buttons & Quick Latency Display */}
              <div className="flex items-center gap-3">
                {service.latest_check && (
                    <span className="text-xs font-mono font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-obsidian-canvas text-slate-700 dark:text-cyan-400 border border-slate-200 dark:border-obsidian-border">
                        {service.latest_check.latency_ms} ms
                    </span>
                )}

                <button
                  type="button"
                  onClick={() => pingMutation.mutate(service.id)}
                  disabled={isPinging}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-canvas dark:hover:bg-obsidian-hover text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-obsidian-border transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-indigo-500' : ''}`}
                  />
                  <span>{isPinging ? 'Pinging...' : 'Ping Now'}</span>
                </button>
              </div>
            </div>

            {/* Segmented Telemetry Bar */}
            <div className="pt-2 border-t border-slate-200 dark:border-obsidian-border">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="inline-flex items-center gap-1 font-medium">
                    <Zap className="w-3 h-3 text-cyan-500"/>
                    Health Telemetry
                </span>
                <span>Interval: {service.check_interval_sec}s</span>
            </div>
            <LatencyBar
              service_status={service.status}
              avgLatencyMs={service.latest_check?.latency_ms ?? 45}
              recent_checks={service.recent_checks}
            />
            </div>
          </div>
        );
      })}
    </div>
  );
};
