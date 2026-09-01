import React from 'react';
import { X, Heart, Coffee, ExternalLink, Music2 } from 'lucide-react';

interface ContextualModalsProps {
  creatorsOpen: boolean;
  supportOpen: boolean;
  onCloseCreators: () => void;
  onCloseSupport: () => void;
}

export const ContextualModals: React.FC<ContextualModalsProps> = ({
  creatorsOpen,
  supportOpen,
  onCloseCreators,
  onCloseSupport,
}) => {
  if (!creatorsOpen && !supportOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={() => {
          if (creatorsOpen) onCloseCreators();
          if (supportOpen) onCloseSupport();
        }}
      />

      {/* CREATORS / ABOUT NOTE CARD */}
      {creatorsOpen && (
        <div
          role="dialog"
          aria-labelledby="creators-title"
          className="relative z-10 w-full max-w-md bg-[#130f10]/95 text-[#f5ede0] rounded-2xl p-6 sm:p-8 border border-[#d8be87]/20 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <button
            onClick={onCloseCreators}
            id="close-creators-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-full text-[#d8be87]/70 hover:text-[#d8be87] hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Close Note"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 text-[#d8be87] mb-4">
            <Heart className="w-4 h-4 text-[#e07a5f]" />
            <span id="creators-title" className="font-rozha text-xs tracking-[0.3em] uppercase">
              MADE WITH BHALOBASHA
            </span>
          </div>

          <div className="mb-4">
            <h2 className="font-bengali text-3xl sm:text-4xl text-[#e8cf9b] leading-tight">
              জলসাঘর
            </h2>
            <p className="font-rozha text-[11px] tracking-[0.25em] text-[#d8be87]/80 uppercase mt-1">
              JALSAGHAR · DIGITAL MEHFIL
            </p>
          </div>

          <p className="font-rozha text-sm sm:text-base leading-relaxed text-[#e5d8c3]/90 mb-4">
            An intimate sanctuary for Indian classical music, rooted in the heritage of historic
            Bengal and the timeless baithaks of North Indian ragas.
          </p>

          <p className="font-rozha text-xs sm:text-sm leading-relaxed text-[#b5a38b] mb-6">
            The room changes quietly with the passage of real time in Kolkata, preserving an ancient musical tradition inside a living digital artifact.
          </p>

          <div className="border-t border-[#d8be87]/15 pt-4 flex items-center justify-between text-xs text-[#d8be87]/80 font-rozha">
            <span>Preserving Indian Classical Heritage</span>
            <span className="text-[#e8cf9b]">Asia/Kolkata</span>
          </div>
        </div>
      )}

      {/* BUY US A CHAI / SUPPORT CARD */}
      {supportOpen && (
        <div
          role="dialog"
          aria-labelledby="support-title"
          className="relative z-10 w-full max-w-md bg-[#130f10]/95 text-[#f5ede0] rounded-2xl p-6 sm:p-8 border border-[#d8be87]/20 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <button
            onClick={onCloseSupport}
            id="close-support-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-full text-[#d8be87]/70 hover:text-[#d8be87] hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Close Card"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 text-[#d8be87] mb-4">
            <Coffee className="w-4 h-4 text-[#d8be87]" />
            <span id="support-title" className="font-rozha text-xs tracking-[0.3em] uppercase">
              BUY US A CHAI
            </span>
          </div>

          <h3 className="font-rozha text-lg sm:text-xl text-[#f4ebdc] mb-3">
            Support the Jalsaghar Mehfil
          </h3>

          <p className="font-rozha text-sm sm:text-base leading-relaxed text-[#e5d8c3]/90 mb-4">
            If Jalsaghar brought a quiet moment of joy or contemplative peace to your day, your
            appreciation helps keep this room alive and ad-free.
          </p>

          <div className="p-4 rounded-xl bg-black/40 border border-[#d8be87]/15 mb-6 text-center">
            <p className="font-rozha text-xs text-[#d8be87]/90 uppercase tracking-widest mb-1">
              PATRONAGE & SUPPORT
            </p>
            <p className="font-rozha text-xs text-[#a9977f]">
              Handcrafted with devotion to classical Indian maestros and listeners.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-[#b5a38b] font-rozha">
            <span>জলসাঘর · Baithak Mehfil</span>
            <button
              onClick={onCloseSupport}
              className="text-[#e8cf9b] hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
