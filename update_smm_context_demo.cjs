const fs = require('fs');
let code = fs.readFileSync('src/contexts/SMMContext.tsx', 'utf8');

// I need to add demo actions to context
const typeStr = `  resetDemo: () => void;`;
const newTypeStr = `  resetDemo: () => void;
  demoAction: (action: string) => void;`;
code = code.replace(typeStr, newTypeStr);

const funcStr = `const resetDemo = () => {`;
const newFuncStr = `const demoAction = (action: string) => {
    setAccounts(prev => {
       const newAccs = [...prev];
       const acc = { ...newAccs[0] }; // Target first account
       const stageIndex = acc.stages.findIndex(s => s.status !== 'Approved');
       const stage = acc.stages[stageIndex];
       
       if (action === 'Approve') simulateReview(acc.id, stage.id, 'Approve');
       if (action === 'Revision') simulateReview(acc.id, stage.id, 'Revision', 'Demo revision note');
       if (action === 'Reject') simulateReview(acc.id, stage.id, 'Reject', 'Demo reject note');
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
       }
       if (action === 'Reset Enrichment') {
          acc.stages = acc.stages.map((s, i) => ({ ...s, status: i < 4 ? 'Approved' : i === 4 ? 'Under Review' : 'Locked' }));
          acc.status = 'Enrichment Started';
          acc.approvalStatus = 'Under Review';
       }
       if (action === 'Reset Reward') {
          acc.fullEnrichmentRewardGranted = false;
       }
       
       newAccs[0] = acc;
       return newAccs;
    });
  };

  const resetDemo = () => {`;
code = code.replace(funcStr, newFuncStr);

code = code.replace(`addXP, simulateReview, submitStage, claimJobHolderBonus, resetDemo, setApprovedIdCount`, `addXP, simulateReview, submitStage, claimJobHolderBonus, resetDemo, demoAction, setApprovedIdCount`);

fs.writeFileSync('src/contexts/SMMContext.tsx', code);
