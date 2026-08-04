import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { Wallet, Target, Award, ShieldCheck, Sparkles } from 'lucide-react';
import { settingsApi } from '../../api/endpoints';

export const SMMSalaryProgressPage: React.FC = () => {
  const { user } = useApp();

  // Configured platform-wide (settings key `salary.nextTierTarget`) rather than
  // hardcoded per page.
  const [nextTierTarget, setNextTierTarget] = React.useState(8000);

  React.useEffect(() => {
    let cancelled = false;
    settingsApi
      .list()
      .then((rows) => {
        const target = rows.find((s) => s.key === 'salary.nextTierTarget')?.value;
        if (!cancelled && typeof target === 'number') setNextTierTarget(target);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const currentEst = user.estimatedSalary;
  const progressPct = Math.min(100, Math.round((currentEst / nextTierTarget) * 100));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Salary Milestone Tracker
            <Wallet className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Roadmap to unlocking the ৳8,000/month Senior Specialist Salary Tier.
          </p>
        </div>
      </div>

      <GlassCard glow="emerald" className="space-y-4 p-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Current Estimated Salary</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">৳{currentEst.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase">Target Senior Tier</span>
            <div className="text-3xl font-black text-purple-300 mt-1">৳{nextTierTarget.toLocaleString()}</div>
          </div>
        </div>

        <ProgressBar progress={progressPct} showLabel label="Progress to Senior Specialist Salary Tier" color="gradient" height="lg" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="p-3 rounded-xl bg-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-400" /> Mission Target
            </div>
            <div className="text-slate-300">Complete 8 more Milkimom missions this month</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Quality Threshold
            </div>
            <div className="text-slate-300">Maintain Quality Score &gt; 90% (Current: {user.qualityScore}%)</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Streak Requirement
            </div>
            <div className="text-slate-300">Keep 15+ Day Streak (Current: {user.streak} Days 🔥)</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
