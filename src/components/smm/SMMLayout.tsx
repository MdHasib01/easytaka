import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SMMHeader } from './SMMHeader';
import { SMMBottomNav } from './SMMBottomNav';
import { LevelUpModal } from '../common/LevelUpModal';
import { ToastContainer } from '../common/ToastContainer';
import { useApp } from '../../context/AppContext';
import { Home, Target, Zap, Trophy, Wallet, GraduationCap, User, ShieldCheck, TrendingUp, Calendar, AlertCircle, HelpCircle, X } from 'lucide-react';

interface SMMLayoutProps {
  children: React.ReactNode;
}

export const SMMLayout: React.FC<SMMLayoutProps> = ({ children }) => {
  const { user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { path: '/smm/home', label: 'Home Dashboard', icon: <Home className="w-5 h-5 shrink-0" /> },
    { path: '/smm/missions', label: 'Missions', icon: <Target className="w-5 h-5 shrink-0" /> },
    { path: '/smm/rapid', label: 'Rapid Blitzes', icon: <Zap className="w-5 h-5 text-amber-400 shrink-0" /> },
    { path: '/smm/salary-progress', label: 'Salary Progress', icon: <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" /> },
    { path: '/smm/career', label: 'Career & Badges', icon: <Trophy className="w-5 h-5 shrink-0" /> },
    { path: '/smm/wallet', label: 'Wallet & Payouts', icon: <Wallet className="w-5 h-5 shrink-0" /> },
    { path: '/smm/academy', label: 'Academy & Skills', icon: <GraduationCap className="w-5 h-5 shrink-0" /> },
    { path: '/smm/leave', label: 'Leave Requests', icon: <Calendar className="w-5 h-5 shrink-0" /> },
    { path: '/smm/appeals', label: 'Appeals', icon: <AlertCircle className="w-5 h-5 shrink-0" /> },
    { path: '/smm/support', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5 shrink-0" /> },
    { path: '/smm/profile', label: 'My Profile', icon: <User className="w-5 h-5 shrink-0" /> }
  ];

  return (
    <div className="h-screen w-screen bg-[#05060A] text-slate-100 flex relative overflow-hidden">
      {/* Geometric Balance ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Desktop & Mobile Sidebar Navigation */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-50 h-full w-64 shrink-0 flex flex-col
          glass-panel border-r border-white/10 p-5 backdrop-blur-2xl bg-slate-950/95 md:bg-white/5
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0 flex items-center justify-center">
              <span className="text-xl font-black text-white">৳</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-1">
                EasyTaka
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </h2>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                SMM WORKFORCE
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav aria-label="SMM Navigation" className="space-y-1.5 flex-1 overflow-y-auto pr-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 mt-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs shrink-0">
          <div className="font-bold text-indigo-300 truncate">{user?.name || 'SMM Specialist'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">District: {user?.district || 'Central'} • Lvl {user?.level || 1}</div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-full z-10 overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <SMMHeader onToggleMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto min-h-0">
          {children}
        </main>
      </div>

      <SMMBottomNav />
      <LevelUpModal />
      <ToastContainer />
    </div>
  );
};
