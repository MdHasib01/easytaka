import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { Bell, Zap, CheckCircle2, Award, DollarSign } from 'lucide-react';

export const SMMNotificationsPage: React.FC = () => {
  const { notifications } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Notification Log & Alerts
            <Bell className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Real-time updates regarding rapid missions, proof approvals, and rewards.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {(notifications || []).map(n => (
          <GlassCard key={n.id} glow="purple" className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">{n.title}</h3>
              <p className="text-xs text-slate-300">{n.message}</p>
              <span className="text-[10px] text-slate-500 block">{n.time}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
