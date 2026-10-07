import React, { useState } from "react";
import { AlertTriangle, UserCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authApi } from "../../api/auth.api";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import type { UserRole, InviteMemberPayload } from "../../types/auth";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("RESPONDER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const inviteMutation = useMutation({
    mutationFn: (payload: InviteMemberPayload) => authApi.inviteUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setRole("RESPONDER");
      setError(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data as Record<string, unknown> | undefined;
        if (responseData && typeof responseData === "object") {
          const firstKey = Object.keys(responseData)[0];
          const val = responseData[firstKey];
          const msg = Array.isArray(val) ? val[0] : val;
          setError(typeof msg === "string" ? msg : "Failed to invite teammate.");
          return;
        }
      }
      setError("Failed to invite teammate.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    inviteMutation.mutate({
      email: email.trim(),
      password,
      role,
      first_name: firstName.trim() || undefined,
      last_name: lastName.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Member"
      subtitle="Invite an engineer with designated workspace permissions"
      icon={<UserCheck className="h-4 w-4" />}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Initial Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-1 w-full rounded-lg border border-slate-300 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="RESPONDER">Responder (Can resolve &amp; take on-call shifts)</option>
            <option value="ADMIN">Admin (Full workspace control)</option>
            <option value="VIEWER">Viewer (Read-only access)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-obsidian-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={inviteMutation.isPending}>
            Add Teammate
          </Button>
        </div>
      </form>
    </Modal>
  );
};
