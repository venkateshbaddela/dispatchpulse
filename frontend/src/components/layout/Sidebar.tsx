import React from "react";
import { NavLink } from "react-router-dom";
import { Activity, Layers, AlertTriangle, LogOut, Globe, Users } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { Logo } from "../ui/Logo";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", path: "/", icon: Activity },
    { label: "Services", path: "/services", icon: Layers },
    { label: "Incidents", path: "/incidents", icon: AlertTriangle },
    { label: "Team", path: "/team", icon: Users },
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
      <div className="p-3.5 border-t border-slate-200 dark:border-obsidian-border bg-slate-50/50 dark:bg-obsidian-card/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 p-[1.5px] shadow-xs">
              <div className="w-full h-full rounded-full bg-white dark:bg-obsidian-card flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            {user?.is_on_call && (
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-obsidian-sidebar ring-1 ring-emerald-500/30 animate-pulse"
                title="Active On-Call Duty"
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate"
                title={user?.email}
              >
                {user?.first_name || user?.email?.split("@")[0] || "User"}
              </p>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                  user?.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40"
                    : user?.role === "VIEWER"
                    ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40"
                }`}
              >
                {user?.role || "Responder"}
              </span>
            </div>
            <p
              className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5"
              title={user?.email}
            >
              {user?.email}
            </p>
          </div>
        </div>

        {/* Micro Status Bar & Sign Out */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/70 dark:border-obsidian-border/70 mt-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            {user?.is_on_call ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                On-Duty
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                Off-Duty
              </span>
            )}
          </div>

          <button
            onClick={() => logout()}
            title="Sign out of workspace"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-75 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};
