import React from 'react';

interface UrsaiLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  variant?: 'emblem' | 'horizontal' | 'full' | 'stacked';
  showSubtitle?: boolean;
  className?: string;
  glow?: boolean;
}

export const UrsaiLogo: React.FC<UrsaiLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  showSubtitle = true,
  className = '',
  glow = true,
}) => {
  const pixelSizeMap: Record<string, number> = {
    xs: 24,
    sm: 32,
    md: 44,
    lg: 64,
    xl: 96,
    '2xl': 140,
  };

  const emblemSize = typeof size === 'number' ? size : pixelSizeMap[size] || 44;
  
  const imgClass = `shrink-0 object-contain ${glow ? 'drop-shadow-[0_0_8px_rgba(0,229,255,0.35)]' : ''}`;

  if (variant === 'emblem') {
    return <img src="/logo.png" alt="URSAI Logo" width={emblemSize} height={emblemSize} className={`${imgClass} ${className}`} />;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img src="/logo.png" alt="URSAI Logo" width={emblemSize} height={emblemSize} className={imgClass} />
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-xl leading-none text-slate-100 font-mono flex items-center">
              <span className="text-cyan-400">U</span>
              <span>R</span>
              <span>S</span>
              <span className="relative">
                A
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rotate-45" />
              </span>
              <span className="text-cyan-400">I</span>
            </span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 uppercase">
              SWARM CORE
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] font-medium tracking-wide text-slate-400 font-sans uppercase mt-0.5">
              Urban Resource Swarm AI
            </p>
          )}
        </div>
      </div>
    );
  }

  // Full Stacked / Badge Variant
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <img src="/logo.png" alt="URSAI Logo" width={emblemSize} height={emblemSize} className={imgClass} />
      <div className="mt-3 flex flex-col items-center">
        <div className="font-extrabold tracking-widest text-3xl text-slate-100 font-mono flex items-center gap-0.5">
          <span className="text-cyan-400">U</span>
          <span>R</span>
          <span>S</span>
          <span className="relative inline-block px-0.5">
            A
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rotate-45 shadow-sm shadow-cyan-400" />
          </span>
          <span className="text-cyan-400">I</span>
        </div>
        {showSubtitle && (
          <>
            <p className="text-[10.5px] font-bold tracking-[0.25em] text-slate-300 font-mono uppercase mt-1.5">
              URBAN <span className="text-cyan-400">•</span> RESOURCE <span className="text-cyan-400">•</span> SWARM <span className="text-cyan-400">•</span> AI <span className="text-cyan-400">•</span> INTELLIGENCE
            </p>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2 flex items-center justify-center">
              <span className="w-2 h-2 bg-cyan-300 rotate-45 shadow-sm shadow-cyan-300" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UrsaiLogo;
