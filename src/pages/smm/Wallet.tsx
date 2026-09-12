import React from 'react';
import { useSMM } from '../../contexts/SMMContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Wallet as WalletIcon, ArrowDownToLine, History } from 'lucide-react';

export default function SMMWallet() {
  const { walletBalance, transactions } = useSMM();

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white tracking-tight">Wallet</h1>
      
      <Card className="bg-gradient-to-br from-slate-900 to-[#0B0F19] text-white border border-indigo-500/20 overflow-hidden relative shadow-[0_10px_40px_-10px_rgba(79,70,229,0.3)]">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-30 pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-violet-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 mb-3">
            <WalletIcon className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Available Balance</span>
          </div>
          <div className="text-5xl font-bold mb-8 tracking-tight drop-shadow-md">৳{walletBalance}</div>
          
          <div className="flex gap-3">
            <Button className="w-full text-slate-900 bg-white hover:bg-slate-200 border-none shadow-[0_0_15px_rgba(255,255,255,0.4)] font-bold text-base h-12 rounded-xl">
              <ArrowDownToLine className="w-5 h-5 mr-2" /> Withdraw Funds
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300"><History className="w-4 h-4 mr-2"/> Full History</Button>
        </div>
        
        <div className="space-y-3">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/5 shadow-sm hover:bg-slate-800/80 transition-colors">
              <div>
                <p className="font-semibold text-slate-200 text-sm">{tx.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tx.desc} • {tx.date}</p>
              </div>
              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
