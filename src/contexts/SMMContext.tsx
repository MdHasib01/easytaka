import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SMM, SocialAccount, Product, Mission } from '../types';
import { mockSMMs, mockSocialAccounts, mockProducts, mockMissions } from '../data/mockData';

interface Transaction {
  id: string;
  title: string;
  desc: string;
  amount: string;
  date: string;
}

interface SMMContextType {
  smm: SMM;
  accounts: SocialAccount[];
  products: Product[];
  missions: Mission[];
  rapidTasks: any[];
  transactions: Transaction[];
  walletBalance: number;
  addXP: (amount: number) => void;
  simulateReview: (accountId: string, stageId: string, action: 'Approve' | 'Revision' | 'Reject') => void;
  submitStage: (accountId: string, stageId: string) => void;
  claimJobHolderBonus: () => void;
  resetDemo: () => void;
  demoAction: (action: string) => void;
  setApprovedIdCount: (count: number) => void;
  addAccount: (account: any) => void;
  createMission: (mission: any) => void;
  createRapidTask: (task: any) => void;
}

const SMMContext = createContext<SMMContextType | undefined>(undefined);

export function SMMProvider({ children }: { children: ReactNode }) {
  const [smm, setSmm] = useState<SMM>(mockSMMs[0]);
  const [accounts, setAccounts] = useState<SocialAccount[]>(mockSocialAccounts);
  const [products] = useState<Product[]>(mockProducts);
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [walletBalance, setWalletBalance] = useState<number>(980);
  
  const [rapidTasks, setRapidTasks] = useState<any[]>([
    {
       id: 'rt1',
       title: 'Flash Sale Boost - Milkimom Pump',
       status: 'Active',
       timeLeft: '2 hours left',
       reward: 50,
       progress: 0,
       total: 20
    }
  ]);

  const createMission = (newMission: any) => {
     setMissions(prev => [{ ...newMission, id: `m_${Date.now()}`, status: 'Active' }, ...prev]);
  };

  const createRapidTask = (newTask: any) => {
     setRapidTasks(prev => [{ ...newTask, id: `rt_${Date.now()}`, status: 'Active' }, ...prev]);
  };
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const addNotification = (title: string, message: string, type: 'info'|'success'|'warning'|'error' = 'info') => {
    setNotifications(prev => [{ id: 'notif_'+Date.now(), title, message, date: 'Just now', read: false, type }, ...prev]);
  };

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', title: 'Weekly Base Salary', desc: 'Week 2 (20 IDs)', amount: '+৳750', date: 'Mon, Sep 5' }
  ]);

  // Recalculate derived SMM stats whenever accounts change
  useEffect(() => {
    const approvedIds = accounts.filter(a => a.status === 'Eligible' || a.enrichmentPercent === 100).length;
    setSmm(prev => ({
      ...prev,
      managedIds: accounts.length,
      approvedEnrichedIds: approvedIds,
    }));
  }, [accounts]);

  const addXP = (amount: number) => {
    setSmm(prev => ({
      ...prev,
      lifetimeXp: prev.lifetimeXp + amount,
      redeemableXp: prev.redeemableXp + amount
    }));
  };

  const addTransaction = (title: string, desc: string, amount: number) => {
    setWalletBalance(prev => prev + amount);
    setTransactions(prev => [
      {
        id: `t_${Date.now()}`,
        title,
        desc,
        amount: `+৳${amount}`,
        date: 'Just now'
      },
      ...prev
    ]);
  };

  const claimJobHolderBonus = () => {
    if (!smm.jobHolderBonusClaimed && smm.approvedEnrichedIds >= 20) {
      setSmm(prev => ({ ...prev, jobHolderUnlocked: true, jobHolderBonusClaimed: true }));
      addXP(200);
      addTransaction('Job Holder Milestone Bonus', '20 Approved IDs Achieved', 100);
    }
  };

  const submitStage = (accountId: string, stageId: string, proofData?: any) => {
    addNotification('Proof Submitted', 'Your enrichment proof has been submitted for review.', 'info');
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
  };

  const simulateReview = (accountId: string, stageId: string, action: 'Approve' | 'Revision' | 'Reject', reviewerNote?: string) => {
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
        addNotification('Stage Approved', `${stage.name} was approved. +${stage.xpReward} XP.`, 'success');
        
        if (enrichmentPercent >= 50 && currentEnrichmentBefore < 50) {
           addNotification('Enrichment Progress', 'Halfway there. Keep going!', 'info');
        }
        if (enrichmentPercent >= 80 && currentEnrichmentBefore < 80) {
           addNotification('Enrichment Progress', 'Almost ready.', 'info');
        }
        if (enrichmentPercent >= 90 && currentEnrichmentBefore < 90) {
           addNotification('Final Review Unlocked', 'Final eligibility review unlocked.', 'info');
        }
        // Unlock next stage
        const stageIndex = updatedStages.findIndex(s => s.id === stageId);
        if (stageIndex < updatedStages.length - 1 && updatedStages[stageIndex + 1].status === 'Locked') {
           updatedStages[stageIndex + 1].status = 'Available';
        }
        
        addXP(stage.xpReward);
        newApprovalStatus = 'Approved';
        
        if (enrichmentPercent === 100 && acc.status !== 'Eligible') {
          newStatus = 'Eligible';
          addNotification('Account Eligible', 'Account is now Eligible.', 'success');
          if (!fullEnrichmentRewardGranted) {
             addNotification('Reward Earned', 'Earned ৳20 for Full Enrichment!', 'success');
             addTransaction('ID #17 Full Enrichment Reward', 'Approved', 20);
             fullEnrichmentRewardGranted = true;
          }
        } else if (acc.status !== 'Eligible') {
          newStatus = 'Enrichment Started';
        }
      } else if (action === 'Revision') {
        addNotification('Revision Required', `${stage.name} needs revision. Check feedback.`, 'warning');
        newStatus = 'Revision Required';
        newApprovalStatus = 'Revision Required';
      } else if (action === 'Reject') {
        addNotification('Stage Rejected', `${stage.name} was rejected.`, 'error');
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

  const setApprovedIdCount = (count: number) => {
    // For demo purposes, we'll force the first N accounts to be approved and others to be new.
    setAccounts(prev => prev.map((acc, i) => {
      if (i < count) {
        return {
          ...acc,
          status: 'Eligible',
          enrichmentPercent: 100,
          approvalStatus: 'Approved',
          stages: acc.stages.map(s => ({ ...s, status: 'Approved' }))
        };
      }
      return {
        ...acc,
        status: 'New',
        enrichmentPercent: 0,
        approvalStatus: null,
        stages: acc.stages.map((s, idx) => ({ ...s, status: idx === 0 ? 'Available' : 'Locked' }))
      };
    }));
  };

  const addAccount = (newAcc: any) => {
    const acc: SocialAccount = {
      id: `acc-${accounts.length + 1}`,
      smmId: smm.id,
      name: newAcc.name || 'New_ID',
      platform: newAcc.platform || 'Facebook',
      email: newAcc.email || 'demo@gmail.com',
      status: 'Enrichment Started', // Based on the wizard flow, it goes straight to enrichment started
      enrichmentPercent: 0,
      approvalStatus: null,
      todayTasksCompleted: 0,
      todayTasksTotal: 0,
      todayCompletionPercent: 0,
      assignedProductCount: 0,
      lastActivity: 'Just now',
      stages: [
        { id: 'st1', name: 'Profile Foundation', status: 'Available', xpReward: 40, weight: 20, checklist: [] },
        { id: 'st2', name: 'Profile Completeness', status: 'Locked', xpReward: 40, weight: 20, checklist: [] },
        { id: 'st3', name: 'Content Foundation', status: 'Locked', xpReward: 40, weight: 20, checklist: [] },
        { id: 'st4', name: 'Organic Activity', status: 'Locked', xpReward: 40, weight: 20, checklist: [] },
        { id: 'st5', name: 'Final Eligibility Review', status: 'Locked', xpReward: 40, weight: 20, checklist: [] },
      ]
    };
    setAccounts([acc, ...accounts]);
  };

  const demoAction = (action: string) => {
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
  };

  const resetDemo = () => {
    setSmm(mockSMMs[0]);
    setAccounts(mockSocialAccounts);
    setWalletBalance(980);
    setTransactions([{ id: 't1', title: 'Weekly Base Salary', desc: 'Week 2 (20 IDs)', amount: '+৳750', date: 'Mon, Sep 5' }]);
  };

  return (
    <SMMContext.Provider value={{
      smm, accounts, products, missions, rapidTasks, transactions, walletBalance,
      addXP, simulateReview, submitStage, claimJobHolderBonus, resetDemo, demoAction, setApprovedIdCount, notifications, addNotification, addAccount, createMission, createRapidTask
    }}>
      {children}
    </SMMContext.Provider>
  );
}

export const useSMM = () => {
  const context = useContext(SMMContext);
  if (!context) throw new Error('useSMM must be used within SMMProvider');
  return context;
};
