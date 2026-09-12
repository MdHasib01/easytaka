import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { useSMM } from '../../../contexts/SMMContext';
import { Plus, Zap, AlertCircle, Clock, ChevronRight } from 'lucide-react';

export function RapidTasksTab() {
  const { rapidTasks, createRapidTask } = useSMM();
  const [view, setView] = useState<'list' | 'create'>('list');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    urgency: 'High',
    timeLimitHours: 2,
    rewardTaka: 50,
    targetCount: 20,
    instructions: ''
  });

  const handlePublish = () => {
    createRapidTask({
      title: formData.title || 'Urgent Task',
      timeLeft: `${formData.timeLimitHours} hours left`,
      reward: formData.rewardTaka,
      total: formData.targetCount,
      progress: 0
    });
    setView('list');
  };

  if (view === 'create') {
     return (
        <div className="space-y-6 max-w-3xl mx-auto p-4 md:p-6">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={() => setView('list')} className="mr-2">Back</Button>
                 Launch Rapid Task
              </h2>
           </div>

           <Card className="border-rose-500/30 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
              <CardHeader>
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                       <Zap className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                       <CardTitle>Rapid Task Configuration</CardTitle>
                       <CardDescription>Blast an urgent, high-reward task to available SMMs.</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-4 border-t border-white/5">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Task Title</label>
                    <input type="text" placeholder="e.g. Flash Sale - Share Now!" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none" />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Time Limit (Hours)</label>
                       <div className="flex items-center gap-4 bg-slate-900 px-4 py-2.5 rounded-xl border border-white/10">
                          <input type="range" min="1" max="24" step="1" value={formData.timeLimitHours} onChange={e => setFormData({...formData, timeLimitHours: parseInt(e.target.value)})} className="flex-1 accent-rose-500" />
                          <span className="font-bold text-white w-8 text-center">{formData.timeLimitHours}h</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-400">Required Completions</label>
                       <input type="number" min="1" max="100" value={formData.targetCount} onChange={e => setFormData({...formData, targetCount: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-rose-500 outline-none" />
                    </div>
                 </div>

                 <div className="space-y-4 bg-rose-500/5 p-6 rounded-2xl border border-rose-500/20">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3 text-rose-400 font-medium">
                          <span className="text-xl font-bold">৳</span> Surge Reward
                       </div>
                       <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">৳{formData.rewardTaka}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Per SMM</div>
                       </div>
                    </div>
                    <input type="range" min="10" max="200" step="10" value={formData.rewardTaka} onChange={e => setFormData({...formData, rewardTaka: parseInt(e.target.value)})} className="w-full accent-emerald-500" />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Instructions / Link</label>
                    <textarea value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} className="w-full h-24 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none resize-none" placeholder="Drop the link and exact action needed..." />
                 </div>

                 <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setView('list')}>Cancel</Button>
                    <Button onClick={handlePublish} className="bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]">Launch Surge Task</Button>
                 </div>
              </CardContent>
           </Card>
        </div>
     );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="w-6 h-6 text-rose-500" /> Rapid Tasks</h2>
           <p className="text-sm text-slate-400">Launch urgent, time-sensitive campaigns to the workforce.</p>
        </div>
        <Button onClick={() => setView('create')} className="bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)] text-white">
           <Zap className="w-4 h-4 mr-2" /> Launch Rapid Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rapidTasks.map((task, i) => (
          <Card key={i} className="hover:border-rose-500/30 transition-colors bg-gradient-to-b from-slate-900 to-[#0B0F19]">
             <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                   <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3 h-3" /> {task.timeLeft}
                   </div>
                   <Badge variant="success" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Active</Badge>
                </div>
                
                <h3 className="font-bold text-lg text-white leading-tight mb-4">{task.title}</h3>
                
                <div className="space-y-3 mb-6">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Fulfillment</span>
                      <span className="font-bold text-slate-200">{task.progress} / {task.total}</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)]" style={{width: `${(task.progress/task.total)*100}%`}}></div>
                   </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Surge Reward</div>
                      <div className="font-bold text-emerald-400 text-lg leading-none">৳{task.reward}</div>
                   </div>
                   <Button variant="outline" size="sm">Manage</Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
