import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Sliders, CheckCircle2, ShieldAlert } from "lucide-react";
import axios from "axios";
import { incidentsApi } from "../../api/incidents.api";
import type { Service } from "../../types/service";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface AlertRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
}

const FAILURE_PRESETS = [
  { label: "1 (Instant)", value: 1 },
  { label: "3 (Standard)", value: 3 },
  { label: "5 (Relaxed)", value: 5 },
];

const TIMEOUT_PRESETS = [
  { label: "2s", value: 2000 },
  { label: "5s (Default)", value: 5000 },
  { label: "10s", value: 10000 },
];

const AlertRuleModalDialog: React.FC<Omit<AlertRuleModalProps, "isOpen">> = ({
  onClose,
  service,
}) => {
  const queryClient = useQueryClient();

  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(
    service?.alert_rule?.consecutive_failures ?? 3
  );
  const [timeoutMs, setTimeoutMs] = useState<number>(
    service?.alert_rule?.timeout_ms ?? 5000
  );
  const [isActive, setIsActive] = useState<boolean>(
    service?.alert_rule?.is_active ?? true
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateRuleMutation = useMutation({
    mutationFn: async () => {
      if (!service) throw new Error("No service selected");
      let ruleId = service.alert_rule?.id;

      // If rule ID is not embedded, query from API
      if (!ruleId) {
        const rules = await incidentsApi.getAlertRules(service.id);
        if (rules && rules.length > 0) {
          ruleId = rules[0].id;
        }
      }

      if (!ruleId) {
        throw new Error("Alert rule record not found for this service.");
      }

      return incidentsApi.updateAlertRule(ruleId, {
        consecutive_failures: Number(consecutiveFailures),
        timeout_ms: Number(timeoutMs),
        is_active: isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      setSuccessMessage("Alert rule thresholds updated successfully.");
      setTimeout(() => {
        onClose();
      }, 700);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as Record<string, unknown> | undefined;
        if (responseData && typeof responseData === "object") {
          const firstKey = Object.keys(responseData)[0];
          const val = responseData[firstKey];
          const msg = Array.isArray(val) ? val[0] : val;
          setErrorMessage(
            typeof msg === "string" ? msg : "Failed to update alert rule."
          );
          return;
        }
      }
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update alert rule."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (consecutiveFailures < 1 || consecutiveFailures > 20) {
      setErrorMessage("Consecutive failures must be between 1 and 20.");
      return;
    }

    if (timeoutMs < 500 || timeoutMs > 60000) {
      setErrorMessage("Timeout must be between 500ms and 60,000ms.");
      return;
    }

    updateRuleMutation.mutate();
  };

  if (!service) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Tune Alert Rules & Thresholds"
      subtitle={`Target: ${service.name}`}
      icon={<Sliders className="w-4 h-4" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Rule Active Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-obsidian-sidebar border border-slate-200 dark:border-obsidian-border">
            <div className="space-y-0.5">
              <label htmlFor="active-toggle" className="text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer">
                Automated Incident Alerting
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Escalate outages and trigger P1 alerts when health checks fail
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="active-toggle"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {!isActive && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Alerting is disabled. Service failures will not trip on-call incidents.</span>
            </div>
          )}

          {/* 2. Consecutive Failures */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Consecutive Failures Threshold
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {consecutiveFailures} {consecutiveFailures === 1 ? "probe" : "probes"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Number of consecutive failed checks before escalating service to MAJOR_OUTAGE and tripping an incident.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={consecutiveFailures}
                onChange={(e) => setConsecutiveFailures(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="20"
                value={consecutiveFailures}
                onChange={(e) => setConsecutiveFailures(Number(e.target.value))}
                className="w-16 rounded-lg bg-slate-50 dark:bg-obsidian-sidebar border border-slate-300 dark:border-obsidian-border px-2.5 py-1 text-xs text-center font-mono text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400">Presets:</span>
              {FAILURE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setConsecutiveFailures(preset.value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    consecutiveFailures === preset.value
                      ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                      : "bg-slate-100 dark:bg-obsidian-hover text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Probe Timeout Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                HTTP Response Timeout Limit
              </label>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {timeoutMs} ms ({(timeoutMs / 1000).toFixed(1)}s)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Probes exceeding this latency threshold will be aborted and registered as a network timeout failure.
            </p>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <input
                type="number"
                min="500"
                max="60000"
                step="500"
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                className="w-20 rounded-lg bg-slate-50 dark:bg-obsidian-sidebar border border-slate-300 dark:border-obsidian-border px-2.5 py-1 text-xs text-center font-mono text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Timeout presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-400">Presets:</span>
              {TIMEOUT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setTimeoutMs(preset.value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    timeoutMs === preset.value
                      ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                      : "bg-slate-100 dark:bg-obsidian-hover text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-obsidian-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={updateRuleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={updateRuleMutation.isPending}
              className="gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Save Alert Thresholds</span>
            </Button>
          </div>
        </form>
    </Modal>
  );
};

export const AlertRuleModal: React.FC<AlertRuleModalProps> = ({
  isOpen,
  onClose,
  service,
}) => {
  if (!isOpen || !service) return null;

  return (
    <AlertRuleModalDialog
      key={`alert-rule-${service.id}-${service.alert_rule?.id ?? "none"}`}
      onClose={onClose}
      service={service}
    />
  );
};
