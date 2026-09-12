const fs = require('fs');
let code = fs.readFileSync('src/contexts/SMMContext.tsx', 'utf8');

// Just keep the actions that mutate account data that aren't simulateReview
const newDemoAction = `const demoAction = (action: string) => {
    setAccounts(prev => {
       const newAccs = [...prev];
       const acc = { ...newAccs[0] }; 
       const stageIndex = acc.stages.findIndex(s => s.status !== 'Approved');
       const stage = acc.stages[stageIndex];
       
       if (action === 'Complete Checklist' && stage) {
          acc.stages[stageIndex] = { ...stage, checklist: stage.checklist.map(c => ({...c, checked: true})) };
       }
       if (action === 'Add Notes') {
          acc.notes = [...(acc.notes || []), 
             { id: 'dn1', type: 'Tone', title: 'Demo Note 1', content: 'Demo context', date: 'Now', tags: [], isImportant: false, isPinned: false },
             { id: 'dn2', type: 'Tone', title: 'Demo Note 2', content: 'Demo context', date: 'Now', tags: [], isImportant: false, isPinned: false },
             { id: 'dn3', type: 'Tone', title: 'Demo Note 3', content: 'Demo context', date: 'Now', tags: [], isImportant: false, isPinned: false },
             { id: 'dn4', type: 'Tone', title: 'Demo Note 4', content: 'Demo context', date: 'Now', tags: [], isImportant: false, isPinned: false },
             { id: 'dn5', type: 'Tone', title: 'Demo Note 5', content: 'Demo context', date: 'Now', tags: [], isImportant: false, isPinned: false }
          ];
       }
       if (action === 'Add Content') {
          acc.contentEntries = Array(10).fill({ id: 'dc', type: 'Post', title: 'Demo Content', date: 'Now' });
       }
       if (action === 'Complete All') {
          acc.stages = acc.stages.map(s => ({ ...s, status: 'Approved' }));
          acc.status = 'Eligible';
          acc.enrichmentPercent = 100;
       }
       if (action === 'Reset Enrichment') {
          acc.stages = acc.stages.map((s, i) => ({ ...s, status: i < 4 ? 'Approved' : i === 4 ? 'Under Review' : 'Locked' }));
          acc.status = 'Enrichment Started';
          acc.approvalStatus = 'Under Review';
          acc.enrichmentPercent = acc.stages.filter(s => s.status === 'Approved').reduce((sum, s) => sum + s.weight, 0);
       }
       if (action === 'Reset Reward') {
          acc.fullEnrichmentRewardGranted = false;
       }
       
       newAccs[0] = acc;
       return newAccs;
    });
  };`;

code = code.replace(/const demoAction = \(action: string\) => \{[\s\S]*?\};\n\n  const resetDemo/, newDemoAction + '\n\n  const resetDemo');
fs.writeFileSync('src/contexts/SMMContext.tsx', code);
