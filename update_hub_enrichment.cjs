const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Hub.tsx', 'utf8');

// I will create an EnrichmentTab component at the top, then replace the inline code with <EnrichmentTab account={account} onSubmitStage={onSubmitStage} />

const enrichmentTabComponent = `
function EnrichmentTab({ account, onSubmitStage }: { account: SocialAccount, onSubmitStage: (stageId: string) => void }) {
  const [selectedStage, setSelectedStage] = useState<string>(account.stages[0]?.id || '');
  const approvedStages = account.stages.filter(s => s.status === 'Approved');
  const currentEnrichment = approvedStages.reduce((sum, s) => sum + s.weight, 0);
  const activeStage = account.stages.find(s => s.id === selectedStage) || account.stages[0];

  const renderChecklist = (stage: EnrichmentStage) => {
    return (
      <div className="space-y-2 mt-4">
        {stage.checklist.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className={\`w-4 h-4 rounded flex items-center justify-center \${item.checked ? 'bg-emerald-500 text-white' : 'border border-slate-600 bg-slate-800'}\`}>
              {item.checked && <CheckCircle2 className="w-3 h-3" />}
            </div>
            <span className={\`text-sm \${item.checked ? 'text-slate-300' : 'text-slate-500'}\`}>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between relative z-10">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden shrink-0">
                 {account.persona?.avatar ? (
                   <img src={account.persona.avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-8 h-8 text-slate-500 m-auto mt-4" />
                 )}
              </div>
              <div>
                 <h2 className="text-xl font-bold text-white">{account.name}</h2>
                 <p className="text-sm text-slate-400">ID: {account.id} • {account.platform}</p>
              </div>
           </div>
           
           <div className="flex-1 w-full max-w-md">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Enrichment</span>
                 <span className="text-3xl font-bold text-white">{currentEnrichment}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 transition-all shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{width: \`\${currentEnrichment}%\`}}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">{approvedStages.length} of {account.stages.length} stages approved</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
         {/* Timeline */}
         <div className="w-full md:w-80 shrink-0">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 px-2">Pipeline Stages</h3>
            <div className="space-y-2">
               {account.stages.map((stage, idx) => (
                 <div 
                   key={stage.id} 
                   onClick={() => setSelectedStage(stage.id)}
                   className={\`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 \${
                     selectedStage === stage.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-900/50 border-white/5 hover:bg-slate-900'
                   }\`}
                 >
                    <div className={\`w-6 h-6 rounded-full flex items-center justify-center shrink-0 \${
                      stage.status === 'Approved' ? 'bg-emerald-500 text-white' :
                      stage.status === 'Locked' ? 'bg-slate-800 text-slate-600' :
                      'bg-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                    }\`}>
                       {stage.status === 'Approved' ? <CheckCircle2 className="w-4 h-4" /> : 
                        stage.status === 'Locked' ? <Lock className="w-3 h-3" /> : 
                        <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className={\`text-sm font-medium truncate \${stage.status === 'Locked' ? 'text-slate-500' : 'text-slate-200'}\`}>{stage.name}</h4>
                       <p className="text-xs text-slate-500">+{stage.weight}%</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Stage Details */}
         <div className="flex-1">
            {activeStage && (
              <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
                 <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-start">
                    <div>
                       <h3 className="text-xl font-bold text-white mb-2">{activeStage.name}</h3>
                       <Badge variant={
                         activeStage.status === 'Approved' ? 'success' :
                         activeStage.status === 'Under Review' ? 'warning' :
                         activeStage.status === 'Revision Required' ? 'error' :
                         activeStage.status === 'Available' || activeStage.status === 'Ready to Submit' ? 'default' :
                         'outline'
                       }>
                         {activeStage.status}
                       </Badge>
                    </div>
                    <span className="text-2xl font-black text-slate-800 shrink-0">+{activeStage.weight}%</span>
                 </div>
                 
                 <div className="p-6">
                    {/* Reusable Proof Component / State Display */}
                    
                    {activeStage.status === 'Revision Required' && activeStage.submission?.reviewerNote && (
                      <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-rose-200/90 text-sm">
                         <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                         <div>
                            <p className="font-bold text-rose-300 mb-1">Revision Required</p>
                            <p>"{activeStage.submission.reviewerNote}"</p>
                         </div>
                      </div>
                    )}
                    
                    {activeStage.status === 'Under Review' && activeStage.submission && (
                      <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-200/90 text-sm">
                         <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                         <div>
                            <p className="font-bold text-amber-300 mb-1">Under Review</p>
                            <p>Submitted: {activeStage.submission.date}</p>
                            <p className="text-amber-200/60 mt-1">Progress will update after approval.</p>
                         </div>
                      </div>
                    )}
                    
                    <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Requirements</h4>
                    {renderChecklist(activeStage)}
                    
                    {activeStage.id === 'stg4' && (
                       <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                          <p className="text-sm text-slate-300">Persona Completeness: <span className="font-bold text-amber-400">{account.persona?.completeness || 0}%</span></p>
                          {(account.persona?.completeness || 0) < 100 && (
                            <p className="text-xs text-rose-400 mt-1">You must complete all Persona fields to submit this stage.</p>
                          )}
                       </div>
                    )}
                    
                    {activeStage.id === 'stg5' && (
                       <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                          <p className="text-sm text-slate-300">Content Entries: <span className="font-bold text-indigo-400">{account.contentEntries?.length || 0} / 10</span></p>
                          <p className="text-xs text-slate-500 mt-1">You need 10 foundational content pieces.</p>
                       </div>
                    )}
                    
                    {activeStage.id === 'stg7' && (
                       <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                          <p className="text-sm text-slate-300">Persona Notes: <span className="font-bold text-emerald-400">{account.notes?.length || 0} / 5</span></p>
                          <p className="text-xs text-slate-500 mt-1">You need to save 5 context notes to establish consistency.</p>
                       </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                       {(activeStage.status === 'Available' || activeStage.status === 'Ready to Submit' || activeStage.status === 'Revision Required') && (
                         <Button onClick={() => onSubmitStage(activeStage.id)} className="bg-indigo-600 hover:bg-indigo-500 px-8 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                           {activeStage.status === 'Revision Required' ? 'Fix & Resubmit' : 'Submit for Review'}
                         </Button>
                       )}
                    </div>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
`;

const importsIndex = code.indexOf('export default function SMMHub()');
code = code.substring(0, importsIndex) + enrichmentTabComponent + '\n' + code.substring(importsIndex);

const activeTabEnrichmentRegex = /\{activeTab === 'Enrichment' && \([\s\S]*?\}\)[\s]*\)\}/;
code = code.replace(activeTabEnrichmentRegex, `{activeTab === 'Enrichment' && <EnrichmentTab account={account} onSubmitStage={onSubmitStage} />}`);

fs.writeFileSync('src/pages/smm/Hub.tsx', code);
