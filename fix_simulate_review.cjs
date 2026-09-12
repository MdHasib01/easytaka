const fs = require('fs');
let code = fs.readFileSync('src/contexts/SMMContext.tsx', 'utf8');

const simulateReviewStart = `const simulateReview = (accountId: string, stageId: string, action: 'Approve' | 'Revision' | 'Reject') => {`;
const setApprovedIdCountStart = `const setApprovedIdCount = (count: number) => {`;

const startIdx = code.indexOf(simulateReviewStart);
const endIdx = code.indexOf(setApprovedIdCountStart);

const newSimulateReview = `const simulateReview = (accountId: string, stageId: string, action: 'Approve' | 'Revision' | 'Reject', reviewerNote?: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id !== accountId) return acc;
      
      const currentEnrichmentBefore = acc.stages.filter(s => s.status === 'Approved').reduce((sum, s) => sum + s.weight, 0);
      const stage = acc.stages.find(s => s.id === stageId);
      if (!stage) return acc;

      const updatedStages = acc.stages.map(s => {
        if (s.id === stageId) {
          if (action === 'Approve') return { ...s, status: 'Approved' };
          if (action === 'Revision') return { ...s, status: 'Revision Required', submission: { ...s.submission, reviewerNote } };
          if (action === 'Reject') return { ...s, status: 'Available', submission: { ...s.submission, reviewerNote } }; // Reject resets it
        }
        return s;
      });

      const currentEnrichment = updatedStages.filter(s => s.status === 'Approved').reduce((sum, s) => sum + s.weight, 0);
      const enrichmentPercent = currentEnrichment;
      
      let newStatus = acc.status;
      let newApprovalStatus = acc.approvalStatus;
      let fullEnrichmentRewardGranted = acc.fullEnrichmentRewardGranted;
      
      const historyEvent = {
        id: 'hist_' + Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        stageName: stage.name,
        status: action === 'Approve' ? 'Approved' : action === 'Revision' ? 'Revision Required' : 'Rejected',
        reviewer: 'Milkimom Review Team',
        note: reviewerNote,
        xpAwarded: action === 'Approve' ? stage.xpReward : 0,
        progressBefore: currentEnrichmentBefore,
        progressAfter: enrichmentPercent
      };

      if (action === 'Approve') {
        // Unlock next stage
        const stageIndex = updatedStages.findIndex(s => s.id === stageId);
        if (stageIndex < updatedStages.length - 1 && updatedStages[stageIndex + 1].status === 'Locked') {
           updatedStages[stageIndex + 1].status = 'Available';
        }
        
        addXP(stage.xpReward);
        newApprovalStatus = 'Approved';
        
        if (enrichmentPercent === 100 && acc.status !== 'Eligible') {
          newStatus = 'Eligible';
          if (!fullEnrichmentRewardGranted) {
             addTransaction('ID #17 Full Enrichment Reward', 'Approved', 20);
             fullEnrichmentRewardGranted = true;
          }
        } else if (acc.status !== 'Eligible') {
          newStatus = 'Enrichment Started';
        }
      } else if (action === 'Revision') {
        newStatus = 'Revision Required';
        newApprovalStatus = 'Revision Required';
      } else if (action === 'Reject') {
        // Keep status if there's no other under review
        const anyUnderReview = updatedStages.some(s => s.status === 'Under Review');
        if (!anyUnderReview && newApprovalStatus === 'Under Review') {
           newApprovalStatus = 'Approved'; // fallback
        }
      }

      return {
        ...acc,
        stages: updatedStages,
        enrichmentPercent,
        status: newStatus,
        approvalStatus: newApprovalStatus,
        fullEnrichmentRewardGranted,
        history: [historyEvent, ...(acc.history || [])]
      };
    }));
  };

  `;

code = code.substring(0, startIdx) + newSimulateReview + code.substring(endIdx);

fs.writeFileSync('src/contexts/SMMContext.tsx', code);
