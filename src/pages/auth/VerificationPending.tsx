import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Loader2, LogOut, RefreshCw, ShieldX } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { AuthShell } from './AuthShell';

export default function VerificationPending() {
  const { session, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const verification = session?.smm?.verification;
  const rejected = verification?.status === 'Rejected';

  // Once approved, RequireAuth moves the SMM on to their workspace.
  const check = async () => {
    setChecking(true);
    await refresh();
    setCheckedAt(new Date());
    setChecking(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AuthShell title={rejected ? 'NID verification rejected' : 'Verification pending'}>
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={
            rejected
              ? 'w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center'
              : 'w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center'
          }
        >
          {rejected ? <ShieldX className="w-8 h-8 text-rose-400" /> : <Clock className="w-8 h-8 text-amber-400" />}
        </div>

        {rejected ? (
          <>
            <p className="text-sm text-slate-300">
              An admin could not verify the National ID you uploaded, so your SMM workspace is locked.
            </p>
            {verification?.note && (
              <div className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300 mb-1">Reason</p>
                <p className="text-sm text-slate-200">{verification.note}</p>
              </div>
            )}
            <p className="text-xs text-slate-500">Contact your brand admin to resolve this.</p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-300">
              Thanks for registering{session ? `, ${session.user.name}` : ''}! An admin is reviewing your National ID.
              Your SMM workspace unlocks as soon as it is approved.
            </p>
            {checkedAt && (
              <p className="text-xs text-slate-500">
                Still pending as of {checkedAt.toLocaleTimeString()}.
              </p>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
          <Button className="flex-1" onClick={check} disabled={checking}>
            {checking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Check status
          </Button>
          <Button variant="secondary" className="flex-1" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Log out
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
