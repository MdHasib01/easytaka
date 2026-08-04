import React from 'react';
import { BadgeTier } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'tier';
  tier?: BadgeTier;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  tier,
  size = 'sm',
  icon,
  className = ''
}) => {
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-sm font-bold';

  const tierStyles: Record<BadgeTier, string> = {
    Bronze: 'bg-amber-900/30 text-amber-300 border-amber-600/40',
    Silver: 'bg-slate-500/30 text-slate-200 border-slate-400/40',
    Gold: 'bg-yellow-500/30 text-yellow-300 border-yellow-400/50 shadow-sm shadow-yellow-500/20',
    Platinum: 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50 shadow-sm shadow-cyan-500/20',
    Diamond: 'bg-purple-500/30 text-purple-200 border-purple-400/50 shadow-md shadow-purple-500/30'
  };

  const variantStyles = {
    primary: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    info: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    tier: tier ? tierStyles[tier] : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md whitespace-nowrap ${sizeClass} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
