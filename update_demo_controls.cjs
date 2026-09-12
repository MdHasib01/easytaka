const fs = require('fs');
let code = fs.readFileSync('src/pages/smm/DemoControls.tsx', 'utf8');

const oldContent = `
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">Add Global XP</label>
          <Button 
             size="sm" 
             variant="outline" 
             onClick={() => addXP(50)}
            className="w-full text-xs"
          >
            <Plus className="w-3 h-3 mr-1" /> Add 50 XP
          </Button>
        </div>
        <div className="pt-2 mt-2 border-t border-white/10">
          <Button 
             size="sm" 
             variant="danger" 
             onClick={resetDemo}
            className="w-full text-xs opacity-80"
          >
            Reset All Data
          </Button>
        </div>
      </div>
    </div>
  );
}
`;

const newContent = `
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="text-xs text-slate-400 font-medium">Enrichment Tools (First ID)</label>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="text-[10px] h-7 bg-slate-800" onClick={() => {
              const acc = accounts[0];
              const stage = acc.stages.find(s => s.status !== 'Approved');
              if (stage) simulateReview(acc.id, stage.id, 'Approve');
            }}>Approve Stage</Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7 bg-slate-800" onClick={() => {
              const acc = accounts[0];
              const stage = acc.stages.find(s => s.status !== 'Approved');
              if (stage) simulateReview(acc.id, stage.id, 'Revision');
            }}>Req. Revision</Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7 bg-slate-800" onClick={() => demoAction('Complete Checklist')}>Checklist ✓</Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7 bg-slate-800" onClick={() => demoAction('Add Notes')}>Add Notes</Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7 bg-slate-800" onClick={() => demoAction('Add Content')}>Add Content</Button>
            <Button size="sm" variant="outline" className="text-[10px] h-7 bg-slate-800" onClick={() => demoAction('Complete All')}>Complete All</Button>
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-white/10 space-y-2">
          <Button size="sm" variant="outline" onClick={() => addXP(50)} className="w-full text-xs bg-slate-800"><Plus className="w-3 h-3 mr-1" /> Add 50 XP</Button>
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={() => demoAction('Reset Enrichment')} className="flex-1 text-[10px] opacity-80">Reset Account</Button>
            <Button size="sm" variant="danger" onClick={resetDemo} className="flex-1 text-[10px] opacity-80">Reset All Data</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

code = code.replace(oldContent, newContent);
code = code.replace(`addXP, setApprovedIdCount, resetDemo } = useSMM();`, `addXP, setApprovedIdCount, resetDemo, demoAction, simulateReview } = useSMM();`);
fs.writeFileSync('src/pages/smm/DemoControls.tsx', code);
