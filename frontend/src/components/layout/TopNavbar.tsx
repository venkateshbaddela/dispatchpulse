import React from "react";
import { Link } from "react-router-dom";
import { Search, Sun, Moon, CheckCircle2, ExternalLink } from "lucide-react";
import { useTheme } from "../../context/useTheme";
import { useAuth } from "../../context/useAuth";
import { Badge } from "../ui/Badge";

export const TopNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const orgSlug = user?.organization?.slug;

  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-canvas">
      {/* CMD-K Command Searc Mock */}
      <div className="flex items-center gap-3">
        <div className="relative w-64 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services, incidents.. (⌘K)"
            className="w-full bg-slate-100 dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border rounded-lg pl-9 pr-12 py-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Global Status Pill & Theme Switcher */}
      <div className="flex items-center gap-4">
        {orgSlug ? (
          <Link
            to={`/status/${orgSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open Public Customer Status Page (/status/${orgSlug})`}
            className="group hidden sm:inline-flex"
          >
            <Badge
              variant="emerald"
              pulse
              className="py-1 cursor-pointer group-hover:bg-emerald-500/20 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Public Status</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Badge>
          </Link>
        ) : (
          <Badge variant="emerald" pulse className="hidden sm:inline-flex py-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Systems Operational
          </Badge>
        )}

        <div
        onClick={toggleTheme}
        aria-label="Toggle Theme" 
       className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-obsidian-hover hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
       >
        {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400"/>
        ) : ( 
            <Moon className="w-4 h-4 text-slate-400"/>

        )}
       </div>
      </div>
    </header>
  );
};
