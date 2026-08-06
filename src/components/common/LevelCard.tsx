import React from 'react';
import { GlassCard } from './GlassCard';
import { ProgressBar } from './ProgressBar';
import { UserAvatar } from './UserAvatar';
import { Sparkles, Zap, Award } from 'lucide-react';
import { SMMUser } from '../../types';

interface LevelCardProps {
  user: SMMUser;
  className?: string;
}

export const LevelCard: React.FC<LevelCardProps> = ({ user, className = '' }) => {
  const xpPercentage = Math.round((user.xp / user.maxXp) * 100);

  return (
    <GlassCard glow="purple" className={`relative overflow-hidden ${className}`}>
      {/* Floating decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse-slow pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl animate-pulse-slow pointer-events-none" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar
              src={user.avatar}
              name={user.name}
              size="lg"
              className="shadow-lg shadow-purple-500/30"
              badgeContent={
                <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-white shadow-md flex items-center gap-0.5 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                  LVL {user.level}
                </div>
              }
              badgeClassName="-bottom-1 -right-1"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {user.name}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {user.title}
              </span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>📍 District: <strong className="text-slate-200">{user.district}</strong></span>
              <span>•</span>
              <span>🏢 Brand: <strong className="text-slate-200">{user.brand}</strong></span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>{user.streak} Day Streak 🔥</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 relative z-10">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1 text-purple-300">
            <Award className="w-3.5 h-3.5" />
            XP Progress
          </span>
          <span>
            <strong className="text-white">{user.xp.toLocaleString()}</strong> / {user.maxXp.toLocaleString()} XP ({xpPercentage}%)
          </span>
        </div>
        <ProgressBar progress={xpPercentage} color="gradient" height="lg" />
      </div>
    </GlassCard>
  );
};
