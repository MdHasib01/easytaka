import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

/** Brand logos are either an emoji or an image URL. */
export function BrandLogo({ logo, className }: { logo?: string; className?: string }) {
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
        'relative bg-slate-800 rounded-xl border border-white/10 shadow-inner shrink-0 overflow-hidden select-none',
        className,
      )}
    >
      {isUrl ? (
        <img
          src={trimmed}
          alt="Brand logo"
          className="absolute inset-0 w-full h-full object-cover block"
          style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }}
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
