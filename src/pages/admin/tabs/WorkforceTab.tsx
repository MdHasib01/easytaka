import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { UserAvatar } from '../../../components/common/UserAvatar';
import { api, errorMessage } from '../../../lib/api';
import { DIVISIONS } from '../../../lib/constants';
import {
  ShieldCheck,
  Eye,
  Search,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Award,
  Layers,
  Package,
  Sparkles,
  Mail,
  Phone,
} from 'lucide-react';
import type { SMM } from '../../../types';

function getProductName(prod: any): string {
  if (!prod) return 'Product';
  if (typeof prod === 'object' && prod.name) return prod.name;
  return typeof prod === 'string' ? prod.slice(-6) : 'Product';
}

interface SmmProfileModalProps {
  open: boolean;
  onClose: () => void;
  smm: SMM | null;
}

function SmmProfileModal({ open, onClose, smm }: SmmProfileModalProps) {
  if (!smm) return null;

  const displayName = smm.user?.name || smm.name || 'SMM Executive';
  const displayAvatar = smm.user?.avatar || smm.avatar;
  const isDivisionValid = smm.nidDivision !== smm.assignedWorkingDivision;
  const progressPercent = smm.managedIds > 0 ? Math.round((smm.approvedEnrichedIds / smm.managedIds) * 100) : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="SMM Profile & Telemetry"
      description="Live operational metrics, identity constraint status, and performance telemetry."
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Profile is read-only for administrators</span>
          </div>
          <Button variant="outline" onClick={onClose} className="px-5">
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        {/* Administrator Policy Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-slate-400 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Security Safeguard:</strong> Administrators and Brand Managers cannot edit
            SMM personal profile information. Identity documents, contact details, and credentials are encrypted and
            maintained exclusively by the account holder.
          </p>
        </div>

        {/* Profile Identity Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/5">
          <UserAvatar src={displayAvatar} name={displayName} size="xl" className="ring-2 ring-indigo-500/30" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white truncate">{displayName}</h3>
              <Badge variant={smm.status === 'Active' ? 'success' : 'error'}>{smm.status}</Badge>
              {smm.jobHolderUnlocked && (
                <Badge variant="outline" className="text-amber-300 border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Job Holder
                </Badge>
              )}
            </div>
            <p className="text-xs text-indigo-300">{smm.designation || 'SMM Executive'}</p>
            <div className="flex flex-wrap gap-y-1 gap-x-4 pt-1 text-xs text-slate-400">
              {smm.user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {smm.user.email}
                </span>
              )}
              {smm.user?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {smm.user.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Division Constraints Card */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Division Assignment Constraint
            </span>
            <Badge variant={isDivisionValid ? 'success' : 'error'}>
              {isDivisionValid ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Compliant
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Division Conflict
                </span>
              )}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Home NID Division</span>
              <p className="font-semibold text-white text-sm">{smm.nidDivision || 'Not Assigned'}</p>
              <p className="text-[11px] text-slate-500">Government identity legal domicile</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Assigned Working Division</span>
              <p className="font-semibold text-indigo-300 text-sm">{smm.assignedWorkingDivision || 'Not Assigned'}</p>
              <p className="text-[11px] text-slate-500">Active market operations zone</p>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
              <Award className="w-3.5 h-3.5 text-indigo-400" /> Level
            </div>
            <p className="text-xl font-bold text-white">{smm.level || 1}</p>
            <p className="text-[10px] text-slate-500">{smm.lifetimeXp || 0} Total XP</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Quality Score
            </div>
            <p className="text-xl font-bold text-emerald-400">{smm.qualityScore || 100}%</p>
            <p className="text-[10px] text-slate-500">Accuracy & Integrity</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Active Streak
            </div>
            <p className="text-xl font-bold text-amber-300">{smm.currentStreak || 0}d</p>
            <p className="text-[10px] text-slate-500">Consecutive Activity</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Managed IDs
            </div>
            <p className="text-xl font-bold text-white">{smm.managedIds || 0}</p>
            <p className="text-[10px] text-slate-500">{smm.approvedEnrichedIds || 0} Approved</p>
          </div>
        </div>

        {/* Hub ID Enrichment Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300">Identity Enrichment Progress</span>
            <span className="font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>{smm.approvedEnrichedIds || 0} Fully Approved</span>
            <span>{smm.managedIds || 0} Total Allocated</span>
          </div>
        </div>

        {/* Review Audit Breakdown */}
        {smm.reviewStats && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Quality Review Audit History
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <span className="block font-bold text-base">{smm.reviewStats.approved || 0}</span>
                <span className="text-[10px] text-emerald-400/80">Approved</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <span className="block font-bold text-base">{smm.reviewStats.revision || 0}</span>
                <span className="text-[10px] text-amber-400/80">Revisions</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <span className="block font-bold text-base">{smm.reviewStats.rejected || 0}</span>
                <span className="text-[10px] text-rose-400/80">Rejected</span>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Products */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            Assigned Brand Products ({smm.assignedProductIds?.length || 0})
          </span>
          {smm.assignedProductIds && smm.assignedProductIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {smm.assignedProductIds.map((prod, idx) => (
                <Badge
                  key={typeof prod === 'object' && prod?._id ? prod._id : idx}
                  variant="outline"
                  className="text-xs px-2.5 py-1 bg-slate-950/80 border-white/10 text-slate-200"
                >
                  {getProductName(prod)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No products assigned to this SMM yet.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function WorkforceTab() {
  const [smms, setSmms] = useState<SMM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Filters
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('quality');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  // SMM Details Modal (Read-Only)
  const [selectedSmm, setSelectedSmm] = useState<SMM | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Dynamic fetch from /api/smms
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedDivision) params.set('division', selectedDivision);
    if (selectedSort) params.set('sort', selectedSort);
    if (debouncedQuery) params.set('q', debouncedQuery);

    setLoading(true);
    api<SMM[]>(`/smms?${params.toString()}`)
      .then((data) => {
        setSmms(data || []);
        setError(null);
      })
      .catch((err) => {
        setError(errorMessage(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedDivision, selectedSort, debouncedQuery]);

  // Aggregate Metrics
  const totalSmms = smms.length;
  const activeSmms = smms.filter((s) => s.status === 'Active').length;
  const avgQuality = totalSmms > 0 ? Math.round(smms.reduce((acc, s) => acc + (s.qualityScore || 0), 0) / totalSmms) : 0;
  const totalManaged = smms.reduce((acc, s) => acc + (s.managedIds || 0), 0);

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Workforce Directory</span>
            <Badge variant="outline" className="text-xs text-indigo-300 border-indigo-500/30">
              Live SMM Roster
            </Badge>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time workforce monitoring, cross-division constraint verification, and performance telemetry.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <span className="text-slate-400">Total SMMs:</span>{' '}
            <strong className="text-white">{totalSmms}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <span className="text-slate-400">Active:</span>{' '}
            <strong className="text-emerald-400">{activeSmms}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <span className="text-slate-400">Avg Quality:</span>{' '}
            <strong className="text-indigo-300">{avgQuality}%</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <span className="text-slate-400">Total IDs:</span>{' '}
            <strong className="text-amber-300">{totalManaged}</strong>
          </div>
        </div>
      </div>

      {/* Division Logic Notice */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-4">
        <div className="mt-0.5">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-indigo-300">Division Assignment Policy Active</h4>
          <p className="text-xs text-indigo-200/70 mt-1">
            SMMs must be assigned to work in a division different from their National ID legal division. The system automatically
            verifies and flags any cross-division violations.
          </p>
        </div>
      </div>

      {/* Dynamic Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SMM by name or email..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 outline-none focus:border-indigo-500/60 cursor-pointer [&>option]:bg-slate-900"
          >
            <option value="">All Divisions</option>
            {DIVISIONS.map((d) => (
              <option key={d} value={d}>
                Division: {d}
              </option>
            ))}
          </select>

          {/* Performance Sort Filter */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 outline-none focus:border-indigo-500/60 cursor-pointer [&>option]:bg-slate-900"
          >
            <option value="quality">Sort: Quality Score</option>
            <option value="level">Sort: Highest Level</option>
            <option value="progress">Sort: ID Progress</option>
            <option value="newest">Sort: Newest</option>
          </select>

          {(selectedDivision || searchQuery || selectedSort !== 'quality') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDivision('');
                setSelectedSort('quality');
                setSearchQuery('');
              }}
              className="text-xs text-slate-400 hover:text-white whitespace-nowrap"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Workforce Dynamic Table */}
      <Card className="overflow-hidden border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[780px]">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">SMM Profile</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Division Constraint</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Products Assigned</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Hub Progress</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px]">Quality & Level</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && smms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
                    <span>Loading workforce directory...</span>
                  </td>
                </tr>
              ) : smms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    No SMMs found matching current filters.
                  </td>
                </tr>
              ) : (
                smms.map((smm) => {
                  const isDivisionValid = smm.nidDivision !== smm.assignedWorkingDivision;
                  const displayName = smm.user?.name || smm.name || 'SMM Executive';
                  const displayAvatar = smm.user?.avatar || smm.avatar;
                  const progressPct =
                    smm.managedIds > 0 ? Math.round((smm.approvedEnrichedIds / smm.managedIds) * 100) : 0;
                  const smmId = smm._id || smm.id;

                  return (
                    <tr key={smmId} className="hover:bg-slate-800/30 transition-colors">
                      {/* SMM Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={displayAvatar} name={displayName} size="md" />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-200 truncate">{displayName}</div>
                            <div className="text-xs text-slate-500 truncate">{smm.user?.email || smm.designation || 'SMM Executive'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Division Constraint */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 w-9 font-medium">NID:</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {smm.nidDivision || 'None'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 w-9 font-medium">Work:</span>
                            <Badge variant={isDivisionValid ? 'success' : 'error'} className="text-[10px]">
                              {smm.assignedWorkingDivision || 'None'}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      {/* Products Assigned */}
                      <td className="px-6 py-4">
                        {smm.assignedProductIds && smm.assignedProductIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {smm.assignedProductIds.map((prod, idx) => (
                              <Badge
                                key={typeof prod === 'object' && prod?._id ? prod._id : idx}
                                variant="outline"
                                className="text-[10px] bg-slate-950/80 border-white/10 text-slate-300"
                              >
                                {getProductName(prod)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>

                      {/* Hub Progress */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">
                              {smm.approvedEnrichedIds || 0} / {smm.managedIds || 0} IDs
                            </span>
                            <span className="font-bold text-emerald-400">{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Quality & Level */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Score:</span>
                            <span className="text-sm font-bold text-emerald-400">{smm.qualityScore || 100}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Level:</span>
                            <Badge variant="default" className="text-[10px] bg-indigo-500/20 text-indigo-300">
                              Lvl {smm.level || 1}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      {/* Read-Only Action: View Profile */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSmm(smm)}
                          className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          View Profile
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dynamic SMM Telemetry Modal (Read-Only) */}
      <SmmProfileModal
        open={Boolean(selectedSmm)}
        onClose={() => setSelectedSmm(null)}
        smm={selectedSmm}
      />
    </div>
  );
}
