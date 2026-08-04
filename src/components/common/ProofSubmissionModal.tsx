import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Mission } from '../../types';
import { useApp } from '../../context/AppContext';
import { Upload, Link as LinkIcon, FileText, CheckCircle } from 'lucide-react';

interface ProofSubmissionModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProofSubmissionModal: React.FC<ProofSubmissionModalProps> = ({
  mission,
  isOpen,
  onClose
}) => {
  const { submitMissionProof } = useApp();
  const [proofUrl, setProofUrl] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!mission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) return;

    setIsSubmitting(true);
    try {
      await submitMissionProof(mission.id, proofUrl, note);
      setProofUrl('');
      setNote('');
      onClose();
    } catch {
      // submitMissionProof already surfaced the reason via a toast.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submit Proof: ${mission.title}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
          <strong>Proof Requirement:</strong> {mission.proofRequirement}
        </div>

        <div>
          <label htmlFor="proof-url-input" className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
            Social Media Post / Group Comment Link *
          </label>
          <input
            id="proof-url-input"
            type="url"
            required
            placeholder="https://facebook.com/groups/milkimom/posts/123456"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div>
          <label id="upload-label" className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            Upload Screenshot Proof (Simulated Drag & Drop)
          </label>
          <div
            tabIndex={0}
            role="button"
            aria-labelledby="upload-label"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
              }
            }}
            className="border-2 border-dashed border-white/20 hover:border-indigo-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl p-6 text-center bg-slate-900/40 cursor-pointer transition-colors"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-semibold">
              Click to browse or drag & drop proof image
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">PNG, JPG up to 5MB</p>
          </div>
        </div>

        <div>
          <label htmlFor="proof-note-input" className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Notes or Highlights for Admin Reviewer
          </label>
          <textarea
            id="proof-note-input"
            rows={3}
            placeholder="e.g. Posted in 3 major Jashore mother care groups with 45 total engagements..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            isLoading={isSubmitting}
            icon={<CheckCircle className="w-4 h-4" />}
          >
            Submit for Review (+{mission.xpReward} XP)
          </Button>
        </div>
      </form>
    </Modal>
  );
};
