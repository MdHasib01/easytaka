import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'none';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
  interactive = false,
  ...props
}) => {
  const glowClass = glow !== 'none' ? `glow-${glow}` : '';
  const interactiveClass = interactive ? 'glass-card-interactive cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-white/10 backdrop-blur-xl ${glowClass} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
