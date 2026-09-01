import React from 'react';

interface WordmarkProps {
  size?: 'large' | 'compact' | 'intro';
  className?: string;
  showSubtitle?: boolean;
}

export const Wordmark: React.FC<WordmarkProps> = ({
  size = 'large',
  className = '',
  showSubtitle = true,
}) => {
  if (size === 'intro') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        {/* Primary Bengali Display Wordmark in Mina */}
        <h1 className="font-bengali text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-[#e6cca0] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-all">
          জলসাঘর
        </h1>

        {showSubtitle && (
          <p className="font-rozha text-xs sm:text-sm md:text-base tracking-[0.35em] text-[#d6be96]/90 uppercase mt-2.5 sm:mt-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            J A L S A G H A R
          </p>
        )}
      </div>
    );
  }

  if (size === 'compact') {
    return (
      <div className={`flex flex-col items-start ${className}`}>
        <span className="font-bengali text-2xl sm:text-3xl tracking-wide text-[#e8cf9b] leading-tight">
          জলসাঘর
        </span>
        <span className="font-rozha text-[10px] tracking-[0.25em] text-[#d1ba8e]/80 uppercase">
          JALSAGHAR
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center pointer-events-none ${className}`}>
      {/* Primary Bengali Display Wordmark in Mina */}
      <h1 className="font-bengali text-4xl sm:text-5xl md:text-6xl tracking-wider text-[#e6cca0]/95 drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]">
        জলসাঘর
      </h1>

      {showSubtitle && (
        <p className="font-rozha text-xs sm:text-sm tracking-[0.4em] text-[#d1ba8e]/85 uppercase mt-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          J A L S A G H A R
        </p>
      )}
    </div>
  );
};
