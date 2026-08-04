import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { BarChart3, Download, FileText, TrendingUp, ShieldCheck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Intelligence & Reports
            <BarChart3 className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Export district engagement, brand ROI, and workforce performance reports.
          </p>
        </div>

        <Button variant="gradient" icon={<Download className="w-4 h-4" />}>
          Export Full Monthly Report (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard glow="purple" className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <FileText className="w-4 h-4" />
            Milkimom Campaign Audit
          </div>
          <p className="text-xs text-slate-300">
            Comprehensive audit report of 24 active Facebook & Instagram community awareness campaigns across 8 districts.
          </p>
          <Button size="sm" variant="glass" className="w-full">
            Download Milkimom PDF
          </Button>
        </GlassCard>

        <GlassCard glow="cyan" className="space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            District Quality Matrix
          </div>
          <p className="text-xs text-slate-300">
            Detailed quality scores, trust indices, and task completion speed breakdown per Bangladesh division.
          </p>
          <Button size="sm" variant="glass" className="w-full">
            Download Quality CSV
          </Button>
        </GlassCard>

        <GlassCard glow="emerald" className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            Fraud Prevention Summary
          </div>
          <p className="text-xs text-slate-300">
            Audit logs detailing suspicious activity prevention, auto-flagged proofs, and quality enforcement.
          </p>
          <Button size="sm" variant="glass" className="w-full">
            Download Security Log
          </Button>
        </GlassCard>
      </div>
    </div>
  );
};
