import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, PlayCircle, Layers, Zap, MessageSquare, User, FileText, ChevronDown, Link, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockSMMs } from '../../../data/mockData';
import { useSMM } from '../../../contexts/SMMContext';

export function ReviewCenterTab() {
  const { accounts, simulateReview, smm } = useSMM();
  const [activeCategory, setActiveCategory] = useState('Enrichment');
  const [selectedReviewItem, setSelectedReviewItem] = useState<{account: any, stage: any} | null>(null);

  const pendingEnrichments = accounts.flatMap(acc => 
    acc.stages
      .filter(s => s.status === 'Under Review')
      .map(stage => ({ account: acc, stage }))
  );
  
  const handleApprove = (accountId: string, stageId: string) => {
    simulateReview(accountId, stageId, 'Approve');
    setSelectedReviewItem(null);
  };
  const handleRevision = (accountId: string, stageId: string, note: string = 'Please update the requested fields.') => {
    simulateReview(accountId, stageId, 'Revision', note);
    setSelectedReviewItem(null);
  };
  const handleReject = (accountId: string, stageId: string, note: string = 'Stage rejected. Please restart.') => {
    simulateReview(accountId, stageId, 'Reject', note);
    setSelectedReviewItem(null);
  };

  
  const categories = [
    { id: 'Enrichment', icon: Layers, count: 4 },
    { id: 'Missions', icon: CheckCircle2, count: 12 },
    { id: 'Rapid Tasks', icon: Zap, count: 0 },
    
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-xl font-bold text-white flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-amber-500" /> Review Center</h2>
           <p className="text-sm text-slate-400">Master queue for AI, Human, and Hybrid operational reviews.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800 p-1.5 rounded-xl border border-white/5">
           <Button size="sm" variant="outline" className="bg-slate-900 border-white/10 shadow-sm text-slate-300">Human Review Mode</Button>
           <Button size="sm" variant="outline" className="border-transparent text-slate-400 hover:text-slate-200">AI Assist Setup</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {categories.map(cat => (
           <Card 
             key={cat.id} 
             onClick={() => setActiveCategory(cat.id)}
             className={`cursor-pointer transition-all ${activeCategory === cat.id ? 'border-amber-500/50 bg-amber-500/5' : 'hover:border-white/20'}`}
           >
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                 <cat.icon className={`w-6 h-6 ${activeCategory === cat.id ? 'text-amber-400' : 'text-slate-500'}`} />
                 <span className={`text-sm font-medium ${activeCategory === cat.id ? 'text-white' : 'text-slate-400'}`}>{cat.id}</span>
                 <Badge variant={cat.count > 0 ? (activeCategory === cat.id ? 'default' : 'secondary') : 'outline'} className={cat.count > 0 && activeCategory === cat.id ? 'bg-amber-500 text-white border-none' : ''}>
                    {cat.count} Pending
                 </Badge>
              </CardContent>
           </Card>
      

         ))}
      </div>

      <Card className="border-amber-500/20">
         <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-amber-400">Queue: {activeCategory}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-400">
               Routing: <span className="text-emerald-400 font-medium">Hybrid (AI First-Pass)</span>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            {activeCategory === 'Enrichment' && (
              <div className="divide-y divide-white/5">
                 {pendingEnrichments.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No pending enrichment reviews.</p>
                  </div>
                )}
                {pendingEnrichments.map(({account, stage}, i) => {
                   const currentEnrichment = account.stages.filter(s => s.status === 'Approved').reduce((sum, s) => sum + s.weight, 0);
                   return (
                   <div key={account.id + stage.id} className="p-4 md:p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row gap-6 justify-between items-start">
                      <div className="flex items-start gap-4 flex-1">
                         <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                            {account.persona?.avatar ? <img src={account.persona.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-500" />}
                         </div>
                         <div className="space-y-2 w-full">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h4 className="font-medium text-slate-200">{account.persona?.fullName || account.name}</h4>
                                  <p className="text-sm text-slate-500">ID: {account.id} • {account.platform}</p>
                                  <p className="text-xs text-indigo-400 mt-1">SMM: {smm.name}</p>
                               </div>
                               <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/20">{stage.name}</Badge>
                            </div>
                            
                            <div className="p-3 bg-slate-900 rounded-lg border border-white/5 mt-2 space-y-2">
                               <div className="flex justify-between items-center">
                                 <p className="text-sm text-slate-400 font-medium">Proof Submitted:</p>
                                 <span className="text-xs text-slate-500">{stage.submission?.date || 'Just now'}</span>
                               </div>
                               
                               {stage.submission?.profileUrl && (
                                 <p className="text-xs text-slate-300 flex items-center gap-1"><Link className="w-3 h-3 text-slate-500"/> {stage.submission.profileUrl}</p>
                               )}
                               
                               {stage.submission?.notes && (
                                 <p className="text-xs text-slate-400 italic">"{stage.submission.notes}"</p>
                               )}
                               
                               <div className="flex gap-2 mt-2">
                                  <div className="w-16 h-16 bg-slate-800 rounded border border-white/10 flex items-center justify-center text-xs text-slate-500">Img 1</div>
                               </div>
                               
                               {stage.checklist && stage.checklist.length > 0 && (
                                 <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                                   {stage.checklist.map(c => (
                                     <div key={c.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                                       <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {c.label}
                                     </div>
                                   ))}
                                 </div>
                               )}
                            </div>
                            
                            <div className="mt-4 border border-white/5 rounded-xl bg-slate-800/30 overflow-hidden">
                               <div className="p-3 bg-slate-800/50 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setSelectedReviewItem({account, stage})}>
                                  <div className="flex items-center gap-2">
                                     <User className="w-4 h-4 text-amber-400" />
                                     <span className="text-sm font-medium text-slate-300">Open Detailed Review</span>
                                  </div>
                                  <ChevronDown className="w-4 h-4 text-slate-500 -rotate-90" />
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0 min-w-[200px] bg-slate-900/50 p-4 rounded-xl border border-white/5">
                         <div className="mb-2 space-y-1">
                           <div className="flex justify-between text-xs">
                             <span className="text-slate-400">Current Progress</span>
                             <span className="text-slate-300">{currentEnrichment}%</span>
                           </div>
                           <div className="flex justify-between text-xs">
                             <span className="text-emerald-400">After Approval</span>
                             <span className="text-emerald-400 font-bold">{currentEnrichment + stage.weight}%</span>
                           </div>
                           <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                             <span className="text-amber-400">XP Reward</span>
                             <span className="text-amber-400">+{stage.xpReward} XP</span>
                           </div>
                           {currentEnrichment + stage.weight === 100 && (
                             <div className="flex justify-between text-xs pt-1">
                               <span className="text-emerald-400">Cash Reward</span>
                               <span className="text-emerald-400">৳20 (Final)</span>
                             </div>
                           )}
                         </div>
                         <Button size="sm" onClick={() => handleApprove(account.id, stage.id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]">Approve</Button>
                         <Button size="sm" onClick={() => handleRevision(account.id, stage.id)} variant="secondary" className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20">Reject / Revision</Button>
                      </div>
                   </div>
                 )})}
              </div>
            )}
            
            {activeCategory !== 'Enrichment' && (
              <div className="p-16 text-center text-slate-500">
                 <PlayCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <h3 className="text-lg font-medium text-slate-300 mb-2">Review Loop Active</h3>
                 <p className="max-w-md mx-auto text-sm">The {activeCategory} review logic flows structurally identically to Enrichment. AI confidence metrics pre-screen inputs before human escalation.</p>
              </div>
            )}
         </CardContent>
      </Card>
    <AnimatePresence>
        {selectedReviewItem && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedReviewItem(null)} />
            <motion.div initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} transition={{type: 'spring', bounce: 0, duration: 0.4}} className="relative w-full max-w-2xl bg-slate-950 border-l border-white/10 h-full overflow-y-auto shadow-2xl flex flex-col">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
                <h3 className="text-lg font-bold text-white">Review Submission</h3>
                <button onClick={() => setSelectedReviewItem(null)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-8 flex-1">
                {/* Account Details */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                     {selectedReviewItem.account.persona?.avatar ? <img src={selectedReviewItem.account.persona.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-500" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-200">{selectedReviewItem.account.persona?.fullName || selectedReviewItem.account.name}</h4>
                    <p className="text-sm text-slate-400">ID: {selectedReviewItem.account.id} • {selectedReviewItem.account.platform}</p>
                    <p className="text-xs text-slate-500 mt-1">Username: @{selectedReviewItem.account.persona?.username || 'not_set'}</p>
                  </div>
                </div>

                {/* Stage Details */}
                <div className="bg-slate-900 rounded-xl border border-white/10 p-5">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Stage Context</h4>
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                    <div>
                      <h5 className="font-bold text-white text-lg">{selectedReviewItem.stage.name}</h5>
                      <p className="text-sm text-slate-400">Weight: {selectedReviewItem.stage.weight}%</p>
                    </div>
                    <Badge variant="warning">Under Review</Badge>
                  </div>
                  {selectedReviewItem.stage.checklist && selectedReviewItem.stage.checklist.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-medium mb-2">Checklist Confirmed:</p>
                      {selectedReviewItem.stage.checklist.map(c => (
                         <div key={c.id} className="flex items-center gap-2 text-sm text-slate-300">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {c.label}
                         </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submission Proof */}
                <div className="bg-slate-900 rounded-xl border border-white/10 p-5">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Submission Proof</h4>
                  {selectedReviewItem.stage.submission?.profileUrl && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Reference URL</p>
                      <a href={selectedReviewItem.stage.submission.profileUrl} target="_blank" className="text-sm text-indigo-400 hover:underline break-all">{selectedReviewItem.stage.submission.profileUrl}</a>
                    </div>
                  )}
                  {selectedReviewItem.stage.submission?.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 mb-1">Reviewer Note</p>
                      <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-white/5 italic">"{selectedReviewItem.stage.submission.notes}"</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Attached Screenshots</p>
                    <div className="flex gap-2">
                      <div className="w-24 h-24 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center text-xs text-slate-500">Image 1</div>
                      <div className="w-24 h-24 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center text-xs text-slate-500">Image 2</div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Context */}
                {selectedReviewItem.stage.id === 'stg4' && (
                  <div className="bg-slate-900 rounded-xl border border-white/10 p-5">
                     <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Persona Context</h4>
                     <p className="text-sm text-slate-300 mb-1">Completeness: <span className="font-bold text-amber-400">{selectedReviewItem.account.persona?.completeness || 0}%</span></p>
                     <p className="text-sm text-slate-400">Tone: {selectedReviewItem.account.persona?.toneOfVoice || 'Not set'}</p>
                     <p className="text-sm text-slate-400">Topics: {selectedReviewItem.account.persona?.likedTopics || 'Not set'}</p>
                  </div>
                )}
                {selectedReviewItem.stage.id === 'stg5' && (
                  <div className="bg-slate-900 rounded-xl border border-white/10 p-5">
                     <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Content Foundation</h4>
                     <p className="text-sm text-slate-300 mb-1">Entries: <span className="font-bold text-indigo-400">{selectedReviewItem.account.contentEntries?.length || 0} / 10</span></p>
                  </div>
                )}
                {selectedReviewItem.stage.id === 'stg7' && (
                  <div className="bg-slate-900 rounded-xl border border-white/10 p-5">
                     <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Persona Notes</h4>
                     <p className="text-sm text-slate-300 mb-1">Notes: <span className="font-bold text-emerald-400">{selectedReviewItem.account.notes?.length || 0} / 5</span></p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-slate-900 flex justify-end gap-3 sticky bottom-0">
                <Button variant="secondary" className="bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20" onClick={() => handleReject(selectedReviewItem.account.id, selectedReviewItem.stage.id)}>Reject</Button>
                <Button variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20" onClick={() => handleRevision(selectedReviewItem.account.id, selectedReviewItem.stage.id)}>Revision Required</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] px-8" onClick={() => handleApprove(selectedReviewItem.account.id, selectedReviewItem.stage.id)}>Approve Stage</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
</div>
  );
}
