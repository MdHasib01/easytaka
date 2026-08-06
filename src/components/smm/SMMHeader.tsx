import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, Flame, Sparkles, LogOut, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface SMMHeaderProps {
  onToggleMobileMenu?: () => void;
}

export const SMMHeader: React.FC<SMMHeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, notifications } = useApp();
  const { logout } = useAuth();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 flex items-center gap-3 px-3 sm:px-4 md:px-6 bg-slate-950/70 backdrop-blur-2xl border-b border-white/10">
      {onToggleMobileMenu && (
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
      <Link to="/smm/profile" className="flex items-center gap-2.5 min-w-0 group">
        <img
          src={user.avatar}
          alt=""
          className="w-9 h-9 rounded-xl object-cover border border-white/20 shrink-0 group-hover:border-cyan-400/60 transition-colors"
        />
        <div className="min-w-0">
          <div className="text-sm font-bold text-white leading-tight truncate max-w-[150px]">
            {user.name}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 truncate max-w-[150px]">
            {user.title} • {user.district}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 ml-auto">
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">
          <Flame className="w-3.5 h-3.5 shrink-0" />
          {user.streak}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/30 bg-purple-500/20 px-2.5 py-1 text-xs font-bold text-purple-200">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          Lv {user.level}
        </span>

        <NavLink
          to="/smm/notifications"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
          className={({ isActive }) =>
            `relative p-2 rounded-xl transition-colors ${
              isActive ? 'text-cyan-400 bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`
          }
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-slate-950">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </NavLink>

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
    </header>
  );
};
