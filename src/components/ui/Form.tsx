import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const controlClass =
  'w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-colors disabled:opacity-50';

export function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="text-xs font-semibold text-slate-300">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(controlClass, className)} {...props} />,
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(controlClass, 'appearance-none [&>option]:bg-slate-900', className)} {...props} />
  ),
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(controlClass, 'min-h-20', className)} {...props} />,
);
Textarea.displayName = 'Textarea';

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
