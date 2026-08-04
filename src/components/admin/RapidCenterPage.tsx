import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Zap, Plus, AlertCircle, Clock, Users, ShieldAlert, Calculator, DollarSign, CheckCircle2 } from 'lucide-react';
import { PlatformType } from '../../types';

export const RapidCenterPage: React.FC = () => {
  const { rapidMissions, addRapidMission, showToast, brands } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [brandName, setBrandName] = useState('Milkimom');
  const [platform, setPlatform] = useState<PlatformType>('Facebook');
  const [reward, setReward] = useState(350);
  const [xpReward, setXpReward] = useState(250);
  const [requiredLevel, setRequiredLevel] = useState(6);
  const [slots, setSlots] = useState(25);
  const [instructions, setInstructions] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const totalCalculatedBudget = reward * slots;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast('Please enter Blitz title', 'warning');
      return;
    }
    setIsDeploying(true);
    try {
      await addRapidMission({
        title,
        brandName,
        platform,
        reward: Number(reward),
        xpReward: Number(xpReward),
        requiredLevel: Number(requiredLevel),
        totalSlots: Number(slots),
        // Becomes an absolute expiresAt server-side, so the countdown is real.
        timeRemainingSeconds: 3600,
        durationSeconds: 3600,
        urgencyLevel: 'Extreme',
        instructions: instructions || 'Immediate rapid social media intervention required.'
      });
      setIsModalOpen(false);
      setTitle('');
      setInstructions('');
    } catch {
      // addRapidMission already surfaced the reason via a toast.
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Rapid Center (Emergency Blitz)
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
          </h1>
          <p className="text-sm text-slate-400">
            Deploy high-priority rapid response missions with real-time slot limits.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="warning"
          icon={<Plus className="w-4 h-4" />}
        >
          Deploy Rapid Emergency Blitz
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard glow="amber">
          <div className="text-xs font-bold text-amber-300 uppercase">Active Rapid Blitzes</div>
          <div className="text-3xl font-black text-white mt-1">{rapidMissions.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">High urgency community moderation</p>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="text-xs font-bold text-cyan-300 uppercase">Emergency Reserve Allocated</div>
          <div className="text-3xl font-black text-white mt-1">
            ৳{rapidMissions.reduce((sum, r) => sum + (r.reward * r.totalSlots), 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active Blitz Commitments</p>
        </GlassCard>

        <GlassCard glow="purple">
          <div className="text-xs font-bold text-purple-300 uppercase">Average Response Time</div>
          <div className="text-3xl font-black text-white mt-1">3.8 Mins</div>
          <p className="text-[11px] text-slate-400 mt-1">Fastest response network</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rapidMissions.map(rm => (
          <GlassCard key={rm.id} glow="amber" className="space-y-4 border-amber-500/40 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
                  <Zap className="w-5 h-5 fill-amber-400" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white">{rm.title}</h3>
                  <span className="text-xs text-amber-300 font-bold">🥛 {rm.brandName} • {rm.platform}</span>
                </div>
              </div>
              <Badge variant="danger">{rm.urgencyLevel} Urgency</Badge>
            </div>

            <p className="text-xs text-slate-300">{rm.instructions}</p>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center text-xs">
              <div>
                <div className="text-slate-400 text-[10px] font-bold">Reward/Slot</div>
                <div className="text-sm font-black text-emerald-400">৳{rm.reward}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-bold">XP Bonus</div>
                <div className="text-sm font-black text-purple-300">+{rm.xpReward} XP</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] font-bold">Total Budget</div>
                <div className="text-sm font-black text-cyan-400">৳{(rm.reward * rm.totalSlots).toLocaleString()}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Slots Claimed
                </span>
                <span>{rm.claimedSlots} / {rm.totalSlots}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${(rm.claimedSlots / rm.totalSlots) * 100}%` }}
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Deploy Emergency Rapid Blitz"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Blitz Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. MILKIMOM FAKE NEWS NEUTRALIZATION BLITZ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Brand</label>
              <select
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reward/Slot (৳)</label>
              <input
                type="number"
                value={reward}
                onChange={(e) => setReward(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Max Slots</label>
              <input
                type="number"
                value={slots}
                onChange={(e) => setSlots(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Min Level Req</label>
              <input
                type="number"
                min={1}
                max={10}
                value={requiredLevel}
                onChange={(e) => setRequiredLevel(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Live Budget Calculator Widget */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-black text-amber-300">Live Calculated Total Budget</div>
                <div className="text-xs text-slate-300">{slots} slots × ৳{reward} per slot</div>
              </div>
            </div>
            <div className="text-lg font-black text-emerald-400">
              ৳{totalCalculatedBudget.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Urgent Instructions</label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Comment official verified batch certificate link on top 5 viral posts."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="warning" disabled={isDeploying}>
              {isDeploying ? 'Deploying...' : 'Deploy Rapid Blitz Now ⚡'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
