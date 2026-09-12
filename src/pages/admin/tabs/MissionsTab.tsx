import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useSMM } from '../../../contexts/SMMContext';
import { Plus, Settings, Package, Users, Calendar, CheckCircle2, ChevronRight, PlayCircle, Trophy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MissionsTab() {
  const { createMission, missions, products, smm } = useSMM();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [step, setStep] = useState(1);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    productId: products[0]?.id || '',
    type: 'Engagement',
    assignTo: 'All Eligible SMMs',
    recurrence: 'Daily',
    instructions: 'Please engage with the latest brand post on the main page. Like, and leave a substantive comment (min 5 words).',
    rewardTaka: 20,
    rewardXp: 50,
  });

  const handleNext = () => setStep(s => Math.min(6, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handlePublish = () => {
    createMission({
      title: formData.title || 'Untitled Mission',
      productName: products.find(p => p.id === formData.productId)?.name || 'General',
      type: formData.type,
      recurrence: formData.recurrence,
      reward: formData.rewardTaka,
      xpReward: formData.rewardXp,
      instructions: formData.instructions,
      completed: 0,
      total: 10,
      dueDate: 'Today'
    });
    setView('list');
    setStep(1);
  };

  if (view === 'create') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Button variant="outline" size="sm" onClick={() => setView('list')} className="mr-2">Back</Button>
               Create New Mission
            </h2>
            <div className="flex gap-2">
               {step > 1 && <Button variant="outline" onClick={handleBack}>Previous</Button>}
               {step < 6 ? (
                 <Button onClick={handleNext}>Next Step <ChevronRight className="w-4 h-4 ml-1" /></Button>
               ) : (
                 <Button onClick={handlePublish} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">Publish Mission</Button>
               )}
            </div>
         </div>

         {/* Stepper */}
         <div className="flex items-center justify-between relative mb-8">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-0"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
            
            {['Basics', 'Workforce', 'Recurrence', 'Instructions', 'Rewards', 'Preview'].map((label, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${step > i + 1 ? 'bg-indigo-500 border-indigo-500 text-white' : step === i + 1 ? 'bg-[#0B0F19] border-indigo-500 text-indigo-400 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-[#0B0F19] border-white/20 text-slate-500'}`}>
                   {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                 </div>
                 <span className={`text-xs font-medium hidden sm:block ${step >= i + 1 ? 'text-indigo-300' : 'text-slate-500'}`}>{label}</span>
              </div>
            ))}
         </div>

         <AnimatePresence mode="wait">
            <motion.div
               key={step}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.2 }}
            >
               {step === 1 && (
                 <Card>
                   <CardHeader>
                     <CardTitle>Basic Information</CardTitle>
                     <CardDescription>Define the core details of this mission.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-400">Mission Title</label>
                         <input type="text" placeholder="e.g. Daily Engagement - Milkimom Pump" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Target Product</label>
                            <select value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none appearance-none">
                               {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Mission Type</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-indigo-500 outline-none appearance-none">
                               <option>Engagement</option>
                               <option>Content Creation</option>
                               <option>Review/Rating</option>
                               <option>Sharing</option>
                            </select>
                         </div>
                      </div>
                   </CardContent>
                 </Card>
               )}

               {step === 2 && (
                 <Card>
                   <CardHeader>
                     <CardTitle>Workforce Assignment</CardTitle>
                     <CardDescription>Who should complete this mission?</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      {['All Eligible SMMs', 'Specific SMMs', 'Target by ID Tier (e.g. Only Tier 3+ IDs)'].map((opt) => (
                         <div 
                           key={opt}
                           onClick={() => setFormData({...formData, assignTo: opt})}
                           className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formData.assignTo === opt ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'}`}
                         >
                            <div className="flex items-center gap-3">
                               <Users className="w-5 h-5" />
                               <span className="font-medium">{opt}</span>
                            </div>
                            {formData.assignTo === opt && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                         </div>
                      ))}
                   </CardContent>
                 </Card>
               )}

               {step === 3 && (
                 <Card>
                   <CardHeader>
                     <CardTitle>Recurrence</CardTitle>
                     <CardDescription>How often should this mission repeat?</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      {['Daily', 'Weekly', 'One-time'].map((opt) => (
                         <div 
                           key={opt}
                           onClick={() => setFormData({...formData, recurrence: opt})}
                           className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formData.recurrence === opt ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'}`}
                         >
                            <div className="flex items-center gap-3">
                               <Calendar className="w-5 h-5" />
                               <span className="font-medium">{opt}</span>
                            </div>
                            {formData.recurrence === opt && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                         </div>
                      ))}
                   </CardContent>
                 </Card>
               )}

               {step === 4 && (
                 <Card>
                   <CardHeader>
                     <CardTitle>Instructions</CardTitle>
                     <CardDescription>Provide clear steps for the SMMs to follow.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-400">Step-by-step Instructions</label>
                         <textarea 
                           value={formData.instructions} 
                           onChange={e => setFormData({...formData, instructions: e.target.value})} 
                           className="w-full h-40 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none" 
                         />
                      </div>
                   </CardContent>
                 </Card>
               )}

               {step === 5 && (
                 <Card>
                   <CardHeader>
                     <CardTitle>Rewards</CardTitle>
                     <CardDescription>Set the payout and gamification rewards per completion.</CardDescription>
                   </CardHeader>
                   <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-emerald-500/20">
                         <div className="flex items-center gap-3 text-emerald-400 font-medium">
                            <span className="text-xl">৳</span> Cash Reward
                         </div>
                         <div className="flex items-center gap-4">
                            <input 
                              type="range" min="5" max="100" step="5" 
                              value={formData.rewardTaka} 
                              onChange={e => setFormData({...formData, rewardTaka: parseInt(e.target.value)})} 
                              className="flex-1 accent-emerald-500"
                            />
                            <div className="w-16 h-10 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center font-bold text-white text-lg">
                               {formData.rewardTaka}
                            </div>
                         </div>
                         <p className="text-xs text-slate-500">Per valid completion</p>
                      </div>

                      <div className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-indigo-500/20">
                         <div className="flex items-center gap-3 text-indigo-400 font-medium">
                            <Trophy className="w-5 h-5" /> XP Reward
                         </div>
                         <div className="flex items-center gap-4">
                            <input 
                              type="range" min="10" max="200" step="10" 
                              value={formData.rewardXp} 
                              onChange={e => setFormData({...formData, rewardXp: parseInt(e.target.value)})} 
                              className="flex-1 accent-indigo-500"
                            />
                            <div className="w-16 h-10 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center font-bold text-white text-lg">
                               {formData.rewardXp}
                            </div>
                         </div>
                         <p className="text-xs text-slate-500">Helps SMM level up faster</p>
                      </div>
                   </CardContent>
                 </Card>
               )}

               {step === 6 && (
                 <Card className="border-indigo-500/30 overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                   <CardHeader>
                     <CardTitle className="text-xl">Mission Summary</CardTitle>
                     <CardDescription>Review details before publishing to the SMM workforce.</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                         <div>
                            <h3 className="text-lg font-bold text-white">{formData.title || 'Untitled Mission'}</h3>
                            <div className="flex items-center gap-3 mt-1.5">
                               <Badge variant="outline" className="bg-slate-800">{formData.type}</Badge>
                               <Badge variant="outline" className="bg-slate-800">{formData.recurrence}</Badge>
                               <span className="text-xs text-slate-400 flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {products.find(p=>p.id===formData.productId)?.name || 'Product'}</span>
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                            <span className="text-emerald-400 font-bold">৳{formData.rewardTaka} / completion</span>
                            <span className="text-indigo-400 text-sm font-medium">+{formData.rewardXp} XP</span>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <h4 className="text-sm font-medium text-slate-400">Target Workforce</h4>
                         <div className="p-3 bg-slate-900 rounded-lg text-sm text-slate-300 border border-white/5 flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-400" /> {formData.assignTo}
                         </div>
                      </div>

                      <div className="space-y-2">
                         <h4 className="text-sm font-medium text-slate-400">Instructions</h4>
                         <div className="p-4 bg-slate-900 rounded-lg text-sm text-slate-300 border border-white/5 whitespace-pre-wrap">
                            {formData.instructions}
                         </div>
                      </div>
                   </CardContent>
                 </Card>
               )}
            </motion.div>
         </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-white">Active Missions</h2>
           <p className="text-sm text-slate-400">Manage ongoing tasks for the SMM workforce.</p>
        </div>
        <Button onClick={() => setView('create')} className="bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
           <Plus className="w-4 h-4 mr-2" /> Create Mission
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {missions.map(mission => (
          <Card key={mission.id} className="hover:border-indigo-500/30 transition-colors">
             <CardContent className="p-5 flex flex-col h-full justify-between">
                <div>
                   <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="bg-slate-800 text-xs">{mission.type}</Badge>
                      <Badge variant={mission.status === 'Active' ? 'success' : 'secondary'} className="text-[10px] uppercase tracking-wider">{mission.status}</Badge>
                   </div>
                   <h3 className="font-bold text-lg text-white leading-tight mb-1">{mission.title}</h3>
                   <p className="text-sm text-slate-400 mb-4">{mission.productName}</p>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-300 font-medium">{mission.completed} / {mission.total} completions</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" style={{width: `${(mission.completed / (mission.total || 1)) * 100}%`}}></div>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex gap-4">
                         <div className="text-sm"><span className="text-slate-500">Reward:</span> <span className="text-emerald-400 font-bold ml-1">৳{mission.reward}</span></div>
                         <div className="text-sm"><span className="text-slate-500">XP:</span> <span className="text-indigo-400 font-bold ml-1">+{mission.xpReward}</span></div>
                      </div>
                      <Button variant="outline" size="sm">Details</Button>
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
