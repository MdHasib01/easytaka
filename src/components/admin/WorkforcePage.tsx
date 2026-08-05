import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Users, Search, ShieldCheck, Sparkles, Filter, Phone, Mail, Plus, UserPlus, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { SMMUser } from '../../types';

export const WorkforcePage: React.FC = () => {
  const { workforce, addSMMUser, showToast, brands } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedSMM, setSelectedSMM] = useState<SMMUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Jashore');
  const [title, setTitle] = useState('SMM Specialist');
  const [nidNumber, setNidNumber] = useState('');
  const [fbProfile, setFbProfile] = useState('');
  const [brand, setBrand] = useState('Aarong Artisans');
  const [level, setLevel] = useState(1);
  const [salary, setSalary] = useState(18000);

  const districts = ['All', 'Jashore', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'];

  const filteredWorkforce = workforce.filter(smm => {
    const matchesSearch = smm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          smm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          smm.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === 'All' || smm.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setNidNumber('');
    setFbProfile('');
    setStep(1);
  };

  const handleNext = () => {
    if (step === 1 && (!name || !phone)) {
      showToast('Please enter Name and Phone number', 'warning');
      return;
    }
    setStep(prev => Math.min(5, prev + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addSMMUser({
        name,
        phone: phone || '+880 1700-112233',
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@easytaka.com`,
        district,
        title,
        brand,
        level: Number(level),
        estimatedSalary: Number(salary)
      });
      setIsModalOpen(false);
      resetForm();
    } catch {
      // addSMMUser already surfaced the reason via a toast (e.g. email taken).
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Workforce Directory
            <Users className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Remote SMM Specialists, Community Leads, and District Coordinators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary">Total SMMs: {workforce.length}</Badge>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            variant="gradient"
            icon={<UserPlus className="w-4 h-4" />}
          >
            Onboard New SMM
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <GlassCard className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SMM name, title, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
          {districts.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDistrict(d)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 ${
                selectedDistrict === d
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Workforce Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkforce.map(smm => (
          <GlassCard
            key={smm.id}
            glow="purple"
            className="space-y-4 cursor-pointer hover:scale-[1.01] transition-all"
            onClick={() => setSelectedSMM(smm)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={smm.avatar}
                    alt={smm.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/40"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full border border-slate-900">
                    L{smm.level}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    {smm.name}
                    {smm.status === 'Top Performer' && (
                      <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    )}
                  </h3>
                  <p className="text-xs text-indigo-300">{smm.title}</p>
                </div>
              </div>
              <Badge variant={smm.status === 'Top Performer' ? 'success' : smm.status === 'At-Risk' ? 'danger' : 'primary'}>
                {smm.status}
              </Badge>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">District:</span>
                <span className="font-bold text-white">📍 {smm.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Brand:</span>
                <span className="font-bold text-white">🥛 {smm.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Streak:</span>
                <span className="font-bold text-amber-400">🔥 {smm.streak} Days</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-slate-400 text-[10px] font-bold">Quality Score</div>
                <div className="text-sm font-black text-emerald-400">{smm.qualityScore}%</div>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="text-slate-400 text-[10px] font-bold">Trust Score</div>
                <div className="text-sm font-black text-cyan-400">{smm.trustScore}%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> {smm.phone}
              </span>
              <span className="font-bold text-emerald-400">৳{smm.estimatedSalary.toLocaleString()}/mo</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Onboard SMM Multi-Step Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard New SMM Specialist"
      >
        <div className="space-y-5">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  step === s ? 'bg-indigo-600 text-white shadow-lg' : step > s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-slate-500'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`hidden sm:inline text-[10px] font-bold ${step === s ? 'text-indigo-300' : 'text-slate-500'}`}>
                  {s === 1 ? 'Personal' : s === 2 ? 'Verification' : s === 3 ? 'Role' : s === 4 ? 'Salary' : 'Review'}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label htmlFor="wf-name" className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                  <input
                    id="wf-name"
                    type="text"
                    required
                    placeholder="e.g. Anika Chowdhury"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="wf-phone" className="block text-xs font-bold text-slate-300 mb-1">Phone Number *</label>
                    <input
                      id="wf-phone"
                      type="text"
                      required
                      placeholder="+880 1711-223344"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="wf-district" className="block text-xs font-bold text-slate-300 mb-1">District Hub</label>
                    <select
                      id="wf-district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Jashore">Jashore</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">National ID (NID) Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 1998451920011"
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Facebook / Social Profile URL</label>
                  <input
                    type="text"
                    placeholder="https://facebook.com/username"
                    value={fbProfile}
                    onChange={(e) => setFbProfile(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Assigned Partner Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Starting Level</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={level}
                      onChange={(e) => setLevel(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Initial Monthly Base Salary (৳)</label>
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs animate-fadeIn">
                <div className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Confirm SMM Onboarding
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div><span className="text-slate-500">Name:</span> <strong className="text-white">{name}</strong></div>
                  <div><span className="text-slate-500">Phone:</span> <strong className="text-white">{phone}</strong></div>
                  <div><span className="text-slate-500">District:</span> <strong className="text-white">{district}</strong></div>
                  <div><span className="text-slate-500">Brand:</span> <strong className="text-cyan-300">{brand}</strong></div>
                  <div><span className="text-slate-500">Base Salary:</span> <strong className="text-emerald-400">৳{salary.toLocaleString()}</strong></div>
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
                <Button type="submit" variant="gradient" disabled={isSubmitting} icon={<UserPlus className="w-4 h-4" />}>
                  {isSubmitting ? 'Onboarding...' : 'Confirm Onboard'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </Modal>

      {/* SMM Detail Drawer */}
      {selectedSMM && (
        <Modal
          isOpen={!!selectedSMM}
          onClose={() => setSelectedSMM(null)}
          title={`SMM Profile: ${selectedSMM.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <img src={selectedSMM.avatar} alt={selectedSMM.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500" />
              <div>
                <h3 className="text-base font-bold text-white">{selectedSMM.name}</h3>
                <p className="text-indigo-300">{selectedSMM.title} • Level {selectedSMM.level}</p>
                <p className="text-slate-400">📍 {selectedSMM.district} Hub • 🥛 {selectedSMM.brand}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[10px]">Quality Score</div>
                <div className="text-sm font-black text-emerald-400">{selectedSMM.qualityScore}%</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[10px]">Trust Score</div>
                <div className="text-sm font-black text-cyan-400">{selectedSMM.trustScore}%</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[10px]">Streak</div>
                <div className="text-sm font-black text-amber-400">{selectedSMM.streak} Days</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Base Salary:</span>
                <span className="font-bold text-emerald-400">৳{selectedSMM.estimatedSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Joined Date:</span>
                <span className="font-bold text-white">{selectedSMM.joinDate}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedSMM(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
