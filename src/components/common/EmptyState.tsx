import React from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are no active entries matching your current view.',
  icon = <Inbox className="w-10 h-10 text-indigo-400" />,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <GlassCard className={`text-center py-12 px-6 flex flex-col items-center justify-center ${className}`}>
      <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 animate-bounce">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="gradient">
          {actionText}
        </Button>
      )}
    </GlassCard>
  );
};
