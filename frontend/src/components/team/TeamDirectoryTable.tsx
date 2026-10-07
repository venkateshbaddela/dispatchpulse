import React from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { User, UserRole } from "../../types/auth";

interface TeamDirectoryTableProps {
  users: User[];
  currentUser: User | null;
  isAdmin: boolean;
  onToggleOnCall: (userId: number) => void;
  onUpdateRole: (userId: number, role: UserRole) => void;
  isTogglingId?: number | null;
}

export const TeamDirectoryTable: React.FC<TeamDirectoryTableProps> = ({
  users,
  currentUser,
  isAdmin,
  onToggleOnCall,
  onUpdateRole,
  isTogglingId,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-obsidian-border bg-slate-50/75 dark:bg-obsidian-card/75 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-6 py-3.5">Member</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">On-Call Shift</th>
              <th className="px-6 py-3.5">Active Load</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-obsidian-border">
            {users.map((member: User) => {
              const isSelf = member.id === currentUser?.id;
              const canToggle = isAdmin || isSelf;

              return (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-obsidian-hover/40 transition-colors"
                >
                  {/* Member Name & Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="h-9 w-9 rounded-full bg-linear-to-tr from-indigo-600 via-indigo-500 to-cyan-500 p-[1.5px] shadow-xs">
                          <div className="h-full w-full rounded-full bg-white dark:bg-obsidian-card flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {member.email.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        {member.is_on_call && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-obsidian-card animate-pulse"
                            title="Active On-Call"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {member.first_name || member.last_name
                              ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
                              : member.email.split("@")[0]}
                          </span>
                          {isSelf && (
                            <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate block">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role Selector or Badge */}
                  <td className="px-6 py-4">
                    {isAdmin && !isSelf ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          onUpdateRole(member.id, e.target.value as UserRole)
                        }
                        className="rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-card px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="RESPONDER">RESPONDER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    ) : (
                      <Badge
                        variant={
                          member.role === "ADMIN"
                            ? "violet"
                            : member.role === "RESPONDER"
                              ? "cyan"
                              : "neutral"
                        }
                      >
                        {member.role}
                      </Badge>
                    )}
                  </td>

                  {/* On-Call Duty Status Badge */}
                  <td className="px-6 py-4">
                    {member.is_on_call ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        On-Call Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-obsidian-canvas px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-obsidian-border">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Off-Duty
                      </span>
                    )}
                  </td>

                  {/* Active Incident Load */}
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold ${
                        (member.active_incidents_count || 0) > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {member.active_incidents_count || 0} active
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right">
                    {canToggle ? (
                      <Button
                        size="sm"
                        variant={member.is_on_call ? "secondary" : "primary"}
                        isLoading={isTogglingId === member.id}
                        onClick={() => onToggleOnCall(member.id)}
                      >
                        {member.is_on_call ? "Go Off-Duty" : "Go On-Call"}
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-600">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
