import React from 'react';

interface SamiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showText?: boolean;
  showTagline?: boolean;
  layout?: 'horizontal' | 'vertical';
  customLogoUrl?: string;
}

export const SamiLogo: React.FC<SamiLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showTagline = true,
  layout = 'horizontal',
  customLogoUrl,
}) => {
  // If user has uploaded a custom logo, render it directly preserving its exact original proportions
  if (customLogoUrl) {
    const customHeights = {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-14',
      xl: 'h-20',
      full: 'h-36 max-w-full',
    }[size];

    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={customLogoUrl}
          alt="Sami Logo"
          referrerPolicy="no-referrer"
          className={`${customHeights} w-auto object-contain rounded-lg`}
        />
      </div>
    );
  }

  // Dimension presets for official Sami logo SVG
  const dimensions = {
    sm: { h: 32, iconOnly: 28 },
    md: { h: 42, iconOnly: 38 },
    lg: { h: 56, iconOnly: 50 },
    xl: { h: 80, iconOnly: 72 },
    full: { h: 180, iconOnly: 140 },
  }[size];

  // If vertical or full layout, display the complete official square lockup as in the user's image
  if (layout === 'vertical' || size === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center select-none ${className}`}>
        <img
          src={`${import.meta.env.BASE_URL}sami-logo.svg`}
          alt="Sami - Tus finanzas personales"
          referrerPolicy="no-referrer"
          style={{ height: `${dimensions.h}px`, width: `${dimensions.h}px` }}
          className="object-contain rounded-xl shadow-xs"
        />
      </div>
    );
  }

  // Horizontal layout (for top navigation bar and headers):
  // Clean lockup: Icon emblem on left + crisp typography on right
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Emblem extracted from /sami-logo.svg (scaled without any distortion) */}
      <div
        style={{ width: `${dimensions.iconOnly}px`, height: `${dimensions.iconOnly}px` }}
        className="shrink-0 overflow-hidden rounded-lg relative"
      >
        <svg
          viewBox="120 95 260 215"
          className="w-full h-full object-contain drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="navGold" x1="120" y1="230" x2="330" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="80%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="navTeal" x1="140" y1="270" x2="310" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0E7490" />
              <stop offset="30%" stopColor="#0891B2" />
              <stop offset="70%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
            <filter id="navShadow" x="-10%" y="-10%" width="120%" height="125%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Golden A and upward arrow */}
          <g filter="url(#navShadow)">
            <path
              d="M 175 205 C 175 160 195 115 240 115 C 285 115 305 160 305 205"
              fill="none"
              stroke="url(#navGold)"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 270 205 L 340 135"
              fill="none"
              stroke="url(#navGold)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M 315 112 L 358 116 L 354 159 Z"
              fill="url(#navGold)"
              stroke="url(#navGold)"
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>

          {/* Teal S loop and wave */}
          <g filter="url(#navShadow)">
            <path
              d="M 235 155 C 190 145 160 165 160 205 C 160 240 190 250 220 250"
              fill="none"
              stroke="url(#navTeal)"
              strokeWidth="26"
              strokeLinecap="round"
            />
            <path
              d="M 152 245 C 145 270 165 295 195 285 C 225 275 240 240 270 230 C 295 220 315 245 325 285"
              fill="none"
              stroke="url(#navTeal)"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center text-left">
          <span className="text-xl font-extrabold tracking-tight text-[#0A2540] leading-none">
            Sami
          </span>
          {showTagline && (
            <span className="text-[11px] font-semibold text-[#0891B2] tracking-normal leading-none mt-1">
              Tus finanzas personales
            </span>
          )}
        </div>
      )}
    </div>
  );
};
