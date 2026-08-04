import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Trophy, Award, Zap, Sparkles, Shield, Flame, Users, Calendar, Plus, ArrowUp, ArrowDown, Edit3, CheckCircle2 } from 'lucide-react';
import { skillsApi } from '../../api/endpoints';
import { BadgeItem, BadgeTier, SkillNode } from '../../types';

export const GamificationPage: React.FC = () => {
  const { showToast, badges, updateBadgeList } = useApp();
  const [activeTab, setActiveTab] = useState('badges');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Form state for badge creation
  const [badgeName, setBadgeName] = useState('');
  const [badgeTier, setBadgeTier] = useState<BadgeTier>('Gold');
  const [category, setCategory] = useState<BadgeItem['category']>('Specialist');
  const [salaryBoost, setSalaryBoost] = useState(500);
  const [description, setDescription] = useState('');
  const [requirementText, setRequirementText] = useState('');

  // Editable level tiers
  const [levelRules, setLevelRules] = useState([
    { id: '1', range: 'Levels 1 - 5 (Rookie)', xp: 200, boost: 'Base Tier', salary: 0 },
    { id: '2', range: 'Levels 6 - 10 (Specialist)', xp: 400, boost: '+৳300 Base', salary: 300 },
    { id: '3', range: 'Levels 11 - 15 (Community Lead)', xp: 500, boost: '+৳600 Base', salary: 600 },
    { id: '4', range: 'Levels 16+ (District Legend)', xp: 800, boost: '+৳1,200 Base', salary: 1200 }
  ]);

  const tabs = [
    { id: 'badges', label: 'Badge Library', icon: <Award className="w-4 h-4" /> },
    { id: 'levels', label: 'Level & XP Rules', icon: <Zap className="w-4 h-4" /> },
    { id: 'skilltree', label: 'Skill Tree Matrix', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'seasonal', label: 'Squad & Seasonal', icon: <Calendar className="w-4 h-4" /> }
  ];

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...levelRules];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setLevelRules(updated);
    showToast('Reordered Level Progression Tiers', 'info');
  };

  const handleMoveDown = (index: number) => {
    if (index === levelRules.length - 1) return;
    const updated = [...levelRules];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setLevelRules(updated);
    showToast('Reordered Level Progression Tiers', 'info');
  };

  const handleCreateBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeName) {
      showToast('Please enter badge name', 'warning');
      return;
    }
    const newBadge: BadgeItem = {
      id: `b-${Date.now()}`,
      name: badgeName,
      tier: badgeTier,
      category,
      iconName: 'Trophy',
      description: description || 'Awarded for exceptional community performance.',
      salaryBoost: Number(salaryBoost),
      isUnlocked: true,
      requirementText: requirementText || 'Complete 10 high quality missions.'
    };
    updateBadgeList([newBadge, ...badges]);
    setIsModalOpen(false);
    showToast(`🏆 Created New Badge: ${badgeName}`, 'success');
    setBadgeName('');
    setDescription('');
    setRequirementText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Gamification Engine Configuration
            <Trophy className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Configure levels, salary impact multipliers, badge tiers, and skill trees.
          </p>
        </div>

        <Button
          variant="gradient"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create New Badge / Tier
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map(b => (
            <GlassCard key={b.id} glow="purple" className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-amber-400 font-bold border border-indigo-400/30">
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
                <span className="text-slate-400 font-semibold">Salary Allowance Boost:</span>
                <span className="font-extrabold text-emerald-400">+৳{b.salaryBoost} / month</span>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                Req: {b.requirementText}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'levels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Level Tier Progression Rules
              </span>
              <span className="text-xs text-slate-400 font-normal">Move Up/Down to reorder</span>
            </h3>

            <div className="space-y-2 text-xs">
              {levelRules.map((rule, idx) => (
                <div key={rule.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-white">{rule.range}</div>
                    <div className="text-[11px] text-indigo-300">{rule.xp} XP / Level • {rule.boost}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-slate-300 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === levelRules.length - 1}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-slate-300 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              Daily Streak Reward Rules
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white/5 flex justify-between">
                <span>7-Day Streak Multiplier</span>
                <span className="font-bold text-amber-400">+10% XP Boost</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 flex justify-between">
                <span>14-Day Streak Multiplier</span>
                <span className="font-bold text-amber-400">+20% XP + ৳200 Bonus</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 flex justify-between">
                <span>30-Day Streak Legendary</span>
                <span className="font-bold text-amber-400">+50% XP + "Streak God" Badge</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'skilltree' && (
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

              <div className="text-xs font-bold text-amber-400">
                Unlock Cost: {sk.costXP} XP Tokens
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'seasonal' && (
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Squad System & District Battles
          </h3>
          <p className="text-xs text-slate-300">
            Jashore District Squad vs. Dhaka Central Squad in the current August Blitz League.
            Winning squad members receive +৳500 seasonal reward bonus.
          </p>
        </GlassCard>
      )}

      {/* Create New Badge Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Gamification Badge"
      >
        <form onSubmit={handleCreateBadge} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Badge Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. VIRAL TITAN"
              value={badgeName}
              onChange={(e) => setBadgeName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Badge Tier</label>
              <select
                value={badgeTier}
                onChange={(e) => setBadgeTier(e.target.value as BadgeTier)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Diamond">Diamond</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Badge Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BadgeItem['category'])}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Speed">Speed</option>
                <option value="Quality">Quality</option>
                <option value="Consistency">Consistency</option>
                <option value="Loyalty">Loyalty</option>
                <option value="Specialist">Specialist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Monthly Salary Boost (৳)</label>
              <input
                type="number"
                value={salaryBoost}
                onChange={(e) => setSalaryBoost(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Unlock Requirement</label>
            <input
              type="text"
              placeholder="e.g. Generate 5,000+ engagements on TikTok."
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Badge Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of what this badge represents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" icon={<Plus className="w-4 h-4" />}>
              Add Badge to Library
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
