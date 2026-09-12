import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { UserMenu } from './UserMenu';
import { Home, Layers, CalendarCheck, Zap, MessageSquare, Trophy, Gift, Wallet, Bell, Menu, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { DemoControls } from '../../pages/smm/DemoControls';
import { useSMM } from '../../contexts/SMMContext';
import { useAuth } from '../../contexts/AuthContext';
import { initials } from '../../lib/auth';
import { AnimatePresence } from 'motion/react';

export function SMMLayout() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const userName = session?.user.name ?? 'SMM';
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const { notifications } = useSMM();
  const topNotifications = notifications.slice(0, 3);
  const navItems = [
    { name: 'Home', path: '/smm/home', icon: Home },
    { name: 'Hub', path: '/smm/hub', icon: Layers },
    { name: 'Missions', path: '/smm/missions', icon: CalendarCheck },
    { name: 'Messages', path: '/smm/messages', icon: MessageSquare },
    { name: 'More', path: '/smm/more', icon: Menu },
  ];

  const desktopNavItems = [
    { name: 'Home', path: '/smm/home', icon: Home },
    { name: 'Hub', path: '/smm/hub', icon: Layers },
    { name: 'Missions', path: '/smm/missions', icon: CalendarCheck },
    { name: 'Rapid', path: '/smm/rapid-tasks', icon: Zap },
    { name: 'Messages', path: '/smm/messages', icon: MessageSquare },
    { name: 'Career', path: '/smm/career', icon: Trophy },
    { name: 'Rewards', path: '/smm/rewards', icon: Gift },
    { name: 'Wallet', path: '/smm/wallet', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans pb-20 md:pb-0 md:pl-64 text-slate-200">
      {/* Decorative ambient background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]"></div>
      </div>

        {/* Mobile Top Header */}
        <header className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/10 md:hidden">
          <div className="px-4 h-16 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_10px_rgba(79,70,229,0.5)]">
                {initials(userName)}
              </div>
              <span className="font-semibold text-slate-200">{userName}</span>
            </div>
            <div className="flex items-center gap-3">
               <button className="relative text-slate-400 hover:text-white transition-colors">
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
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-tight">EASYTAKA</h1>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
            {desktopNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "relative px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3",
                  isActive ? "text-indigo-300" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="smm-desktop-nav"
                        className="absolute inset-0 bg-indigo-500/10 rounded-lg border border-indigo-500/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <item.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_15px_rgba(79,70,229,0.3)] shrink-0">
              <div className="w-full h-full bg-indigo-900 flex items-center justify-center text-indigo-300 font-bold text-sm">
                {initials(userName)}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{session?.brand?.name ?? 'SMM Workspace'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 text-slate-500 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Desktop Top Bar */}
        <header className="sticky top-0 z-40 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/10 hidden md:block">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">
            <span className="text-sm font-medium text-indigo-300 tracking-wide">SMM Workspace</span>
            <div className="flex items-center gap-4">
              <button className="relative text-slate-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0B0F19]"></span>
              </button>
              <UserMenu />
            </div>
          </div>
        </header>
        
        <main className="flex-1 w-full max-w-7xl mx-auto md:px-6 md:py-8 p-4 relative z-10">
          <Outlet />
        </main>

        <div className="fixed bottom-24 left-4 md:left-72 z-50 flex flex-col gap-2 pointer-events-none md:bottom-8">
           <AnimatePresence>
             {topNotifications.map(notif => (
                <motion.div key={notif.id} initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0}} className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-2xl w-72 pointer-events-auto">
                   <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                   <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                </motion.div>
             ))}
           </AnimatePresence>
        </div>


        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B0F19]/90 backdrop-blur-xl border-t border-white/10 pb-safe z-50">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative",
                  isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {({ isActive }) => (
                   <>
                     {isActive && (
                       <motion.div 
                          layoutId="smm-mobile-nav"
                          className="absolute -top-[1px] w-8 h-1 bg-indigo-500 rounded-b-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                       />
                     )}
                     <item.icon className={cn("w-5 h-5", isActive && "fill-indigo-500/20")} />
                     <span className="text-[10px] font-medium">{item.name}</span>
                   </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
        
        <DemoControls />
    </div>
  );
}
