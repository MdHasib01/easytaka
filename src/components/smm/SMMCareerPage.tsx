import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';
import { UserAvatar } from '../common/UserAvatar';
import { useApp } from '../../context/AppContext';
import { Trophy, Award, Zap, Flame, Sparkles, Shield, Lock, CheckCircle2, Star, Calendar } from 'lucide-react';
import { skillsApi } from '../../api/endpoints';
import { SkillNode } from '../../types';

export const SMMCareerPage: React.FC = () => {
  const { user, badges } = useApp();
  const [activeTab, setActiveTab] = useState('passport');
  const [sampleSkillTree, setSkillTree] = useState<SkillNode[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    skillsApi
      .list()
      .then((rows) => !cancelled && setSkillTree(rows))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = [
    { id: 'passport', label: 'Career Passport', icon: <Trophy className="w-4 h-4" /> },
    { id: 'badges', label: 'Badge Collection', icon: <Award className="w-4 h-4" /> },
    { id: 'skills', label: 'Skill Tree Matrix', icon: <Sparkles className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Career Passport & Progression
            <Trophy className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Gamified workforce titles, skill tokens, and district rank history.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'passport' && (
        <div className="space-y-6">
          {/* Career Passport Card */}
          <GlassCard glow="purple" className="border-2 border-purple-500/40 relative overflow-hidden p-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-6 border-b border-white/10 pb-6">
              <div className="relative">
                <UserAvatar
                  src={user.avatar}
                  name={user.name}
                  size="xl"
                  badgeContent={
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-white shadow-md">
                      LVL {user.level}
                    </span>
                  }
                  badgeClassName="-bottom-2 -right-2"
                />
              </div>

              <div className="text-center md:text-left space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-xl font-black text-white">{user.name}</h2>
                  <Badge variant="primary">{user.title}</Badge>
                </div>
                <p className="text-xs text-slate-300">
                  📍 District: <strong className="text-white">{user.district}</strong> • Brand Specialist: <strong className="text-white">{user.brand}</strong>
                </p>
                <div className="text-xs text-indigo-300 font-bold flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span>🔥 {user.streak} Day Streak</span>
                  <span>•</span>
                  <span>🏆 Rank #1 in Jashore</span>
                </div>
              </div>
            </div>

            {/* Career Timeline */}
            <div className="pt-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Career Milestone Progression
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-emerald-300">
                  <span>Joined EasyTaka SMM Force ({user.joinDate})</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-emerald-300">
                  <span>Reached Level 10 & Unlocked Community Specialist Title</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center text-amber-300 font-bold">
                  <span>Current Objective: Reach Level 15 for District Coordinator Upgrade</span>
                  <span>360 XP Remaining</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map(b => (
            <GlassCard key={b.id} glow={b.isUnlocked ? 'purple' : 'none'} className={`space-y-3 ${!b.isUnlocked && 'opacity-60'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className={`p-2.5 rounded-2xl ${b.isUnlocked ? 'bg-indigo-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'} font-bold`}>
                    🏆
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{b.name}</h3>
                    <span className="text-xs text-indigo-300">{b.category}</span>
                  </div>
                </div>
                <Badge variant="tier" tier={b.tier}>{b.tier}</Badge>
              </div>

              <p className="text-xs text-slate-300">{b.description}</p>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Salary Impact:</span>
                <span className="font-extrabold text-emerald-400">+৳{b.salaryBoost} / month</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleSkillTree.map(sk => (
            <GlassCard key={sk.id} glow="purple" className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">{sk.title}</h3>
                  <span className="text-xs text-indigo-300">{sk.category} Branch</span>
                </div>
                <Badge variant={sk.isUnlocked ? 'success' : 'info'}>
                  {sk.isUnlocked ? 'Unlocked' : `Lvl ${sk.requiredLevel} Req`}
                </Badge>
              </div>

              <p className="text-xs text-slate-300">{sk.description}</p>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/10">
                <span className="font-bold text-amber-400">Cost: {sk.costXP} XP</span>
                {sk.isUnlocked ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Skill
                  </span>
                ) : (
                  <Button size="sm" variant="gradient">Unlock Skill</Button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
