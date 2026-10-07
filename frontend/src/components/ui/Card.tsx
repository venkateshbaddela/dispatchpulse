import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-xl bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border shadow-xs ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`p-5 pb-3 border-b border-slate-100 dark:border-obsidian-border ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement> & { children: React.ReactNode }> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);
