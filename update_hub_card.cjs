const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

const oldCardMapStart = `{filteredAccounts.map(account => (`
const oldCardMapEndStr = `))}
      </div>`;

const startIdx = code.indexOf(oldCardMapStart);
const endIdx = code.indexOf(oldCardMapEndStr, startIdx);

const newCardMap = `{filteredAccounts.map(account => {
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
                  <div className={\`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 \${account.platform === 'Facebook' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'}\`}>
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
                 <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all" style={{width: \`\${currentEnrichment}%\`}}></div>
               </div>
               
               <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                 <span>{approvedStages.length} / {account.stages.length} Stages</span>
                 <span>Status: <span className={\`\${
                   currentStage.status === 'Under Review' ? 'text-amber-400' :
                   currentStage.status === 'Revision Required' ? 'text-rose-400' :
                   currentStage.status === 'Approved' ? 'text-emerald-400' :
                   'text-indigo-400'
                 }\`}>{currentEnrichment === 100 ? 'Eligible' : currentStage.status}</span></span>
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
        })}`;

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + newCardMap + code.substring(endIdx);
  fs.writeFileSync('src/pages/smm/Hub.tsx', code);
  console.log('Replaced successfully');
} else {
  console.log('Could not find boundaries');
}
