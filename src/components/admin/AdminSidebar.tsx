import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  Zap,
  ClipboardCheck,
  GraduationCap,
  Trophy,
  Wallet,
  Banknote,
  BarChart3,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { path: '/admin/command-center', label: 'Command Center', icon: LayoutDashboard },
  { path: '/admin/brands', label: 'Brands', icon: Building2 },
  { path: '/admin/workforce', label: 'Workforce', icon: Users },
  { path: '/admin/missions', label: 'Missions', icon: Target },
  { path: '/admin/rapid-center', label: 'Rapid Center', icon: Zap },
  { path: '/admin/review-center', label: 'Review Center', icon: ClipboardCheck },
  { path: '/admin/academy', label: 'Academy', icon: GraduationCap },
  { path: '/admin/gamification', label: 'Gamification', icon: Trophy },
  { path: '/admin/wallet', label: 'Wallet', icon: Wallet },
  { path: '/admin/payroll', label: 'Payroll', icon: Banknote },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { path: '/admin/settings', label: 'Settings', icon: Settings }
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  onCloseMobile
}) => {
  const width = collapsed ? 'md:w-[76px]' : 'md:w-64';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Admin Navigation"
        className={`fixed md:sticky top-0 left-0 z-50 h-screen shrink-0 flex flex-col
          bg-slate-950/90 md:bg-white/[0.03] backdrop-blur-2xl border-r border-white/10
          transition-[transform,width] duration-300 ease-out
          w-64 ${width}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 h-16 shrink-0 border-b border-white/10">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="font-black text-white leading-none truncate">EasyTaka</div>
              <div className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mt-1">
                Admin Console
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="md:hidden ml-auto p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                 ${collapsed ? 'md:justify-center md:px-0' : ''}
                 ${
                   isActive
                     ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                     : 'text-slate-400 border border-transparent hover:text-white hover:bg-white/5'
                 }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden md:block border-t border-white/10 p-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
