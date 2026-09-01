import React, { useState, useEffect } from 'react';
import { Wordmark } from './Wordmark';
import { formatKolkataFullString } from '../lib/time';
import { TimeOfDay } from '../types';

interface CurtainIntroProps {
  timeOfDay: TimeOfDay;
  onEnter: () => void;
}

export const CurtainIntro: React.FC<CurtainIntroProps> = ({ timeOfDay, onEnter }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isClosed, setIsClosed] = useState(true);
  const [timeStr, setTimeStr] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Live Kolkata clock string
    setTimeStr(formatKolkataFullString(timeOfDay));
    const timer = setInterval(() => {
      setTimeStr(formatKolkataFullString(timeOfDay));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeOfDay]);

  const handleEnter = () => {
    if (isOpening || !isClosed) return;

    if (prefersReducedMotion) {
      setIsClosed(false);
      onEnter();
      return;
    }

    setIsOpening(true);

    // Curtain opens with physical mass over 2.2 seconds
    setTimeout(() => {
      setIsClosed(false);
      onEnter();
    }, 2200);
  };

  if (!isClosed) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-opacity duration-1000 ${
        isOpening ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Light Shaft Behind Center Seam */}
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 z-10 w-2.5 transition-all duration-[2200ms] ease-out pointer-events-none ${
          isOpening
            ? 'w-full opacity-100 bg-amber-200/20'
            : 'w-1 sm:w-1.5 opacity-90 light-slit-glow bg-[#ffc371]'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#ffdb99] via-[#f7a046] to-[#d66b29] opacity-85 blur-[1px]" />
      </div>

      {/* LEFT CURTAIN PANEL */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 z-20 curtain-left-folds shadow-[inset_-12px_0_30px_rgba(0,0,0,0.95)] transition-transform duration-[2200ms] cubic-bezier(0.22, 1, 0.36, 1) ${
          isOpening ? '-translate-x-full scale-x-75 origin-left' : 'translate-x-0 scale-x-100'
        }`}
      >
        {/* Textile Depth Folds & Subtle Highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-black/40 to-black/80 pointer-events-none" />
        
        {/* Vertical velvet drapery ribs */}
        <div className="absolute inset-0 flex justify-around opacity-35 pointer-events-none">
          <div className="w-12 h-full bg-gradient-to-r from-black/60 via-red-950/20 to-black/70 blur-[2px]" />
          <div className="w-16 h-full bg-gradient-to-r from-black/70 via-rose-950/30 to-black/80 blur-[2px]" />
          <div className="w-14 h-full bg-gradient-to-r from-black/60 via-red-950/20 to-black/70 blur-[2px]" />
          <div className="w-8 h-full bg-gradient-to-r from-black/80 via-transparent to-black/90 blur-[1px]" />
        </div>

        {/* Center seam edge shadow */}
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black via-black/80 to-transparent" />
      </div>

      {/* RIGHT CURTAIN PANEL */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 z-20 curtain-right-folds shadow-[inset_12px_0_30px_rgba(0,0,0,0.95)] transition-transform duration-[2200ms] cubic-bezier(0.22, 1, 0.36, 1) ${
          isOpening ? 'translate-x-full scale-x-75 origin-right' : 'translate-x-0 scale-x-100'
        }`}
      >
        {/* Textile Depth Folds & Subtle Highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-black/40 to-black/80 pointer-events-none" />
        
        {/* Vertical velvet drapery ribs */}
        <div className="absolute inset-0 flex justify-around opacity-35 pointer-events-none">
          <div className="w-8 h-full bg-gradient-to-r from-black/90 via-transparent to-black/80 blur-[1px]" />
          <div className="w-14 h-full bg-gradient-to-r from-black/70 via-red-950/20 to-black/60 blur-[2px]" />
          <div className="w-16 h-full bg-gradient-to-r from-black/80 via-rose-950/30 to-black/70 blur-[2px]" />
          <div className="w-12 h-full bg-gradient-to-r from-black/70 via-red-950/20 to-black/60 blur-[2px]" />
        </div>

        {/* Center seam edge shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black via-black/80 to-transparent" />
      </div>

      {/* Grain layer over curtain */}
      <div className="absolute inset-0 z-25 film-grain opacity-40 mix-blend-overlay pointer-events-none" />

      {/* FOREGROUND OVERLAY: Metadata & Entry Affordance */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 safe-pt safe-pb safe-pl safe-pr transition-all duration-1000 ${
          isOpening ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Top Environmental Metadata */}
        <header className="w-full flex items-center justify-between text-[#d6be96]/80 text-[11px] sm:text-xs font-rozha tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#d6be96] opacity-70 animate-pulse" />
            <span>{timeStr || 'KOLKATA TIME'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            <span>ON AIR · MEHFIL</span>
          </div>
        </header>

        {/* Center Wordmark */}
        <main className="my-auto py-12 flex flex-col items-center justify-center">
          <Wordmark size="intro" />
        </main>

        {/* Bottom Entrance Trigger Button */}
        <footer className="w-full flex flex-col items-center justify-center pb-2 sm:pb-6">
          <button
            onClick={handleEnter}
            id="enter-jalsaghar-button"
            className="group relative flex items-center gap-3 px-6 py-3 rounded-full bg-[#180a0e]/80 hover:bg-[#281118]/90 border border-[#e2c785]/25 hover:border-[#e2c785]/50 text-[#e6cca0] font-rozha text-xs sm:text-sm tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] hover:scale-[1.02] cursor-pointer"
            aria-label="Enter the Jalsaghar digital mehfil"
          >
            <span className="font-bengali text-sm text-[#e8cf9b]">জলসাঘর</span>
            <span className="text-white/40">·</span>
            <span>ENTER THE JALSAGHAR</span>
            <span className="text-[#e2c785] transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
};
