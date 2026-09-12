const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/Missions.tsx', 'utf8');

const hookStr = `const { smm, missions } = useSMM();
  const [activeTab, setActiveTab] = useState('today');`;
const newHookStr = `const { smm, missions, accounts } = useSMM();
  const [activeTab, setActiveTab] = useState('today');
  const [executingMission, setExecutingMission] = useState<any>(null);
  
  const eligibleAccounts = accounts.filter(a => a.enrichmentPercent === 100 && a.status === 'Eligible');`;

code = code.replace(hookStr, newHookStr);

const modalStr = `
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
`;

code = code.replace(`</Tabs>\n    </div>`, `</Tabs>\n${modalStr}    </div>`);

code = code.replace(`onClick={() => setExecutingMission(mission)}`, ``);
code = code.replace(`<Button className="w-full md:w-auto rounded-xl">Execute Mission</Button>`, `<Button className="w-full md:w-auto rounded-xl" onClick={() => setExecutingMission(mission)}>Execute Mission</Button>`);

fs.writeFileSync('src/pages/smm/Missions.tsx', code);
