import React from 'react';
import { Wordmark } from './Wordmark';
import { X, Music2, Sparkles, Moon, Sun, Sunset, Sunrise } from 'lucide-react';
import { TIME_PERIODS } from '../lib/time';

interface AboutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDrawer: React.FC<AboutDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-[#140c0e]/95 border border-[#d8be87]/20 shadow-[0_24px_64px_rgba(0,0,0,0.9)] text-[#f7f3e9] p-6 sm:p-10 font-rozha">
        {/* Close button */}
        <button
          onClick={onClose}
          id="close-about-drawer-btn"
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#e3dac7] transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wordmark Lockup */}
        <div className="text-center mb-8">
          <Wordmark size="compact" className="items-center" />
          <p className="text-xs tracking-[0.3em] uppercase text-[#d8be87] mt-2">
            A Digital Mehfil for Indian Classical Music
          </p>
        </div>

        {/* Story Section */}
        <div className="space-y-6 text-xs sm:text-sm text-[#e3dac7]/85 leading-relaxed tracking-wide">
          <p>
            <strong className="text-[#e8cf9b]">Jalsaghar (জলসাঘর)</strong> is not a conventional streaming catalog. It is a living digital room inspired by the aristocratic music rooms of Bengal, intimate baithaks, and the timeless heritage of Hindustani classical music.
          </p>

          <p>
            The experience honors the quiet tradition of listening — where music is not background noise, but the soul of a gathering. Like the historic film by Satyajit Ray, the room holds memories of generations of ustads and pandits.
          </p>

          {/* Time of Day Worlds */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#d8be87] mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              The Four Time-of-Day Worlds (Kolkata Time)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-[#e6cca0] mb-1">
                  <Sunrise className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-rozha text-xs uppercase">SHOKAL · সকাল</span>
                </div>
                <p className="text-[11px] text-white/60">{TIME_PERIODS.shokal.period} · {TIME_PERIODS.shokal.ragas}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-[#e6cca0] mb-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-rozha text-xs uppercase">DUPUR · দুপুর</span>
                </div>
                <p className="text-[11px] text-white/60">{TIME_PERIODS.dupur.period} · {TIME_PERIODS.dupur.ragas}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-[#e6cca0] mb-1">
                  <Sunset className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-rozha text-xs uppercase">BIKEL · বিকেল</span>
                </div>
                <p className="text-[11px] text-white/60">{TIME_PERIODS.bikel.period} · {TIME_PERIODS.bikel.ragas}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-[#e6cca0] mb-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="font-rozha text-xs uppercase">RAAT · রাত</span>
                </div>
                <p className="text-[11px] text-white/60">{TIME_PERIODS.raat.period} · {TIME_PERIODS.raat.ragas}</p>
              </div>
            </div>
          </div>

          {/* Curated Repertoire Section */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-xs uppercase tracking-[0.25em] text-[#d8be87] mb-3 flex items-center gap-2">
              <Music2 className="w-3.5 h-3.5" />
              Curated Playlists
            </h4>
            <ul className="space-y-2 text-[11px] text-white/75">
              <li>
                <strong className="text-[#e8cf9b]">BAITHAK:</strong> Intimate instrumental and vocal classical recordings by legendary masters.
              </li>
              <li>
                <strong className="text-[#e8cf9b]">RIYAZ:</strong> Long-form contemplative morning and deep practice alaaps.
              </li>
              <li>
                <strong className="text-[#e8cf9b]">MEHFIL:</strong> Nocturnal gatherings, thumris, dadras, and midnight raga performances.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-white/10 pt-6 mt-6">
          <p className="text-[10px] tracking-widest text-[#d8be87]/60 uppercase">
            जलसाঘর · JALSAGHAR · LIVE ON AIR
          </p>
        </div>
      </div>
    </div>
  );
};
