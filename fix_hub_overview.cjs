const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

const statusHealthStr = `<div className="bg-slate-900 rounded-2xl p-5 border border-white/5">
                      <h3 className="text-sm font-medium text-slate-400 mb-4">Status & Health</h3>`;

const enrichmentSummaryStr = `<div className="bg-slate-900 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
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
                            <span className={\`font-medium \${account.status === 'Eligible' ? 'text-emerald-400' : 'text-amber-400'}\`}>{account.status}</span>
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
                   </div>`;

const newOverview = enrichmentSummaryStr + `\n                   ` + statusHealthStr;

code = code.replace(statusHealthStr, newOverview);

// We need to add state for showHistory
code = code.replace(
  `const tabs = ['Overview', 'Persona', 'Enrichment', 'Notes', 'Account Access'];`,
  `const tabs = ['Overview', 'Persona', 'Enrichment', 'Notes', 'Account Access'];
  const [showHistory, setShowHistory] = useState(false);`
);

// We need to add the History Modal inside AccountWorkspaceModal
const historyModal = `
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
                           <div className={\`flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 \${
                             event.status === 'Approved' ? 'bg-emerald-500' :
                             event.status === 'Revision Required' ? 'bg-amber-500' :
                             event.status === 'Rejected' ? 'bg-rose-500' : 'bg-indigo-500'
                           }\`}>
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
`;

code = code.replace(`</motion.div>\n    </motion.div>`, historyModal + `\n    </motion.div>\n    </motion.div>`);

fs.writeFileSync('src/pages/smm/Hub.tsx', code);
