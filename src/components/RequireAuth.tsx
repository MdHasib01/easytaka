import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { areaFor, homePathFor, type Area } from '../lib/auth';

export function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
    </div>
  );
}

/** Renders children only for sessions in `area`; everyone else goes to login or their own home. */
export function RequireAuth({ area, children }: { area: Area | Area[]; children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  const allowed = Array.isArray(area) ? area : [area];
  if (!allowed.includes(areaFor(session))) return <Navigate to={homePathFor(session)} replace />;
  return <>{children}</>;
}

/** Login and registration pages: signed-in users are sent to their home. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (session) return <Navigate to={homePathFor(session)} replace />;
  return <>{children}</>;
}

export function HomeRedirect() {
  const { session, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return <Navigate to={homePathFor(session)} replace />;
}
