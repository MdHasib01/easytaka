import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppRole } from '../../types';

interface RequireAuthProps {
  role?: AppRole;
  children: React.ReactNode;
}

const homeFor = (role: AppRole) => (role === 'admin' ? '/admin/command-center' : '/smm/home');

export const RequireAuth: React.FC<RequireAuthProps> = ({ role, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Session restore is still in flight — redirecting now would bounce a
  // logged-in user to /login on every refresh.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <span className="text-sm font-semibold">Restoring your session…</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  if (role && user.role !== role) return <Navigate to={homeFor(user.role as AppRole)} replace />;

  return <>{children}</>;
};
