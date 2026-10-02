import React from 'react';
import { useParams } from 'react-router-dom';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Incident Investigation
      </h1>
      <p className="text-xs font-mono text-slate-500 mt-1">
        ID: {id}
      </p>
    </div>
  );
};