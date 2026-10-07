import React from "react";
import type { ServiceStatus } from "../../types/service";

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
  className?: string;
  size?: "sm" | "md";
}

export const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({
  status,
  className = "",
  size = "md",
}) => {
  const isOperational = status === "OPERATIONAL";
  const isDegraded = status === "DEGRADED";

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold shrink-0 ${sizeClasses} ${
        isOperational
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          : isDegraded
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOperational
            ? "bg-emerald-500"
            : isDegraded
              ? "bg-amber-500"
              : "bg-rose-500 animate-ping"
        }`}
      />
      {isOperational ? "Operational" : isDegraded ? "Degraded" : "Major Outage"}
    </span>
  );
};
