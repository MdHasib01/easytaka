import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  Package,
  Users,
  CheckSquare,
  Zap,
  ShieldCheck,
  UserCheck,
  Trophy,
  BarChart3,
  UserCog,
  Bell,
  Menu,
  LogOut,
  ArrowLeftCircle,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { areaFor } from '../../lib/auth';
import { AppLogo } from '../AppLogo';
import { BrandLogo } from '../BrandLogo';
import { UserAvatar } from '../common/UserAvatar';
import { ChatWidget } from '../chat/ChatWidget';
import { UserMenu } from './UserMenu';
import { Button } from '../ui/Button';
import logoImg from '../../assets/logo.png';

const PLATFORM_NAV = [
  { name: 'Overview', path: '/admin/overview', icon: LayoutGrid },
  { name: 'Brands', path: '/admin/brands', icon: Building2 },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Workforce', path: '/admin/workforce', icon: Users },
  { name: 'Missions', path: '/admin/missions', icon: CheckSquare },
  { name: 'Rapid Tasks', path: '/admin/rapid-tasks', icon: Zap },
  { name: 'Review Center', path: '/admin/review', icon: ShieldCheck },
  { name: 'Reviewer Mgmt', path: '/admin/reviewers', icon: UserCheck },
  { name: 'Gamification', path: '/admin/gamification', icon: Trophy },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { name: 'Manage Users', path: '/admin/users', icon: UserCog },
];

const BRAND_NAV = [
  { name: 'Overview', path: '/admin/brand/overview', icon: LayoutGrid },
  { name: 'Brand Details', path: '/admin/brand/details', icon: Building2 },
  { name: 'Products', path: '/admin/brand/products', icon: Package },
  { name: 'Workforce', path: '/admin/brand/workforce', icon: Users },
  { name: 'Missions', path: '/admin/brand/missions', icon: CheckSquare },
  { name: 'Rapid Tasks', path: '/admin/brand/rapid-tasks', icon: Zap },
  { name: 'Review Center', path: '/admin/brand/review', icon: ShieldCheck },
  { name: 'Reviewer Mgmt', path: '/admin/brand/reviewers', icon: UserCheck },
  { name: 'Gamification', path: '/admin/brand/gamification', icon: Trophy },
  { name: 'Reports', path: '/admin/brand/reports', icon: BarChart3 },
];

const PLATFORM_MOBILE_NAV = [
  { name: 'Overview', path: '/admin/overview', icon: LayoutGrid },
  { name: 'Brands', path: '/admin/brands', icon: Building2 },
  { name: 'Products', path: '/admin/products', icon: Package },
];

const BRAND_MOBILE_NAV = [
  { name: 'Overview', path: '/admin/brand/overview', icon: LayoutGrid },
  { name: 'Products', path: '/admin/brand/products', icon: Package },
  { name: 'Missions', path: '/admin/brand/missions', icon: CheckSquare },
];

