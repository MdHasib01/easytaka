const fs = require('fs');
let code = fs.readFileSync('src/contexts/SMMContext.tsx', 'utf8');

const typeStart = `export interface SMMContextType {`;
const typeEnd = `  addTransaction: (title: string, desc: string, amount: number) => void;`;

const newTypeStr = `  notifications: Notification[];
  addNotification: (title: string, message: string, type?: 'info'|'success'|'warning'|'error') => void;`;

code = code.replace(typeEnd, newTypeStr + '\n' + typeEnd);

const hookStart = `const [transactions, setTransactions] = useState<Transaction[]>([`;
const hookNew = `const [notifications, setNotifications] = useState<Notification[]>([]);
  const addNotification = (title: string, message: string, type: 'info'|'success'|'warning'|'error' = 'info') => {
    setNotifications(prev => [{ id: 'notif_'+Date.now(), title, message, date: 'Just now', read: false, type }, ...prev]);
  };
`;
code = code.replace(hookStart, hookNew + '\n  ' + hookStart);

// Inject into return
code = code.replace(`addXP, simulateReview, submitStage, claimJobHolderBonus, resetDemo, demoAction, setApprovedIdCount`, `addXP, simulateReview, submitStage, claimJobHolderBonus, resetDemo, demoAction, setApprovedIdCount, notifications, addNotification`);

fs.writeFileSync('src/contexts/SMMContext.tsx', code);
