import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Target, Zap, Trophy, Wallet, GraduationCap, User } from 'lucide-react';

export const SMMBottomNav: React.FC = () => {
  const navItems = [
    { path: '/smm/home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { path: '/smm/missions', label: 'Missions', icon: <Target className="w-5 h-5" /> },
    { path: '/smm/rapid', label: 'Rapid', icon: <Zap className="w-5 h-5 text-amber-400 shrink-0" /> },
    { path: '/smm/career', label: 'Career', icon: <Trophy className="w-5 h-5" /> },
    { path: '/smm/wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { path: '/smm/academy', label: 'Academy', icon: <GraduationCap className="w-5 h-5" /> },
    { path: '/smm/profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
  ];

  return (
    <nav aria-label="SMM Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-1.5 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex justify-between items-center md:hidden overflow-x-auto scrollbar-none">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-1.5 py-1 rounded-xl transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              isActive
                ? 'text-cyan-400 font-bold bg-white/10 scale-105 shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`
          }
        >
          {item.icon}
          <span className="text-[10px] leading-none mt-1 whitespace-nowrap">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
