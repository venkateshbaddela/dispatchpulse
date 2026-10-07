import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Moon, Sun } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/useTheme";
import { Logo } from "../ui/Logo";

export const LandingHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-obsidian-canvas/90 border-b border-slate-200 dark:border-obsidian-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Version Pill */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo size="md" showText={true} />
          </Link>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            v1.0
          </span>
        </div>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a
            href="#is-it-down"
            className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            Is It Down?
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Free
            </span>
          </a>
          <a
            href="#features"
            className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
          >
            Platform Features
          </a>
          <a
            href="#architecture"
            className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
          >
            Architecture
          </a>
        </nav>

        {/* Action CTAs & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-obsidian-hover hover:text-slate-900 dark:text-slate-100 transition-colors cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Authenticated vs Guest Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                  {user?.first_name || user?.email?.split("@")[0]}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                  {user?.role || "RESP"}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                title="Sign Out"
                className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
