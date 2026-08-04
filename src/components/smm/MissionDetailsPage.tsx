import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { Target, Award, DollarSign, Calendar, Upload, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export const MissionDetailsPage: React.FC = () => {
  const { missions, submitMissionProof } = useApp();
  const [selectedId, setSelectedId] = useState(missions[0]?.id || '');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');

  const mission = missions.find(m => m.id === selectedId) || missions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !mission) return;
    submitMissionProof(mission.id, url, note);
    setUrl('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Mission Details & Submission Portal
            <Target className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Step-by-step execution guidelines and proof verification.
          </p>
        </div>
      </div>

      {/* Select Mission Selector */}
      <GlassCard className="flex items-center gap-4">
        <label className="text-xs font-bold text-slate-300">Select Mission:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
        >
          {missions.map(m => (
            <option key={m.id} value={m.id}>{m.title} ({m.brandName})</option>
          ))}
        </select>
      </GlassCard>

      {mission && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard glow="purple" className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-indigo-300">🥛 {mission.brandName} • {mission.platform}</span>
                <h2 className="text-lg font-bold text-white mt-1">{mission.title}</h2>
              </div>
              <Badge variant="primary">{mission.priority} Priority</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
              <h4 className="font-bold text-white">Execution Instructions:</h4>
              <p className="text-slate-300">{mission.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1 text-xs">
              <h4 className="font-bold text-indigo-300">Required Proof:</h4>
              <p className="text-slate-300">{mission.proofRequirement}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <div className="text-slate-400 text-[10px] font-bold">XP Reward</div>
                <div className="text-base font-black text-purple-300">+{mission.xpReward} XP</div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-slate-400 text-[10px] font-bold">Monetary Compensation</div>
                <div className="text-base font-black text-emerald-400">৳{mission.monetaryReward}</div>
              </div>
            </div>
          </GlassCard>

          {/* Submission Form Card */}
          <GlassCard glow="cyan" className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              Submit Proof
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Link URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://facebook.com/group/post/123"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Note to Reviewer</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Shared in Jashore Parents group with 45 comments"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full" icon={<CheckCircle2 className="w-4 h-4" />}>
                Submit for Verification
              </Button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
