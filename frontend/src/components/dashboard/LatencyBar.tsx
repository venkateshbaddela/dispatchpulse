import React from "react";
import type { TelemetryCheckItem } from "../../types/service";

interface LatencyBarProps {
  service_status: "OPERATIONAL" | "DEGRADED" | "MAJOR_OUTAGE" | string;
  avgLatencyMs?: number;
  recent_checks?: TelemetryCheckItem[];
  barCount?: number;
}

interface BarSegment {
  status: "operational" | "degraded" | "failed" | "empty";
  latency: number | null;
  statusCode: number | null;
  checkedAt: string | null;
}

export const LatencyBar: React.FC<LatencyBarProps> = ({
  service_status,
  avgLatencyMs = 45,
  recent_checks,
  barCount = 30,
}) => {
  let segments: BarSegment[];

  if (recent_checks && recent_checks.length > 0) {
    const totalSlots = Math.max(barCount, recent_checks.length);
    const emptyCount = Math.max(0, totalSlots - recent_checks.length);

    const emptySlots: BarSegment[] = Array.from({ length: emptyCount }, () => ({
      status: "empty",
      latency: null,
      statusCode: null,
      checkedAt: null,
    }));

    const checkSlots: BarSegment[] = recent_checks.map((check) => {
      let status: BarSegment["status"] = "operational";
      if (!check.is_success) {
        status = "failed";
      } else if (check.latency_ms && check.latency_ms >= 1000) {
        status = "degraded";
      }
      return {
        status,
        latency: check.latency_ms,
        statusCode: check.status_code,
        checkedAt: check.checked_at,
      };
    });

    segments = [...emptySlots, ...checkSlots];
  } else {
    segments = Array.from({ length: barCount }, () => {
      if (service_status === "MAJOR_OUTAGE") {
        return { status: "failed", latency: null, statusCode: 500, checkedAt: null };
      }
      if (service_status === "DEGRADED") {
        return { status: "degraded", latency: avgLatencyMs, statusCode: 200, checkedAt: null };
      }
      return { status: "operational", latency: avgLatencyMs, statusCode: 200, checkedAt: null };
    });
  }

  // Calculate actual uptime from recent checks
  const validChecks = recent_checks && recent_checks.length > 0 ? recent_checks : [];
  const successfulChecks = validChecks.filter((c) => c.is_success).length;
  const uptimePct =
    validChecks.length > 0
      ? ((successfulChecks / validChecks.length) * 100).toFixed(1)
      : service_status === "OPERATIONAL"
      ? "100.0"
      : service_status === "DEGRADED"
      ? "95.0"
      : "0.0";

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center gap-0.75 h-6 w-full">
        {segments.map((seg, idx) => {
          let barBg = "bg-emerald-500/80 hover:bg-emerald-400";
          let tooltip = `Operational — ${seg.latency ?? avgLatencyMs}ms`;

          if (seg.status === "empty") {
            barBg = "bg-slate-200 dark:bg-obsidian-hover/40";
            tooltip = "No probe data yet";
          } else if (seg.status === "degraded") {
            barBg = "bg-amber-500/90 hover:bg-amber-400";
            tooltip = `Degraded (High Latency) — ${seg.latency ?? 1000}ms (HTTP ${seg.statusCode || 200})`;
          } else if (seg.status === "failed") {
            barBg = "bg-rose-500 hover:bg-rose-400";
            tooltip = `Outage (Failed check) — HTTP ${seg.statusCode || "Timeout / Error"}`;
          }

          if (seg.checkedAt) {
            tooltip += ` • ${new Date(seg.checkedAt).toLocaleTimeString()}`;
          }

          return (
            <div
              key={idx}
              className={`flex-1 h-5 rounded-xs transition-all duration-75 cursor-pointer ${barBg}`}
              title={tooltip}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500">
        <span>{segments.length} checks history</span>
        <span
          className={
            Number(uptimePct) >= 99
              ? "text-emerald-500 dark:text-emerald-400"
              : Number(uptimePct) >= 90
              ? "text-amber-500 dark:text-amber-400"
              : "text-rose-500 dark:text-rose-400"
          }
        >
          {uptimePct}% uptime
        </span>
        <span>Latest check</span>
      </div>
    </div>
  );
};
