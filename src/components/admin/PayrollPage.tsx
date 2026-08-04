import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Wallet, CheckCircle2, Download, ArrowUpRight, ShieldCheck, Filter, Lock, Edit3, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { payrollApi } from '../../api/endpoints';
import { PayrollLine, PayrollRun } from '../../types';

export const PayrollPage: React.FC = () => {
  const { showToast, triggerConfetti, brands } = useApp();

  const [run, setRun] = useState<PayrollRun | null>(null);
  const [lines, setLines] = useState<PayrollLine[]>([]);
  const [payPeriod, setPayPeriod] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<PayrollLine | null>(null);
  const [customBonus, setCustomBonus] = useState(0);
  const [customDeduction, setCustomDeduction] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const isLocked = run?.status === 'Locked' || run?.status === 'Disbursed';
  const isDisbursed = run?.status === 'Disbursed';

  /** Loads the latest run, or builds a fresh draft if none exists. */
  const loadLatest = React.useCallback(async () => {
    try {
      const runs = await payrollApi.runs();
      if (!runs.length) return;
      const detail = await payrollApi.getRun(runs[0].id);
      setRun(detail.run);
      setLines(detail.lines);
      setPayPeriod(detail.run.period);
    } catch {
      /* nothing to load yet */
    }
  }, []);

  React.useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const buildRun = async () => {
    setIsBuilding(true);
    try {
      const { run: created, lines: createdLines } = await payrollApi.createRun({
        period: payPeriod || undefined,
        district: selectedDistrict === 'All' ? null : selectedDistrict,
        brandName: selectedBrand === 'All' ? null : selectedBrand
      });
      setRun(created);
      setLines(createdLines);
      setPayPeriod(created.period);
      showToast(`🧾 Draft payroll built for ${createdLines.length} specialists`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not build payroll run', 'error');
    } finally {
      setIsBuilding(false);
    }
  };

  const selectedLines = lines.filter((l) => l.selected);
  const totalPayroll = selectedLines.reduce((sum, l) => sum + l.netPay, 0);

  const toggleSelectAll = async () => {
    if (!run || isLocked) return;
    const next = selectedLines.length === lines.length ? [] : lines.map((l) => l.userId);
    const result = await payrollApi.setSelection(run.id, next);
    setLines(result.lines);
  };

  const toggleSMMSelect = async (userId: string) => {
    if (!run || isLocked) return;
    const next = selectedLines.some((l) => l.userId === userId)
      ? selectedLines.filter((l) => l.userId !== userId).map((l) => l.userId)
      : [...selectedLines.map((l) => l.userId), userId];
    const result = await payrollApi.setSelection(run.id, next);
    setLines(result.lines);
  };

  const saveLineAdjustment = async () => {
    if (!editingLine) return;
    try {
      const updated = await payrollApi.updateLine(editingLine.id, {
        customBonus,
        deduction: customDeduction
      });
      setLines((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showToast(`Updated payout for ${updated.userName}`, 'success');
      setEditingLine(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not adjust this line', 'error');
    }
  };

  /** Lock then disburse — the real two-step lifecycle, not a 1.2s timeout. */
  const handleConfirmLockAndDisburse = async () => {
    if (!run) return;
    setIsProcessing(true);
    try {
      if (run.status === 'Draft') await payrollApi.lock(run.id);
      const result = await payrollApi.disburse(run.id);
      setRun(result.run);
      setLines(result.lines);
      setIsLockModalOpen(false);
      showToast(
        `🔒 Payroll Locked & ৳${result.run.totals.net.toLocaleString()} disbursed to ${result.disbursed} specialists via ${result.run.gateway}!`,
        'success'
      );
      triggerConfetti();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Disbursal failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const disburseOne = async (line: PayrollLine) => {
    try {
      const updated = await payrollApi.disburseLine(line.id);
      setLines((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      showToast(`Disbursed ৳${updated.netPay.toLocaleString()} to ${updated.userName} via ${updated.method}!`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not disburse this line', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Payroll & Disbursal Engine
            <Wallet className="w-6 h-6 text-emerald-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Calculate salaries, add custom bonuses/deductions, lock payroll, and execute bulk bKash / Nagad payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={buildRun}
            variant="secondary"
            isLoading={isBuilding}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            {run ? 'Rebuild Draft' : 'Build Payroll Run'}
          </Button>
          <Button
            onClick={() => setIsLockModalOpen(true)}
            variant="gradient"
            disabled={!run || isDisbursed || selectedLines.length === 0}
            icon={<Lock className="w-4 h-4" />}
          >
            {isDisbursed ? 'Payroll Disbursed' : `Lock Payroll & Disburse (${selectedLines.length})`}
          </Button>
        </div>
      </div>

      {/* Pay Period & Filters Header */}
      <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-bold text-slate-300 shrink-0">Pay Period:</label>
          <input
            type="text"
            value={payPeriod}
            onChange={(e) => setPayPeriod(e.target.value)}
            placeholder="August 2026 - Cycle 1"
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-bold text-emerald-400 focus:outline-none min-w-[200px]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300"
          >
            <option value="All">All Districts</option>
            <option value="Jashore">Jashore</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chittagong">Chittagong</option>
            <option value="Sylhet">Sylhet</option>
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300"
          >
            <option value="All">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard glow="emerald">
          <div className="text-xs font-bold text-slate-400 uppercase">Estimated Total Payroll</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">৳{totalPayroll.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-1">{payPeriod}</div>
        </GlassCard>

        <GlassCard glow="purple">
          <div className="text-xs font-bold text-slate-400 uppercase">Selected SMM Count</div>
          <div className="text-2xl font-black text-purple-300 mt-1">{selectedLines.length} / {lines.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Ready for disbursal</div>
        </GlassCard>

        <GlassCard glow="amber">
          <div className="text-xs font-bold text-slate-400 uppercase">Rapid Blitz Bonus Pool</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            ৳{selectedLines.reduce((s, l) => s + l.rapidEarnings, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Emergency Blitz Commissions</div>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="text-xs font-bold text-slate-400 uppercase">Disbursal Gateway</div>
          <div className="text-2xl font-black text-cyan-300 mt-1">{run?.gateway ?? 'bKash Merchant'}</div>
          <div className="text-[10px] text-slate-400 mt-1">Instant Direct Transfer</div>
        </GlassCard>
      </div>

      {/* Workforce Payroll Table */}
      <GlassCard className="space-y-4 overflow-x-auto">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white">SMM Payout Breakdown</h3>
            <button
              onClick={toggleSelectAll}
              disabled={isLocked || !run}
              className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selectedLines.length === lines.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <Badge variant={isDisbursed ? 'success' : isLocked ? 'warning' : 'info'}>
            Cycle Status: {run?.status ?? 'No run built'}
          </Badge>
        </div>

        <div className="overflow-x-auto scrollbar-none -mx-2 px-2">
          <table className="min-w-[640px] w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-white/10 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Select</th>
                <th className="py-3 px-2">SMM Name</th>
                <th className="py-3 px-2">District</th>
                <th className="py-3 px-2">Base Salary</th>
                <th className="py-3 px-2">Rapid Blitz</th>
                <th className="py-3 px-2">Badge Bonus</th>
                <th className="py-3 px-2">Net Pay</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lines.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No payroll run yet — click <strong className="text-white">Build Payroll Run</strong> to
                    snapshot this cycle&apos;s salaries.
                  </td>
                </tr>
              )}
              {/* Every figure below is a frozen snapshot from the run, not a
                  live recomputation — the mock derived base pay as
                  `estimatedSalary - rapidEarnings - 600`. */}
              {lines.map(line => (
                <tr key={line.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2">
                    <input
                      type="checkbox"
                      checked={line.selected}
                      disabled={isLocked}
                      onChange={() => toggleSMMSelect(line.userId)}
                      className="accent-indigo-500 rounded cursor-pointer disabled:opacity-40"
                    />
                  </td>
                  <td className="py-3 px-2 font-bold text-white">
                    <span className="truncate max-w-[120px] sm:max-w-none">{line.userName}</span>
                  </td>
                  <td className="py-3 px-2 text-slate-300">📍 {line.district}</td>
                  <td className="py-3 px-2 text-slate-300">৳{line.baseSalary.toLocaleString()}</td>
                  <td className="py-3 px-2 text-amber-400 font-bold">৳{line.rapidEarnings.toLocaleString()}</td>
                  <td className="py-3 px-2 text-purple-300 font-bold">+৳{line.badgeAllowance.toLocaleString()}</td>
                  <td className="py-3 px-2 text-emerald-400 font-black text-sm">৳{line.netPay.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {line.status === 'Paid' ? (
                        <Badge variant="success">Paid</Badge>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="glass"
                            disabled={isLocked}
                            onClick={() => {
                              setEditingLine(line);
                              setCustomBonus(line.customBonus);
                              setCustomDeduction(line.deduction);
                            }}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                          </Button>
                          <Button
                            size="sm"
                            variant="glass"
                            disabled={!isLocked}
                            onClick={() => disburseOne(line)}
                          >
                            Disburse
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Edit Bonus/Penalty Modal */}
      {editingLine && (
        <Modal
          isOpen={!!editingLine}
          onClose={() => setEditingLine(null)}
          title={`Adjust Payroll: ${editingLine.userName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Add Performance Bonus (৳)</label>
                <input
                  type="number"
                  value={customBonus}
                  onChange={(e) => setCustomBonus(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deduction / Penalty (৳)</label>
                <input
                  type="number"
                  value={customDeduction}
                  onChange={(e) => setCustomDeduction(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 text-slate-300 flex justify-between font-bold">
              <span>Updated Total Payout:</span>
              <span className="text-emerald-400">
                ৳{Math.max(
                  0,
                  editingLine.baseSalary +
                    editingLine.rapidEarnings +
                    editingLine.badgeAllowance +
                    editingLine.performanceBonus +
                    customBonus -
                    customDeduction
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setEditingLine(null)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={saveLineAdjustment}>
                Save Adjustment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lock Payroll Confirmation Modal */}
      {isLockModalOpen && (
        <Modal
          isOpen={isLockModalOpen}
          onClose={() => setIsLockModalOpen(false)}
          title="Lock Payroll & Trigger Disbursal"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
              <div>
                <div className="font-bold text-sm">Locking Payroll for {payPeriod}</div>
                <p className="mt-1 text-[11px] text-amber-200/80">
                  Once locked, salary figures will be frozen and dispatched directly to SMM mobile wallets via bKash Merchant API.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Selected SMM Specialists:</span>
                <strong className="text-white">{selectedLines.length} SMMs</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Disbursal Amount:</span>
                <strong className="text-emerald-400 font-black text-sm">৳{totalPayroll.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setIsLockModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" disabled={isProcessing} onClick={handleConfirmLockAndDisburse} icon={<Lock className="w-4 h-4" />}>
                {isProcessing ? 'Locking & Disbursing...' : 'Confirm Lock & Pay Now 💸'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
