import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockBrands } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import type { Brand } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Package, Users, CheckSquare, Zap, ShieldCheck, UserCheck, UserCog, Trophy, BarChart3, Plus, Settings, ChevronLeft, ChevronRight, Menu, Bell, Search, LayoutGrid, MessageSquare, ChevronDown, CheckCircle2, AlertCircle, Globe2 } from 'lucide-react';
import AdminBrands from './Brands';
import AdminManageUsers from './ManageUsers';
import { BrandLogo } from '../../components/BrandLogo';
import logoImg from '../../assets/logo.png';
import { OverviewTab } from './tabs/OverviewTab';
import { BrandDetailsTab } from './tabs/BrandDetailsTab';
import { ProductsTab } from './tabs/ProductsTab';
import { WorkforceTab } from './tabs/WorkforceTab';
import { MissionsTab } from './tabs/MissionsTab';
import { RapidTasksTab } from './tabs/RapidTasksTab';
import { ReviewCenterTab } from './tabs/ReviewCenterTab';
import { MessagesTab } from './tabs/MessagesTab';

/** Workspace modules shared by the Brand Admin and the platform Admin (across all brands). */
const MODULE_NAV = [
  { value: 'products', label: 'Products', icon: Package },
  { value: 'workforce', label: 'Workforce', icon: Users },
  { value: 'missions', label: 'Missions', icon: CheckSquare },
  { value: 'rapid-tasks', label: 'Rapid Tasks', icon: Zap },
  { value: 'review', label: 'Review Center', icon: ShieldCheck },
  { value: 'reviewers', label: 'Reviewer Mgmt', icon: UserCheck },
  { value: 'gamification', label: 'Gamification', icon: Trophy },
  { value: 'messages', label: 'Messages', icon: MessageSquare },
  { value: 'reports', label: 'Reports', icon: BarChart3 },
];

const OVERVIEW_NAV = { value: 'overview', label: 'Overview', icon: LayoutGrid };

const NAV_BY_SCOPE = {
  brand: [OVERVIEW_NAV, { value: 'details', label: 'Brand Details', icon: Building2 }, ...MODULE_NAV],
  platform: [
    OVERVIEW_NAV,
    { value: 'brands', label: 'Brands', icon: Building2 },
    ...MODULE_NAV,
    { value: 'users', label: 'Manage Users', icon: UserCog },
  ],
};

export type WorkspaceScope = keyof typeof NAV_BY_SCOPE;

