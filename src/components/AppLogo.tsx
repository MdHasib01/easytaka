import { Link } from 'react-router-dom';
import logoSrc from '../assets/logo.png';
import { cn } from '../lib/utils';

export interface AppLogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  orientation?: 'horizontal' | 'vertical';
  href?: string;
}

export function AppLogo({
  className,
  imageClassName,
  textClassName,
  size = 'md',
  showText = true,
  orientation = 'horizontal',
  href,
}: AppLogoProps) {
  const sizeConfig = {
    sm: {
      img: 'w-7 h-7',
      text: 'text-base font-bold',
      gap: 'gap-2',
    },
    md: {
      img: 'w-8 h-8',
      text: 'text-xl font-bold',
      gap: 'gap-2.5',
    },
    lg: {
      img: 'w-12 h-12',
      text: 'text-2xl font-extrabold',
      gap: 'gap-3',
    },
    xl: {
      img: 'w-20 h-20 sm:w-24 sm:h-24',
      text: 'text-2xl sm:text-3xl font-black tracking-tight',
      gap: 'gap-3',
    },
  }[size];

  const content = (
    <div
      className={cn(
        'flex select-none group',
        orientation === 'vertical' ? 'flex-col items-center justify-center text-center' : 'items-center justify-start',
        sizeConfig.gap,
        className
      )}
    >
      <div className="relative shrink-0 flex items-center justify-center">
        {size === 'xl' && (
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-110 pointer-events-none" />
        )}
        <img
          src={logoSrc}
          alt="EasyTaka"
          className={cn(
            sizeConfig.img,
            'object-contain relative z-10 transition-transform duration-200 group-hover:scale-105',
            size === 'xl'
              ? 'drop-shadow-[0_8px_24px_rgba(99,102,241,0.35)]'
              : 'drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)]',
            imageClassName
          )}
        />
      </div>

      {showText && (
        <span
          className={cn(
            sizeConfig.text,
            'bg-gradient-to-r from-indigo-400 via-sky-300 to-violet-400 bg-clip-text text-transparent tracking-tight leading-none',
            textClassName
          )}
        >
          EASYTAKA
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}

export default AppLogo;
