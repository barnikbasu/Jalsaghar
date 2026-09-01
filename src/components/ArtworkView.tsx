import React, { useEffect, useState } from 'react';
import { TimeOfDay } from '../types';
import { TIME_PERIODS } from '../lib/time';

interface ArtworkViewProps {
  timeOfDay: TimeOfDay;
}

export const ArtworkView: React.FC<ArtworkViewProps> = ({ timeOfDay }) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const periods: TimeOfDay[] = ['shokal', 'dupur', 'bikel', 'raat'];

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 bg-[#090607]">
      {/* 4 Automatic Time-of-Day Painting Layers */}
      {periods.map((period) => {
        const info = TIME_PERIODS[period];
        const isActive = timeOfDay === period;
        const currentSrc = isPortrait ? info.tallImage : info.wideImage;

        return (
          <div
            key={period}
            className={`absolute inset-0 w-full h-full ${
              prefersReducedMotion
                ? isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                : `transition-opacity duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`
            }`}
          >
            {/* The Painting / The World */}
            <img
              src={currentSrc}
              alt={`Jalsaghar Indian Classical Mehfil Room - ${info.name}`}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          </div>
        );
      })}

      {/* Atmospheric depth vignette for UI contrast */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* Subtle film grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 film-grain mix-blend-overlay opacity-30" />
    </div>
  );
};
