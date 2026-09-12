import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    secondary: "border-white/10 bg-white/5 text-slate-300",
    outline: "text-slate-300 border-white/20",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    error: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none backdrop-blur-sm",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
