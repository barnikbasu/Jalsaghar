import React, { useEffect, useState } from 'react';
import { TimeOfDay } from '../types';
import { TIME_PERIODS } from '../lib/time';

interface ArtworkViewProps {
  timeOfDay: TimeOfDay;
}

export const ArtworkView: React.FC<ArtworkViewProps> = ({ timeOfDay }) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const periods: TimeOfDay[] = ['shokal', 'dupur', 'bikel', 'raat'];

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0 bg-[#090607]">
      {/* Time-of-day Artwork Crossfade Layers */}
      {periods.map((period) => {
        const info = TIME_PERIODS[period];
        const isActive = timeOfDay === period;
        const currentSrc = isPortrait ? info.tallImage : info.wideImage;

        return (
          <div
            key={period}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Cover sizing and natural positioning */}
            <img
              src={currentSrc}
              alt={`Jalsaghar Mehfil - ${info.name}`}
              className="w-full h-full object-cover object-center"
              onLoad={() =>
                setImageLoaded((prev) => ({ ...prev, [period]: true }))
              }
              onError={() => {
                setImageLoaded((prev) => ({ ...prev, [period]: false }));
              }}
            />

            {/* Ambient atmospheric backdrop layer behind image if loading */}
            {!imageLoaded[period] && (
              <div
                className={`absolute inset-0 bg-gradient-to-b ${info.ambientTone} flex items-center justify-center`}
              >
                <div className="text-center px-4 opacity-40">
                  <span className="font-bengali text-3xl tracking-widest text-[#d8be87]">
                    {info.bengaliName}
                  </span>
                  <p className="font-rozha text-xs tracking-widest uppercase mt-2 text-[#e3dac7]">
                    {info.name} · {info.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Very subtle edge vignette and depth gradient for UI readability at top & bottom */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-b from-black/45 via-transparent to-black/75" />

      {/* Paper/film atmospheric texture */}
      <div className="absolute inset-0 pointer-events-none z-20 film-grain mix-blend-overlay" />
    </div>
  );
};
