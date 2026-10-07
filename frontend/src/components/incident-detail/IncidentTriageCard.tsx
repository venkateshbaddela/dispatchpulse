import React from "react";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import type { AISummary } from "../../types/incident";

interface IncidentTriageCardProps {
  ai_summary?: AISummary | null;
  isTriaging: boolean;
  onTriage: () => void;
}

export const IncidentTriageCard: React.FC<IncidentTriageCardProps> = ({
  ai_summary,
  isTriaging,
  onTriage,
}) => {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-950/10 p-5 dark:border-purple-500/20 dark:bg-purple-950/20 relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-950 dark:text-purple-200">
              AI Diagnostic Triage
            </h3>
            <p className="text-xs text-purple-800 dark:text-purple-400">
              Automated root-cause analysis and remediation synthesis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ai_summary?.confidence && (
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
              {Math.round(ai_summary.confidence * 100)}% Confidence
            </span>
          )}
          <Button
            variant="violet"
            size="sm"
            className="gap-1.5"
            isLoading={isTriaging}
            onClick={onTriage}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {ai_summary?.root_cause ? "Re-Triage with AI" : "Auto-Triage with AI"}
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-300">
            Identified Root Cause
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {ai_summary?.root_cause ||
              "AI diagnostic triage is awaiting execution or currently analyzing error patterns..."}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-300">
            Recommended Remediation
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {ai_summary?.recommended_fix ||
              "Follow standard runbook procedures for this error classification."}
          </p>
        </div>
      </div>
    </div>
  );
};