export function AdminLayout() {
  const { session, canReturnToAdmin, returnToAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPlatform = session ? areaFor(session) === 'platform' : false;
  const userName = session?.user.name ?? (isPlatform ? 'Platform Admin' : 'Brand Admin');
  const basePath = isPlatform ? '/admin' : '/admin/brand';
  const homeUrl = isPlatform ? '/admin/overview' : '/admin/brand/overview';
  const profilePath = isPlatform ? '/admin/profile' : '/admin/brand/profile';
  const userSubtitle = isPlatform ? 'Platform Admin' : (session?.brand?.name ?? 'Brand Admin');

  const desktopNavItems = isPlatform ? PLATFORM_NAV : BRAND_NAV;
  const mobileNavItems = isPlatform ? PLATFORM_MOBILE_NAV : BRAND_MOBILE_NAV;

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const quickCreateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showQuickCreate) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (quickCreateRef.current && !quickCreateRef.current.contains(event.target as Node)) {
        setShowQuickCreate(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowQuickCreate(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showQuickCreate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const backToAdmin = async () => {
    await returnToAdmin();
    navigate('/admin/brands', { replace: true });
  };

  // Determine if a secondary module is active that's not in the main 4 mobile tabs
  const isMobileTabActive = mobileNavItems.some(item => location.pathname === item.path);
  const isMoreActive = !isMobileTabActive && location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans pb-20 md:pb-0 md:pl-64 text-slate-200">
      {/* Decorative ambient background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/10 blur-[120px]"></div>
      </div>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/10 md:hidden">
        {canReturnToAdmin && session?.brand && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs px-4 py-1.5 flex items-center justify-between">
            <span className="truncate">
              As <strong className="text-amber-100">{session.brand.name}</strong>
            </span>
            <button
              onClick={backToAdmin}
              className="flex items-center gap-1 font-semibold text-amber-100 hover:text-white shrink-0 ml-2"
            >
              <ArrowLeftCircle className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        )}
        <div className="px-4 h-16 flex items-center justify-between relative z-10">
          <AppLogo size="sm" href={homeUrl} />
          <div className="flex items-center gap-3">
            <button
              className="relative text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0B0F19]"></span>
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col bg-[#0B0F19]/95 backdrop-blur-xl border-r border-white/10">
        <div className="h-16 px-6 flex items-center border-b border-white/10">
          <AppLogo size="md" href={homeUrl} />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1 hide-scrollbar">
          {desktopNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3",
                  isActive ? "text-indigo-300" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-desktop-nav"
                    className="absolute inset-0 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4 relative z-10", isActive && "text-indigo-400")} />
                <span className="relative z-10">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Bottom User Profile Card */}
        <div className="p-3 border-t border-white/10 flex items-center gap-2.5 shrink-0">
          <div
            onClick={() => navigate(profilePath)}
            className="cursor-pointer group flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
            title="Click to edit profile"
          >
            <UserAvatar
              src={session?.user.avatar}
              name={userName}
              size="sm"
              className={cn(
                "transition-all",
                location.pathname === profilePath
                  ? "ring-2 ring-indigo-400"
                  : "group-hover:ring-indigo-400/50"
              )}
            />
            <div className="min-w-0 flex-1">
              <p className={cn(
                "text-sm font-semibold truncate transition-colors",
                location.pathname === profilePath
                  ? "text-indigo-300"
                  : "text-slate-200 group-hover:text-indigo-300"
              )}>
                {userName}
              </p>
              <p className="text-xs text-slate-500 truncate">{userSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(profilePath)}
            title="Edit profile"
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer",
              location.pathname === profilePath
                ? "text-indigo-300 bg-white/10"
                : "text-slate-500 hover:text-indigo-300 hover:bg-white/5"
            )}
          >
            <UserCog className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-500 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Desktop Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/10 hidden md:block">
        {canReturnToAdmin && session?.brand && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs sm:text-sm">
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-3">
              <span>
                You are logged in as <strong className="text-amber-100">{session.brand.name}</strong> Brand Admin
              </span>
              <button
                onClick={backToAdmin}
                className="flex items-center gap-1.5 font-semibold text-amber-100 hover:text-white shrink-0"
              >
                <ArrowLeftCircle className="w-4 h-4" /> Back to Admin
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {isPlatform ? (
              <div className="flex items-center gap-2.5">
                <img src={logoImg} alt="EasyTaka" className="w-5 h-5 object-contain" />
                <span className="text-sm font-medium text-indigo-300 tracking-wide">Platform Admin</span>
              </div>
            ) : (
              session?.brand && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <BrandLogo logo={session.brand.logo} className="w-5 h-5 text-xs rounded-md border border-white/10 shrink-0" />
                  <span className="text-sm font-semibold text-slate-200 truncate">
                    {session.brand.name}
                  </span>
                  <span className="text-xs text-indigo-300/80 font-medium tracking-wide hidden lg:inline">
                    Brand Admin
                  </span>
                </div>
              )
            )}
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            {/* Quick Create Dropdown */}
            <div className="relative" ref={quickCreateRef}>
              <Button
                onClick={() => setShowQuickCreate(!showQuickCreate)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] px-3.5 h-8 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Quick Create
              </Button>

              <AnimatePresence>
                {showQuickCreate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50 overflow-hidden backdrop-blur-xl"
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">
                      Create New...
                    </div>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                      onClick={() => {
                        setShowQuickCreate(false);
                        navigate(`${basePath}/products`);
                      }}
                    >
                      <Package className="w-4 h-4 text-indigo-400" /> Add Product
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                      onClick={() => {
                        setShowQuickCreate(false);
                        navigate(`${basePath}/workforce`);
                      }}
                    >
                      <Users className="w-4 h-4 text-emerald-400" /> Invite SMM
                    </button>
                    <div className="h-px bg-white/5 my-1 mx-2" />
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                      onClick={() => {
                        setShowQuickCreate(false);
                        navigate(`${basePath}/missions`);
                      }}
                    >
                      <CheckSquare className="w-4 h-4 text-violet-400" /> Create Mission
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                      onClick={() => {
                        setShowQuickCreate(false);
                        navigate(`${basePath}/rapid-tasks`);
                      }}
                    >
                      <Zap className="w-4 h-4 text-rose-400" /> Create Rapid Task
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              className="relative text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0B0F19]"></span>
            </button>

            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto md:px-6 md:py-8 p-4 relative z-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B0F19]/90 backdrop-blur-xl border-t border-white/10 pb-safe z-50">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
                  isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-mobile-nav"
                    className="absolute -top-[1px] w-8 h-1 bg-indigo-500 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                  />
                )}
                <item.icon className={cn("w-5 h-5", isActive && "fill-indigo-500/20")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </NavLink>
            );
          })}

          {/* More menu button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative cursor-pointer",
              isMoreActive || isMobileDrawerOpen ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {(isMoreActive && !isMobileDrawerOpen) && (
              <motion.div
                layoutId="admin-mobile-nav"
                className="absolute -top-[1px] w-8 h-1 bg-indigo-500 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
              />
            )}
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Accessible from "More") */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setIsMobileDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0B0F19]/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col md:hidden"
            >
              <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
                <AppLogo size="sm" href={homeUrl} />
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-1 hide-scrollbar">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">
                  All Modules
                </div>
                {desktopNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Mobile Drawer Bottom User Section */}
              <div className="p-3 border-t border-white/10 flex items-center gap-2.5 shrink-0">
                <div
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    navigate(profilePath);
                  }}
                  className="cursor-pointer group flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
                >
                  <UserAvatar src={session?.user.avatar} name={userName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-200 truncate">{userName}</p>
                    <p className="text-xs text-slate-500 truncate">{userSubtitle}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    navigate(profilePath);
                  }}
                  title="Edit profile"
                  className="p-1.5 text-slate-500 hover:text-indigo-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <UserCog className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 text-slate-500 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChatWidget launcherClassName="bottom-24 right-4 md:bottom-8 md:right-8" />
    </div>
  );
}
