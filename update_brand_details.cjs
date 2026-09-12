const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/tabs/BrandDetailsTab.tsx', 'utf8');

const importStr = `import { Badge } from '../../../components/ui/Badge';
import { Settings, Plus, Trash2, CheckCircle2, AlertTriangle, Layers, Type, Percentage, Coins, ClipboardList } from 'lucide-react';
`;

code = code.replace(`import { Button } from '../../../components/ui/Button';`, `import { Button } from '../../../components/ui/Button';\n` + importStr);

const componentStr = `export function BrandDetailsTab({ brand }: { brand: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [stages, setStages] = useState([
      { id: 'stg1', name: 'Account Setup & Security', weight: 10, required: true, xpReward: 50, active: true },
      { id: 'stg2', name: 'Profile Identity Complete', weight: 15, required: true, xpReward: 100, active: true },
      { id: 'stg3', name: 'Profile Information Complete', weight: 15, required: true, xpReward: 100, active: true },
      { id: 'stg4', name: 'Persona Setup Complete', weight: 15, required: true, xpReward: 150, active: true },
      { id: 'stg5', name: 'Content Foundation', weight: 15, required: true, xpReward: 200, active: true },
      { id: 'stg6', name: 'Account Activity / Readiness', weight: 10, required: true, xpReward: 100, active: true },
      { id: 'stg7', name: 'Persona Notes & Consistency', weight: 10, required: true, xpReward: 100, active: true },
      { id: 'stg8', name: 'Final Eligibility Review', weight: 10, required: true, xpReward: 250, active: true }
  ]);
  
  const totalWeight = stages.reduce((sum, stage) => sum + (stage.active ? stage.weight : 0), 0);
  const isValid = totalWeight === 100;
`;

code = code.replace(`export function BrandDetailsTab({ brand }: { brand: any }) {
  const [isEditing, setIsEditing] = useState(false);`, componentStr);

const newContent = `
        <Card className="border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]">
           <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-indigo-400 flex items-center gap-2"><Layers className="w-5 h-5"/> Enrichment Configuration</CardTitle>
              <div className="flex items-center gap-3">
                 <div className={\`flex items-center gap-2 px-3 py-1.5 rounded-lg border \${isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}\`}>
                    <span className="text-xs font-bold tracking-wide uppercase">Total Weight</span>
                    <span className="text-sm font-bold">{totalWeight} / 100</span>
                    {isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                 </div>
              </div>
           </CardHeader>
           <CardContent className="pt-6 space-y-4">
              {!isValid && (
                 <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center gap-2 text-rose-400 text-sm mb-4">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Enrichment stage weights must total 100%.
                 </div>
              )}
              
              <div className="space-y-4">
                 {stages.map((stage, idx) => (
                    <div key={stage.id} className={\`p-4 rounded-xl border transition-all \${!stage.active ? 'bg-slate-900/30 border-white/5 opacity-60' : 'bg-slate-900 border-white/10'}\`}>
                       <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div className="flex-1 space-y-3 w-full">
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 w-4">#{idx + 1}</span>
                                <input 
                                  type="text" 
                                  value={stage.name} 
                                  disabled={!isEditing} 
                                  onChange={(e) => {
                                    const newStages = [...stages];
                                    newStages[idx].name = e.target.value;
                                    setStages(newStages);
                                  }}
                                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-70 focus:outline-none focus:border-indigo-500"
                                />
                                <Badge variant={stage.required ? 'default' : 'secondary'} className={stage.required ? 'bg-indigo-500/20 text-indigo-300' : ''}>
                                  {stage.required ? 'Required' : 'Optional'}
                                </Badge>
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-4 ml-7">
                                <div className="flex items-center gap-2">
                                  <Percentage className="w-4 h-4 text-slate-500" />
                                  <span className="text-xs text-slate-400 w-12">Weight</span>
                                  <input 
                                    type="number" 
                                    value={stage.weight} 
                                    disabled={!isEditing}
                                    onChange={(e) => {
                                      const newStages = [...stages];
                                      newStages[idx].weight = parseInt(e.target.value) || 0;
                                      setStages(newStages);
                                    }}
                                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-white disabled:opacity-70"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Coins className="w-4 h-4 text-slate-500" />
                                  <span className="text-xs text-slate-400 w-16">XP Reward</span>
                                  <input 
                                    type="number" 
                                    value={stage.xpReward} 
                                    disabled={!isEditing}
                                    onChange={(e) => {
                                      const newStages = [...stages];
                                      newStages[idx].xpReward = parseInt(e.target.value) || 0;
                                      setStages(newStages);
                                    }}
                                    className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-white disabled:opacity-70"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <ClipboardList className="w-4 h-4 text-slate-500" />
                                  <Button size="sm" variant="outline" className="h-7 text-xs bg-slate-800" disabled={!isEditing}>Edit Checklist</Button>
                                </div>
                             </div>
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center gap-2 self-end md:self-center ml-7 md:ml-0">
                               <button 
                                 onClick={() => {
                                    const newStages = [...stages];
                                    newStages[idx].active = !newStages[idx].active;
                                    setStages(newStages);
                                 }}
                                 className={\`text-xs px-2 py-1 rounded \${stage.active ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}\`}
                               >
                                 {stage.active ? 'Disable' : 'Enable'}
                               </button>
                               <button className="p-1 text-slate-500 hover:text-rose-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          )}
                       </div>
                    </div>
                 ))}
                 
                 {isEditing && (
                    <Button variant="outline" className="w-full border-dashed border-white/20 text-slate-400 hover:text-white hover:border-white/40 bg-slate-900/50">
                       <Plus className="w-4 h-4 mr-2" /> Add New Stage
                    </Button>
                 )}
              </div>
           </CardContent>
        </Card>
`;

code = code.replace(/<Card>[\s\S]*Account Setup & Enrichment Guidelines[\s\S]*?<\/Card>/, newContent);
code = code.replace(`onClick={() => setIsEditing(!isEditing)}`, `onClick={() => setIsEditing(!isEditing)} disabled={isEditing && !isValid}`);

fs.writeFileSync('src/pages/admin/tabs/BrandDetailsTab.tsx', code);
