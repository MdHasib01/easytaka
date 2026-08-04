import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { ticketsApi } from '../../api/endpoints';
import { PriorityLevel, SupportTicket } from '../../types';
import { 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  Wallet, 
  Target, 
  ShieldCheck, 
  Send,
  LifeBuoy
} from 'lucide-react';

const faqItems = [
  {
    q: 'When are monthly base salaries paid out?',
    a: 'Base salaries are disbursed directly to your verified bKash or Nagad wallet on the 1st day of every month after payroll locking.'
  },
  {
    q: 'How do Rapid Blitz Mission rewards work?',
    a: 'Rapid Blitz earnings accumulate immediately in your Instant Wallet once the review team verifies your submission.'
  },
  {
    q: 'What happens if my Quality Score falls below 80%?',
    a: 'Your account enters an At-Risk grace period. Completing required Academy refresher courses restores your tier level.'
  },
  {
    q: 'How do I unlock higher salary allowance badges?',
    a: 'Achieve mission completion milestones, maintain unbroken daily streaks, and complete brand certifications.'
  }
];

export const SMMSupportPage: React.FC = () => {
  const { showToast } = useApp();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('Wallet & Payout');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    let cancelled = false;
    ticketsApi
      .list()
      .then((rows) => !cancelled && setTickets(rows))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setSubmitting(true);
    try {
      const created = await ticketsApi.create({ subject, category, priority, message });
      setTickets((prev) => [created, ...prev]);
      setIsTicketModalOpen(false);
      setSubject('');
      setMessage('');
      showToast('🎧 Support Ticket Created! An EasyTaka help agent will respond shortly.', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not create ticket', 'error');
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
            Help & Workforce Support
            <LifeBuoy className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            24/7 dedicated support desk for EasyTaka remote SMM workforce.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => showToast('📞 Emergency Hotline: +880 9612-EASYTAKA', 'info')}
            variant="glass"
            icon={<PhoneCall className="w-4 h-4 text-emerald-400" />}
          >
            Hotline
          </Button>
          <Button
            onClick={() => setIsTicketModalOpen(true)}
            variant="gradient"
            icon={<Plus className="w-4 h-4" />}
          >
            Create Support Ticket
          </Button>
        </div>
      </div>

      {/* Support Categories Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glow="emerald" className="cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsTicketModalOpen(true)}>
          <Wallet className="w-6 h-6 text-emerald-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Wallet & Payouts</h3>
          <p className="text-[11px] text-slate-400 mt-1">bKash, Nagad, withdrawal status</p>
        </GlassCard>

        <GlassCard glow="purple" className="cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsTicketModalOpen(true)}>
          <Target className="w-6 h-6 text-indigo-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Mission Help</h3>
          <p className="text-[11px] text-slate-400 mt-1">Proof uploads, link validation</p>
        </GlassCard>

        <GlassCard glow="cyan" className="cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsTicketModalOpen(true)}>
          <ShieldCheck className="w-6 h-6 text-cyan-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Account & Badges</h3>
          <p className="text-[11px] text-slate-400 mt-1">Level calculation, streak reset</p>
        </GlassCard>

        <GlassCard glow="amber" className="cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setIsTicketModalOpen(true)}>
          <LifeBuoy className="w-6 h-6 text-amber-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Emergency Help</h3>
          <p className="text-[11px] text-slate-400 mt-1">Immediate admin escalation</p>
        </GlassCard>
      </div>

      {/* Ticket History */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-3">
          <span>Active Support Tickets</span>
          <Badge variant="primary">{tickets.length} Tickets</Badge>
        </h3>

        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-sm">{t.subject}</span>
                  <span className="text-xs text-slate-400 font-mono">({t.ref ?? t.id})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={t.priority === 'Urgent' ? 'danger' : 'info'}>{t.priority}</Badge>
                  <Badge variant={t.status === 'Resolved' ? 'success' : 'warning'}>{t.status}</Badge>
                </div>
              </div>

              <p className="text-xs text-slate-300 pl-6 border-l-2 border-indigo-500/40">
                {t.lastMessage}
              </p>

              <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                <span>Category: {t.category}</span>
                <span>Created: {t.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* FAQ Accordion */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-400" /> Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={idx} className="rounded-2xl bg-white/5 border border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex justify-between items-center text-xs font-bold text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-2">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Create New Support Ticket"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Delayed payout for July 2026"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Wallet & Payout">Wallet & Payout</option>
                <option value="Mission Issue">Mission Issue</option>
                <option value="Account & Device">Account & Device</option>
                <option value="Emergency Help">Emergency Help</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Message Body *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe your question or technical problem in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsTicketModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" icon={<Send className="w-4 h-4" />}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
