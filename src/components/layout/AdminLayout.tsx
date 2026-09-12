import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { areaFor, roleLabel } from '../../lib/auth';
import { AppLogo } from '../AppLogo';
import { BrandLogo } from '../BrandLogo';
import { UserMenu } from './UserMenu';

export function AdminLayout() {
  const { session, canReturnToAdmin, returnToAdmin } = useAuth();
  const navigate = useNavigate();
  const isPlatform = session ? areaFor(session) === 'platform' : false;

  const backToAdmin = async () => {
    await returnToAdmin();
    navigate('/admin/brands', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans text-slate-200">
      {/* Decorative ambient background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-violet-900/20 blur-[100px]"></div>
      </div>

      <header className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/10">
        {canReturnToAdmin && session?.brand && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-xs sm:text-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <AppLogo size="md" href="/admin" />
              <div className="h-6 w-px bg-white/10 hidden md:block"></div>

              {isPlatform ? (
                <span className="hidden sm:inline text-sm font-medium text-slate-400">Platform Admin</span>
              ) : (
                session?.brand && (
                  <div className="flex items-center gap-2 min-w-0">
                    <BrandLogo logo={session.brand.logo} className="w-8 h-8 text-base rounded-lg" />
                    <div className="min-w-0 hidden sm:block">
                      <p className="text-sm font-semibold text-white truncate">{session.brand.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{roleLabel(session)}</p>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-white/5 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex w-full relative z-10 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
