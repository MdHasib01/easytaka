import React from 'react';
import { Menu, Search, Bell, ShieldCheck, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, detailedRole, notifications } = useApp();
  const { logout } = useAuth();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 flex items-center gap-3 px-3 sm:px-4 md:px-6 bg-slate-950/70 backdrop-blur-2xl border-b border-white/10">
      <button
        type="button"
        onClick={onToggleMobileMenu}
        aria-label="Open navigation"
        className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="search"
          placeholder="Search brands, missions, specialists..."
          aria-label="Search"
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent transition-shadow"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        <button
          type="button"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
          className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-slate-950">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l border-white/10">
          <img
            src={user.avatar}
            alt=""
            className="w-9 h-9 rounded-xl object-cover border border-white/20 shrink-0"
          />
          <div className="hidden sm:block min-w-0">
            <div className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">
              {user.name}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[120px]">{detailedRole}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
