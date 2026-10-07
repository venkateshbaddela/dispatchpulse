import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Radio, AlertTriangle, Plus } from "lucide-react";
import { authApi } from "../api/auth.api";
import { useAuth } from "../context/useAuth";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { TeamDirectoryTable } from "../components/team/TeamDirectoryTable";
import { InviteMemberModal } from "../components/team/InviteMemberModal";
import type { UserRole } from "../types/auth";

export const TeamPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // 1. Fetch Organization Users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.getUsers,
  });

  // 2. Toggle On-Call Shift Mutation
  const toggleOnCallMutation = useMutation({
    mutationFn: (userId: number) => {
      setTogglingId(userId);
      return authApi.toggleOnCall(userId);
    },
    onSettled: () => {
      setTogglingId(null);
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

  // Derived Stats
  const totalMembers = users.length;
  const activeOnCallCount = users.filter((u) => u.is_on_call).length;
  const respondersWithLoadCount = users.filter(
    (u) => (u.active_incidents_count || 0) > 0,
  ).length;

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
            Team &amp; Responders
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage organization members, responder roles, and live on-call duty rotations.
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            className="gap-2 shadow-xs"
            onClick={() => setIsInviteOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        )}
      </div>

      {/* KPI Stats Bento Bar */}
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

      {/* Modular Team Directory Table */}
      <TeamDirectoryTable
        users={users}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onToggleOnCall={(userId) => toggleOnCallMutation.mutate(userId)}
        onUpdateRole={(userId, role) => updateRoleMutation.mutate({ userId, role })}
        isTogglingId={togglingId}
      />

      {/* Modular Add Teammate Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};
