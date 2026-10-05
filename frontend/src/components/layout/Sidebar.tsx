import React from "react";
import { NavLink } from "react-router-dom";
import { Activity, Layers, AlertTriangle, LogOut, Radio, Globe } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { Badge } from "../ui/Badge";
import { Logo } from "../ui/Logo";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/", icon: Activity },
    { label: "Services", path: "/services", icon: Layers },
    { label: "Incidents", path: "/incidents", icon: AlertTriangle },
    { label: "Is It Down?", path: "/is-it-down", icon: Globe },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-sidebar">
      <div>
        {/* Brand & Organization */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-obsidian-border">
          <Logo size="md" showText={true} />
          <span className="text-[10px] font-mono text-slate-500 truncate dark:text-slate-400 ml-11 -mt-1">
            {user?.organization?.name || "Workspace"}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-obsidian-hover hover:text-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      {/* User Responder Profile & Sign Out */}
      <div className="p-4 border-t border-slate-200 dark:border-obsidian-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-200 truncate">
                {user?.email}
              </p>
              <p className="text-slate-900 dark:text-slate-200 truncate">
                {user?.role || "Responder"}
              </p>
            </div>
          </div>
          {user?.is_on_call && (
            <Badge variant="emerald" pulse className="text-[10px] px-1.5 py-0">
              <Radio className="w-2.5 h-2.5" />
              On-Call
            </Badge>
          )}
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
