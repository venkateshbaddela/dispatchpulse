import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const dimensions = {
    sm: { box: 28, text: 'text-base', pulse: 'w-7 h-7' },
    md: { box: 36, text: 'text-xl', pulse: 'w-9 h-9' },
    lg: { box: 48, text: 'text-2xl', pulse: 'w-12 h-12' },
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Dynamic Pulse Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${dimensions.pulse}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(99,102,241,0.45)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="dp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Squircle Background Tile */}
          <rect
            width="32"
            height="32"
            rx="8"
            fill="url(#dp-gradient)"
          />

          {/* Precision Telemetry Pulse Waveform */}
          <path
            d="M 4 16 L 9 16 L 12.5 8 L 16.5 24 L 20 12 L 23 18 L 25 16 L 28 16"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Live Ping Beacon Dot */}
          <circle cx="28" cy="16" r="1.5" fill="#38BDF8" className="animate-pulse" />
        </svg>
      </div>

      {/* Brand Typographic Wordmark */}
      {showText && (
        <div className="flex items-center tracking-tight font-bold">
          <span className={`text-slate-900 dark:text-slate-100 ${dimensions.text}`}>
            Dispatch
          </span>
          <span className={`text-indigo-600 dark:text-cyan-400 font-extrabold ${dimensions.text}`}>
            Pulse
          </span>
        </div>
      )}
    </div>
  );
};