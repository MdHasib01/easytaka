import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ToastContainer } from '../common/ToastContainer';
import { LevelUpModal } from '../common/LevelUpModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#05060A] text-slate-100 flex relative overflow-hidden">
      {/* Geometric Balance ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-pink-600/10 rounded-full blur-[100px]" />
      </div>

      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full min-w-0 z-10 overflow-hidden">
        <AdminHeader onToggleMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>

      <ToastContainer />
      <LevelUpModal />
    </div>
  );
};
