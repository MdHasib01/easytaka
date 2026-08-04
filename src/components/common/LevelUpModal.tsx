import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Trophy, Sparkles, Award, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LevelUpModal: React.FC = () => {
  const { levelUpModalOpen, setLevelUpModalOpen, user } = useApp();

  return (
    <Modal
      isOpen={levelUpModalOpen}
      onClose={() => setLevelUpModalOpen(false)}
      maxWidth="md"
    >
      <div className="text-center py-4 space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 p-1 shadow-2xl shadow-amber-500/50 animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Trophy className="w-12 h-12 text-amber-400" />
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
            LEVEL UP CELEBRATION!
          </span>
          <h2 className="text-3xl font-black text-white mt-2">
            You Reached Level {user.level}! 🎉
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Your performance quality score ({user.qualityScore}%) and dedication earned you a rank upgrade!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>New Title Unlocked:</span>
            <span className="text-purple-300 font-bold">{user.title}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Next Salary Tier Multiplier:</span>
            <span className="text-emerald-400 font-bold">+৳500 / Month</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Unlocked Skill Tree Point:</span>
            <span className="text-cyan-300 font-bold">1 Skill Token</span>
          </div>
        </div>

        <Button
          onClick={() => setLevelUpModalOpen(false)}
          variant="gradient"
          size="lg"
          className="w-full"
          icon={<Award className="w-5 h-5" />}
        >
          Claim Level Rewards & Continue
        </Button>
      </div>
    </Modal>
  );
};
