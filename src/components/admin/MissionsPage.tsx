import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Target, Plus, Search, Calendar, Award, DollarSign, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { PlatformType, PriorityLevel, Mission } from '../../types';

export const MissionsPage: React.FC = () => {
  const { missions, brands, addMission, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Available' | 'In Progress' | 'Submitted' | 'Approved'>('All');

  // Form state
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [platform, setPlatform] = useState<PlatformType>('Facebook');
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [category, setCategory] = useState<'Engagement' | 'Content Creation' | 'Community Growth' | 'Moderation' | 'Viral Campaign'>('Community Growth');
  const [description, setDescription] = useState('');
  const [monetaryReward, setMonetaryReward] = useState(250);
  const [xpReward, setXpReward] = useState(180);
  const [deadline, setDeadline] = useState('2026-08-10 23:59');
  const [proofRequirement, setProofRequirement] = useState('');

  const filteredMissions = missions.filter(m => {
    if (selectedFilter === 'All') return true;
    return m.status === selectedFilter;
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProofRequirement('');
    setStep(1);
  };

  const handleNext = () => {
    if (step === 1 && !title) {
      showToast('Please enter a Mission Title', 'warning');
      return;
    }
    setStep(prev => Math.min(5, prev + 1));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBrand = brands.find(b => b.id === brandId) || brands[0];
    if (!selectedBrand) {
      showToast('Create a brand before launching a mission', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await addMission({
        title,
        brandId: selectedBrand.id,
        brandName: selectedBrand.name,
        platform,
        priority,
        deadline: deadline || '2026-08-10 23:59',
        xpReward: Number(xpReward),
        monetaryReward: Number(monetaryReward),
        proofRequirement: proofRequirement || 'Submit Facebook/TikTok link and engagement screenshot.',
        description: description || 'Promote brand campaign across targeted Bangladesh social media groups.',
        category
      });
      setIsModalOpen(false);
      resetForm();
    } catch {
      // addMission already surfaced the reason via a toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Mission Command Center
            <Target className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Create, assign, and track regular SMM campaign missions.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          variant="gradient"
          icon={<Plus className="w-4 h-4" />}
        >
          Create Regular Mission
        </Button>
      </div>

      {/* Filter Tabs */}
      <GlassCard className="flex items-center gap-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
        {['All', 'Available', 'In Progress', 'Submitted', 'Approved'].map(status => (
          <button
            key={status}
            onClick={() => setSelectedFilter(status as any)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              selectedFilter === status
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </GlassCard>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMissions.map(m => (
          <GlassCard
            key={m.id}
            glow="purple"
            className="space-y-4 cursor-pointer hover:scale-[1.01] transition-all"
            onClick={() => setSelectedMission(m)}
          >
            <div className="flex justify-between items-start gap-2">
              <Badge variant="primary">{m.platform}</Badge>
              <Badge variant={m.priority === 'Urgent' ? 'danger' : 'warning'}>
                {m.priority} Priority
              </Badge>
            </div>

            <div>
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                🥛 {m.brandName}
              </div>
              <h3 className="text-base font-bold text-white mt-1 line-clamp-2">{m.title}</h3>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                <Award className="w-4 h-4 text-amber-400" />
                +{m.xpReward} XP
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <DollarSign className="w-4 h-4" />
                +৳{m.monetaryReward}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Due {m.deadline.slice(5, 10)}
              </span>
              <Badge variant={m.status === 'Approved' ? 'success' : m.status === 'In Progress' ? 'info' : 'warning'}>
                {m.status}
              </Badge>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Multi-step Create Mission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Build & Launch SMM Mission"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  step === s ? 'bg-indigo-600 text-white shadow-lg' : step > s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-slate-500'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`hidden sm:inline text-[10px] font-bold ${step === s ? 'text-indigo-300' : 'text-slate-500'}`}>
                  {s === 1 ? 'Basics' : s === 2 ? 'Details' : s === 3 ? 'Rewards' : s === 4 ? 'Proof' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {step === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mission Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Milkimom Nutrition Reel Distribution"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Brand</label>
                    <select
                      value={brandId}
                      onChange={(e) => setBrandId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as PlatformType)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Facebook" className="bg-slate-900">Facebook</option>
                      <option value="Instagram" className="bg-slate-900">Instagram</option>
                      <option value="TikTok" className="bg-slate-900">TikTok</option>
                      <option value="YouTube" className="bg-slate-900">YouTube</option>
                      <option value="X/Twitter" className="bg-slate-900">X/Twitter</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mission Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Community Growth">Community Growth</option>
                    <option value="Content Creation">Content Creation</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Moderation">Moderation</option>
                    <option value="Viral Campaign">Viral Campaign</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Instructions for SMMs</label>
                  <textarea
                    rows={3}
                    placeholder="Provide step-by-step instructions on where and how SMMs should post/interact..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Monetary Reward (৳)</label>
                    <input
                      type="number"
                      value={monetaryReward}
                      onChange={(e) => setMonetaryReward(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">XP Reward</label>
                    <input
                      type="number"
                      value={xpReward}
                      onChange={(e) => setXpReward(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Submission Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Proof Requirements & Guidelines</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Provide direct public link + screenshot of post with clear group name visible."
                    value={proofRequirement}
                    onChange={(e) => setProofRequirement(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs animate-fadeIn">
                <div className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirm & Deploy Mission
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><span className="text-slate-500">Title:</span> <strong className="text-white">{title}</strong></div>
                  <div><span className="text-slate-500">Platform:</span> <strong className="text-white">{platform}</strong></div>
                  <div><span className="text-slate-500">Reward:</span> <strong className="text-emerald-400">৳{monetaryReward} + {xpReward} XP</strong></div>
                  <div><span className="text-slate-500">Deadline:</span> <strong className="text-white">{deadline}</strong></div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              {step > 1 ? (
                <Button type="button" variant="secondary" onClick={() => setStep(step - 1)} icon={<ChevronLeft className="w-4 h-4" />}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              )}

              {step < 5 ? (
                <Button type="button" variant="gradient" onClick={handleNext} icon={<ChevronRight className="w-4 h-4" />}>
                  Next Step
                </Button>
              ) : (
                <Button type="submit" variant="gradient" disabled={isSubmitting} icon={<Sparkles className="w-4 h-4" />}>
                  {isSubmitting ? 'Launching...' : 'Confirm Launch'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Modal>

      {/* Mission Detail Modal */}
      {selectedMission && (
        <Modal
          isOpen={!!selectedMission}
          onClose={() => setSelectedMission(null)}
          title={`Mission Details: ${selectedMission.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <div className="text-indigo-300 font-bold">🥛 {selectedMission.brandName}</div>
                <div className="text-sm font-bold text-white mt-1">{selectedMission.title}</div>
              </div>
              <Badge variant="primary">{selectedMission.platform}</Badge>
            </div>

            <p className="text-slate-300">{selectedMission.description}</p>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
              <div className="text-slate-400 font-bold">Proof Requirement:</div>
              <p className="text-amber-300">{selectedMission.proofRequirement}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedMission(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
