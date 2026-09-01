import React, { useState, useEffect } from 'react';
import { Wordmark } from './Wordmark';
import { trackEvent } from '../lib/analytics';

interface CurtainIntroProps {
  isOpen: boolean;
  onOpen: () => void;
}

export const CurtainIntro: React.FC<CurtainIntroProps> = ({ isOpen, onOpen }) => {
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isRendered, setIsRendered] = useState<boolean>(!isOpen);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
  }, []);

  const handleEnter = () => {
    trackEvent('curtain_opened');
    if (prefersReducedMotion) {
      onOpen();
      setIsRendered(false);
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      onOpen();
      setTimeout(() => {
        setIsRendered(false);
      }, 500);
    }, 2000);
  };

  if (!isRendered && isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden pointer-events-auto transition-opacity duration-1000 ${
        isOpen && !isAnimating ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* LEFT HEAVY VELVET CURTAIN PANEL */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 bg-[#1b080a] shadow-[20px_0_50px_rgba(0,0,0,0.9)] transition-transform duration-[2000ms] ease-[cubic-bezier(0.25,1,0.5,1)] z-10 ${
          isAnimating ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, 
              rgba(18,4,6,0.95) 0px, 
              rgba(48,12,18,0.85) 24px, 
              rgba(28,6,10,0.95) 48px, 
              rgba(12,2,4,0.98) 72px, 
              rgba(40,10,14,0.9) 96px
            )
          `,
        }}
      >
        {/* Deep fabric shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* RIGHT HEAVY VELVET CURTAIN PANEL */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 bg-[#1b080a] shadow-[-20px_0_50px_rgba(0,0,0,0.9)] transition-transform duration-[2000ms] ease-[cubic-bezier(0.25,1,0.5,1)] z-10 ${
          isAnimating ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, 
              rgba(40,10,14,0.9) 0px, 
              rgba(12,2,4,0.98) 24px, 
              rgba(28,6,10,0.95) 48px, 
              rgba(48,12,18,0.85) 72px, 
              rgba(18,4,6,0.95) 96px
            )
          `,
        }}
      >
        {/* Deep fabric shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* CENTER GOLDEN SEAM LIGHT GLOW (Visible before parting) */}
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[#e8cca0] shadow-[0_0_40px_10px_rgba(232,204,160,0.6)] z-20 pointer-events-none transition-opacity duration-700 ${
          isAnimating ? 'opacity-0 scale-y-110' : 'opacity-80 animate-pulse'
        }`}
      />

      {/* CENTER INTRO CONTENT & THRESHOLD CTA */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center z-30 px-6 select-none transition-all duration-700 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Central Bengali Brand Wordmark */}
        <Wordmark size="intro" showSubtitle={true} className="mb-8 sm:mb-12" />

        {/* Enter Room Action Button */}
        <button
          onClick={handleEnter}
          id="enter-jalsaghar-btn"
          className="group relative px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-black/50 hover:bg-black/70 text-[#f4ebdc] border border-[#e8cca0]/40 hover:border-[#e8cca0] shadow-[0_4px_25px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-300 cursor-pointer"
          aria-label="Enter the Jalsaghar digital mehfil"
        >
          <div className="flex items-center gap-3">
            <span className="font-rozha text-xs sm:text-sm tracking-[0.3em] uppercase text-[#e8cca0] group-hover:text-[#fff4dc] transition-colors">
              ENTER THE JALSAGHAR
            </span>
            <span className="text-[#e8cca0] transform group-hover:translate-x-1.5 transition-transform duration-300 text-sm sm:text-base">
              →
            </span>
          </div>

          {/* Ambient Glow */}
          <div className="absolute inset-0 rounded-full bg-[#e8cca0]/5 group-hover:bg-[#e8cca0]/15 transition-all blur-sm -z-10" />
        </button>

        {/* Restrained contextual caption */}
        <p className="font-rozha text-[11px] sm:text-xs tracking-[0.25em] text-[#d6be96]/60 uppercase mt-6 drop-shadow-md">
          A SANCTUARY FOR INDIAN CLASSICAL MUSIC
        </p>
      </div>
    </div>
  );
};
