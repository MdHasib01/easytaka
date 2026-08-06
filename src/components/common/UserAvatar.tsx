import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  badgeContent?: React.ReactNode;
  badgeClassName?: string;
  fallbackText?: string;
}

export const getInitials = (name?: string | null, fallback = '??'): string => {
  if (!name || typeof name !== 'string') return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  
  const clean = trimmed.replace(/\s+/g, '');
  if (clean.length === 0) return fallback;
  if (clean.length === 1) return clean.toUpperCase();
  return clean.slice(0, 2).toUpperCase();
};

const sizeClasses = {
  xs: 'w-7 h-7 text-[10px] rounded-lg',
  sm: 'w-9 h-9 text-xs rounded-xl',
  md: 'w-11 h-11 text-sm rounded-2xl',
  lg: 'w-14 h-14 text-lg rounded-2xl',
  xl: 'w-20 h-20 text-2xl rounded-3xl',
  '2xl': 'w-24 h-24 text-3xl rounded-3xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  badgeContent,
  badgeClassName = '',
  fallbackText = '??'
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const initials = getInitials(name, fallbackText);
  const sizeStyle = sizeClasses[size] || sizeClasses.md;

  const showImage = Boolean(src && src.trim() && !imageError);

  return (
    <div className={`relative shrink-0 inline-flex items-center justify-center select-none ${className}`}>
      <div
        className={`${sizeStyle} overflow-hidden border border-white/20 shadow-md flex items-center justify-center font-black tracking-wider transition-colors ${
          showImage
            ? 'bg-slate-900'
            : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-indigo-500/20'
        }`}
      >
        {showImage ? (
          <img
            src={src!}
            alt={name || 'User Avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {badgeContent && (
        <div className={`absolute ${badgeClassName}`}>
          {badgeContent}
        </div>
      )}
    </div>
  );
};
