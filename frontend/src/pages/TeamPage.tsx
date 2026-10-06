import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Radio,
  AlertTriangle,
  Plus,
  UserCheck,
  X,
} from "lucide-react";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/useAuth";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import type { User, UserRole, InviteMemberPayload } from "../types/auth";
import axios from "axios";

export const TeamPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("RESPONDER");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  // 1. Fetch Organization Users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.getUsers,
  });

  // 2. Toggle On-Call Shift Mutation
  const toggleOnCallMutation = useMutation({
    mutationFn: (userId: number) => authApi.toggleOnCall(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // 3. Update User Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: UserRole }) =>
      authApi.updateUser(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // 4. Invite Teammate Mutation
  const inviteMutation = useMutation({
    mutationFn: (payload: InviteMemberPayload) => authApi.inviteUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsInviteOpen(false);
      setInviteEmail("");
      setInvitePassword("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteRole("RESPONDER");
      setInviteError(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as
          | Record<string, unknown>
          | undefined;
        if (responseData && typeof responseData === "object") {
          const firstKey = Object.keys(responseData)[0];
          const val = responseData[firstKey];
          const msg = Array.isArray(val) ? val[0] : val;
          setInviteError(
            typeof msg === "string" ? msg : "Failed to invite teammate.",
          );
          return;
        }
      }
      setInviteError("Failed to invite teammate.");
    },
  });

  // Derived Stats
  const totalMembers = users.length;
  const activeOnCallCount = users.filter((u) => u.is_on_call).length;
  const respondersWithLoadCount = users.filter(
    (u) => (u.active_incidents_count || 0) > 0,
  ).length;

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    inviteMutation.mutate({
      email: inviteEmail.trim(),
      password: invitePassword,
      role: inviteRole,
      first_name: inviteFirstName.trim() || undefined,
      last_name: inviteLastName.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Team & Responders
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage organization members, responder roles, and live on-call duty
            rotations.
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            className="gap-2 shadow-xs"
            onClick={() => {
              setInviteError(null);
              setIsInviteOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Members
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalMembers}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active On-Call
              </p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {activeOnCallCount} on duty
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Responders
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {respondersWithLoadCount} handling incidents
              </p>
            </div>
          </div>
        </div>
      </div>
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
                    className="hover:bg-slate-50/50 dark:hover:bg-obsidian-hover/40           
  transition-colors"
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
                              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded- 
  full bg-emerald-500 ring-2 ring-white dark:ring-obsidian-card animate-pulse"
                              title="Active On-Call"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {member.first_name || member.last_name
                                ? `${member.first_name} ${member.last_name}`.trim()
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

                    {/* Role Dropdown / Badge */}
                    <td className="px-6 py-4">
                      {isAdmin && !isSelf ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              userId: member.id,
                              role: e.target.value as UserRole,
                            })
                          }
                          disabled={updateRoleMutation.isPending}
                          aria-label={`Change role for ${member.email}`}
                          className="rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-card px-2.5 py-1 text-xs font-semibold text-slate-800          
  dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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

                    {/* On-Call Shift */}
                    <td className="px-6 py-4">
                      {member.is_on_call ? (
                        <Badge variant="emerald" pulse>
                          On-Duty
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Off-Duty</Badge>
                      )}
                    </td>

                    {/* Active Load */}
                    <td className="px-6 py-4">
                      {(member.active_incidents_count || 0) > 0 ? (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-    
  amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-500 dark:text-amber-400 border      
  border-amber-500/20"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          {member.active_incidents_count} Active
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          0 Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {canToggle ? (
                        <Button
                          variant={member.is_on_call ? "secondary" : "primary"}
                          size="sm"
                          className={
                            member.is_on_call
                              ? "text-xs"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          }
                          isLoading={toggleOnCallMutation.isPending}
                          onClick={() => toggleOnCallMutation.mutate(member.id)}
                        >
                          {member.is_on_call ? "Go Off-Duty" : "Go On-Call"}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-600">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Teammate Modal */}
      {isInviteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60  
  backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200        
  dark:border-obsidian-border bg-white dark:bg-obsidian-card p-6 shadow-2xl"
          >
            <div
              className="flex items-center justify-between pb-4 border-b border-slate-100  
  dark:border-obsidian-border"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3
                  id="modal-title"
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  Add Team Member
                </h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-obsidian-hover dark:hover:text-slate-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              {inviteError && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={inviteFirstName}
                    onChange={(e) => setInviteFirstName(e.target.value)}
                    placeholder="Alex"
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={inviteLastName}
                    onChange={(e) => setInviteLastName(e.target.value)}
                    placeholder="Rivera"
                    className="mt-1 w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Initial Password (min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Initial Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="RESPONDER">
                    Responder (Can resolve & take on-call shifts)
                  </option>
                  <option value="ADMIN">Admin (Full workspace control)</option>
                  <option value="VIEWER">Viewer (Read-only access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-obsidian-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={inviteMutation.isPending}
                >
                  Add Teammate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
