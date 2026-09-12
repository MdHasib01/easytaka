import { useState } from 'react';
import { initials } from '../../lib/auth';
import { cn } from '../../lib/utils';

export interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ring?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

export function UserAvatar({
  src,
  name,
  size = 'md',
  className,
  ring = true,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;

  return (
    <div
      className={cn(
        'rounded-full relative flex items-center justify-center font-bold select-none shrink-0 overflow-hidden',
        SIZE_CLASSES[size],
        ring && 'ring-2 ring-white/10 shadow-[0_0_12px_rgba(79,70,229,0.25)]',
        !showImage && 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white',
        className
      )}
    >
      {showImage ? (
        <img
          src={src!}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span>{initials(name || 'User')}</span>
      )}
    </div>
  );
}
