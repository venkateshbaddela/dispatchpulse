import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Globe, Radio, X } from "lucide-react";
import React, { useState } from "react";
import { servicesApi } from "../../api/services.api";
import type {
  CreateServicePayload,
  Service,
  UpdateServicePayload,
} from "../../types/service";
import { Button } from "../ui/Button";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: Service | null;
}

const CADENCE_OPTIONS = [
  { label: "Every 15s (Aggressive)", value: 15 },
  { label: "Every 30s (Default)", value: 30 },
  { label: "Every 60s (Standard)", value: 60 },
  { label: "Every 5m (Relaxed)", value: 300 },
];

const ServiceModalDialog: React.FC<Omit<ServiceModalProps, "isOpen">> = ({
  onClose,
  serviceToEdit,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(serviceToEdit?.name ?? "");
  const [targetUrl, setTargetUrl] = useState(serviceToEdit?.target_url ?? "");
  const [checkIntervalSec, setCheckIntervalSec] = useState(
    serviceToEdit?.check_interval_sec || 30,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isEditMode = Boolean(serviceToEdit);

  const saveMutation = useMutation({
    mutationFn: (payload: CreateServicePayload | UpdateServicePayload) => {
      if (isEditMode && serviceToEdit) {
        return servicesApi.updateService(serviceToEdit.id, payload);
      }
      return servicesApi.createService(payload as CreateServicePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      onClose();
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as Record<string, unknown> | undefined;
        if (responseData && typeof responseData === "object") {
          const firstKey = Object.keys(responseData)[0];
          const val = responseData[firstKey];
          const msg = Array.isArray(val) ? val[0] : val;
          setErrorMessage(
            typeof msg === "string"
              ? msg
              : "Failed to save service target. Please verify your inputs.",
          );
          return;
        }
      }
      setErrorMessage(
        "Failed to save service target. Please verify your inputs.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Service name is required.");
      return;
    }

    if (!targetUrl.trim()) {
      setErrorMessage("Target URL is required.");
      return;
    }

    try {
      new URL(targetUrl.trim());
    } catch {
      setErrorMessage(
        "Please enter a valid URL (e.g. https://api.example.com/health).",
      );
      return;
    }

    saveMutation.mutate({
      name: name.trim(),
      target_url: targetUrl.trim(),
      check_interval_sec: Number(checkIntervalSec),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-obsidian-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isEditMode ? "Edit Monitored Target" : "Register Service Target"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure HTTP endpoint & telemetry polling cadence
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {errorMessage}
            </div>
          )}

          {/* Service Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Payments API Gateway"
              className="w-full rounded-lg bg-slate-50 dark:bg-obsidian-sidebar border border-slate-300 dark:border-obsidian-border px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Target URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Probe URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://api.example.com/health"
                className="w-full rounded-lg bg-slate-50 dark:bg-obsidian-sidebar border border-slate-300 dark:border-obsidian-border pl-9 pr-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors font-mono text-xs"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Polling Interval */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Health Check Cadence
            </label>
            <select
              value={checkIntervalSec}
              onChange={(e) => setCheckIntervalSec(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-50 dark:bg-obsidian-sidebar border border-slate-300 dark:border-obsidian-border px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              {CADENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-obsidian-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saveMutation.isPending}
            >
              {isEditMode ? "Update Target" : "Register Service"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
}) => {
  if (!isOpen) return null;

  return (
    <ServiceModalDialog
      key={serviceToEdit?.id ?? "create"}
      onClose={onClose}
      serviceToEdit={serviceToEdit}
    />
  );
};