import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Building2, Plus, MapPin, Users, Target, Wallet, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Brand } from '../../types';

export const BrandsPage: React.FC = () => {
  const { brands, addBrand, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [adminManager, setAdminManager] = useState('Nafis Ahmed (Operations Lead)');
  const [logo, setLogo] = useState('🥛');
  const [primaryPlatform, setPrimaryPlatform] = useState('Facebook');
  const [targetSMMs, setTargetSMMs] = useState(12);
  const [districtCount, setDistrictCount] = useState(6);
  const [teamStructure, setTeamStructure] = useState('District Hub Model');
  const [monthlyBudget, setMonthlyBudget] = useState(250000);
  const [defaultBaseSalary, setDefaultBaseSalary] = useState(18000);

  const resetForm = () => {
    setName('');
    setCategory('');
    setDescription('');
    setLogo('🥛');
    setStep(1);
  };

  const handleNext = () => {
    if (step === 1 && !name) {
      showToast('Please enter a Brand Name', 'warning');
      return;
    }
    setStep(prev => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Await the real request — the modal must not close on a failed create.
      await addBrand({
        name,
        logo,
        category: category || 'E-Commerce & Retail',
        monthlyBudget: Number(monthlyBudget),
        status: 'Active',
        districtCount: Number(districtCount)
      });
      setIsModalOpen(false);
      resetForm();
    } catch {
      // addBrand already surfaced the reason via a toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Brand Management
            <Building2 className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Partner brands running remote SMM workforce campaigns on EasyTaka.
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
          Create New Brand
        </Button>
      </div>

      {/* Brands Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map(brand => {
          const budgetUsedPct = Math.min(100, Math.round((brand.spentBudget / brand.monthlyBudget) * 100));
          return (
            <GlassCard
              key={brand.id}
              glow="purple"
              className="space-y-4 cursor-pointer transition-all hover:scale-[1.01]"
              onClick={() => setSelectedBrand(brand)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl shadow-inner">
                    {brand.logo}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      {brand.name}
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </h3>
                    <span className="text-xs text-slate-400">{brand.category}</span>
                  </div>
                </div>
                <Badge variant={brand.status === 'Active' ? 'success' : 'warning'}>
                  {brand.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-center text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                    <Target className="w-3 h-3 text-indigo-400" /> Missions
                  </div>
                  <div className="text-sm font-black text-white mt-1">{brand.activeMissions}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" /> SMM Force
                  </div>
                  <div className="text-sm font-black text-white mt-1">{brand.totalSMMs || 8}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" /> Districts
                  </div>
                  <div className="text-sm font-black text-white mt-1">{brand.districtCount}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Budget Utilized
                  </span>
                  <span className="text-white">৳{brand.spentBudget.toLocaleString()} / ৳{brand.monthlyBudget.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${budgetUsedPct}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Multi-step Create Brand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Partner Brand (Step-by-Step)"
      >
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex items-center gap-1 text-xs">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  step === s ? 'bg-indigo-600 text-white shadow-lg' : step > s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-slate-500'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`hidden sm:inline text-[10px] font-bold ${step === s ? 'text-indigo-300' : 'text-slate-500'}`}>
                  {s === 1 ? 'Info' : s === 2 ? 'Branding' : s === 3 ? 'Workforce' : s === 4 ? 'Salary' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Info */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label htmlFor="brand-name" className="block text-xs font-bold text-slate-300 mb-1">Brand Name *</label>
                  <input
                    id="brand-name"
                    type="text"
                    required
                    placeholder="e.g. Aarong Artisans or PRAN Foods"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="brand-category" className="block text-xs font-bold text-slate-300 mb-1">Industry / Category</label>
                  <input
                    id="brand-category"
                    type="text"
                    placeholder="e.g. FMCG, Dairy & Health Nutrition"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="brand-desc" className="block text-xs font-bold text-slate-300 mb-1">Brand Overview & Campaign Goals</label>
                  <textarea
                    id="brand-desc"
                    rows={3}
                    placeholder="Describe brand mission, social media requirements, and district targets..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="admin-manager" className="block text-xs font-bold text-slate-300 mb-1">Assigned Account Manager</label>
                  <select
                    id="admin-manager"
                    value={adminManager}
                    onChange={(e) => setAdminManager(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Nafis Ahmed (Operations Lead)">Nafis Ahmed (Operations Lead)</option>
                    <option value="Tasmia Rahman (Brand Relationship Lead)">Tasmia Rahman (Brand Lead)</option>
                    <option value="Farhan Kabir (HQ Commander)">Farhan Kabir (HQ Commander)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Branding */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Select Brand Emoji Logo</label>
                  <div className="flex gap-2">
                    {['🥛', '📱', '👗', '🍔', '🎨', '⚡', '🏆', '💎'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setLogo(emoji)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                          logo === emoji ? 'bg-indigo-600 border-2 border-amber-300 scale-110 shadow-lg' : 'bg-white/5 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Primary Social Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Facebook', 'Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'X/Twitter'].map(plat => (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => setPrimaryPlatform(plat)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          primaryPlatform === plat ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {plat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Workforce */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target SMM Workforce</label>
                    <input
                      type="number"
                      value={targetSMMs}
                      onChange={(e) => setTargetSMMs(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">District Coverage</label>
                    <input
                      type="number"
                      value={districtCount}
                      onChange={(e) => setDistrictCount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Team Structure Model</label>
                  <select
                    value={teamStructure}
                    onChange={(e) => setTeamStructure(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="District Hub Model">District Hub Model (Coordinated Teams)</option>
                    <option value="Direct Specialist Deployment">Direct Specialist Deployment</option>
                    <option value="Rapid Task Force">Rapid Task Force (Blitz Campaigns)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Salary & Budget */}
            {step === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Monthly Allocated Budget (৳)</label>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Default Base Salary per SMM (৳)</label>
                  <input
                    type="number"
                    value={defaultBaseSalary}
                    onChange={(e) => setDefaultBaseSalary(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review & Confirm */}
            {step === 5 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs animate-fadeIn">
                <div className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Review Brand Details
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><span className="text-slate-500">Brand Name:</span> <strong className="text-white">{name || 'N/A'}</strong></div>
                  <div><span className="text-slate-500">Logo Emoji:</span> <strong className="text-white">{logo}</strong></div>
                  <div><span className="text-slate-500">Category:</span> <strong className="text-white">{category || 'General'}</strong></div>
                  <div><span className="text-slate-500">Platform:</span> <strong className="text-white">{primaryPlatform}</strong></div>
                  <div><span className="text-slate-500">Monthly Budget:</span> <strong className="text-emerald-400">৳{monthlyBudget.toLocaleString()}</strong></div>
                  <div><span className="text-slate-500">Districts:</span> <strong className="text-white">{districtCount} Hubs</strong></div>
                  <div><span className="text-slate-500">Target SMMs:</span> <strong className="text-cyan-300">{targetSMMs} Specialists</strong></div>
                  <div><span className="text-slate-500">Account Lead:</span> <strong className="text-white">{adminManager}</strong></div>
                </div>
              </div>
            )}

            {/* Step Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              {step > 1 ? (
                <Button type="button" variant="secondary" onClick={handleBack} icon={<ChevronLeft className="w-4 h-4" />}>
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
                  {isSubmitting ? 'Creating...' : 'Confirm & Launch Brand'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Modal>

      {/* Brand Details Modal Drawer */}
      {selectedBrand && (
        <Modal
          isOpen={!!selectedBrand}
          onClose={() => setSelectedBrand(null)}
          title={`Brand Overview: ${selectedBrand.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-4xl p-2 bg-slate-900 rounded-xl">{selectedBrand.logo}</span>
              <div>
                <h3 className="text-base font-bold text-white">{selectedBrand.name}</h3>
                <p className="text-slate-400">{selectedBrand.category} • {selectedBrand.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <div className="text-slate-500 font-bold">Monthly Budget</div>
                <div className="text-base font-black text-emerald-400">৳{selectedBrand.monthlyBudget.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10">
                <div className="text-slate-500 font-bold">Spent Budget</div>
                <div className="text-base font-black text-cyan-400">৳{selectedBrand.spentBudget.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedBrand(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
