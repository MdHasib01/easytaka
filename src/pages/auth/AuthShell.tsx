import type { ReactNode } from 'react';
import { AppLogo } from '../../components/AppLogo';
import { cn } from '../../lib/utils';

export function AuthShell({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans flex flex-col items-center px-4 py-10 sm:py-16 relative overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-violet-900/20 blur-[100px]" />
      </div>

      <div className={cn('relative z-10 w-full', wide ? 'max-w-2xl' : 'max-w-md')}>
        <div className="flex justify-center mb-8">
          <AppLogo size="xl" orientation="vertical" href="/" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
