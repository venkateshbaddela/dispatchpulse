import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Globe,
  Plus,
  Radio,
  RefreshCw,
  Sliders,
  Trash2,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { servicesApi } from "../api/services.api";
import { LatencyBar } from "../components/dashboard/LatencyBar";
import { AlertRuleModal } from "../components/services/AlertRuleModal";
import { ServiceModal } from "../components/services/ServiceModal";
import { Button } from "../components/ui/Button";
import type { BatchPingResult, Service } from "../types/service";

export const ServicesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [serviceForAlerts, setServiceForAlerts] = useState<Service | null>(null);

  // Per-service pending state
  const [activePingingId, setActivePingingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Batch probe feedback state
  const [batchFeedback, setBatchFeedback] = useState<BatchPingResult | null>(
    null,
  );

  // Cache invalidation helper
  const invalidateServices = () => {
    queryClient.invalidateQueries({ queryKey: ["services"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
  };

  // 1. Fetch all tenant services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: servicesApi.getServices,
  });

  // 2. Single Service Ping Mutation
  const pingMutation = useMutation({
    mutationFn: (id: string) => servicesApi.pingService(id),
    onMutate: (id) => setActivePingingId(id),
    onSettled: () => {
      setActivePingingId(null);
      invalidateServices();
    },
  });

  // 3. Batch Ping All Services Mutation
  const pingAllMutation = useMutation({
    mutationFn: servicesApi.pingAllServices,
    onSuccess: (data: BatchPingResult) => {
      setBatchFeedback(data);
      invalidateServices();
      setTimeout(() => setBatchFeedback(null), 6000);
    },
  });

  // 4. Delete Service Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.deleteService(id),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => {
      setDeletingId(null);
      invalidateServices();
    },
  });

  const handleOpenCreateModal = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${service.name}"? Health check history will be permanently removed.`,
      )
    ) {
      deleteMutation.mutate(service.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Monitored Services
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                HTTP endpoint targets, real-time health checks & telemetry polling cadence
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions Bar */}
        <div className="flex items-center gap-2.5">
          {/* Batch Result Feedback Pill */}
          {batchFeedback && (
            <div className="animate-in fade-in zoom-in-95 duration-150 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Probed {batchFeedback.total}: {batchFeedback.success} OK, {batchFeedback.failed} Failed
              </span>
            </div>
          )}

          {/* Ping All Now Button */}
          <button
            type="button"
            onClick={() => pingAllMutation.mutate()}
            disabled={pingAllMutation.isPending || services.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-card dark:hover:bg-obsidian-hover text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-obsidian-border transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${pingAllMutation.isPending ? "animate-spin text-indigo-500" : ""}`}
            />
            <span>{pingAllMutation.isPending ? "Probing All..." : "Ping All Now"}</span>
          </button>

          {/* Register Target Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Target</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border animate-pulse p-5"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && services.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 mx-auto mb-3 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            No targets registered
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Register your HTTP endpoints to initiate automated latency telemetry, health checks, and incident alerting.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Register First Target</span>
          </Button>
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const isOperational = service.status === "OPERATIONAL";
            const isDegraded = service.status === "DEGRADED";
            const isPinging = activePingingId === service.id;
            const isDeleting = deletingId === service.id;

            return (
              <div
                key={service.id}
                className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover transition-colors shadow-xs"
              >
                <div>
                  {/* Top Bar: Name & Status Pill */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                      {service.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                        isOperational
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : isDegraded
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOperational
                            ? "bg-emerald-500"
                            : isDegraded
                              ? "bg-amber-500"
                              : "bg-rose-500 animate-ping"
                        }`}
                      />
                      {isOperational
                        ? "Operational"
                        : isDegraded
                          ? "Degraded"
                          : "Major Outage"}
                    </span>
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
                    onClick={() => pingMutation.mutate(service.id)}
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
                      onClick={() => {
                        setServiceForAlerts(service);
                        setIsAlertModalOpen(true);
                      }}
                      disabled={isDeleting}
                      title="Tune Alert Rules"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-obsidian-hover transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(service)}
                      disabled={isDeleting}
                      title="Edit Service"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteService(service)}
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
          })}
        </div>
      )}

      {/* Create / Edit Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setServiceToEdit(null);
        }}
        serviceToEdit={serviceToEdit}
      />

      {/* Alert Rule Configuration Modal */}
      <AlertRuleModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setServiceForAlerts(null);
        }}
        service={serviceForAlerts}
      />
    </div>
  );
};
