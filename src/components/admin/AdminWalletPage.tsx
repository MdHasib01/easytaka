import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  CreditCard, 
  SlidersHorizontal, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

import { walletApi } from '../../api/endpoints';
import { Transaction, WalletKpis } from '../../types';

export const AdminWalletPage: React.FC = () => {
  const { showToast, workforce } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kpis, setKpis] = useState<WalletKpis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Manual Adjustment Modal State
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [smmId, setSmmId] = useState('');
  const [adjAmount, setAdjAmount] = useState(200);
  const [adjReason, setAdjReason] = useState('');
  const [adjType, setAdjType] = useState<'credit' | 'debit'>('credit');

  // Transaction details drawer state
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);

  const load = React.useCallback(() => {
    Promise.all([walletApi.transactions({ pageSize: 100 }), walletApi.kpis()])
      .then(([page, k]) => {
        setTransactions(page.items);
        setKpis(k);
      })
      .catch(() => showToast('Could not load the wallet ledger', 'error'));
  }, [showToast]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Default the adjustment target once the workforce list arrives.
  React.useEffect(() => {
    if (!smmId && workforce.length) setSmmId(workforce[0].id);
  }, [workforce, smmId]);

  const filteredTx = transactions.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = t.smmName.toLowerCase().includes(q) || (t.ref ?? t.id).toLowerCase().includes(q);
    const matchesType = selectedType === 'All' || t.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjReason || !smmId) return;
    try {
      // The server derives the sign from `direction` — the client no longer
      // computes `amount: adjType === 'debit' ? -Math.abs(...) : ...`.
      const tx = await walletApi.adjust({
        userId: smmId,
        amount: Math.abs(adjAmount),
        direction: adjType,
        note: adjReason
      });
      setTransactions((prev) => [tx, ...prev]);
      setIsAdjustmentModalOpen(false);
      setAdjReason('');
      walletApi.kpis().then(setKpis).catch(() => {});
      showToast(`💰 Balance Adjustment for ${tx.smmName} applied!`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not apply adjustment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Wallet & Financial Ledger Admin
            <Wallet className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Monitor real-time balance liability, payout queues, and manual adjustments across all SMM accounts.
          </p>
        </div>

        <Button
          onClick={() => setIsAdjustmentModalOpen(true)}
          variant="gradient"
          icon={<PlusCircle className="w-4 h-4" />}
        >
          Manual Balance Adjustment
        </Button>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow="emerald">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Approved Balance Liability</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ৳{(kpis?.totalHeldBalance ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-300 font-semibold mt-1">Ready for month-end payout</p>
        </GlassCard>

        <GlassCard glow="amber">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Mission Rewards</span>
            <CreditCard className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ৳{(kpis?.pendingAmount ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-300 font-semibold mt-1">
            {kpis?.pendingCount ?? 0} transactions awaiting settlement
          </p>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rapid Blitz Payout</span>
            <ArrowUpRight className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ৳{(kpis?.creditedThisWeek ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-cyan-300 font-semibold mt-1">Credited this week</p>
        </GlassCard>

        <GlassCard glow="purple">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Badge Allowances</span>
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ৳{(kpis?.withdrawnThisWeek ?? 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-indigo-300 font-semibold mt-1">Withdrawn this week</p>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SMM name or Tx ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
          {['All', 'Mission Reward', 'Rapid Bonus', 'Badge Allowance', 'Manual Adjustment', 'Withdrawal Payout'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                selectedType === type
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-extrabold tracking-wider">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">SMM Personnel</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-indigo-300">{tx.ref ?? tx.id}</td>
                  <td className="p-4 font-bold text-white">{tx.smmName}</td>
                  <td className="p-4">
                    <Badge variant={tx.type === 'Rapid Bonus' ? 'warning' : tx.type === 'Withdrawal Payout' ? 'info' : 'primary'}>
                      {tx.type}
                    </Badge>
                  </td>
                  <td className={`p-4 font-black ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {tx.amount < 0 ? `-৳${Math.abs(tx.amount)}` : `+৳${tx.amount}`}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 font-bold ${
                      tx.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {tx.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{tx.date}</td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => setActiveTx(tx)}
                      icon={<FileText className="w-3.5 h-3.5" />}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Manual Adjustment Modal */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Issue Manual Balance Adjustment"
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Target SMM Personnel</label>
            {/* Real user ids, populated from the workforce — the mock hardcoded
                five names and sent the name string as the identifier. */}
            <select
              value={smmId}
              onChange={(e) => setSmmId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              {workforce.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.district})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Adjustment Type</label>
              <select
                value={adjType}
                onChange={(e) => setAdjType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="credit">Bonus Credit (+৳)</option>
                <option value="debit">Penalty Deduction (-৳)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Amount (৳)</label>
              <input
                type="number"
                value={adjAmount}
                onChange={(e) => setAdjAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Reason / Justification Note *</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Special campaign incentive awarded by Milkimom brand manager."
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAdjustmentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Apply Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transaction Details Modal */}
      {activeTx && (
        <Modal
          isOpen={!!activeTx}
          onClose={() => setActiveTx(null)}
          title={`Transaction Audit (#${activeTx.ref ?? activeTx.id})`}
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Personnel:</span>
                <span className="font-bold text-white">{activeTx.smmName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="font-bold text-indigo-300">{activeTx.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className={`font-black text-sm ${activeTx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {activeTx.amount < 0 ? `-৳${Math.abs(activeTx.amount)}` : `+৳${activeTx.amount}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-200">{activeTx.date}</span>
              </div>
              {activeTx.method && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Gateway:</span>
                  <span className="text-amber-300 font-mono">{activeTx.method}</span>
                </div>
              )}
            </div>

            {activeTx.note && (
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                <span className="font-bold block mb-1">Note / Reference:</span>
                {activeTx.note}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setActiveTx(null)}>
                Close Audit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
