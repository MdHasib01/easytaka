import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'gradient';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'gradient',
  height = 'md',
  showLabel = false,
  label,
  className = ''
}) => {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colorClasses = {
    purple: 'bg-indigo-500 shadow-sm shadow-indigo-500/50',
    cyan: 'bg-blue-400 shadow-sm shadow-blue-400/50',
    emerald: 'bg-green-400 shadow-sm shadow-green-400/50',
    amber: 'bg-orange-400 shadow-sm shadow-orange-400/50',
    rose: 'bg-rose-500 shadow-sm shadow-rose-500/50',
    gradient: 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]'
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div 
      className={`w-full ${className}`}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress'}
    >
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-300">
          <span>{label || 'Progress'}</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/60 rounded-full overflow-hidden p-0.5 border border-white/10 ${heightClasses[height]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colorClasses[color]}`}
        />
      </div>
    </div>
  );
};
