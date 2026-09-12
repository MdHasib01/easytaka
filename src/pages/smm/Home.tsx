import React, { useEffect, useState } from 'react';
import { useSMM } from '../../contexts/SMMContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { Badge } from '../../components/ui/Badge';
import { Trophy, Star, Zap, Flame, CalendarCheck, Coins, LayoutGrid, ShieldAlert, ArrowRight, CheckCircle2, Layers, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function SMMHome() {
  const { smm, accounts, missions, claimJobHolderBonus } = useSMM();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);

  const rapidTasks = missions.filter(m => m.isRapid);
  const regularMissions = missions.filter(m => !m.isRapid);
  const needsAttention = accounts.filter(a => a.approvalStatus === 'Under Review' || a.approvalStatus === 'Revision Required' || a.enrichmentPercent < 100);

  useEffect(() => {
    if (smm.approvedEnrichedIds >= 20 && !smm.jobHolderUnlocked) {
      setShowCelebration(true);
    }
  }, [smm.approvedEnrichedIds, smm.jobHolderUnlocked]);

  const handleClaimBonus = () => {
    claimJobHolderBonus();
    setShowCelebration(false);
    navigate('/smm/missions');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto md:max-w-none pb-12">
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl max-w-sm w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)]"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-500/30">
                <Trophy className="w-10 h-10 drop-shadow-md" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">CONGRATULATIONS 🎉</h2>
              <p className="text-emerald-300 font-medium mb-6">You are now an EasyTaka Job Holder</p>
              
              <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 mb-6 space-y-3">
                <p className="text-xs text-emerald-200/70 uppercase tracking-widest font-bold">20 / 20 Approved IDs Completed</p>
                <div className="space-y-2 text-sm font-medium text-white text-left">
                  <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                    <span>Job Holder Bonus</span>
                    <span className="text-emerald-400">+ ৳100</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                    <span>Lifetime XP</span>
                    <span className="text-amber-400">+ 200 XP</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-left mb-8">
                 <p className="text-sm font-bold text-white mb-3">Unlocked:</p>
                 {['Regular Missions', 'Full Mission Workspace', 'Weekly Salary Eligibility', 'Rapid Task Eligibility'].map((item, i) => (
                   <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                     <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {item}
                   </div>
                 ))}
              </div>

              <Button onClick={handleClaimBonus} className="w-full bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-white font-bold h-12 rounded-xl">
                Enter Mission Workspace
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back,<br/>{smm.name.split(' ')[0]} 👋</h1>
          <p className="text-indigo-300 font-medium mt-1 text-sm">Milkimom • {smm.role}</p>
        </div>
        
        {/* Milestone Card */}
        <Card className="bg-gradient-to-br from-indigo-900/60 to-slate-900 border-indigo-500/30 relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(79,70,229,0.3)]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
           <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                   <Trophy className="w-4 h-4" /> JOB HOLDER PROGRESS
                 </h3>
                 <span className="text-indigo-200 font-medium text-sm">{Math.round((smm.approvedEnrichedIds / 20) * 100)}%</span>
              </div>
              
              <div className="mb-4">
                 <div className="flex items-end gap-2 mb-2">
                   <span className="text-3xl font-bold text-white">{smm.approvedEnrichedIds}</span>
                   <span className="text-slate-400 mb-1">/ 20 Approved IDs</span>
                 </div>
                 <Progress value={(smm.approvedEnrichedIds / 20) * 100} className="h-2 bg-indigo-950 [&>div]:bg-indigo-400" />
              </div>
              
              <p className="text-sm text-slate-300 italic mb-5">
                "Complete {Math.max(0, 20 - smm.approvedEnrichedIds)} more approved IDs to unlock your full Mission Workspace."
              </p>
              
              <Button onClick={() => navigate('/smm/hub')} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                Continue Enrichment <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
           </CardContent>
        </Card>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Level {smm.level}</p>
              <p className="text-2xl font-bold text-white">{smm.lifetimeXp} <span className="text-xs text-slate-500 font-normal">XP</span></p>
            </div>
            <div className="mt-3">
              <Progress value={64} className="h-1 bg-slate-800 [&>div]:bg-indigo-400" />
            </div>
          </div>
          
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Redeemable XP</p>
              <p className="text-2xl font-bold text-white flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {smm.redeemableXp}
              </p>
            </div>
            <button onClick={() => navigate('/smm/rewards')} className="text-xs text-indigo-400 font-medium text-left mt-2 hover:text-indigo-300">Open Store →</button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="rounded-2xl p-3 bg-slate-900/40">
            <div className="flex flex-col gap-1">
              <LayoutGrid className="w-4 h-4 text-indigo-400 mb-0.5" />
              <span className="text-lg font-bold text-white">{smm.managedIds}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Managed IDs</span>
            </div>
          </Card>
          <Card className="rounded-2xl p-3 bg-slate-900/40">
            <div className="flex flex-col gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-0.5" />
              <span className="text-lg font-bold text-white">{smm.approvedEnrichedIds}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Fully Enriched</span>
            </div>
          </Card>
          <Card className="rounded-2xl p-3 bg-slate-900/40">
            <div className="flex flex-col gap-1">
              <Flame className="w-4 h-4 text-amber-500 mb-0.5" />
              <span className="text-lg font-bold text-white">{smm.currentStreak} d</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Work Streak</span>
            </div>
          </Card>
          <Card className="rounded-2xl p-3 bg-slate-900/40">
             <div className="flex flex-col gap-1">
               <Coins className="w-4 h-4 text-emerald-400 mb-0.5" />
               <span className="text-lg font-bold text-white">৳{smm.weeklyEarnings}</span>
               <span className="text-[10px] text-slate-400 uppercase tracking-wide">Weekly Earned</span>
             </div>
          </Card>
        </div>
      </div>

      {/* Today Section */}
      <div className="space-y-4 pt-2">
        <h2 className="font-bold text-lg text-white">Today's Focus</h2>
        
        {rapidTasks.length > 0 && smm.jobHolderUnlocked && (
          <Card className="border-rose-500/30 bg-rose-500/10 shadow-[0_0_20px_rgba(225,29,72,0.1)] cursor-pointer hover:bg-rose-500/20" onClick={() => navigate('/smm/rapid-tasks')}>
            <CardHeader className="p-4 pb-2">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Zap className="w-4 h-4 text-rose-400 fill-rose-400" />
                   <CardTitle className="text-rose-100 text-sm">Rapid Task Alert</CardTitle>
                 </div>
                 <Badge variant="error" className="text-[10px]">Urgent</Badge>
               </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
               <p className="text-xs text-rose-200/80 mt-1">{rapidTasks[0].name}</p>
            </CardContent>
          </Card>
        )}

        {needsAttention.length > 0 && (
          <Card className="border-amber-500/20 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10" onClick={() => navigate('/smm/hub')}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-100">{needsAttention.length} IDs Need Attention</h3>
                  <p className="text-xs text-amber-200/60 mt-0.5">Enrichment pending or revisions required.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-500/50" />
            </CardContent>
          </Card>
        )}
        
        <Card className="border-white/5 bg-slate-900/60 backdrop-blur-xl cursor-pointer hover:bg-slate-800/80 transition-colors" onClick={() => navigate('/smm/missions')}>
           <CardContent className="p-4 flex items-center justify-between opacity-100">
             <div className="flex items-center gap-3">
               <CalendarCheck className="w-5 h-5 text-indigo-400" />
               <div>
                 <h3 className="text-sm font-semibold text-white">Regular Missions</h3>
                 <p className="text-xs text-slate-400 mt-0.5">
                   {smm.jobHolderUnlocked ? `${regularMissions.length} active tasks today` : 'Locked until Job Holder status'}
                 </p>
               </div>
             </div>
             {!smm.jobHolderUnlocked && <Badge variant="secondary" className="text-[10px]">Locked</Badge>}
             {smm.jobHolderUnlocked && <ArrowRight className="w-4 h-4 text-indigo-400" />}
           </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
           <Button variant="secondary" className="justify-start bg-slate-800/80 hover:bg-slate-700" onClick={() => navigate('/smm/hub')}>
             <Layers className="w-4 h-4 mr-2 text-indigo-400" /> Open Hub
           </Button>
           <Button variant="secondary" className="justify-start bg-slate-800/80 hover:bg-slate-700" onClick={() => navigate('/smm/messages')}>
             <MessageSquare className="w-4 h-4 mr-2 text-emerald-400" /> Messages
           </Button>
           <Button variant="secondary" className="justify-start bg-slate-800/80 hover:bg-slate-700">
             <LayoutGrid className="w-4 h-4 mr-2 text-rose-400" /> View Products
           </Button>
           <Button variant="secondary" className="justify-start bg-slate-800/80 hover:bg-slate-700" onClick={() => navigate('/smm/career')}>
             <Trophy className="w-4 h-4 mr-2 text-amber-400" /> Open Career
           </Button>
        </div>
      </div>
    </div>
  );
}
