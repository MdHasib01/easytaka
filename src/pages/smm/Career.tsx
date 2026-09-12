import React from 'react';
import { useSMM } from '../../contexts/SMMContext';
import { Trophy, Shield } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function SMMCareer() {
  const { smm } = useSMM();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Career & Badges</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 border border-indigo-400/30 overflow-hidden relative shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <CardContent className="p-8 relative z-10">
            <h2 className="text-sm font-semibold text-indigo-200 uppercase tracking-wider mb-6">Current Standing</h2>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-bold text-white drop-shadow-md">{smm.level}</span>
              <span className="text-xl text-indigo-200 mb-2 font-medium">/ 10 Lvl</span>
            </div>
            <div className="space-y-3 bg-indigo-950/30 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-200 font-medium">Lifetime Experience</span>
                <span className="font-bold text-white">{smm.lifetimeXp} / 2000 XP</span>
              </div>
              <div className="h-2 w-full bg-indigo-900/50 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all" style={{width: `${Math.min(100, (smm.lifetimeXp / 2000) * 100)}%`}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Earned Badges</h2>
          <div className="grid grid-cols-2 gap-4">
             {[1,2,3,4].map(i => (
               <Card key={i} className="hover:border-amber-500/30 hover:bg-slate-800/80 transition-all group cursor-default">
                 <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
                   <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full flex items-center justify-center text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all">
                     <Shield className="w-8 h-8 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                   </div>
                   <div>
                     <span className="text-sm font-bold text-white block">Achievement {i}</span>
                     <span className="text-[10px] text-amber-400/70 uppercase font-bold tracking-wider mt-1 block">Tier {i}</span>
                   </div>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
