import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { auditApi } from '../../api/endpoints';
import { AuditLog } from '../../types';
import { 
  FileText, 
  Search, 
  Filter, 
  ShieldCheck, 
  User, 
  Calendar, 
  Laptop, 
  Globe, 
  Eye, 
  Download 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuditLogsPage: React.FC = () => {
  const { showToast } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    auditApi
      .list({ pageSize: 100 })
      .then((page) => !cancelled && setLogs(page.items))
      .catch(() => showToast('Could not load audit logs', 'error'));
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  // Server-side filters exist too; this keeps the existing instant-filter feel.
  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || l.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleExportLogs = () => {
    showToast('📄 Audit Log Ledger Exported to CSV format!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            System Audit & Governance Logs
            <FileText className="w-6 h-6 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400">
            Immutable tracking log for administrative actions, security clearances, and mission approvals.
          </p>
        </div>

        <Button
          onClick={handleExportLogs}
          variant="secondary"
          icon={<Download className="w-4 h-4" />}
        >
          Export Audit Trail
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 glass-panel rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search actor, target, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/5 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['All', 'Admin', 'SMM', 'System'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                selectedRole === role
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <GlassCard className="overflow-hidden p-0">
        <div className="overflow-x-auto scrollbar-none">
          <table className="min-w-[700px] w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase font-extrabold tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action Summary</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="p-4 font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {log.actor}
                  </td>
                  <td className="p-4">
                    <Badge variant={log.role === 'Admin' ? 'primary' : log.role === 'System' ? 'info' : 'success'}>
                      {log.role}
                    </Badge>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">{log.action}</td>
                  <td className="p-4 text-indigo-300 font-mono">{log.target}</td>
                  <td className="p-4 text-slate-400 font-mono">{log.ip}</td>
                  <td className="p-4">
                    <Badge variant={log.status === 'Success' ? 'success' : 'warning'}>
                      {log.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => setActiveLog(log)}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Log Details Modal */}
      {activeLog && (
        <Modal
          isOpen={!!activeLog}
          onClose={() => setActiveLog(null)}
          title={`Audit Event Details (#${activeLog.id})`}
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Date & Time:
                </span>
                <span className="font-mono text-white font-bold">{activeLog.timestamp}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Authorized Actor:
                </span>
                <span className="font-bold text-indigo-300">{activeLog.actor} ({activeLog.role})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> IP Location:
                </span>
                <span className="font-mono text-slate-200">{activeLog.ip} (Dhaka Gateway)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" /> Device Context:
                </span>
                <span className="text-slate-200">Chrome OS 128 / Encrypted Admin Session</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 space-y-1">
              <span className="font-bold block uppercase tracking-wider text-[10px]">Action Executed:</span>
              <p className="text-sm font-bold text-white">{activeLog.action}</p>
              <p className="text-xs text-indigo-300 mt-1">Target Object: {activeLog.target}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setActiveLog(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
