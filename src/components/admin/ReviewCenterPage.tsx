import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { CheckSquare, CheckCircle, AlertTriangle, XCircle, ExternalLink, ShieldAlert, Eye, ZoomIn, Star, Sparkles } from 'lucide-react';
import { Mission } from '../../types';

export const ReviewCenterPage: React.FC = () => {
  const { missions, reviewMission, showToast } = useApp();
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});
  const [qualityScores, setQualityScores] = useState<Record<string, number>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedMissionForReview, setSelectedMissionForReview] = useState<Mission | null>(null);

  const submittedMissions = missions.filter(m => m.status === 'Submitted' || m.status === 'In Progress' || m.status === 'Revision Required');

  const handleAction = (missionId: string, status: 'Approved' | 'Rejected' | 'Revision Required', note?: string) => {
    reviewMission(missionId, status, note);
    if (selectedMissionForReview?.id === missionId) {
      setSelectedMissionForReview(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Proof Verification & Review Center
            <CheckSquare className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Audit submitted proof screenshots, engagement links, quality metrics, and verify payouts.
          </p>
        </div>

        <Badge variant="warning">
          Pending Reviews: {submittedMissions.filter(m => m.status === 'Submitted').length}
        </Badge>
      </div>

      <div className="space-y-4">
        {submittedMissions.map(m => {
          const currentQuality = qualityScores[m.id] ?? 95;

          return (
            <GlassCard key={m.id} glow="purple" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="text-xs font-bold text-indigo-300">🥛 {m.brandName} • {m.platform}</span>
                  <h3 className="text-base font-bold text-white">{m.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">Reward: ৳{m.monetaryReward} + {m.xpReward} XP</Badge>
                  <Badge variant={m.status === 'Submitted' ? 'warning' : 'info'}>{m.status}</Badge>
                </div>
              </div>

              {m.submissionProof ? (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Mock Screenshot Thumbnail */}
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80"
                        alt="Proof Screenshot"
                        className="w-full h-full object-cover group-hover:scale-105 transition-all"
                      />
                      <button
                        onClick={() => setPreviewImage("https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80")}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <ZoomIn className="w-4 h-4 text-cyan-400" /> Zoom Screenshot
                      </button>
                    </div>

                    <div className="md:col-span-2 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-400 font-bold">Proof Link:</span>
                        <a
                          href={m.submissionProof.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 underline hover:text-cyan-300 truncate font-semibold"
                        >
                          {m.submissionProof.url}
                        </a>
                      </div>

                      <div className="text-slate-300">
                        <strong className="text-white">SMM Notes:</strong> {m.submissionProof.note}
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Submitted at: {m.submissionProof.submittedAt}
                      </div>
                    </div>
                  </div>

                  {m.status === 'Submitted' && (
                    <div className="space-y-3 pt-3 border-t border-white/10">
                      {/* Quality Score Slider */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Quality Score Rating:
                          </span>
                          <span className="text-emerald-400">{currentQuality}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={currentQuality}
                          onChange={(e) => setQualityScores({ ...qualityScores, [m.id]: Number(e.target.value) })}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Reviewer note or feedback for SMM (optional)..."
                        value={feedbackInput[m.id] || ''}
                        onChange={(e) => setFeedbackInput({ ...feedbackInput, [m.id]: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />

                      <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="danger"
                          icon={<XCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleAction(m.id, 'Rejected', feedbackInput[m.id])}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="warning"
                          icon={<AlertTriangle className="w-3.5 h-3.5" />}
                          onClick={() => handleAction(m.id, 'Revision Required', feedbackInput[m.id] || 'Please upload higher clarity screenshot or active group URL.')}
                        >
                          Request Revision
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          icon={<CheckCircle className="w-3.5 h-3.5" />}
                          onClick={() => handleAction(m.id, 'Approved', feedbackInput[m.id])}
                        >
                          Approve & Pay (+৳{m.monetaryReward})
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white/5 text-xs text-slate-400 italic">
                  SMM is currently executing this mission. Proof has not been uploaded yet.
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Proof Screenshot Zoom Modal */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title="Submitted Proof Screenshot (High Resolution)"
        >
          <div className="space-y-3 text-center">
            <div className="rounded-2xl overflow-hidden border border-white/20 max-h-[70vh] flex items-center justify-center bg-black">
              <img src={previewImage} alt="Proof Zoomed" className="w-full h-full object-contain" />
            </div>
            <Button variant="secondary" onClick={() => setPreviewImage(null)}>
              Close Image Viewer
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
