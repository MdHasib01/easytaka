import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />
  };

  const borderGlow = {
    success: 'border-emerald-500/40 glow-emerald',
    info: 'border-cyan-500/40 glow-cyan',
    warning: 'border-amber-500/40 glow-amber',
    error: 'border-rose-500/40 glow-rose'
  };

  return (
    <div role="status" aria-live="polite" className="fixed bottom-20 sm:bottom-auto sm:top-5 right-3 sm:right-5 left-3 sm:left-auto z-50 pointer-events-none max-w-sm w-full mx-auto sm:mx-0">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`glass-panel dark:bg-slate-900/95 border ${borderGlow[toast.type]} rounded-2xl p-4 shadow-2xl flex items-center gap-3 pointer-events-auto backdrop-blur-2xl`}
        >
          <div className="shrink-0">{icons[toast.type]}</div>
          <div className="text-sm font-semibold text-slate-800 dark:text-white flex-1">{toast.message}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
