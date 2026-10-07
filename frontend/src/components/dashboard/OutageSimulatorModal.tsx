import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Flame,
  Database,
  Cpu,
  Clock,
  ShieldAlert,
  Zap,
  ArrowRight,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import axios from "axios";
import { incidentsApi } from "../../api/incidents.api";
import type { OutageScenario, SimulateCrashResponse } from "../../types/incident";
import type { Service } from "../../types/service";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface OutageSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  defaultServiceId?: string;
}

interface ScenarioOption {
  key: OutageScenario;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  accentColor: string;
}

const SCENARIOS: ScenarioOption[] = [
  {
    key: "SERVER_CRASH",
    title: "500 Server Crash",
    subtitle: "SIGSEGV / OOM runtime panic in worker process",
    icon: Cpu,
    accentColor: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
  {
    key: "DATABASE",
    title: "DB Pool Exhaustion",
    subtitle: "FATAL: max_connections limit exceeded (100% capacity)",
    icon: Database,
    accentColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  {
    key: "API_TIMEOUT",
    title: "504 Gateway Timeout",
    subtitle: "Upstream ingress proxy timeout after 10,000ms",
    icon: Clock,
    accentColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    key: "AUTH_SECURITY",
    title: "401 Auth Key Mismatch",
    subtitle: "Rotated JWKS signature verification rejected",
    icon: ShieldAlert,
    accentColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  {
    key: "PERFORMANCE",
    title: "P99 Latency Surge",
    subtitle: "P99 latency > 4850ms with heavy I/O wait",
    icon: Zap,
    accentColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
];

export const OutageSimulatorModal: React.FC<OutageSimulatorModalProps> = ({
  isOpen,
  onClose,
  services,
  defaultServiceId,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    defaultServiceId || (services[0]?.id ?? "")
  );
  const [selectedScenario, setSelectedScenario] = useState<OutageScenario>("SERVER_CRASH");
  const [customLogs, setCustomLogs] = useState<string>("");
  const [showLogsInput, setShowLogsInput] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulateCrashResponse | null>(null);

  const simulateMutation = useMutation({
    mutationFn: () =>
      incidentsApi.simulateCrash({
        service_id: selectedServiceId,
        scenario: selectedScenario,
        custom_logs: customLogs.trim() || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-kpis"] });
      queryClient.invalidateQueries({ queryKey: ["active-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setSimulationResult(data);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as Record<string, unknown> | undefined;
        if (responseData && typeof responseData === "object") {
          const firstKey = Object.keys(responseData)[0];
          const val = responseData[firstKey];
          const msg = Array.isArray(val) ? val[0] : val;
          setErrorMessage(
            typeof msg === "string" ? msg : "Simulation failed. Please check inputs."
          );
          return;
        }
      }
      setErrorMessage(
        err instanceof Error ? err.message : "Simulation failed. Please check inputs."
      );
    },
  });

  const handleTriggerSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSimulationResult(null);

    if (!selectedServiceId) {
      setErrorMessage("Please select a target service to simulate an outage.");
      return;
    }

    simulateMutation.mutate();
  };

  const handleNavigateToIncident = (incidentId: string) => {
    onClose();
    navigate(`/incidents/${incidentId}`);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chaos & Outage Simulator"
      subtitle="Inject realistic outages to test telemetry alerts and AI triage"
      icon={<Flame className="w-4 h-4" />}
      maxWidth="xl"
    >
      <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              {errorMessage}
            </div>
          )}

          {/* Success Result Banner */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {simulationResult.message}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Target service flipped to{" "}
                    <span className="font-bold text-rose-500">
                      {simulationResult.service_status}
                    </span>
                    . A P1 incident was triggered.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                  Incident: {simulationResult.incident.title.slice(0, 38)}...
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigateToIncident(simulationResult.incident.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>Open AI Triage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleTriggerSimulation} className="space-y-5">
            {/* 1. Target Service Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Monitored Service
              </label>
              {services.length === 0 ? (
                <p className="text-xs text-rose-500">
                  No monitored services found. Please register a service first.
                </p>
              ) : (
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 dark:bg-obsidian-sidebar border border-slate-300 dark:border-obsidian-border px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} — Status: {srv.status}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. Scenario Presets Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Outage Scenario Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SCENARIOS.map((sc) => {
                  const Icon = sc.icon;
                  const isSelected = selectedScenario === sc.key;
                  return (
                    <button
                      key={sc.key}
                      type="button"
                      onClick={() => setSelectedScenario(sc.key)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-50 dark:bg-obsidian-sidebar border-indigo-500 shadow-xs ring-1 ring-indigo-500"
                          : "bg-white dark:bg-obsidian-card border-slate-200 dark:border-obsidian-border hover:border-slate-300 dark:hover:border-obsidian-hover"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`p-1.5 rounded-lg border text-xs ${sc.accentColor}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {sc.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {sc.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Custom Stack Trace Logs Option */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogsInput(!showLogsInput)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>
                  {showLogsInput ? "Hide Custom Stack Trace" : "Provide Custom Stack Trace / Logs"}
                </span>
              </button>

              {showLogsInput && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <textarea
                    rows={4}
                    value={customLogs}
                    onChange={(e) => setCustomLogs(e.target.value)}
                    placeholder="Enter custom error trace, panic message, or stack dump..."
                    className="w-full rounded-lg bg-slate-50 dark:bg-obsidian-sidebar border border-slate-300 dark:border-obsidian-border p-3 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    If left blank, a realistic realistic stack trace for the selected scenario will be used automatically.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-obsidian-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={simulateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={simulateMutation.isPending}
                disabled={services.length === 0}
                className="gap-1.5 shadow-sm"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Inject Outage</span>
              </Button>
            </div>
          </form>
        </div>
    </Modal>
  );
};
