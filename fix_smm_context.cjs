const fs = require('fs');
let code = fs.readFileSync('src/contexts/SMMContext.tsx', 'utf8');

code = code.replace(
  `      // Recalculate enrichment %
      const approvedStages = updatedStages.filter(s => s.status === 'Approved').length;
      const enrichmentPercent = (approvedStages / updatedStages.length) * 100;`,
  `      // Recalculate enrichment % based on weight
      const currentEnrichment = updatedStages.filter(s => s.status === 'Approved').reduce((sum, s) => sum + s.weight, 0);
      const enrichmentPercent = currentEnrichment;`
);

code = code.replace(
  `      const approvedIds = accounts.filter(a => a.status === 'Eligible' || a.enrichmentPercent === 100).length;`,
  `      const approvedIds = accounts.filter(a => a.status === 'Eligible' || (a.stages.filter(s => s.status === 'Approved').reduce((sum, s) => sum + s.weight, 0) === 100)).length;`
);

// We need to also add sendMessage / createConversation maybe? "add a complete internal LIVE CHAT"
// Wait, the previous steps might have already created these.

fs.writeFileSync('src/contexts/SMMContext.tsx', code);
