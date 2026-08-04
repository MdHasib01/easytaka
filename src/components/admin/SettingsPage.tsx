import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Settings, Shield, Bell, Lock, Database } from 'lucide-react';
import { auditApi, settingsApi } from '../../api/endpoints';
import { AuditLog, SystemSettingItem } from '../../types';

export const SettingsPage: React.FC = () => {
  const [sampleAuditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [settings, setSettings] = React.useState<SystemSettingItem[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    Promise.all([auditApi.recent(6), settingsApi.list()])
      .then(([logs, rows]) => {
        if (cancelled) return;
        setAuditLogs(logs);
        setSettings(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /** Reads a persisted setting, falling back to the value the page used to hardcode. */
  const setting = (key: string, fallback: string | number | boolean) =>
    settings.find((s) => s.key === key)?.value ?? fallback;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          System Settings & Audit Logs
          <Settings className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-sm text-slate-400">
          Platform configurations, fraud thresholds, and security audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Quality & Fraud Prevention Thresholds
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <div>
                <div className="font-bold text-white">Minimum Quality Score Threshold</div>
                <div className="text-slate-400 text-[10px]">Auto-flags SMMs dropping below threshold</div>
              </div>
              <span className="font-black text-amber-400 text-sm">{setting('quality.minScore', 80)}%</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <div>
                <div className="font-bold text-white">Rapid Mission Verification Window</div>
                <div className="text-slate-400 text-[10px]">Maximum time allowed for proof submission</div>
              </div>
              <span className="font-black text-cyan-300 text-sm">
                {setting('rapid.verificationWindowMins', 30)} Mins
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
              <div>
                <div className="font-bold text-white">IP Cluster Dup Detection</div>
                <div className="text-slate-400 text-[10px]">Strict check against duplicate proof submissions</div>
              </div>
              <Badge variant={setting('fraud.ipClusterDetection', true) ? 'success' : 'danger'}>
                {setting('fraud.ipClusterDetection', true) ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            System Audit Log Stream
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
            {sampleAuditLogs.map(log => (
              <div key={log.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>{log.actor}</span>
                  <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                </div>
                <div className="text-indigo-300">{log.action}</div>
                <div className="text-[10px] text-slate-400">Target: {log.target} • IP: {log.ip}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
