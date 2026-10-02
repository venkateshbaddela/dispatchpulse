import React from "react";

export const Dashboard: React.FC = () => {
    const keyMetrics = [
          "Total Services",
          "Active Incidents",
          "Uptime Rate",
          "Avg Latency",
        ]
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Operational Overview
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Telemetry stream & active incident response board
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {keyMetrics.map((metric) => (
          <div
            key={metric}
            className="p-5 rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsedian-border shadow-sm"
          >
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {metric}
            </span>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              --
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
