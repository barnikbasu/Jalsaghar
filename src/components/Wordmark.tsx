import React from 'react';

interface WordmarkProps {
  size?: 'default' | 'compact' | 'intro';
  className?: string;
  showSubtitle?: boolean;
}

export const Wordmark: React.FC<WordmarkProps> = ({
  size = 'default',
  className = '',
  showSubtitle = true,
}) => {
  if (size === 'intro') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        {/* Primary Bengali Display Wordmark in Mina font */}
        <h1 className="font-bengali text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-wider text-[#e6cca0] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          জলসাঘর
        </h1>

        {showSubtitle && (
          <p className="font-rozha text-xs sm:text-sm md:text-base tracking-[0.45em] text-[#d6be96]/90 uppercase mt-3 sm:mt-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
            J A L S A G H A R
          </p>
        )}
      </div>
    );
  }

  if (size === 'compact') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <span className="font-bengali text-3xl sm:text-4xl tracking-wide text-[#e8cf9b] leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          জলসাঘর
        </span>
        {showSubtitle && (
          <span className="font-rozha text-[10px] sm:text-[11px] tracking-[0.3em] text-[#d1ba8e]/85 uppercase mt-0.5">
            J A L S A G H A R
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center pointer-events-none select-none ${className}`}>
      {/* Primary Bengali Display Wordmark in Mina */}
      <h1 className="font-bengali text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-[#e8cca0] drop-shadow-[0_6px_28px_rgba(0,0,0,0.85)] transition-all">
        জলসাঘর
      </h1>

      {showSubtitle && (
        <p className="font-rozha text-xs sm:text-sm md:text-base tracking-[0.45em] text-[#d6be96]/90 uppercase mt-2 sm:mt-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          J A L S A G H A R
        </p>
      )}
    </div>
  );
};
