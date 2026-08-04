import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { User, Phone, Mail, MapPin, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

export const SMMProfilePage: React.FC = () => {
  const { user } = useApp();

  return (
    <div className="space-y-6">
      <GlassCard glow="purple" className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-500/40 shadow-2xl"
          />
          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
              {user.name}
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </h1>
            <p className="text-sm font-bold text-indigo-300">{user.title} • {user.brand}</p>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-3 mt-1">
              <span>📍 {user.district} District</span>
              <span>•</span>
              <span>📞 {user.phone}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-slate-400 font-bold">Level</div>
            <div className="text-lg font-black text-amber-400">Lvl {user.level}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-slate-400 font-bold">Quality Score</div>
            <div className="text-lg font-black text-purple-300">{user.qualityScore}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-slate-400 font-bold">Trust Score</div>
            <div className="text-lg font-black text-cyan-300">{user.trustScore}%</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-slate-400 font-bold">Missions Done</div>
            <div className="text-lg font-black text-emerald-400">{user.totalCompletedMissions}</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
