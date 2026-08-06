import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';
import { AppRole } from '../../types';

const DEV_ACCOUNTS = [
  { label: 'Super Admin', email: 'sumon@easytaka.com', password: 'Admin@123' },
  { label: 'Finance Manager', email: 'nasrin@easytaka.com', password: 'Admin@123' },
  { label: 'SMM — Rafi Islam', email: 'rafi.islam@easytaka.smm', password: 'Smm@1234' }
];

const homeFor = (role: AppRole) => (role === 'admin' ? '/admin/command-center' : '/smm/home');

export const LoginPage: React.FC = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in — go where they were headed, or their role's home.
  if (!loading && user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? homeFor(user.role as AppRole)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const signedIn = await login(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? homeFor(signedIn.role as AppRole), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDevAccount = (account: (typeof DEV_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-[25%] right-[15%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-5">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">EasyTaka</h1>
            <p className="text-sm text-slate-400">SMM Workforce Operations Platform</p>
          </div>
        </div>

        <GlassCard className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white">Sign in</h2>
            <p className="text-xs text-slate-400 mt-0.5">Use your EasyTaka credentials to continue.</p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@easytaka.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              isLoading={submitting}
              icon={<LogIn className="w-4 h-4" />}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </GlassCard>

        <GlassCard className="space-y-2.5">
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
            Development accounts
          </div>
          <div className="space-y-1.5">
            {DEV_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDevAccount(account)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
              >
                <span className="text-xs font-bold text-white">{account.label}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate">{account.email}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500">
            Click to fill the form. Seeded by <code className="text-slate-400">npm run seed</code>.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
