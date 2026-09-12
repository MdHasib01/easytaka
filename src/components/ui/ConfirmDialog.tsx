import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Loader2, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose(): void;
  onConfirm(): void;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, loading]);

  const content = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => {
              if (!loading) onClose();
            }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
            className="relative z-10 w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-left"
          >
            {/* Header Icon + Close */}
            <div className="flex items-start justify-between gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  variant === 'danger'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                }`}
              >
                {variant === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Body */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
              <div className="mt-2 text-sm text-slate-300 leading-relaxed">{description}</div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="text-slate-300 hover:text-white hover:bg-white/5"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`text-white font-semibold shadow-lg ${
                  variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20 focus:ring-rose-500'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 focus:ring-amber-500'
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}

interface SuccessDialogProps {
  open: boolean;
  onClose(): void;
  title: string;
  description: ReactNode;
  actionText?: string;
}

export function SuccessDialog({
  open,
  onClose,
  title,
  description,
  actionText = 'Done',
}: SuccessDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const content = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
            className="relative z-10 w-full max-w-md bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-center"
          >
            {/* Success Icon */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            {/* Content */}
            <h3 className="mt-4 text-lg font-bold text-white tracking-tight">{title}</h3>
            <div className="mt-2 text-sm text-slate-300 leading-relaxed">{description}</div>

            {/* Action */}
            <div className="mt-6 flex justify-center">
              <Button
                type="button"
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white min-w-[120px] shadow-lg shadow-emerald-600/20 font-medium"
              >
                {actionText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
