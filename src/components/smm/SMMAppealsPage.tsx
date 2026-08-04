import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { appealsApi } from '../../api/endpoints';
import { AppealItem } from '../../types';
import { 
  AlertCircle, 
  Plus, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  Clock 
} from 'lucide-react';

export const SMMAppealsPage: React.FC = () => {
  const { showToast } = useApp();
  const [appeals, setAppeals] = useState<AppealItem[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [missionTitle, setMissionTitle] = useState('Milkimom Breastfeeding Reel');
  const [appealType, setAppealType] = useState<AppealItem['type']>('Incorrect Rejection');
  const [explanation, setExplanation] = useState('');

  React.useEffect(() => {
    let cancelled = false;
    appealsApi
      .list()
      .then((rows) => !cancelled && setAppeals(rows))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation) return;

    setSubmitting(true);
    try {
      // No client-side decisionNote — the mock fabricated "Assigned to Senior
      // Admin..." at submission time, before anyone had actually looked at it.
      const created = await appealsApi.create({ missionTitle, type: appealType, explanation });
      setAppeals((prev) => [created, ...prev]);
      setIsSubmitModalOpen(false);
      setExplanation('');
      showToast('⚖️ Dispute Appeal Submitted! EasyTaka Audit team will review within 24h.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not submit appeal', 'error');
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
            Dispute & Review Appeals
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Submit a formal dispute if your mission proof was unfairly rejected or payout was miscalculated.
          </p>
        </div>

        <Button
          onClick={() => setIsSubmitModalOpen(true)}
          variant="gradient"
          icon={<Plus className="w-4 h-4" />}
        >
          Submit New Appeal
        </Button>
      </div>

      {/* Appeals List */}
      <div className="space-y-4">
        {appeals.map((item) => (
          <GlassCard key={item.id} glow="purple" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">{item.missionTitle}</h3>
                  <span className="text-xs text-slate-400 font-mono">Appeal Ref: {item.ref ?? item.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.type === 'Incorrect Rejection' ? 'warning' : 'primary'}>
                  {item.type}
                </Badge>
                <Badge variant={item.status === 'Resolved' ? 'success' : item.status === 'Under Review' ? 'info' : 'danger'}>
                  {item.status}
                </Badge>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <div>
                <span className="font-bold text-slate-400 block mb-0.5">Your Dispute Statement:</span>
                <p className="p-3 rounded-xl bg-white/5 border border-white/5 leading-relaxed text-slate-200">
                  {item.explanation}
                </p>
              </div>

              {item.decisionNote && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-white text-[11px]">Audit Team Note:</span>
                    {item.decisionNote}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Submit Appeal Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Mission Dispute Appeal"
      >
        <form onSubmit={handleSubmitAppeal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Related Mission Title *</label>
            <input
              type="text"
              required
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Dispute Category</label>
            <select
              value={appealType}
              onChange={(e) => setAppealType(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="Incorrect Rejection">Incorrect Rejection</option>
              <option value="Reward Mismatch">Reward Mismatch</option>
              <option value="Penalty Dispute">Penalty Dispute</option>
              <option value="System Glitch">System Glitch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Detailed Explanation & Proof Link *</label>
            <textarea
              required
              rows={4}
              placeholder="Explain why the rejection was incorrect. Include public post links or screenshot URLs..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" icon={<Send className="w-4 h-4" />}>
              Submit Appeal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
