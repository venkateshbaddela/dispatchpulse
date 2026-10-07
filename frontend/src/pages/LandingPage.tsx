import React from "react";
import { Radio } from "lucide-react";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingHero } from "../components/landing/LandingHero";
import { PublicProbeWidget } from "../components/public/PublicProbeWidget";
import { LandingFeatures } from "../components/landing/LandingFeatures";
import { LandingFooter } from "../components/landing/LandingFooter";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-obsidian-canvas text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sticky Navigation */}
      <LandingHeader />

      <main className="flex-1">
        {/* Hero & Platform Showcase Bento */}
        <LandingHero />

        {/* FEATURED TOOL: IS IT DOWN? (PUBLIC ACCESS) */}
        <section
          id="is-it-down"
          className="scroll-mt-16 py-16 sm:py-24 border-b border-slate-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card/40"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Public Availability Tool &bull; Free &bull; No Auth Required</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Is It Down Right Now?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Test any website or API endpoint instantly through our global telemetry edge prober. Verifies live DNS resolution, SSL, latency, and HTTP response codes.
              </p>
            </div>

            <PublicProbeWidget showDeepLink={true} />
          </div>
        </section>

        {/* 6 Core Platform Capabilities */}
        <LandingFeatures />

        {/* System Architecture & Conversion Footer */}
        <LandingFooter />
      </main>
    </div>
  );
};