export default function BrandDashboard({ scope = 'brand' }: { scope?: WorkspaceScope }) {
  const isPlatform = scope === 'platform';
  const basePath = isPlatform ? '/admin' : '/admin/brand';
  const { tab } = useParams();
  const navigate = useNavigate();
  const currentTab = tab || 'overview';
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showBrandSelector, setShowBrandSelector] = useState(false);
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
  
  const { session, canReturnToAdmin, returnToAdmin } = useAuth();
  // Tabs still run on mock data; only the brand identity comes from the session.
  const brand: Brand = session?.brand
    ? {
        ...mockBrands[0],
        id: session.brand.id,
        name: session.brand.name,
        logo: session.brand.logo,
        status: session.brand.status,
        industry: session.brand.industry || mockBrands[0].industry,
        primaryPlatform: session.brand.primaryPlatform || mockBrands[0].primaryPlatform,
      }
    : mockBrands[0];

  const switchBrand = async () => {
    await returnToAdmin();
    navigate('/admin/brands', { replace: true });
  };

  const navItems = NAV_BY_SCOPE[scope];

  const handleNav = (val: string) => {
     navigate(`${basePath}/${val}`);
     setIsMobileOpen(false);
  };

  const onHeaderClick = () => {
    if (isPlatform) handleNav('brands');
    else if (canReturnToAdmin) switchBrand();
    else setShowBrandSelector(!showBrandSelector);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0B0F19]/95 backdrop-blur-xl border-r border-white/10 relative z-20 overflow-hidden">
      {/* Brand Header */}
      <div className={cn("p-4 border-b border-white/10 shrink-0", isCollapsed ? "items-center flex flex-col" : "")}>
        <div
          className="flex items-center gap-3 cursor-pointer group"
          title={isPlatform ? 'Open a brand' : canReturnToAdmin ? 'Back to Admin to switch brand' : undefined}
          onClick={onHeaderClick}
        >
          {isPlatform ? (
            <div className="w-10 h-10 bg-slate-850 rounded-xl flex items-center justify-center p-1.5 border border-white/10 shadow-inner shrink-0 group-hover:border-indigo-500/50 transition-colors">
              <img src={logoImg} alt="EasyTaka" className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(99,102,241,0.3)]" />
            </div>
          ) : (
            <BrandLogo logo={brand.logo} className="w-10 h-10 text-xl rounded-xl shrink-0 group-hover:border-indigo-500/50 transition-colors" />
          )}

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white truncate">{isPlatform ? 'All Brands' : brand.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                 {isPlatform ? 'Platform Admin' : 'Active'}
              </div>
            </div>
          )}
          {!isCollapsed && <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />}
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 hide-scrollbar">
        {navItems.map((item) => {
          const isActive = currentTab === item.value;
          return (
            <button
              key={item.value}
              onClick={() => handleNav(item.value)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                isActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              )}
              <item.icon className={cn("w-5 h-5 relative z-10 shrink-0 transition-colors", isActive && "text-indigo-400")} />
              
              {!isCollapsed && (
                <span className="relative z-10 text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Footer controls */}
      <div className="p-3 border-t border-white/10 shrink-0 flex flex-col gap-2">
         <button className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-slate-500 hover:text-slate-300 hover:bg-white/5", isCollapsed ? "justify-center" : "justify-start")} onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!isCollapsed && <span className="text-xs font-medium uppercase tracking-wider">Collapse</span>}
         </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-[#0B0F19] text-slate-200 absolute inset-0">
      
      {/* Desktop Sidebar */}
      <motion.div 
         initial={false}
         animate={{ width: isCollapsed ? 80 : 260 }}
         className="hidden md:block shrink-0 relative z-20 h-full"
      >
         <SidebarContent />
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[260px] z-50 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        
        {/* Brand Workspace Header */}
        <header className="h-16 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-xl shrink-0 flex items-center justify-between px-4 lg:px-6 relative z-30">
           <div className="flex items-center gap-3 lg:gap-4">
              <button 
                onClick={() => setIsMobileOpen(true)}
                className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"
              >
                 <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2.5 text-sm min-w-0">
                {isPlatform ? (
                  <div className="w-8 h-8 rounded-lg bg-slate-800/90 border border-white/10 p-1 shrink-0 flex items-center justify-center shadow-sm">
                    <img src={logoImg} alt="EasyTaka" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <BrandLogo logo={brand.logo} className="w-8 h-8 rounded-lg shrink-0 shadow-sm border border-white/10" />
                )}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-200 truncate">{isPlatform ? 'EasyTaka' : brand.name}</span>
                  <span className="text-slate-600 hidden sm:inline">/</span>
                  <span className="text-indigo-300 font-medium tracking-wide hidden sm:inline">{isPlatform ? 'Platform Admin' : 'Brand Workspace'}</span>
                </div>
              </div>

              {!isPlatform && <div className="hidden lg:flex items-center gap-4 ml-4 pl-4 border-l border-white/10 text-xs text-slate-400">
                 <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5"/> 12 Products</span>
                 <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> 10 SMM</span>
                 <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5"/> 320 Managed IDs</span>
                 <span className="flex items-center gap-1.5 text-amber-400/80"><AlertCircle className="w-3.5 h-3.5"/> 8 Pending Reviews</span>
              </div>}
           </div>
           
           <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative hidden md:block group">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                 <input type="text" placeholder="Search..." className="w-48 lg:w-64 bg-slate-900/50 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-slate-200 placeholder:text-slate-500" />
              </div>

              
              <div className="relative" ref={quickCreateRef}>
                <Button 
                   onClick={() => setShowQuickCreate(!showQuickCreate)}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] pl-3 pr-4 hidden sm:flex"
                >
                   <Plus className="w-4 h-4 mr-1.5" /> Quick Create
                </Button>
                <Button 
                   size="icon"
                   onClick={() => setShowQuickCreate(!showQuickCreate)}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] w-9 h-9 sm:hidden"
                >
                   <Plus className="w-4 h-4" />
                </Button>
                
                {/* Quick Create Dropdown */}
                <AnimatePresence>
                  {showQuickCreate && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowQuickCreate(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50 overflow-hidden backdrop-blur-xl"
                      >
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Create New...</div>
                         <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors" onClick={() => { setShowQuickCreate(false); handleNav('products'); }}><Package className="w-4 h-4 text-indigo-400" /> Add Product</button>
                         <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors" onClick={() => { setShowQuickCreate(false); handleNav('workforce'); }}><Users className="w-4 h-4 text-emerald-400" /> Invite SMM</button>
                         <div className="h-px bg-white/5 my-1 mx-2"></div>
                         <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors" onClick={() => { setShowQuickCreate(false); handleNav('missions'); }}><CheckSquare className="w-4 h-4 text-violet-400" /> Create Mission</button>
                         <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors" onClick={() => { setShowQuickCreate(false); handleNav('rapid-tasks'); }}><Zap className="w-4 h-4 text-rose-400" /> Create Rapid Task</button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
           </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          
          {/* Ambient Right Glow */}
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none z-0"></div>
          
          <div className="relative z-10 w-full min-h-full pb-12">
            {currentTab === 'overview' && <OverviewTab />}
            {!isPlatform && currentTab === 'details' && <BrandDetailsTab brand={brand} />}
            {isPlatform && currentTab === 'brands' && <AdminBrands />}
            {isPlatform && currentTab === 'users' && <AdminManageUsers />}
            {currentTab === 'products' && <ProductsTab />}
            {currentTab === 'workforce' && <WorkforceTab />}
            {currentTab === 'missions' && <MissionsTab />}
            {currentTab === 'rapid-tasks' && <RapidTasksTab />}
            {currentTab === 'messages' && <MessagesTab />}
            {currentTab === 'review' && <ReviewCenterTab />}
            
            {/* Stubs for new flows */}
            {['reviewers', 'gamification', 'reports'].includes(currentTab) && (
              <div className="p-4 md:p-6 max-w-7xl mx-auto">
                 <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-dashed border-white/10 backdrop-blur-sm">
                   <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 mx-auto mb-4">
                      {['reviewers', 'gamification', 'reports'].includes(currentTab) && <Settings className="w-8 h-8 text-slate-500" />}
                   </div>
                   <h3 className="text-xl font-medium text-slate-200 capitalize mb-2">{currentTab.replace('-', ' ')} Module</h3>
                   <p className="text-slate-500 max-w-md mx-auto">Deep logic implementation pending next sequence instruction.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
