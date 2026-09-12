import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

export interface BrandLogoProps {
  logo?: string;
  className?: string;
  imageClassName?: string;
  fit?: 'contain' | 'cover';
}

/** Brand logos are either an emoji or an image URL. */
export function BrandLogo({
  logo,
  className,
  imageClassName,
  fit = 'contain',
}: BrandLogoProps) {
  const [loadError, setLoadError] = useState(false);
  const trimmed = logo?.trim();

  useEffect(() => {
    setLoadError(false);
  }, [logo]);

  const isUrl = !loadError && Boolean(
    trimmed && (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('/')
    )
  );

  return (
    <div
      className={cn(
        'relative bg-slate-800/90 rounded-xl border border-white/10 shadow-inner shrink-0 overflow-hidden select-none flex items-center justify-center',
        className,
      )}
    >
      {isUrl ? (
        <img
          src={trimmed}
          alt="Brand logo"
          className={cn(
            'w-full h-full max-w-full max-h-full block select-none',
            fit === 'contain' ? 'object-contain' : 'object-cover',
            imageClassName,
          )}
          style={{ objectFit: fit, objectPosition: 'center' }}
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="leading-none">{trimmed || '🏷️'}</span>
        </div>
      )}
    </div>
  );
}
