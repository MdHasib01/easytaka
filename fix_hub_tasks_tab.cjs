const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

code = code.replace(
  `const tabs = ['Overview', 'Persona', 'Enrichment', 'Notes', 'Account Access'];`,
  `const tabs = ['Overview', 'Persona', 'Enrichment', 'Notes', 'Account Access', 'Tasks'];`
);

const tasksTabStr = `
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
`;

code = code.replace(`{activeTab === 'Account Access' && (`, tasksTabStr + `\n           {activeTab === 'Account Access' && (`);
fs.writeFileSync('src/pages/smm/Hub.tsx', code);
