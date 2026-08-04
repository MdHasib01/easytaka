import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Wallet, ArrowDownRight, CheckCircle2, DollarSign, ShieldCheck, Download } from 'lucide-react';
import { walletApi } from '../../api/endpoints';
import { PaymentRecord, SalaryBreakdown } from '../../types';

const EMPTY_BREAKDOWN: SalaryBreakdown = {
  baseSalary: 0,
  rapidEarnings: 0,
  badgeAllowance: 0,
  performanceBonus: 0,
  deductions: 0,
  netSalary: 0,
  currency: '৳'
};

export const SMMWalletPage: React.FC = () => {
  const { user, requestWithdrawal } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [method, setMethod] = useState('bKash');

  const [currentSalaryBreakdown, setBreakdown] = useState<SalaryBreakdown>(EMPTY_BREAKDOWN);
  const [samplePaymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  // Withdrawable cash, NOT the salary projection — those are different numbers.
  const [walletBalance, setWalletBalance] = useState(user.walletBalance ?? 0);
  const [amount, setAmount] = useState(user.walletBalance ?? 0);

  const loadSummary = React.useCallback(() => {
    walletApi
      .mySummary()
      .then((summary) => {
        setBreakdown(summary.salaryBreakdown);
        setPaymentHistory(summary.paymentHistory);
        setWalletBalance(summary.walletBalance);
        setAmount(summary.walletBalance);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestWithdrawal(Number(amount), method);
      setIsModalOpen(false);
      loadSummary();
    } catch {
      // requestWithdrawal already surfaced the reason via a toast.
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            SMM Earnings & Wallet
            <Wallet className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Real-time monthly earnings breakdown, badge allowances & mobile payouts.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="gradient"
          icon={<ArrowDownRight className="w-4 h-4" />}
        >
          Withdraw Earnings (bKash / Nagad)
        </Button>
      </div>

      {/* Wallet Balance Hero Card */}
      <GlassCard glow="emerald" className="bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-purple-950/40 border-emerald-500/40 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Two distinct numbers: cash you can take out now, vs the projected
              month-end salary. Withdrawing moves the first, never the second. */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Withdrawable Balance
              </span>
              <div className="text-3xl md:text-4xl font-black text-emerald-400 mt-1">
                ৳{walletBalance.toLocaleString()}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Verified EasyTaka Payroll Account • {user.district}
              </p>
            </div>

            <div className="sm:border-l sm:border-white/10 sm:pl-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Projected Monthly Net
              </span>
              <div className="text-2xl md:text-3xl font-black text-purple-300 mt-1">
                ৳{currentSalaryBreakdown.netSalary.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Settled at the end of the payroll cycle</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="success">Auto Disbursal Active</Badge>
          </div>
        </div>
      </GlassCard>

      {/* Salary Component Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <GlassCard glow="purple">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Base Contract</div>
          <div className="text-lg font-black text-white mt-1">৳{currentSalaryBreakdown.baseSalary}</div>
        </GlassCard>

        <GlassCard glow="amber">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Rapid Blitz</div>
          <div className="text-lg font-black text-amber-400 mt-1">৳{user.rapidEarnings}</div>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Badge Allowance</div>
          <div className="text-lg font-black text-cyan-300 mt-1">+৳{currentSalaryBreakdown.badgeAllowance}</div>
        </GlassCard>

        <GlassCard glow="emerald">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Streak Bonus</div>
          <div className="text-lg font-black text-emerald-400 mt-1">+৳{currentSalaryBreakdown.performanceBonus}</div>
        </GlassCard>

        <GlassCard glow="rose">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Deductions</div>
          <div className="text-lg font-black text-rose-400 mt-1">-৳{currentSalaryBreakdown.deductions}</div>
        </GlassCard>
      </div>

      {/* Payment History */}
      <GlassCard className="space-y-4">
        <h3 className="text-base font-bold text-white">Disbursal Payout History</h3>

        <div className="space-y-2 text-xs">
          {samplePaymentHistory.map(pay => (
            <div key={pay.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{pay.method} Transfer ({pay.reference})</div>
                <div className="text-[10px] text-slate-400">{pay.date}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-emerald-400 text-sm">৳{pay.amount.toLocaleString()}</div>
                <Badge variant="success">{pay.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Withdraw SMM Earnings"
      >
        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Select Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
            >
              <option value="bKash">bKash Merchant (+880 1712-345678)</option>
              <option value="Nagad">Nagad Direct Wallet</option>
              <option value="Bank Transfer">Islami Bank Bangladesh Ltd</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Withdrawal Amount (৳)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Initiate Instant Disbursal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
