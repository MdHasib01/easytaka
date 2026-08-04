import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { Zap, Clock, Users, ShieldAlert, Award, DollarSign } from 'lucide-react';

export const SMMRapidPage: React.FC = () => {
  const { rapidMissions, claimRapidMission, user } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Rapid Emergency Blitz Center
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
          </h1>
          <p className="text-sm text-slate-400">
            Urgent interventions with limited slots & instant cash rewards.
          </p>
        </div>

        <Badge variant="warning" icon={<Clock className="w-3.5 h-3.5" />}>
          Live Countdown Active
        </Badge>
      </div>

      {rapidMissions.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No Active Rapid Blitzes"
          description="There are currently no emergency rapid blitz missions active. Check back soon for high-urgency tasks!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rapidMissions.map(rm => {
            const isEligible = user.level >= rm.requiredLevel;
            const slotsRemaining = rm.totalSlots - rm.claimedSlots;

            return (
              <GlassCard key={rm.id} glow="amber" className="space-y-4 border-amber-500/40 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 animate-pulse">
                      <Zap className="w-6 h-6 fill-amber-400" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white">{rm.title}</h3>
                      <span className="text-xs text-amber-300 font-bold">🥛 {rm.brandName} • {rm.platform}</span>
                    </div>
                  </div>
                  <Badge variant="danger">{rm.urgencyLevel}</Badge>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                  {rm.instructions}
                </p>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-center text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold">Reward</div>
                    <div className="text-sm font-black text-emerald-400">৳{rm.reward}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold">XP Bonus</div>
                    <div className="text-sm font-black text-purple-300">+{rm.xpReward} XP</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold">Level Req</div>
                    <div className="text-sm font-black text-amber-400">Lvl {rm.requiredLevel}+</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> Slots: {slotsRemaining} Remaining
                  </span>
                  <span className="text-rose-400 font-bold animate-pulse">
                    ⏱️ Live Blitz
                  </span>
                </div>

                <Button
                  variant="warning"
                  className="w-full"
                  disabled={!isEligible || slotsRemaining <= 0 || rm.status === 'Claimed'}
                  onClick={() => claimRapidMission(rm.id)}
                  icon={<Zap className="w-4 h-4 fill-white" />}
                >
                  {rm.status === 'Claimed' || slotsRemaining <= 0
                    ? 'All Slots Claimed'
                    : !isEligible
                    ? `Level ${rm.requiredLevel} Required`
                    : `Claim Rapid Blitz (+৳${rm.reward})`}
                </Button>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
