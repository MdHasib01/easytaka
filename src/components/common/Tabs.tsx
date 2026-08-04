import React from 'react';
import { motion } from 'motion/react';

interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'glass' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'glass',
  className = ''
}) => {
  return (
    <div role="tablist" className={`flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl max-w-full overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isActive
                ? 'text-blue-200'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`activeTab-${variant}`}
                className="absolute inset-0 bg-blue-500/20 rounded-full border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.3)] -z-0"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                    isActive
                      ? 'bg-blue-500/30 text-blue-200'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
