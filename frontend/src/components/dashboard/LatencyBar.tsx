import React from "react";

interface LatencyBarProps {
  service_status: "OPERATIONAL" | "DEGRADED" | "MAJOR_OUTAGE" | string;
  avgLatencyMs?: number;
  barCount?: number;
}

export const LatencyBar: React.FC<LatencyBarProps> = ({
  service_status,
  avgLatencyMs = 45,
  barCount = 30,
}) => {
  // Generate deterministic micro-segment health data for the visual bar
  const segments = Array.from({ length: barCount }, (_, index) => {
    // If major outage, te most recent segments show failures
    if (service_status === "MAJOR_OUTAGE" && index >= barCount - 5) {
      return { status: "failed", latency: 0 };
    }
    // If degraded, intermittent latency spikes
    if (service_status === "DEGRADED" && index % 6 === 0) {
      return { status: "degraded", latency: Math.min(avgLatencyMs * 4, 850) };
    }
    // Operational jitter
    const jitter = ((index * 17) % 25) - 12;
    return {
      status: "operational",
      latency: Math.max(12, avgLatencyMs + jitter),
    };
  });

  return (
    <div className="space-y-1.5 w-full">
        <div className="flex items-center gap-0.75 h-6 w-full">
            {segments.map((seg, idx) => {
                let barBg = 'bg-emerald-500/80 hover:bg-emrald-400'
                if(seg.status === 'degraded') {
                    barBg = 'bg-amber-500/90 hover:bg-amber-400';
                } else if (seg.status === 'failed') {
                    barBg = 'bg-rose-500 hover:bg-rose-400'
                }

                return (
                    <div 
                    key={idx}
                   className={`flex-1 h-5 rounded-xs transition-all duration-150 cursor-pointer ${barBg}`}
                   title={`${seg.status.toUpperCase()} - ${seg.latency}ms`}
                   />
                )
            })}
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <span>30 checks ago</span>
            <span className="text-emerald-500 dark:text-emerald-400">99.98% uptime</span>
            <span>Current</span>
        </div>
    </div>
  )
};
