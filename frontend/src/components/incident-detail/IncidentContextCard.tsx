import React from "react";
import { Clock, Server, ShieldAlert, User as UserIcon } from "lucide-react";
import type { Incident } from "../../types/incident";
import type { User } from "../../types/auth";

interface IncidentContextCardProps {
  incident: Incident;
  currentUser: User | null;
  users: User[];
  onAssign: (userId: number | null) => void;
  isAssigning: boolean;
}

export const IncidentContextCard: React.FC<IncidentContextCardProps> = ({
  incident,
  currentUser,
  users,
  onAssign,
  isAssigning,
}) => {
  const sortedUsers = [...users].sort((a, b) => {
    if (a.is_on_call === b.is_on_call) {
      return a.email.localeCompare(b.email);
    }
    return a.is_on_call ? -1 : 1;
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5 space-y-4 shadow-xs">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Incident Context
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Server className="h-4 w-4" /> Service
          </span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {incident.service_name || incident.service}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <ShieldAlert className="h-4 w-4" /> Error Type
          </span>
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
            {incident.error_type}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-obsidian-border/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <UserIcon className="h-4 w-4" /> Assigned To
            </span>
            {!incident.assigned_to && currentUser && (
              <button
                type="button"
                onClick={() => onAssign(currentUser.id)}
                disabled={isAssigning}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer disabled:opacity-50"
              >
                Claim Incident
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={incident.assigned_to ? String(incident.assigned_to.id) : ""}
              onChange={(e) => {
                const val = e.target.value;
                onAssign(val ? Number(val) : null);
              }}
              disabled={isAssigning}
              aria-label="Assign responder"
              className="w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-card px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
            >
              <option value="">⚪ Unassigned</option>
              {sortedUsers.map((u) => {
                const isCurrentUser = currentUser?.id === u.id;
                const displayName = u.first_name || u.last_name
                  ? `${u.first_name || ""} ${u.last_name || ""}`.trim()
                  : u.email;
                const label = `${u.is_on_call ? "🟢" : "⚪"} ${displayName}${u.is_on_call ? " (On-Call)" : ""}${isCurrentUser ? " - You" : ""}`;
                return (
                  <option key={u.id} value={u.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" /> Created At
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {new Date(incident.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
