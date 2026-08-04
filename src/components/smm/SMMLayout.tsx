import React from 'react';
import { SMMHeader } from './SMMHeader';
import { SMMBottomNav } from './SMMBottomNav';
import { ToastContainer } from '../common/ToastContainer';
import { LevelUpModal } from '../common/LevelUpModal';

interface SMMLayoutProps {
  children: React.ReactNode;
}

export const SMMLayout: React.FC<SMMLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Geometric Balance ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-cyan-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 z-10">
        <SMMHeader />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <SMMBottomNav />
      <ToastContainer />
      <LevelUpModal />
    </div>
  );
};
