import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { LevelCard } from '../common/LevelCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Flame, 
  Award, 
  Wallet, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { statsApi } from '../../api/endpoints';
import { SmmWeeklyPoint } from '../../types';

export const SMMHomePage: React.FC = () => {
  const { user, rapidMissions, missions } = useApp();
  const navigate = useNavigate();

  const [smmWeeklyPerformanceData, setSmmWeeklyPerformanceData] = React.useState<SmmWeeklyPoint[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    statsApi
      .smmWeekly()
      .then((rows) => !cancelled && setSmmWeeklyPerformanceData(rows))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRapidAlert = rapidMissions.find(r => r.status === 'Active');
  const pendingRevision = missions.find(m => m.status === 'Revision Required');

  return (
    <div className="space-y-6">
      {/* Rapid Alert Banner if active */}
      {activeRapidAlert && (
        <GlassCard glow="amber" className="bg-amber-950/40 border-amber-500/50 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 animate-bounce">
                <Zap className="w-6 h-6 fill-amber-400" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  URGENT RAPID BLITZ ACTIVE
                </span>
                <h3 className="text-sm font-bold text-white mt-1">{activeRapidAlert.title}</h3>
                <p className="text-xs text-amber-200">
                  Reward: ৳{activeRapidAlert.reward} + {activeRapidAlert.xpReward} XP • {activeRapidAlert.totalSlots - activeRapidAlert.claimedSlots} slots remaining!
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate('/smm/rapid')}
              variant="warning"
              size="sm"
              icon={<Zap className="w-4 h-4 fill-white" />}
            >
              Claim Rapid Reward
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Revision Required Banner */}
      {pendingRevision && (
        <GlassCard className="bg-rose-950/30 border-rose-500/40 p-4">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Revision Required: {pendingRevision.title}
            </div>
            <Button size="sm" variant="danger" onClick={() => navigate('/smm/missions')}>
              Fix Proof
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Level & XP Identity Card */}
      <LevelCard user={user} />

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow="emerald">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Estimated Salary</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-400">
            <AnimatedCounter value={user.estimatedSalary} prefix="৳" />
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Includes ৳{user.rapidEarnings} Rapid Earnings
          </div>
        </GlassCard>

        <GlassCard glow="purple">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Quality Score</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-purple-300">
            <AnimatedCounter value={user.qualityScore} suffix="%" />
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            Top 5% in Jashore District
          </div>
        </GlassCard>

        <GlassCard glow="amber">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-400">
            <AnimatedCounter value={user.streak} suffix=" Days" />
          </div>
          <div className="text-[10px] text-amber-300 font-semibold mt-1">
            +15% XP Active Multiplier
          </div>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Trust Score</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl md:text-2xl font-black text-cyan-300">
            <AnimatedCounter value={user.trustScore} suffix="%" />
          </div>
          <div className="text-[10px] text-cyan-300 font-semibold mt-1">
            Instant Proof Clearance
          </div>
        </GlassCard>
      </div>

      {/* Daily Checklist & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Mission Checklist */}
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Daily Mission Checklist
            </h3>
            <Badge variant="primary">3/4 Done</Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-300">
              <span className="line-through font-medium">1. Comment on Milkimom Group Reel</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-300">
              <span className="line-through font-medium">2. Moderate 3 Toddler Formula Enquiries</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-300">
              <span className="line-through font-medium">3. Claim 1 Rapid Blitz Intervention</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-slate-300">
              <span>4. Share Shajgoj Glow Serum Story</span>
              <Button size="sm" variant="gradient" onClick={() => navigate('/smm/missions')}>
                Execute
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Weekly Performance Chart */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Weekly Performance Analytics
              </h3>
              <p className="text-xs text-slate-400">Daily XP and Earnings growth</p>
            </div>
            <Badge variant="info">7 Days</Badge>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={smmWeeklyPerformanceData}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="xp" stroke="#a855f7" fillOpacity={1} fill="url(#colorXp)" name="XP Tokens" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
