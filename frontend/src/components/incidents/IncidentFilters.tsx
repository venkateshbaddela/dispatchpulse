import React from "react";
import { RotateCcw, Search, X } from "lucide-react";
import type { Service } from "../../types/service";

interface IncidentFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  severityFilter: string;
  setSeverityFilter: (severity: string) => void;
  serviceFilter: string;
  setServiceFilter: (service: string) => void;
  searchInput: string;
  setSearchInput: (query: string) => void;
  setDebouncedSearch: (query: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  services: Service[];
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
  serviceFilter,
  setServiceFilter,
  searchInput,
  setSearchInput,
  setDebouncedSearch,
  hasActiveFilters,
  onResetFilters,
  services,
}) => {
  const statusTabs = [
    { id: "ALL", label: "All Incidents" },
    { id: "ACTIVE", label: "Active Queue", alert: true },
    { id: "TRIGGERED", label: "Triggered" },
    { id: "ACKNOWLEDGED", label: "Acknowledged" },
    { id: "RESOLVED", label: "Resolved" },
  ];

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs space-y-4">
      {/* Row 1: Status Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-obsidian-border pb-3">
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

      {/* Row 2: Search, Severity, Service, Reset */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Debounced Search */}
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

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-obsidian-hover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-obsidian-border transition-colors cursor-pointer shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
