import React from 'react';
import { RAAG_CATALOG, TRACK_CATALOG } from '../../lib/tracks';
import { Track } from '../../types';
import { BookOpen, Play, X } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';

interface RaagIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: Track) => void;
  currentTrackId: string;
}

export const RaagIndexModal: React.FC<RaagIndexModalProps> = ({
  isOpen,
  onClose,
  onSelectTrack,
  currentTrackId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="raag-index-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#140f12]/95 border border-[#d8be87]/25 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[85vh] flex flex-col text-[#f4ebdc] font-rozha select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d8be87]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#d8be87]" />
            <div>
              <h2 id="raag-index-title" className="text-base sm:text-lg tracking-wide text-[#f4ebdc]">
                RAAG INDEX
              </h2>
              <p className="text-[11px] text-[#b5a38b] font-sans font-normal">
                Canonical ragas, prahars (time of day), thaats & classical rasas in Jalsaghar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#b5a38b] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Raag Index"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Raag List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {RAAG_CATALOG.map((raag) => {
            const matchingTracks = TRACK_CATALOG.filter((t) => raag.tracks.includes(t.id));

            return (
              <div
                key={raag.name}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-[#d8be87]/30 transition-all space-y-2.5"
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg text-[#e8cca0] tracking-wide">{raag.name}</h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#d8be87]/15 text-[#e8cca0] font-sans">
                    {raag.thaat} Thaat
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-[#b5a38b]">
                  <div>
                    <span className="text-[#8e7e69] uppercase text-[10px] tracking-wider block">
                      Prahar / Time of Day
                    </span>
                    <p className="text-[#f4ebdc]/90 mt-0.5">{raag.timeOfDay}</p>
                  </div>
                  <div>
                    <span className="text-[#8e7e69] uppercase text-[10px] tracking-wider block">
                      Rasa / Emotional Tone
                    </span>
                    <p className="text-[#f4ebdc]/90 mt-0.5">{raag.mood}</p>
                  </div>
                </div>

                {/* Associated Mehfil Recordings */}
                {matchingTracks.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                    {matchingTracks.map((trk) => {
                      const isPlayingThis = currentTrackId === trk.id;
                      return (
                        <button
                          key={trk.id}
                          onClick={() => {
                            onSelectTrack(trk);
                            trackEvent('raag_index_track_selected', {
                              raag: raag.name,
                              title: trk.title,
                            });
                            onClose();
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all cursor-pointer ${
                            isPlayingThis
                              ? 'bg-[#d8be87] text-black font-medium'
                              : 'bg-white/5 hover:bg-white/12 text-[#e5d8c3] border border-white/10 hover:border-[#d8be87]/40'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>
                            {trk.title} — {trk.artist}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
