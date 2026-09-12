import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { roleLabel } from '../../lib/auth';
import { UserAvatar } from '../common/UserAvatar';

export function UserMenu() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!session) return null;

  const { user } = session;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleEditProfile = () => {
    setOpen(false);
    navigate('/profile');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        title={user.name}
        className="focus:outline-none cursor-pointer group"
      >
        <UserAvatar
          src={user.avatar}
          name={user.name}
          size="sm"
          className="group-hover:ring-indigo-400/50 transition-all"
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 z-50"
            >
              <div className="px-3 py-2">
                <div className="flex items-center gap-2.5 mb-2">
                  <UserAvatar src={user.avatar} name={user.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  {roleLabel(session)}
                  {session.brand && ` · ${session.brand.name}`}
                </p>
              </div>

              <div className="h-px bg-white/5 my-1 mx-2" />

              <button
                onClick={handleEditProfile}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <UserCog className="w-4 h-4 text-indigo-400" /> Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-rose-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

