import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 - 100
  showLabel?: boolean;
  label?: string;
  color?: 'gradient' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  label,
  color = 'gradient',
  height = 'md',
  className = ''
}) => {
  const pct = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  }[height];

  const fillClass = {
    gradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-400',
    cyan: 'bg-gradient-to-r from-cyan-500 to-blue-400',
    indigo: 'bg-gradient-to-r from-indigo-500 to-blue-500'
  }[color];

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
          <span className="text-slate-400">{label ?? 'Progress'}</span>
          <span className="text-white tabular-nums">{pct}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={`w-full ${heightClass} rounded-full bg-white/10 overflow-hidden border border-white/5`}
      >
        <div
          className={`${heightClass} ${fillClass} rounded-full transition-[width] duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
