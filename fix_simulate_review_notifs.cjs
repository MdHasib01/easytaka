const fs = require('fs');
let code = fs.readFileSync('src/contexts/SMMContext.tsx', 'utf8');

const oldSimulateReview = `const historyEvent = {
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

      if (action === 'Approve') {`;
      
const newSimulateReview = `const historyEvent = {
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
        addNotification('Stage Approved', \`\${stage.name} was approved. +\${stage.xpReward} XP.\`, 'success');
        
        if (enrichmentPercent >= 50 && currentEnrichmentBefore < 50) {
           addNotification('Enrichment Progress', 'Halfway there. Keep going!', 'info');
        }
        if (enrichmentPercent >= 80 && currentEnrichmentBefore < 80) {
           addNotification('Enrichment Progress', 'Almost ready.', 'info');
        }
        if (enrichmentPercent >= 90 && currentEnrichmentBefore < 90) {
           addNotification('Final Review Unlocked', 'Final eligibility review unlocked.', 'info');
        }`;

code = code.replace(oldSimulateReview, newSimulateReview);

const eligibleCheckStr = `if (enrichmentPercent === 100 && acc.status !== 'Eligible') {
          newStatus = 'Eligible';
          if (!fullEnrichmentRewardGranted) {
             addTransaction('ID #17 Full Enrichment Reward', 'Approved', 20);
             fullEnrichmentRewardGranted = true;
          }
        } else if (acc.status !== 'Eligible') {
          newStatus = 'Enrichment Started';
        }`;

const eligibleCheckNew = `if (enrichmentPercent === 100 && acc.status !== 'Eligible') {
          newStatus = 'Eligible';
          addNotification('Account Eligible', 'Account is now Eligible.', 'success');
          if (!fullEnrichmentRewardGranted) {
             addNotification('Reward Earned', 'Earned ৳20 for Full Enrichment!', 'success');
             addTransaction('ID #17 Full Enrichment Reward', 'Approved', 20);
             fullEnrichmentRewardGranted = true;
          }
        } else if (acc.status !== 'Eligible') {
          newStatus = 'Enrichment Started';
        }`;

code = code.replace(eligibleCheckStr, eligibleCheckNew);

const revisionCheckStr = `} else if (action === 'Revision') {
        newStatus = 'Revision Required';
        newApprovalStatus = 'Revision Required';
      } else if (action === 'Reject') {`;

const revisionCheckNew = `} else if (action === 'Revision') {
        addNotification('Revision Required', \`\${stage.name} needs revision. Check feedback.\`, 'warning');
        newStatus = 'Revision Required';
        newApprovalStatus = 'Revision Required';
      } else if (action === 'Reject') {
        addNotification('Stage Rejected', \`\${stage.name} was rejected.\`, 'error');`;
        
code = code.replace(revisionCheckStr, revisionCheckNew);

const submitStageStr = `const submitStage = (accountId: string, stageId: string, proofData?: any) => {`;
const submitStageNew = `const submitStage = (accountId: string, stageId: string, proofData?: any) => {
    addNotification('Proof Submitted', 'Your enrichment proof has been submitted for review.', 'info');`;
code = code.replace(submitStageStr, submitStageNew);


fs.writeFileSync('src/contexts/SMMContext.tsx', code);
