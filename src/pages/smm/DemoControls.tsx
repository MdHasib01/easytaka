import React, { useState } from 'react';
import { useSMM } from '../../contexts/SMMContext';
import { Settings, X, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function DemoControls() {
  const [isOpen, setIsOpen] = useState(false);
  const { smm, accounts, addXP, setApprovedIdCount, resetDemo, demoAction, simulateReview } = useSMM();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-xl z-50 hover:bg-rose-500 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-80 bg-slate-900 border border-rose-500/50 p-5 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="absolute inset-0 bg-rose-500/5 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-bold text-rose-400 flex items-center gap-2">
          <Settings className="w-4 h-4" /> Demo Controls
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">Set Approved IDs (Current: {smm.approvedEnrichedIds})</label>
          <div className="flex gap-2">
            {[16, 19, 20].map(count => (
              <Button 
                key={count} 
                size="sm" 
                variant="secondary" 
                onClick={() => setApprovedIdCount(count)}
                className="flex-1 text-xs"
              >
                Set {count}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">Add Global XP</label>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => addXP(50)}
            className="w-full text-xs"
          >
            <Plus className="w-3 h-3 mr-1" /> Add 50 XP
          </Button>
        </div>

        <div className="pt-2 mt-2 border-t border-white/10">
          <Button 
            size="sm" 
            variant="danger" 
            onClick={resetDemo}
            className="w-full text-xs opacity-80"
          >
            Reset All Data
          </Button>
        </div>
      </div>
    </div>
  );
}
