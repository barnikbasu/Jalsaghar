import React, { useState } from 'react';
import { RAAG_CATALOG, TRACK_CATALOG } from '../../lib/tracks';
import { Track } from '../../types';
import { BookOpen, Play, X, ListMusic, Sparkles, Search } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'raags' | 'all'>('raags');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredRaags = RAAG_CATALOG.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.thaat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.timeOfDay.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTracks = TRACK_CATALOG.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.raga && t.raga.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.gharana && t.gharana.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="raag-index-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#0e0f12]/95 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[85vh] flex flex-col text-white select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="raag-index-title" className="text-base sm:text-lg font-semibold tracking-tight text-white">
                ARCHIVAL INDEX
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Explore canonical ragas, prahars, thaats & classical recordings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Archival Index"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 self-start">
            <button
              onClick={() => setActiveTab('raags')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'raags'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ragas & Prahars</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>All Tracks ({TRACK_CATALOG.length})</span>
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search raga, artist, gharana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === 'raags' ? (
            filteredRaags.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs font-sans">
                No matching ragas found.
              </div>
            ) : (
              filteredRaags.map((raag) => {
                const matchingTracks = TRACK_CATALOG.filter((t) => raag.tracks.includes(t.id));

                return (
                  <div
                    key={raag.name}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all space-y-3"
                  >
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-white tracking-tight">{raag.name}</h3>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-sans border border-white/10">
                        {raag.thaat} Thaat
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans text-zinc-400">
                      <div>
                        <span className="text-zinc-500 uppercase text-[10px] font-medium tracking-wider block">
                          Prahar / Time of Day
                        </span>
                        <p className="text-zinc-200 mt-0.5">{raag.timeOfDay}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 uppercase text-[10px] font-medium tracking-wider block">
                          Rasa / Emotional Tone
                        </span>
                        <p className="text-zinc-200 mt-0.5">{raag.mood}</p>
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
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                                isPlayingThis
                                  ? 'bg-white text-black font-semibold shadow-md'
                                  : 'bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10'
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
              })
            )
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs font-sans">
              No matching recordings found.
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredTracks.map((track, idx) => {
                const isCurrent = currentTrackId === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      onSelectTrack(track);
                      trackEvent('track_selected_from_index', {
                        title: track.title,
                        artist: track.artist,
                      });
                      onClose();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-white/15 border border-white/20 text-white'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="font-mono text-[11px] text-zinc-500 w-5 shrink-0 text-center">
                        {isCurrent ? (
                          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse inline" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-white truncate">
                          {track.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {track.raga ? `${track.raga} · ` : ''}
                          {track.artist}
                          {track.gharana ? ` (${track.gharana})` : ''}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-zinc-500 font-mono shrink-0">
                      {track.duration}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

