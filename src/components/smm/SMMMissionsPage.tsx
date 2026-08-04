import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Tabs } from '../common/Tabs';
import { ProofSubmissionModal } from '../common/ProofSubmissionModal';
import { useApp } from '../../context/AppContext';
import { Mission, MissionStatus } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { Target, Award, DollarSign, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export const SMMMissionsPage: React.FC = () => {
  const { missions, startMission } = useApp();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: 'All', label: 'All Missions' },
    { id: 'Available', label: 'Available' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Submitted', label: 'Submitted' },
    { id: 'Approved', label: 'Approved' },
    { id: 'Revision Required', label: 'Revision' }
  ];

  const filteredMissions = missions.filter(m => {
    if (activeTab === 'All') return true;
    return m.status === activeTab;
  });

  const handleOpenProofModal = (m: Mission) => {
    setSelectedMission(m);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            SMM Missions Hub
            <Target className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Execute social media tasks for partner brands & earn XP + cash rewards.
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {filteredMissions.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Missions Found"
          description={`There are currently no missions in "${activeTab}" status. Check back later or select a different filter.`}
          actionLabel="Show All Missions"
          onAction={() => setActiveTab('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMissions.map(m => (
            <GlassCard key={m.id} glow="purple" className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Badge variant="primary">{m.platform}</Badge>
                  <Badge variant={m.priority === 'Urgent' ? 'danger' : 'warning'}>
                    {m.priority} Priority
                  </Badge>
                </div>

                <div>
                  <span className="text-xs font-bold text-indigo-300">🥛 {m.brandName}</span>
                  <h3 className="text-base font-bold text-white mt-0.5 line-clamp-2">{m.title}</h3>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{m.description}</p>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1 text-purple-300 font-bold">
                    <Award className="w-4 h-4" />
                    +{m.xpReward} XP
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <DollarSign className="w-4 h-4" />
                    +৳{m.monetaryReward}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Due {m.deadline.slice(5, 10)}
                  </span>
                  <Badge variant={m.status === 'Approved' ? 'success' : m.status === 'In Progress' ? 'info' : 'warning'}>
                    {m.status}
                  </Badge>
                </div>

                {m.status === 'Available' && (
                  <Button
                    variant="gradient"
                    className="w-full"
                    icon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => startMission(m.id)}
                  >
                    Start Mission
                  </Button>
                )}

                {(m.status === 'In Progress' || m.status === 'Revision Required') && (
                  <Button
                    variant="success"
                    className="w-full"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => handleOpenProofModal(m)}
                  >
                    Submit Proof link & Screenshot
                  </Button>
                )}

                {m.status === 'Submitted' && (
                  <div className="text-center text-xs text-amber-300 font-semibold p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    ⏳ Submitted & Pending Review
                  </div>
                )}

                {m.status === 'Approved' && (
                  <div className="text-center text-xs text-emerald-400 font-bold p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    ✅ Approved (+৳{m.monetaryReward})
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ProofSubmissionModal
        mission={selectedMission}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
