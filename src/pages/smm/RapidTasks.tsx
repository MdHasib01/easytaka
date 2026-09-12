import React, { useState } from 'react';
import { useSMM } from '../../contexts/SMMContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Zap, Timer, Coins, Lock } from 'lucide-react';

export default function SMMRapidTasks() {
  const { smm, rapidTasks } = useSMM();
  const [activeTab, setActiveTab] = useState('available');

  if (!smm.jobHolderUnlocked) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
         <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-2 border-4 border-slate-900 shadow-inner">
           <Lock className="w-10 h-10" />
         </div>
         <h1 className="text-2xl font-bold text-white tracking-tight">Rapid Tasks Locked</h1>
         <p className="text-slate-400 max-w-sm mx-auto">
           You must complete your Job Holder milestone by getting 20 IDs fully enriched and approved to unlock premium Rapid Tasks.
         </p>
         <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl mt-4">
           <p className="text-sm text-rose-300 font-medium">Current Progress: {smm.approvedEnrichedIds} / 20 Approved IDs</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-6 h-6 text-rose-500 fill-rose-500 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]" /> Rapid Tasks
        </h1>
        <p className="text-sm text-slate-400 mt-1">Urgent one-time assignments with premium cash bounties</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          <TabsList>
            <TabsTrigger value="available">Available (1)</TabsTrigger>
            <TabsTrigger value="assigned">Assigned</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="available" className="mt-6 space-y-4">
          {rapidTasks.map(task => (
            <Card key={task.id} className="cursor-pointer border-rose-500/30 bg-rose-950/20 hover:border-rose-500/50 hover:bg-rose-950/30 transition-all shadow-[0_0_15px_rgba(225,29,72,0.05)]">
              <CardContent className="p-5 flex flex-col md:flex-row gap-5 justify-between md:items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="error" className="shadow-[0_0_8px_rgba(225,29,72,0.4)]">URGENT PRIORITY</Badge>
                    <span className="text-xs text-rose-400 font-medium flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <Timer className="w-3.5 h-3.5" /> {task.timeLeft}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{task.title}</h3>
                  <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{task.instructions || 'Brand is launching a new promo today. We need immediate positive engagement on the latest post using your approved enriched IDs.'}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm pt-2">
                     <div className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                       <Coins className="w-4 h-4 drop-shadow-md" /> ৳{task.reward} Bounty
                     </div>
                     <div className="font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                       +{task.xpReward || 50} XP
                     </div>
                     <div className="text-slate-400 text-xs bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                       Required IDs: 5
                     </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto mt-2 md:mt-0 self-center">
                   <Button variant="danger" className="w-full rounded-xl px-8 shadow-[0_0_15px_rgba(225,29,72,0.4)]">Accept Task</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        {/* Placeholder for other tabs */}
        {['assigned', 'in-progress', 'submitted', 'completed'].map(tab => (
           <TabsContent key={tab} value={tab} className="mt-6">
             <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-white/10 backdrop-blur-sm">
               <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-slate-300">No rapid tasks</h3>
               <p className="text-sm text-slate-500 mt-1">You don't have any tasks in this queue right now.</p>
             </div>
           </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
