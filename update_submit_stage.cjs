const fs = require('fs');
let code = fs.readFileSync('src/contexts/SMMContext.tsx', 'utf8');

code = code.replace(
  `const submitStage = (accountId: string, stageId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          approvalStatus: 'Under Review',
          status: acc.status === 'New' ? 'Enrichment Started' : acc.status,
          stages: acc.stages.map(s => s.id === stageId ? { ...s, status: 'Under Review' } : s)
        };
      }
      return acc;
    }));
  };`,
  `const submitStage = (accountId: string, stageId: string, proofData?: any) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          approvalStatus: 'Under Review',
          status: acc.status === 'New' ? 'Enrichment Started' : acc.status,
          stages: acc.stages.map(s => s.id === stageId ? { 
            ...s, 
            status: 'Under Review',
            submission: proofData || { status: 'Submitted', date: new Date().toLocaleDateString() }
          } : s)
        };
      }
      return acc;
    }));
  };`
);

fs.writeFileSync('src/contexts/SMMContext.tsx', code);
