import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Users, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Wallet, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { statsApi, auditApi } from '../../api/endpoints';
import { AdminWeeklyPoint, AuditLog, CommandCenterKpis, DistrictStat } from '../../types';

const PIE_COLORS = ['#818cf8', '#38bdf8', '#34d399', '#fbbf24'];

export const CommandCenterPage: React.FC = () => {
  const { showToast, workforce } = useApp();

  const [kpis, setKpis] = React.useState<CommandCenterKpis | null>(null);
  const [weekly, setWeekly] = React.useState<AdminWeeklyPoint[]>([]);
  const [districts, setDistricts] = React.useState<DistrictStat[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([statsApi.commandCenter(), statsApi.adminWeekly(), statsApi.districts(), auditApi.recent(3)])
      .then(([k, w, d, a]) => {
        if (cancelled) return;
        setKpis(k);
        setWeekly(w);
        setDistricts(d);
        setAuditLogs(a);
      })
      .catch(() => showToast('Could not load command centre metrics', 'error'));
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const totalBrands = kpis?.totalBrands ?? 0;
  const activeSMMs = kpis?.activeSMMs ?? 0;
  const pendingReviewsCount = kpis?.pendingReviews ?? 0;
  const activeRapidCount = kpis?.activeRapid ?? 0;
  const atRiskCount = kpis?.atRiskCount ?? 0;
  const payrollForecast = kpis?.payrollForecast ?? 0;

  const pieData = (kpis?.brandCampaignShare ?? []).map((slice, i) => ({
    ...slice,
    color: PIE_COLORS[i % PIE_COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            Command Center
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Real-time operating system metrics for EasyTaka SMM workforce network.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" icon={<Zap className="w-3.5 h-3.5" />}>
            Milkimom Campaign Live
          </Badge>
          <Badge variant="warning" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
            Fraud System Active
          </Badge>
        </div>
      </div>

      {/* Top Key Performance Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow="purple">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Brands</span>
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            <AnimatedCounter value={totalBrands} />
          </div>
          <div className="text-[11px] text-indigo-300 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Milkimom primary partner
          </div>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active SMM Workforce</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            <AnimatedCounter value={activeSMMs} />
          </div>
          <div className="text-[11px] text-cyan-300 font-semibold mt-1">
            Across 12 districts in Bangladesh
          </div>
        </GlassCard>

        <GlassCard glow="amber">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Reviews</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            <AnimatedCounter value={pendingReviewsCount} />
          </div>
          <div className="text-[11px] text-amber-300 font-semibold mt-1">
            Requires proof validation
          </div>
        </GlassCard>

        <GlassCard glow="emerald">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Payroll Forecast</span>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            <AnimatedCounter value={payrollForecast} prefix="৳" />
          </div>
          <div className="text-[11px] text-emerald-300 font-semibold mt-1">
            Est. current month payout
          </div>
        </GlassCard>
      </div>

      {/* Fraud & At-Risk Alert Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="border-rose-500/30 bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">Fraud Prevention System Alert</h4>
              <p className="text-xs text-rose-300/80 mt-0.5">
                0 suspicious IP clusters detected in Jashore & Sylhet districts today. Quality score threshold enforcing clean engagement.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-amber-500/30 bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">At-Risk SMM Personnel ({atRiskCount})</h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Sumi Akter (Sylhet) quality score dropped below 75%. Automated Academy retraining assigned.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Completion & Rapid Trend */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Mission Execution Trend</h3>
              <p className="text-xs text-slate-400">Regular vs. Rapid Blitz missions completed</p>
            </div>
            <Badge variant="primary">7-Day Live</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRapid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="completed" stroke="#818cf8" fillOpacity={1} fill="url(#colorCompleted)" name="Completed Missions" />
                <Area type="monotone" dataKey="rapid" stroke="#38bdf8" fillOpacity={1} fill="url(#colorRapid)" name="Rapid Blitz" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Brand Campaign Share Donut Chart */}
        <GlassCard className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Brand Campaign Share</h3>
            <p className="text-xs text-slate-400">Mission distribution across partner brands</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400 font-semibold">Milkimom</span>
              <span className="text-lg font-black text-indigo-400">45%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-300 font-medium">{p.name} ({p.value}%)</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* District Performance & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Performance */}
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                District Performance Matrix
              </h3>
              <p className="text-xs text-slate-400">Completion rate and workforce density</p>
            </div>
          </div>

          <div className="space-y-3">
            {districts.map((d) => (
              <div key={d.district} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{d.district} District</span>
                  <span className="text-indigo-300 font-bold">{d.activeSMMs} Active SMMs • ৳{d.totalPayout.toLocaleString()} Payout</span>
                </div>
                <ProgressBar progress={d.missionCompletionRate} showLabel label={`Completion (${d.qualityAvg}% Quality Avg)`} color="gradient" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Performers & Recent Audit Logs */}
        <GlassCard className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white">Top SMM Performers</h3>
            <span className="text-xs text-indigo-400 font-bold cursor-pointer hover:underline flex items-center">
              View All <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-3">
            {[...workforce]
              .sort((a, b) => b.estimatedSalary - a.estimatedSalary)
              .slice(0, 3)
              .map((w) => (
              <div key={w.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={w.avatar} alt={w.name} className="w-10 h-10 rounded-xl object-cover border border-white/20" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{w.name}</h4>
                    <p className="text-[10px] text-slate-400">{w.district} • Level {w.level} • {w.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400">৳{w.estimatedSalary.toLocaleString()}</div>
                  <div className="text-[10px] text-indigo-300">{w.qualityScore}% Quality Score</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold text-slate-300 mb-2">Recent System Audit Log</h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              {auditLogs.map(log => (
                <div key={log.id} className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-slate-200 font-semibold">{log.action}</span>
                  <span className="text-slate-500">{log.timestamp.slice(11, 16)}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
