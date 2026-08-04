import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { leaveApi } from '../../api/endpoints';
import { LeaveBalance, LeaveRequest } from '../../types';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send 
} from 'lucide-react';

export const SMMLeavePage: React.FC = () => {
  const { showToast } = useApp();
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([leaveApi.list(), leaveApi.balances()])
      .then(([history, bal]) => {
        if (cancelled) return;
        setLeaveHistory(history);
        setBalances(bal);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /** Reads a live balance, falling back to the figure the card used to hardcode. */
  const balanceFor = (type: LeaveRequest['type'], fallback: number) =>
    balances.find((b) => b.type === type)?.remaining ?? fallback;

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    setSubmitting(true);
    try {
      // status, appliedOn and the applicant are all set server-side now — the
      // mock hardcoded `smmName: 'Rafi Islam'` on every request.
      const created = await leaveApi.create({ type: leaveType, startDate, endDate, reason });
      setLeaveHistory((prev) => [created, ...prev]);
      setIsApplyModalOpen(false);
      setReason('');
      leaveApi.balances().then(setBalances).catch(() => {});
      showToast('📅 Leave Request Submitted to EasyTaka HR Admin!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not submit leave request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Leave & Attendance Management
            <Calendar className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Apply for casual, medical, or emergency leave without breaking your SMM streak status.
          </p>
        </div>

        <Button
          onClick={() => setIsApplyModalOpen(true)}
          variant="gradient"
          icon={<Plus className="w-4 h-4" />}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balances Grid — computed from approved requests vs configured allowances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard glow="purple">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Casual Leave</span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {balanceFor('Casual Leave', 12)} / {balances.find((b) => b.type === 'Casual Leave')?.allowance ?? 12} Days
          </div>
          <p className="text-[11px] text-indigo-300 font-semibold mt-1">
            {balances.find((b) => b.type === 'Casual Leave')?.used ?? 0} days utilized this year
          </p>
        </GlassCard>

        <GlassCard glow="cyan">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Medical Leave</span>
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {balanceFor('Medical Leave', 10)} / {balances.find((b) => b.type === 'Medical Leave')?.allowance ?? 10} Days
          </div>
          <p className="text-[11px] text-cyan-300 font-semibold mt-1">
            {balances.find((b) => b.type === 'Medical Leave')?.used ?? 0} days utilized this year
          </p>
        </GlassCard>

        <GlassCard glow="amber">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Emergency Leave</span>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {balanceFor('Emergency Leave', 5)} /{' '}
            {balances.find((b) => b.type === 'Emergency Leave')?.allowance ?? 5} Days
          </div>
          <p className="text-[11px] text-amber-300 font-semibold mt-1">Streak Protection active</p>
        </GlassCard>
      </div>

      {/* Leave History Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="p-4 bg-white/5 border-b border-white/10 font-bold text-white text-sm flex items-center justify-between">
          <span>Leave Request History</span>
          <Badge variant="primary">{leaveHistory.length} Total Requests</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-extrabold tracking-wider">
              <tr>
                <th className="p-4">Leave Type</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Applied On</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {leaveHistory.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    {req.type}
                  </td>
                  <td className="p-4 font-mono text-indigo-300">
                    {req.startDate} to {req.endDate}
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs truncate">{req.reason}</td>
                  <td className="p-4 text-slate-400">{req.appliedOn}</td>
                  <td className="p-4">
                    <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Pending' ? 'warning' : 'danger'}>
                      {req.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Leave Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit New Leave Application"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="Casual Leave">Casual Leave</option>
              <option value="Medical Leave">Medical Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Reason for Leave *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide a short explanation for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" icon={<Send className="w-4 h-4" />}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
