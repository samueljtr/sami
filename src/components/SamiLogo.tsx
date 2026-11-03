import React from 'react';
import { SAMI_LOGO_DATA_URL } from '../constants/logo';

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
  const logoSrc = customLogoUrl || SAMI_LOGO_DATA_URL;

  // Sizing definitions tuned for sami.png (seal mascot + "sami" typography)
  const sizeConfig = {
    sm: { imgClass: 'w-10 h-10', titleClass: 'text-sm', badgeClass: 'text-[10px]' },
    md: { imgClass: 'w-13 h-13', titleClass: 'text-base', badgeClass: 'text-[11px]' },
    lg: { imgClass: 'w-16 h-16', titleClass: 'text-lg', badgeClass: 'text-xs' },
    xl: { imgClass: 'w-24 h-24', titleClass: 'text-xl', badgeClass: 'text-xs' },
    full: { imgClass: 'w-32 h-32', titleClass: 'text-2xl', badgeClass: 'text-sm' },
  }[size];

  if (layout === 'vertical' || size === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
        <div className="relative rounded-3xl bg-white border border-sky-100 shadow-md p-1.5 flex items-center justify-center overflow-hidden">
          <img
            src={logoSrc}
            alt="Sami Logo Oficial"
            className={`${sizeConfig.imgClass} object-contain transition-transform`}
          />
        </div>
        {showText && (
          <div className="mt-2.5">
            <span className={`font-black tracking-tight text-neutral-900 ${sizeConfig.titleClass}`}>
              sami
            </span>
            {showTagline && (
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                Control de Finanzas
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="rounded-2xl bg-white border border-sky-100 shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={logoSrc}
          alt="Sami Logo Oficial"
          className={`${sizeConfig.imgClass} object-contain`}
        />
      </div>

      {showText && (
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-neutral-900 ${sizeConfig.titleClass}`}>
              sami
            </span>
            <span className={`font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-1.5 py-0.5 rounded-md ${sizeConfig.badgeClass}`}>
              Finanzas
            </span>
          </div>
          {showTagline && (
            <p className="text-[11px] text-neutral-500 font-medium mt-1 truncate">
              Control personal
            </p>
          )}
        </div>
      )}
    </div>
  );
};
