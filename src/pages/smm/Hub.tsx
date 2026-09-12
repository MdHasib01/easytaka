import React, { useState, useRef } from 'react';
import { useSMM } from '../../contexts/SMMContext';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { Plus, Search, Filter, ShieldCheck, Facebook, Instagram, Lock, Unlock, X, Clock, AlertTriangle, CheckCircle2, XCircle, ChevronRight, User, Image as ImageIcon, MessageSquare, Briefcase, FileText, Activity, Key, Star, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SocialAccount, Persona, Note, EnrichmentStage } from '../../types';
import { ProofSubmission } from '../../components/ProofSubmission';
import { ImageCropModal, CroppedImageResult } from '../../components/common/ImageCropModal';


function EnrichmentTab({ account, onSubmitStage }: { account: SocialAccount, onSubmitStage: (stageId: string, proofData?: any) => void }) {
  const [selectedStage, setSelectedStage] = useState<string>(account.stages[0]?.id || '');
  const [showProofForm, setShowProofForm] = useState(false);
  const approvedStages = account.stages.filter(s => s.status === 'Approved');
  const currentEnrichment = approvedStages.reduce((sum, s) => sum + s.weight, 0);
  const activeStage = account.stages.find(s => s.id === selectedStage) || account.stages[0];

  const renderChecklist = (stage: EnrichmentStage) => {
    return (
      <div className="space-y-2 mt-4">
        {stage.checklist.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${item.checked ? 'bg-emerald-500 text-white' : 'border border-slate-600 bg-slate-800'}`}>
              {item.checked && <CheckCircle2 className="w-3 h-3" />}
            </div>
            <span className={`text-sm ${item.checked ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden shrink-0">
                 {account.persona?.avatar ? (
                   <img src={account.persona.avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-8 h-8 text-slate-500 m-auto mt-4" />
                 )}
              </div>
              <div>
                 <h2 className="text-xl font-bold text-white">{account.name}</h2>
                 <p className="text-sm text-slate-400">ID: {account.id} • {account.platform}</p>
              </div>
           </div>
           
           <div className="flex-1 w-full max-w-md">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Enrichment</span>
                 <span className="text-3xl font-bold text-white">{currentEnrichment}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 transition-all shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{width: `${currentEnrichment}%`}}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">{approvedStages.length} of {account.stages.length} stages approved</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
         {/* Timeline */}
         <div className="w-full md:w-80 shrink-0">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 px-2">Pipeline Stages</h3>
            <div className="space-y-2">
               {account.stages.map((stage, idx) => (
                 <div 
                   key={stage.id} 
                   onClick={() => { setSelectedStage(stage.id); setShowProofForm(false); }}
                   className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                     selectedStage === stage.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900/50 border-white/5 hover:bg-slate-900'
                   }`}
                 >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      stage.status === 'Approved' ? 'bg-emerald-500 text-white' :
                      stage.status === 'Locked' ? 'bg-slate-800 text-slate-600' :
                      'bg-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                    }`}>
                       {stage.status === 'Approved' ? <CheckCircle2 className="w-4 h-4" /> : 
                        stage.status === 'Locked' ? <Lock className="w-3 h-3" /> : 
                        <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className={`text-sm font-medium truncate ${stage.status === 'Locked' ? 'text-slate-500' : 'text-slate-200'}`}>{stage.name}</h4>
                       <p className="text-xs text-slate-500">+{stage.weight}%</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Stage Details */}
         <div className="flex-1">
            {activeStage && (
              <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
                 <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-start">
                    <div>
                       <h3 className="text-xl font-bold text-white mb-2">{activeStage.name}</h3>
                       <Badge variant={
                         activeStage.status === 'Approved' ? 'success' :
                         activeStage.status === 'Under Review' ? 'warning' :
                         activeStage.status === 'Revision Required' ? 'error' :
                         activeStage.status === 'Available' || activeStage.status === 'Ready to Submit' ? 'default' :
                         'outline'
                       }>
                         {activeStage.status}
                       </Badge>
                    </div>
                    <span className="text-2xl font-black text-slate-800 shrink-0">+{activeStage.weight}%</span>
                 </div>
                 
                 <div className="p-6">
                    {/* Reusable Proof Component / State Display */}
                    
                    {activeStage.status === 'Revision Required' && activeStage.submission?.reviewerNote && (
                      <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-rose-200/90 text-sm">
                         <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                         <div>
                            <p className="font-bold text-rose-300 mb-1">Revision Required</p>
                            <p>"{activeStage.submission.reviewerNote}"</p>
                         </div>
                      </div>
                    )}
                    
                    {activeStage.status === 'Under Review' && activeStage.submission && (
                      <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-200/90 text-sm">
                         <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                         <div>
                            <p className="font-bold text-amber-300 mb-1">Under Review</p>
                            <p>Submitted: {activeStage.submission.date}</p>
                            <p className="text-amber-200/60 mt-1">Progress will update after approval.</p>
                         </div>
                      </div>
                    )}
                    
                    
                    {showProofForm ? (
                      <div className="mb-6">
                        <ProofSubmission 
                          stage={activeStage} 
                          onCancel={() => setShowProofForm(false)}
                          onSubmit={(data) => {
                            setShowProofForm(false);
                            onSubmitStage(activeStage.id, data);
                          }} 
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Requirements</h4>

                    {renderChecklist(activeStage)}
                    
                    {activeStage.id === 'stg4' && (
                       <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                          <p className="text-sm text-slate-300">Persona Completeness: <span className="font-bold text-amber-400">{account.persona?.completeness || 0}%</span></p>
                          {(account.persona?.completeness || 0) < 100 && (
                            <p className="text-xs text-rose-400 mt-1">You must complete all Persona fields to submit this stage.</p>
                          )}
                       </div>
                    )}
                    
                    {activeStage.id === 'stg5' && (
                       <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                          <p className="text-sm text-slate-300">Content Entries: <span className="font-bold text-indigo-400">{account.contentEntries?.length || 0} / 10</span></p>
                          <p className="text-xs text-slate-500 mt-1">You need 10 foundational content pieces.</p>
                       </div>
                    )}
                    
                    {activeStage.id === 'stg7' && (
                       <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                          <p className="text-sm text-slate-300">Persona Notes: <span className="font-bold text-emerald-400">{account.notes?.length || 0} / 5</span></p>
                          <p className="text-xs text-slate-500 mt-1">You need to save 5 context notes to establish consistency.</p>
                       </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                       {(activeStage.status === 'Available' || activeStage.status === 'Ready to Submit' || activeStage.status === 'Revision Required') && (() => {
                          let isDisabled = false;
                          let disableReason = '';
                          if (activeStage.id === 'stg4' && (account.persona?.completeness || 0) < 100) {
                             isDisabled = true;
                             disableReason = 'Persona Incomplete';
                          }
                          if (activeStage.id === 'stg5' && (account.contentEntries?.length || 0) < 10) {
                             isDisabled = true;
                             disableReason = 'More Content Required';
                          }
                          if (activeStage.id === 'stg7' && (account.notes?.length || 0) < 5) {
                             isDisabled = true;
                             disableReason = 'More Notes Required';
                          }
                          
                          return (
                            <Button 
                              onClick={() => setShowProofForm(true)} 
                              disabled={isDisabled}
                              className={`${isDisabled ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'} px-8`}
                            >
                              {isDisabled ? disableReason : (activeStage.status === 'Revision Required' ? 'Fix & Resubmit' : 'Submit for Review')}
                            </Button>
                          );
                       })()}

                    </div>
                      </>
                    )}
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

export default function SMMHub() {
  const { accounts, addAccount, submitStage } = useSMM();
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);

  if (showAddWizard) {
    return <AddIDWizard onComplete={() => setShowAddWizard(false)} onCancel={() => setShowAddWizard(false)} addAccount={addAccount} />;
  }

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(search.toLowerCase()) || acc.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || acc.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hub</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your {accounts.length} assigned social IDs and personas</p>
        </div>
        <Button onClick={() => setShowAddWizard(true)} className="rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] bg-indigo-600 hover:bg-indigo-500 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Add New ID
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search accounts or personas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Eligible', 'Enrichment Started', 'Revision Required', 'New'].map(f => (
            <Button 
              key={f} 
              variant={filter === f ? 'default' : 'secondary'} 
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-indigo-600' : 'bg-slate-800/80 text-slate-300 whitespace-nowrap'}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAccounts.map(account => {
          const approvedStages = account.stages.filter(s => s.status === 'Approved');
          const currentEnrichment = approvedStages.reduce((sum, s) => sum + s.weight, 0);
          const currentStage = account.stages.find(s => s.status !== 'Approved') || account.stages[account.stages.length - 1];

          return (
          <div key={account.id} onClick={() => setSelectedAccount(account)} className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-lg hover:border-indigo-500/30 hover:bg-slate-800/80 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden">
            
            {/* Quick Preview Hover */}
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center p-6 text-center">
              <h3 className="font-bold text-white mb-2">{account.persona?.fullName || account.name}</h3>
              <p className="text-xs text-slate-300 mb-1">Tone: {account.persona?.toneOfVoice || 'Not set'}</p>
              <p className="text-xs text-slate-300 mb-3">Lang: {account.persona?.languageMix || 'Not set'}</p>
              <div className="grid grid-cols-2 gap-2 w-full text-left mb-4">
                 <div className="bg-slate-800 rounded p-2 border border-white/5">
                   <p className="text-[10px] text-slate-400">Enrichment</p>
                   <p className="text-sm font-bold text-indigo-400">{currentEnrichment}%</p>
                 </div>
                 <div className="bg-slate-800 rounded p-2 border border-white/5">
                   <p className="text-[10px] text-slate-400">Persona</p>
                   <p className="text-sm font-bold text-amber-400">{account.persona?.completeness || 0}%</p>
                 </div>
              </div>
              <Button size="sm" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]">Open Account</Button>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {account.persona?.avatar ? (
                    <img src={account.persona.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                      <User className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 ${account.platform === 'Facebook' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'}`}>
                    {account.platform === 'Facebook' ? <Facebook className="w-3 h-3" /> : <Instagram className="w-3 h-3" />}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm">{account.persona?.fullName || account.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate w-32">@{account.persona?.username || account.name.toLowerCase()}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">ID {account.id.split('@')[0].slice(-2) || '00'}</span>
            </div>
            
            <div className="mt-2 space-y-3 flex-1 flex flex-col justify-end">
               <div className="flex justify-between items-end mb-1">
                 <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Enrichment</span>
                 <span className="text-lg font-bold text-white">{currentEnrichment}%</span>
               </div>
               
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all" style={{width: `${currentEnrichment}%`}}></div>
               </div>
               
               <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                 <span>{approvedStages.length} / {account.stages.length} Stages</span>
                 <span>Status: <span className={`${
                   currentStage.status === 'Under Review' ? 'text-amber-400' :
                   currentStage.status === 'Revision Required' ? 'text-rose-400' :
                   currentStage.status === 'Approved' ? 'text-emerald-400' :
                   'text-indigo-400'
                 }`}>{currentEnrichment === 100 ? 'Eligible' : currentStage.status}</span></span>
               </div>
               
               {currentEnrichment === 100 ? (
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-500/10 px-2 py-2 rounded-lg border border-emerald-500/20 font-bold justify-center shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="w-4 h-4" />
                    ELIGIBLE ✓
                  </div>
               ) : (
                  <div className="mt-2 bg-slate-800/50 rounded-lg p-2 border border-white/5">
                     <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Stage</p>
                     <p className="text-xs text-slate-300 font-medium truncate">{currentStage.name}</p>
                  </div>
               )}
            </div>
          </div>
        )
        })}
      </div>

      <AnimatePresence>
        {selectedAccount && (
           <AccountWorkspaceModal 
             account={selectedAccount} 
             onClose={() => setSelectedAccount(null)} 
             onSubmitStage={(stageId, proofData) => submitStage(selectedAccount.id, stageId, proofData)} 
           />
        )}
      </AnimatePresence>
    </div>
  );
}

// ... Rest of the components will be written separately to avoid file size limit

function AccountWorkspaceModal({ account, onClose, onSubmitStage }: { account: SocialAccount, onClose: () => void, onSubmitStage: (stageId: string, proofData?: any) => void }) {
  const { open: openChat } = useChat();
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Persona', 'Enrichment', 'Notes', 'Account Access', 'Tasks'];
  const [showHistory, setShowHistory] = useState(false);

  // Persona avatar zoom & adjust state
  const [personaAvatar, setPersonaAvatar] = useState(account.persona?.avatar || '');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const personaFileRef = useRef<HTMLInputElement>(null);

  const handlePersonaFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (result: CroppedImageResult) => {
    setPersonaAvatar(result.dataUrl);
    if (account.persona) {
      account.persona.avatar = result.dataUrl;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="bg-slate-900 w-full max-w-5xl sm:rounded-3xl rounded-t-3xl sm:border border-white/10 shadow-2xl flex flex-col h-[90vh] overflow-hidden relative"
      >
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-4">
             <div className="relative">
               {(personaAvatar || account.persona?.avatar) ? (
                 <img src={personaAvatar || account.persona?.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
               ) : (
                 <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                   <User className="w-6 h-6 text-slate-500" />
                 </div>
               )}
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight leading-none">{account.persona?.fullName || account.name}</h2>
               <p className="text-sm text-slate-400 mt-1">@{account.persona?.username || account.name.toLowerCase()} • {account.platform}</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" size="sm" onClick={() => openChat({ view: 'new', role: 'MANAGER' })} className="hidden sm:flex border-white/10 text-slate-300 hover:text-white bg-slate-800">
                <MessageSquare className="w-4 h-4 mr-2" /> Message Brand Manager
             </Button>
             <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
               <X className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="flex border-b border-white/5 overflow-x-auto hide-scrollbar bg-slate-900 shrink-0">
           {tabs.map(t => (
             <button 
               key={t}
               onClick={() => setActiveTab(t)}
               className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === t ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
             >
                {t}
                {activeTab === t && (
                  <motion.div layoutId="workspaceTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                )}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/50">
           {activeTab === 'Overview' && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="bg-slate-900 rounded-2xl p-5 border border-white/5">
                      <h3 className="text-sm font-medium text-slate-400 mb-4">Identity Summary</h3>
                      <div className="space-y-3">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Platform</span>
                            <span className="text-slate-200 flex items-center gap-1"><Facebook className="w-3 h-3 text-blue-400" /> {account.platform}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Location</span>
                            <span className="text-slate-200">{account.persona?.location || 'Not set'}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Age Range</span>
                            <span className="text-slate-200">{account.persona?.ageRange || 'Not set'}</span>
                         </div>
                      </div>
                   </div>
                   <div className="bg-slate-900 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                      <h3 className="text-sm font-medium text-slate-400 mb-4 relative z-10">Enrichment Profile</h3>
                      <div className="space-y-3 relative z-10">
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500">Enrichment</span>
                            <span className="text-xl font-bold text-white">{account.enrichmentPercent}%</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500">Stages</span>
                            <span className="text-slate-200">{account.stages.filter(s => s.status === 'Approved').length} / {account.stages.length} Approved</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-500">Status</span>
                            <span className={`font-medium ${account.status === 'Eligible' ? 'text-emerald-400' : 'text-amber-400'}`}>{account.status}</span>
                         </div>
                         {account.history && account.history.length > 0 && (
                           <>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-500">Last Action</span>
                                <span className="text-xs text-slate-400">{account.history[0].date.split(',')[0]}</span>
                             </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-500">Reviewer</span>
                                <span className="text-xs text-slate-400 truncate max-w-[100px]">{account.history[0].reviewer}</span>
                             </div>
                           </>
                         )}
                         <Button size="sm" variant="outline" className="w-full mt-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10" onClick={() => setShowHistory(true)}>
                           View Enrichment History
                         </Button>
                      </div>
                   </div>
                   <div className="bg-slate-900 rounded-2xl p-5 border border-white/5">
                      <h3 className="text-sm font-medium text-slate-400 mb-4">Status & Health</h3>
                      <div className="space-y-3">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Account Status</span>
                            <Badge variant={account.status === 'Eligible' ? 'success' : 'secondary'} className="text-[10px]">{account.status}</Badge>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Persona Completeness</span>
                            <span className="text-amber-400 font-medium">{account.persona?.completeness || 0}%</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Enrichment Stage</span>
                            <span className="text-indigo-400 font-medium">{Math.round(account.enrichmentPercent)}%</span>
                         </div>
                      </div>
                   </div>
                   <div className="bg-slate-900 rounded-2xl p-5 border border-white/5">
                      <h3 className="text-sm font-medium text-slate-400 mb-4">Current Assignments</h3>
                      <div className="space-y-3">
                         <div className="flex justify-between">
                            <span className="text-slate-500">Assigned Brand</span>
                            <span className="text-slate-200 font-medium">Milkimom</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Assigned Products</span>
                            <span className="text-slate-200">{account.assignedProductCount}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500">Today's Missions</span>
                            <span className="text-emerald-400 font-medium">{account.todayTasksCompleted} / {account.todayTasksTotal}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'Persona' && (
             <div className="space-y-6 max-w-3xl">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-amber-400" /> Persona Configuration</h3>
                   <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">Completeness: {account.persona?.completeness || 0}%</Badge>
                </div>
                
                {(!account.persona?.completeness || account.persona.completeness < 100) && (
                   <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-200/80 text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <p>This persona is incomplete. Please fill out all required fields to establish a consistent identity for quality reviews.</p>
                   </div>
                )}

                <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 space-y-8">
                   {/* Photo                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Visual Identity</h4>
                      <div className="flex flex-col sm:flex-row gap-6">
                         <div className="space-y-2 text-center">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center mx-auto overflow-hidden relative group">
                               {(personaAvatar || account.persona?.avatar) ? (
                                  <>
                                    <img src={personaAvatar || account.persona?.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    <div
                                      onClick={() => personaFileRef.current?.click()}
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    >
                                       <Camera className="w-6 h-6 text-white" />
                                    </div>
                                  </>
                               ) : (
                                  <ImageIcon className="w-8 h-8 text-slate-500" />
                               )}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => personaFileRef.current?.click()}
                              className="text-xs"
                            >
                              Upload Profile
                            </Button>
                            <input
                              ref={personaFileRef}
                              type="file"
                              accept="image/*"
                              onChange={handlePersonaFileSelect}
                              className="hidden"
                            />
                         </div></div>
                         <div className="space-y-2 flex-1">
                            <div className="h-24 rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden relative group">
                               {account.persona?.coverPhoto ? (
                                  <>
                                    <img src={account.persona.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                       <span className="text-sm font-medium text-white">Change Cover</span>
                                    </div>
                                  </>
                               ) : (
                                  <span className="text-sm text-slate-500">No Cover Photo</span>
                               )}
                            </div>
                            <Button size="sm" variant="outline" className="text-xs">Upload Cover</Button>
                         </div>
                      </div>
                   </div>

                   {/* Bio */}
                   <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Basic Demographics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1.5"><label className="text-xs text-slate-500">Full Name</label><input type="text" defaultValue={account.persona?.fullName} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white" /></div>
                         <div className="space-y-1.5"><label className="text-xs text-slate-500">Username</label><input type="text" defaultValue={account.persona?.username} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white" /></div>
                         <div className="space-y-1.5"><label className="text-xs text-slate-500">Age Range</label><input type="text" defaultValue={account.persona?.ageRange} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white" /></div>
                         <div className="space-y-1.5"><label className="text-xs text-slate-500">Location</label><input type="text" defaultValue={account.persona?.location} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white" /></div>
                         <div className="space-y-1.5 col-span-2"><label className="text-xs text-slate-500">Relationship Context</label><input type="text" defaultValue={account.persona?.relationshipContext} placeholder="e.g. Married, 1 young child" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white" /></div>
                      </div>
                   </div>

                   {/* Voice & Style */}
                   <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Voice & Style</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1.5"><label className="text-xs text-slate-500">Tone of Voice</label><input type="text" defaultValue={account.persona?.toneOfVoice} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white" /></div>
                         <div className="space-y-1.5"><label className="text-xs text-slate-500">Language Mix</label><input type="text" defaultValue={account.persona?.languageMix} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white" /></div>
                         <div className="space-y-1.5 col-span-2"><label className="text-xs text-slate-500">Common Vocabulary</label><textarea defaultValue={account.persona?.commonVocabulary} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white h-20 resize-none" /></div>
                         <div className="space-y-1.5 col-span-2"><label className="text-xs text-slate-500">Comment Style</label><textarea defaultValue={account.persona?.commentStyle} className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white h-20 resize-none" /></div>
                      </div>
                   </div>
                </div>
                <div className="flex justify-end">
                   <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Persona Changes</Button>
                </div>
             </div>
           )}

           {activeTab === 'Enrichment' && <EnrichmentTab account={account} onSubmitStage={onSubmitStage} />}

           {activeTab === 'Notes' && (
             <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-400" /> Account Context Notes</h3>
                   <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500"><Plus className="w-4 h-4 mr-2"/> Add Note</Button>
                </div>
                
                <div className="space-y-4">
                   {account.notes && account.notes.length > 0 ? (
                     account.notes.map(note => (
                       <div key={note.id} className="bg-slate-900 rounded-xl border border-white/5 p-5 relative">
                          {note.isPinned && <div className="absolute top-4 right-4"><Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px]">Pinned</Badge></div>}
                          <div className="flex items-center gap-2 mb-2">
                             <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300">{note.type}</Badge>
                             <span className="text-xs text-slate-500">{note.date}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-200 mb-2">{note.title}</h4>
                          <p className="text-sm text-slate-400 mb-4">{note.content}</p>
                          
                          {note.commentContext && (
                            <div className="bg-slate-950 border border-white/5 rounded-lg p-3 mt-3">
                               <p className="text-xs text-slate-500 mb-1">Saved Comment:</p>
                               <p className="text-sm text-slate-300 italic">"{note.commentContext.originalComment}"</p>
                               <div className="flex gap-4 mt-2">
                                  <span className="text-[10px] text-slate-500">Context: {note.commentContext.context}</span>
                                  <span className="text-[10px] text-slate-500">Tone: {note.commentContext.tone}</span>
                               </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-4">
                             {note.tags.map(tag => (
                               <span key={tag} className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-white/5">#{tag}</span>
                             ))}
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-white/10">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No context notes saved yet.</p>
                     </div>
                   )}
                </div>
             </div>
           )}

           
           {activeTab === 'Tasks' && (
             <div className="max-w-2xl mx-auto">
                {account.enrichmentPercent < 100 ? (
                  <div className="bg-slate-900 rounded-2xl border border-white/5 p-8 text-center space-y-4 shadow-xl">
                     <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mx-auto">
                        <Lock className="w-8 h-8 text-rose-400" />
                     </div>
                     <h3 className="text-xl font-bold text-white tracking-tight uppercase">Regular Tasks Locked</h3>
                     <p className="text-sm text-slate-400 max-w-sm mx-auto">Complete all enrichment stages first to unlock regular tasks for this identity.</p>
                     
                     <div className="bg-slate-950 p-4 rounded-xl border border-white/5 mt-6 inline-block w-full max-w-xs text-left">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs text-slate-400 uppercase tracking-wider">Current Enrichment</span>
                           <span className="text-sm font-bold text-white">{account.enrichmentPercent}%</span>
                        </div>
                        <Progress value={account.enrichmentPercent} className="h-1.5 bg-slate-800 [&>div]:bg-rose-500" />
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Active Tasks</h3>
                     </div>
                     <div className="bg-slate-900 rounded-2xl border border-emerald-500/20 p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                           <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                           <h4 className="font-bold text-white mb-1">Eligible for Regular Missions</h4>
                           <p className="text-sm text-slate-400">This account is fully enriched and ready to receive standard assignments.</p>
                        </div>
                     </div>
                  </div>
                )}
             </div>
           )}

           {activeTab === 'Account Access' && (
             <div className="space-y-6 max-w-2xl">
                <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2"><Key className="w-5 h-5 text-rose-400" /> Account Access</h3>
                </div>
                
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-rose-200/80 text-sm">
                   <Lock className="w-5 h-5 text-rose-400 shrink-0" />
                   <p>Credentials are encrypted and stored in the secure vault. Displaying masked demo representations for the prototype.</p>
                </div>
                
                <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 space-y-4">
                   <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-sm text-slate-400">Platform</span>
                      <span className="text-sm font-medium text-white flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-400" /> {account.platform}</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-sm text-slate-400">Registered Email</span>
                      <span className="text-sm font-medium text-white">{account.email}</span>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-sm text-slate-400">Password</span>
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-mono text-slate-300">••••••••••••</span>
                         <Button size="sm" variant="outline" className="h-7 text-[10px] bg-slate-800 border-white/10">Reveal Demo</Button>
                      </div>
                   </div>
                   <div className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-sm text-slate-400">2FA Status</span>
                      <Badge variant="success" className="text-[10px]">Enabled via App</Badge>
                   </div>
                   <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-slate-400">Credential Status</span>
                      <span className="text-sm text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Healthy</span>
                   </div>
                </div>
             </div>
           )}

        </div>
      
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                   <div>
                     <h3 className="text-lg font-bold text-white">Enrichment History</h3>
                     <p className="text-sm text-slate-400">{account.persona?.fullName || account.name}</p>
                   </div>
                   <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                   {account.history && account.history.length > 0 ? (
                     <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                       {account.history.map((event, i) => (
                         <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                           <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                             event.status === 'Approved' ? 'bg-emerald-500' :
                             event.status === 'Revision Required' ? 'bg-amber-500' :
                             event.status === 'Rejected' ? 'bg-rose-500' : 'bg-indigo-500'
                           }`}>
                             {event.status === 'Approved' ? <CheckCircle2 className="w-4 h-4 text-white" /> : 
                              event.status === 'Revision Required' ? <AlertTriangle className="w-4 h-4 text-white" /> :
                              <XCircle className="w-4 h-4 text-white" />}
                           </div>
                           <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-slate-900/80 backdrop-blur-sm shadow-xl">
                             <div className="flex items-center justify-between space-x-2 mb-1">
                               <div className="font-bold text-slate-200">{event.stageName}</div>
                               <time className="text-xs font-medium text-slate-500">{event.date.split(',')[0]}</time>
                             </div>
                             <div className="text-sm text-slate-400 mb-2">
                               {event.status} <span className="mx-1">•</span> {event.progressBefore}% → {event.progressAfter}%
                             </div>
                             {event.note && (
                               <div className="bg-slate-950 p-2 rounded border border-white/5 text-xs text-slate-300 italic">
                                 "{event.note}"
                               </div>
                             )}
                             <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
                               <span>Reviewer: {event.reviewer}</span>
                               {event.xpAwarded ? <span className="text-amber-400">+{event.xpAwarded} XP</span> : null}
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-12 text-slate-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No enrichment history available.</p>
                     </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImageCropModal
        open={cropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        title="Adjust Persona Avatar"
      />
    </motion.div>
    </motion.div>
  );
}

function AddIDWizard({ onComplete, onCancel, addAccount }: { onComplete: () => void, onCancel: () => void, addAccount: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', name: '', platform: 'Facebook' });
  
  const totalSteps = 6;
  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const handleComplete = () => {
    addAccount(formData);
    onComplete();
  };

  const steps = [
    { title: "Create Email", desc: "Follow brand guidelines" },
    { title: "2FA Setup", desc: "Secure the account" },
    { title: "Verify", desc: "Confirm email access" },
    { title: "Social Profile", desc: "Create the actual account" },
    { title: "Upload Proof", desc: "Submit screenshots" },
    { title: "Start Enrichment", desc: "Begin the warming process" }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 bg-slate-900/80 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
       {/* Ambient Glow */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
       <div className="flex justify-between items-center mb-8 relative z-10">
         <h2 className="text-xl font-bold text-white tracking-tight">Guided ID Setup</h2>
         <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
       </div>
       
       {/* Progress Dots */}
       <div className="flex items-center justify-between mb-8 relative z-10">
         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full"></div>
         <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] -z-10 rounded-full transition-all" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%`}}></div>
         
         {steps.map((s, i) => (
           <div key={i} className="flex flex-col items-center gap-2">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
               step > i + 1 ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 
               step === i + 1 ? 'bg-slate-900 border-indigo-500 text-indigo-400 ring-4 ring-indigo-500/20' : 
               'bg-slate-900 border-slate-700 text-slate-500'
             }`}>
               {step > i + 1 ? '✓' : i + 1}
             </div>
             <span className="hidden md:block text-[10px] font-medium text-slate-400 absolute -bottom-6 w-20 text-center -ml-6">{s.title}</span>
           </div>
         ))}
       </div>
       
       <div className="min-h-[300px] mt-12 py-4 relative z-10">
         <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">1. Create Email Address</h3>
                  <div className="bg-indigo-500/10 text-indigo-200 p-4 rounded-xl text-sm border border-indigo-500/20">
                    <p className="font-bold text-indigo-300 mb-1">Milkimom Brand Guideline:</p>
                    <p>Format must be: <span className="font-mono bg-black/30 px-1 py-0.5 rounded text-indigo-100">firstname.milkimom.number@gmail.com</span></p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Enter Created Email</label>
                    <input 
                      type="email" 
                      placeholder="e.g. rafi.milkimom.21@gmail.com" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder:text-slate-600" 
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">4. Create Social Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2 col-span-2 sm:col-span-1">
                       <label className="text-sm font-medium text-slate-400">Platform</label>
                       <select 
                         value={formData.platform}
                         onChange={e => setFormData({...formData, platform: e.target.value})}
                         className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white appearance-none"
                       >
                         <option>Facebook</option>
                         <option>Instagram</option>
                       </select>
                     </div>
                     <div className="space-y-2 col-span-2 sm:col-span-1">
                       <label className="text-sm font-medium text-slate-400">Profile Name</label>
                       <input 
                         type="text" 
                         placeholder="Full Name" 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white" 
                       />
                     </div>
                     <div className="space-y-2 col-span-2">
                       <label className="text-sm font-medium text-slate-400">Profile URL</label>
                       <input type="url" placeholder="https://facebook.com/..." className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-white" />
                     </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 text-center py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <ShieldCheck className="w-10 h-10 drop-shadow-md" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Account Registered</h3>
                    <p className="text-slate-400 max-w-sm mx-auto text-sm">The ID is securely logged. You must now begin the systematic enrichment process before missions unlock.</p>
                  </div>
                </div>
              )}

              {/* Dummy for other steps */}
              {[2, 3, 5].includes(step) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">{step}. {steps[step-1].title}</h3>
                  <p className="text-slate-400 text-sm">{steps[step-1].desc}</p>
                  <div className="h-32 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-800/30 text-slate-500 text-sm">
                     Interactive Setup Area
                  </div>
                </div>
              )}

            </motion.div>
         </AnimatePresence>
       </div>

       <div className="flex justify-between pt-6 border-t border-white/5 relative z-10">
         <Button variant="ghost" onClick={prevStep} disabled={step === 1}>Back</Button>
         {step < totalSteps ? (
           <Button onClick={nextStep} className="px-8 rounded-full border-none shadow-[0_0_15px_rgba(79,70,229,0.4)]">Continue</Button>
         ) : (
           <Button onClick={handleComplete} className="px-8 rounded-full bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]">Finish & Start Enrichment</Button>
         )}
       </div>
    </div>
  )
}
