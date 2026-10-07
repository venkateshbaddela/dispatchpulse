import React from "react";
import type { IncidentLog } from "../../types/incident";

interface IncidentTimelineProps {
  logs?: IncidentLog[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ logs = [] }) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5 shadow-xs">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Activity Timeline
      </h3>

      {logs.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No timeline logs recorded yet.
        </p>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-obsidian-border">
          {logs.map((log) => (
            <div className="relative" key={log.id}>
              {/* Timeline Node Dot */}
              <div className="absolute left-[-1.85rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 dark:border-obsidian-card" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {log.event_type}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {log.note}
                </p>
                <span className="mt-1 block text-[10px] text-slate-400">
                  by {log.actor ? log.actor.email : "System Automation"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
