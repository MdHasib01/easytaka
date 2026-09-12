import React, { useState } from 'react';
import { useSMM } from '../../contexts/SMMContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Clock, Lock } from 'lucide-react';

export default function SMMMissions() {
  const { smm, missions, accounts } = useSMM();
  const [activeTab, setActiveTab] = useState('today');
  const [executingMission, setExecutingMission] = useState<any>(null);
  
  const eligibleAccounts = accounts.filter(a => a.enrichmentPercent === 100 && a.status === 'Eligible');
  const regularMissions = missions.filter(m => !m.isRapid);

  if (!smm.jobHolderUnlocked) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
         <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-2 border-4 border-slate-900 shadow-inner">
           <Lock className="w-10 h-10" />
         </div>
         <h1 className="text-2xl font-bold text-white tracking-tight">Workspace Locked</h1>
         <p className="text-slate-400 max-w-sm mx-auto">
           You must complete your Job Holder milestone by getting 20 IDs fully enriched and approved to unlock the regular mission workspace.
         </p>
         <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl mt-4">
           <p className="text-sm text-indigo-300 font-medium">Current Progress: {smm.approvedEnrichedIds} / 20 Approved IDs</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Missions</h1>
        <p className="text-sm text-slate-400 mt-1">Your regular recurring brand operations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="revision">Revision Required</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="today" className="mt-6 space-y-4">
          {regularMissions.map(mission => (
            <Card key={mission.id} className="cursor-pointer hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-800 text-slate-300">{mission.type || mission.category}</Badge>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due {mission.dueDate || (mission.deadline ? new Date(mission.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Today')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{mission.title || mission.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                     <span className="bg-slate-800 px-2 py-0.5 rounded border border-white/5">{mission.productName || 'Milkimom'}</span>
                     <span>•</span>
                     <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">+{mission.xpReward} XP</span>
                     <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">৳{mission.reward || 0}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                   {mission.status === 'In Progress' && mission.progress !== undefined && (
                     <div className="w-full md:w-48 space-y-2 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-indigo-400">{mission.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all shadow-[0_0_8px_rgba(99,102,241,0.8)]" style={{width: `${mission.progress}%`}}></div>
                        </div>
                     </div>
                   )}
                   <Button className="w-full md:w-auto rounded-xl" onClick={() => setExecutingMission(mission)}>Execute Mission</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        {/* Placeholder for other tabs */}
        {['upcoming', 'in-progress', 'submitted', 'revision', 'completed'].map(tab => (
           <TabsContent key={tab} value={tab} className="mt-6">
             <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-white/10 backdrop-blur-sm">
               <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-slate-300">No missions found</h3>
               <p className="text-sm text-slate-500 mt-1">There are no tasks pending in this queue.</p>
             </div>
           </TabsContent>
        ))}
      </Tabs>

      {executingMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setExecutingMission(null)} />
           <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Execute Mission: {executingMission.title || executingMission.name}</h3>
              <p className="text-sm text-slate-400 mb-6">Select an eligible identity to complete this mission.</p>
              
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-300">Select Operating ID</label>
                {eligibleAccounts.length > 0 ? (
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-indigo-500">
                    {eligibleAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.persona?.fullName || acc.name} ({acc.id})</option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex gap-2">
                    <Lock className="w-5 h-5 shrink-0" />
                    <span>You do not have any Eligible accounts (100% Enriched). You must complete enrichment in the Hub first.</span>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                 <Button variant="secondary" onClick={() => setExecutingMission(null)}>Cancel</Button>
                 <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" disabled={eligibleAccounts.length === 0}>Start Execution</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
