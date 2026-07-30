import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4', text: 'text-base' },
    md: { container: 'w-10 h-10 rounded-xl', icon: 'w-5.5 h-5.5', text: 'text-lg' },
    lg: { container: 'w-12 h-12 rounded-2xl', icon: 'w-7 h-7', text: 'text-2xl' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Badge */}
      <div
        className={`${currentSize.container} bg-gradient-to-tr from-indigo-500 via-purple-600 to-indigo-700 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0 group transition-transform hover:scale-105`}
      >
        <div className="w-full h-full bg-zinc-950 rounded-[9px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-indigo-500/10 blur-sm group-hover:bg-indigo-500/20 transition-all" />
          
          <svg
            className={`${currentSize.icon} text-indigo-400 relative z-10 transition-transform group-hover:rotate-6`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Geometric Brain/Target Node Emblem */}
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 4a6 6 0 1 1-6 6 6 6 0 0 1 6-6z" />
            <path d="M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4z" />
            <circle cx="12" cy="12" r="2" className="fill-indigo-400 stroke-none" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-bold tracking-tight text-white leading-tight`}>
            Talent<span className="text-indigo-400 font-extrabold">Forge</span>
          </span>
          <span className="text-[10px] font-semibold text-zinc-400 tracking-wider">
            Intelligent Resume Screening & Candidate Matching
          </span>
        </div>
      )}
    </div>
  );
};
