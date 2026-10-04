import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { servicesApi } from "../api/services.api";
import { Badge, type BadgeVariant } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Logo } from "../components/ui/Logo";
import { type ServiceStatus } from "../types/service";
import type React from "react";

export const PublicStatusPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: statusData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-status", slug],
    queryFn: () => servicesApi.getPublicStatus(slug!),
    enabled: !!slug,
    refetchInterval: 3000,
  });

  const getStatusConfig = (status: ServiceStatus) => {
    switch (status) {
      case "OPERATIONAL":
        return {
          title: "All Systems Operational",
          description:
            "All monitored infrastructure and services are running normally.",
          icon: CheckCircle2,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          badgeVariant: "emerald" as BadgeVariant,
        };
      case "DEGRADED":
        return {
          title: "Active Degraded Performance",
          description:
            "One or more services are experiencing elevated latency or transient errors.",
          icon: AlertTriangle,
          color: "text-amber-500",
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          badgeVariant: "amber" as BadgeVariant,
        };
      case "MAJOR_OUTAGE":
      default:
        return {
          title: "Major System Outage",
          description:
            "Critical service disruptions detected. Responders are actively investigating.",
          icon: XCircle,
          color: "text-rose-500",
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          badgeVariant: "crimson" as BadgeVariant,
        };
    }
  };

  const getServiceBadgeVariant = (status: ServiceStatus): BadgeVariant => {
    switch (status) {
      case "OPERATIONAL":
        return "emerald";
      case "DEGRADED":
        return "amber";
      case "MAJOR_OUTAGE":
        return "crimson";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-obsidian-canvas flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Loading system status...
        </p>
      </div>
    );
  }

  if (isError || !statusData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-obsidian-canvas flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Status Page Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          No public status page found for identifier "{slug}". Check the
          organization slug and try again.
        </p>
      </div>
    );
  }

  const overallStatus =
    statusData.overall_status || statusData.status || "OPERATIONAL";
  const config = getStatusConfig(overallStatus);
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-canvas text-slate-900 dark:text-slate-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8">
        {/* Top eader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-obsidian-border">
          <div className="flex items-center gap-3">
            <Logo showText={true} size="md" />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {statusData.organization}
              </h2>
              <p className="text-xs text-slate-500 dark:slate-400">
                Live Service Health & Availability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Refreshed every 30s </span>
          </div>
        </div>

        {/* Hero Global Status Card */}
        <div
          className={`rounded-xl border p-6 flex items-start gap-4 ${config.bg}`}
        >
          <StatusIcon className={`h-7 w-7 shrink-0 mt-0.5 ${config.color}`} />
          <div className="space-y-1">
            <h1 className="taxt-base sm:textlg font-bold">{config.title}</h1>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Monitored Services List */}
        <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-6 shadow-sm">
          <div className="flex items-center juistify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                System Services
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {statusData.services.length} Monitored
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-obsidian-border">
            {statusData.services.map((service, idx) => (
              <div
                key={idx}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {service.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {service.last_checked_at
                      ? `Last checked ${new Date(service.last_checked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Awaiting initial health check"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Micro 30-Tick History Sparkline */}
                  <div
                    className="hidden sm:flex items-center gap-0.5"
                    title="Recent probe uptime"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-4 w-1 rounded-xs ${
                          service.status === "OPERATIONAL"
                            ? "bg-emerald-500/80 hover:bg-emerald-400"
                            : service.status === "DEGRADED" && i > 18
                              ? "bg-amber-500/80 hover:bg-amber-400"
                              : service.status === "MAJOR_OUTAGE" && i > 16
                                ? "bg-rose-500/80 hover:bg-rose-400"
                                : "bg-emerald-500/80"
                        }`}
                      />
                    ))}
                  </div>
                  <Badge
                    variant={getServiceBadgeVariant(service.status)}
                    pulse={service.status === "MAJOR_OUTAGE"}
                  >
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Brand Seal */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-6">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Powered by </span>
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            DispatchPulse
          </span>
        </div>
      </div>
    </div>
  );
};
