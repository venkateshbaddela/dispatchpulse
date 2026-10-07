import React, { useState } from "react";
import { Activity, Check, Copy } from "lucide-react";
import { Button } from "../ui/Button";

interface IncidentLogsViewerProps {
  raw_logs?: string | null;
}

export const IncidentLogsViewer: React.FC<IncidentLogsViewerProps> = ({ raw_logs }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = async () => {
    if (raw_logs) {
      await navigator.clipboard.writeText(raw_logs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-obsidian-border">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Raw Telemetry &amp; Stack Trace
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleCopyLogs}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Logs</span>
            </>
          )}
        </Button>
      </div>

      <div className="mt-4">
        <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-400 max-h-96 selection:bg-emerald-900 selection:text-white">
          <code>{raw_logs || "// No raw trace logs recorded for this event."}</code>
        </pre>
      </div>
    </div>
  );
};
