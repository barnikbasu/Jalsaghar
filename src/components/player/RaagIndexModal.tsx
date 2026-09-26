import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { RAAG_CATALOG, TRACK_CATALOG } from '../../lib/tracks';
import { Track } from '../../types';
import { BookOpen, Play, X, ListMusic, Sparkles, Search, Compass, Clock, Music } from 'lucide-react';
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
  const [mounted, setMounted] = useState<boolean>(false);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Client-side mount check for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll locking without touching body pointer-events
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Focus management: save focus on open, focus close button, restore focus on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else {
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    }
  }, [isOpen]);

  // Dedicated Escape key handler with capture to guarantee immediate close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        trackEvent('raag_index_closed_via_escape');
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const query = searchQuery.trim().toLowerCase();

  const filteredRaags = RAAG_CATALOG.filter((r) => {
    if (!query) return true;
    return (
      r.name.toLowerCase().includes(query) ||
      (r.thaat && r.thaat.toLowerCase().includes(query)) ||
      (r.mood && r.mood.toLowerCase().includes(query)) ||
      (r.timeOfDay && r.timeOfDay.toLowerCase().includes(query)) ||
      r.tracks.some((tId) => {
        const trk = TRACK_CATALOG.find((t) => t.id === tId);
        return trk && (trk.title.toLowerCase().includes(query) || trk.artist.toLowerCase().includes(query));
      })
    );
  });

  const filteredTracks = TRACK_CATALOG.filter((t) => {
    if (!query) return true;
    return (
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      (t.raga && t.raga.toLowerCase().includes(query)) ||
      (t.gharana && t.gharana.toLowerCase().includes(query))
    );
  });

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto select-auto">
      {/* 1. Backdrop Layer (Separated, full-screen, handles outside clicks) */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-200 pointer-events-auto cursor-pointer"
        onClick={() => {
          trackEvent('raag_index_closed_via_backdrop');
          onClose();
        }}
        aria-hidden="true"
      />

      {/* 2. Interactive Modal Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="raag-index-title"
        className="relative z-10 w-full max-w-2xl mx-3 sm:mx-6 bg-[#0e0a0d]/98 border border-[#d8be87]/25 rounded-3xl p-5 sm:p-7 shadow-[0_25px_65px_rgba(0,0,0,0.95)] max-h-[88vh] sm:max-h-[82vh] flex flex-col text-[#f5ede0] pointer-events-auto overscroll-contain animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => {
          // Prevent clicks inside modal content from triggering backdrop dismissal
          e.stopPropagation();
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d8be87]/15 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-[#d8be87]/10 border border-[#d8be87]/20 flex items-center justify-center text-[#d8be87] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="raag-index-title"
                className="text-base sm:text-lg font-serif tracking-wide text-[#f4ebdc] font-semibold truncate"
              >
                ARCHIVAL INDEX · জলসাঘর
              </h2>
              <p className="text-xs text-[#a3917e] font-sans truncate">
                Canonical Hindustani classical ragas, prahars, thaats & archival recitals
              </p>
            </div>
          </div>

          {/* Prominent Close Button */}
          <button
            ref={closeButtonRef}
            onClick={() => {
              trackEvent('raag_index_closed_via_button');
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 text-[#e8cca0] hover:text-white border border-[#d8be87]/30 text-xs font-sans tracking-wide transition-all cursor-pointer shrink-0 focus:outline-none focus:ring-1 focus:ring-[#d8be87]"
            aria-label="Close Archival Index"
            title="Close Archival Index (Escape)"
          >
            <X className="w-4 h-4" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Close</span>
          </button>
        </div>

        {/* Tab Selection & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 self-start">
            <button
              onClick={() => setActiveTab('raags')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'raags'
                  ? 'bg-[#d8be87] text-black font-semibold shadow-sm'
                  : 'text-[#d8be87]/70 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Ragas & Prahars ({filteredRaags.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#d8be87] text-black font-semibold shadow-sm'
                  : 'text-[#d8be87]/70 hover:text-white'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>All Recitals ({filteredTracks.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#a3917e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by raga, artist, thaat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#786b5f] focus:outline-none focus:border-[#d8be87]/50 transition-colors pointer-events-auto"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs p-0.5 rounded cursor-pointer"
                title="Clear filter"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* 3. Fully Scrollable Content Viewport */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          role="region"
          aria-label="Catalogue recordings list"
          className="flex-1 overflow-y-auto overscroll-contain space-y-3 pr-1.5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent focus:outline-none pointer-events-auto"
        >
          {activeTab === 'raags' ? (
            filteredRaags.length === 0 ? (
              <div className="text-center py-12 text-[#a3917e] text-xs font-sans">
                No matching ragas found for &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredRaags.map((raag) => {
                const matchingTracks = TRACK_CATALOG.filter((t) => raag.tracks.includes(t.id));

                return (
                  <div
                    key={raag.name}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-[#d8be87]/15 hover:border-[#d8be87]/30 transition-all space-y-3"
                  >
                    {/* Raga Title & Thaat badge */}
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#d8be87]" />
                        <h3 className="text-base font-serif font-semibold text-[#f5ede0] tracking-wide">
                          {raag.name}
                        </h3>
                      </div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#d8be87]/15 text-[#e8cca0] font-sans border border-[#d8be87]/25">
                        {raag.thaat} Thaat
                      </span>
                    </div>

                    {/* Prahar & Rasa Attributes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans text-[#b8a795]">
                      <div className="flex items-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#d8be87] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[#877868] uppercase text-[10px] font-medium tracking-wider block">
                            Prahar / Time of Day
                          </span>
                          <p className="text-[#dfd0bd] mt-0.5">{raag.timeOfDay}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-[#d8be87] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[#877868] uppercase text-[10px] font-medium tracking-wider block">
                            Rasa / Bhava
                          </span>
                          <p className="text-[#dfd0bd] mt-0.5">{raag.mood}</p>
                        </div>
                      </div>
                    </div>

                    {/* Associated Canonical Recordings */}
                    {matchingTracks.length > 0 && (
                      <div className="pt-2.5 border-t border-white/5 space-y-1.5">
                        <span className="text-[10px] text-[#877868] uppercase tracking-wider font-sans font-medium block">
                          Archival Recordings ({matchingTracks.length})
                        </span>
                        <div className="flex flex-col gap-1.5">
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
                                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group ${
                                  isPlayingThis
                                    ? 'bg-[#d8be87] text-black font-semibold shadow-md'
                                    : 'bg-white/5 hover:bg-white/10 text-[#f5ede0] border border-white/10 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  {isPlayingThis ? (
                                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-black animate-pulse" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 shrink-0 text-[#d8be87] group-hover:scale-110 transition-transform fill-current" />
                                  )}
                                  <div className="truncate">
                                    <span className="font-serif font-medium">{trk.title}</span>
                                    <span className={isPlayingThis ? 'text-black/80' : 'text-[#a3917e]'}>
                                      {' '}
                                      — {trk.artist}
                                    </span>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-mono shrink-0 ${isPlayingThis ? 'text-black/80' : 'text-[#877868]'}`}>
                                  {isPlayingThis ? 'PLAYING' : trk.playlistId || 'RECITAL'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-[#a3917e] text-xs font-sans">
              No matching recitals found for &ldquo;{searchQuery}&rdquo;.
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
                        ? 'bg-[#d8be87] text-black font-semibold shadow-md'
                        : 'bg-white/[0.03] hover:bg-white/10 text-[#f5ede0] border border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span
                        className={`font-mono text-[11px] w-5 shrink-0 text-center ${
                          isCurrent ? 'text-black font-bold' : 'text-[#877868]'
                        }`}
                      >
                        {isCurrent ? (
                          <Sparkles className="w-3.5 h-3.5 text-black animate-pulse inline" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <div className="truncate">
                        <p className={`font-serif text-sm truncate ${isCurrent ? 'text-black font-semibold' : 'text-white'}`}>
                          {track.title}
                        </p>
                        <p className={`text-xs truncate mt-0.5 ${isCurrent ? 'text-black/80' : 'text-[#a3917e]'}`}>
                          {track.raga ? `${track.raga} · ` : ''}
                          {track.artist}
                          {track.gharana ? ` (${track.gharana})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${isCurrent ? 'bg-black/15 text-black' : 'bg-white/5 text-[#877868]'}`}>
                        {track.playlistId}
                      </span>
                      <Play className={`w-3.5 h-3.5 ${isCurrent ? 'text-black fill-current' : 'text-[#d8be87] opacity-0 group-hover:opacity-100 transition-opacity fill-current'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer / Return Notice */}
        <div className="pt-3 mt-3 border-t border-[#d8be87]/15 flex items-center justify-between text-[11px] text-[#877868] shrink-0 font-sans">
          <span>Click any recital to start listening</span>
          <button
            onClick={onClose}
            className="text-[#e8cca0] hover:text-white underline underline-offset-2 cursor-pointer"
          >
            Return to JALSAGHAR baithak
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
