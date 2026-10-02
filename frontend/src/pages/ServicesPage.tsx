import React from 'react';

export const ServicesPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Monitored Services
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        HTTP target configurations & 90-day latency telemetry
      </p>
    </div>
  );
};