import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Globe,
  Plus,
  Radio,
  RefreshCw,
} from "lucide-react";
import { servicesApi } from "../api/services.api";
import { AlertRuleModal } from "../components/services/AlertRuleModal";
import { ServiceModal } from "../components/services/ServiceModal";
import { ServiceCard } from "../components/services/ServiceCard";
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
  const [batchFeedback, setBatchFeedback] = useState<BatchPingResult | null>(null);

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
                HTTP endpoint targets, real-time health checks &amp; telemetry polling cadence
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => pingAllMutation.mutate()}
            isLoading={pingAllMutation.isPending}
            disabled={services.length === 0}
            className="gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pingAllMutation.isPending ? "animate-spin text-indigo-500" : ""}`} />
            <span>Ping All Targets</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Service</span>
          </Button>
        </div>
      </div>

      {/* Batch Feedback Banner */}
      {batchFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Batch Probe Complete:</strong> {batchFeedback.total} service(s) checked ({batchFeedback.success} passed, {batchFeedback.failed} failed).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBatchFeedback(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:opacity-75 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Skeleton Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="h-64 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border animate-pulse p-5 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
              </div>
              <div className="h-6 bg-slate-100 dark:bg-slate-800/40 rounded" />
              <div className="h-8 bg-slate-100 dark:bg-slate-800/40 rounded mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && services.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-obsidian-card border border-dashed border-slate-300 dark:border-obsidian-border shadow-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-obsidian-canvas flex items-center justify-center text-slate-400">
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

      {/* Services Grid using modular ServiceCard */}
      {!isLoading && services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isPinging={activePingingId === service.id}
              isDeleting={deletingId === service.id}
              onPing={(id) => pingMutation.mutate(id)}
              onOpenAlerts={(svc) => {
                setServiceForAlerts(svc);
                setIsAlertModalOpen(true);
              }}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteService}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={serviceToEdit}
      />

      {serviceForAlerts && (
        <AlertRuleModal
          isOpen={isAlertModalOpen}
          onClose={() => {
            setIsAlertModalOpen(false);
            setServiceForAlerts(null);
          }}
          service={serviceForAlerts}
        />
      )}
    </div>
  );
};
