import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { RAAG_CATALOG, TRACK_CATALOG } from '../../lib/tracks';
import { Track } from '../../types';
import { BookOpen, Play, X, ListMusic, Compass, Search } from 'lucide-react';
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

  const query = searchQuery.trim().toLowerCase();

  const filteredRaags = useMemo(() => {
    return RAAG_CATALOG.filter((r) => {
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
  }, [query]);

  // Group filtered ragas alphabetically by first letter (A, B, D, J, etc.)
  const alphabeticalGroups = useMemo(() => {
    const groups: Record<string, typeof filteredRaags> = {};
    const sorted = [...filteredRaags].sort((a, b) => a.name.localeCompare(b.name));
    for (const r of sorted) {
      const letter = (r.name[0] || '').toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(r);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRaags]);

  const filteredTracks = useMemo(() => {
    return TRACK_CATALOG.filter((t) => {
      if (!query) return true;
      return (
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        (t.raga && t.raga.toLowerCase().includes(query)) ||
        (t.gharana && t.gharana.toLowerCase().includes(query))
      );
    });
  }, [query]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto select-auto p-3 sm:p-6">
      {/* 1. Backdrop Layer */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200 pointer-events-auto cursor-pointer"
        onClick={() => {
          trackEvent('raag_index_closed_via_backdrop');
          onClose();
        }}
        aria-hidden="true"
      />

      {/* 2. Interactive Modal Dialog Container: Archival Catalogue Style */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="raag-index-title"
        className="relative z-10 w-full max-w-2xl mx-auto bg-[rgba(14,8,10,0.96)] border border-[rgba(212,175,55,0.18)] rounded-2xl p-5 sm:p-7 shadow-[0_25px_65px_rgba(0,0,0,0.95)] max-h-[88vh] sm:max-h-[82vh] flex flex-col text-[#f5ede0] pointer-events-auto overscroll-contain animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[rgba(212,175,55,0.12)] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <BookOpen className="w-4 h-4 text-[#d8be87]" />
            <div className="min-w-0">
              <h2
                id="raag-index-title"
                className="text-sm sm:text-base font-rozha tracking-wider text-[#f7f3e9] uppercase truncate"
              >
                RAAG INDEX · জলসাঘর
              </h2>
              <p className="text-[11px] text-[#d6be96]/60 font-serif truncate">
                Archival catalogue of Hindustani classical ragas & recitals
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            ref={closeButtonRef}
            onClick={() => {
              trackEvent('raag_index_closed_via_button');
              onClose();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(11,6,7,0.72)] hover:bg-[rgba(212,175,55,0.10)] text-[#d6be96]/80 hover:text-[#f7f3e9] border border-[rgba(212,175,55,0.15)] text-[10px] font-rozha tracking-wider uppercase transition-colors cursor-pointer shrink-0"
            aria-label="Close Archival Index"
            title="Close (Escape)"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>

        {/* Tab Selection & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3.5 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-[rgba(11,6,7,0.72)] rounded-full border border-[rgba(212,175,55,0.12)] self-start">
            <button
              onClick={() => setActiveTab('raags')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-rozha uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'raags'
                  ? 'bg-[rgba(212,175,55,0.2)] text-[#f7f3e9] border border-[rgba(212,175,55,0.35)] shadow-sm'
                  : 'text-[#d6be96]/70 hover:text-[#f7f3e9]'
              }`}
            >
              <Compass className="w-3 h-3" />
              <span>Ragas ({filteredRaags.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-rozha uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[rgba(212,175,55,0.2)] text-[#f7f3e9] border border-[rgba(212,175,55,0.35)] shadow-sm'
                  : 'text-[#d6be96]/70 hover:text-[#f7f3e9]'
              }`}
            >
              <ListMusic className="w-3 h-3" />
              <span>All Recitals ({filteredTracks.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#d6be96]/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by raga or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[rgba(11,6,7,0.72)] border border-[rgba(212,175,55,0.12)] rounded-full pl-8 pr-7 py-1 text-xs text-[#f7f3e9] placeholder-[#d6be96]/40 focus:outline-none focus:border-[rgba(212,175,55,0.35)] transition-colors pointer-events-auto"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#d6be96]/50 hover:text-white text-xs p-0.5 cursor-pointer"
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
          className="flex-1 overflow-y-auto overscroll-contain pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent focus:outline-none pointer-events-auto"
        >
          {activeTab === 'raags' ? (
            alphabeticalGroups.length === 0 ? (
              <div className="text-center py-12 text-[#d6be96]/50 text-xs font-serif">
                No matching ragas found for &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              alphabeticalGroups.map(([letter, ragasInGroup]) => (
                <div key={letter} className="mb-5 last:mb-2">
                  {/* Alphabetical Section Letter Header */}
                  <div className="font-rozha text-xs tracking-[0.3em] text-[#d8be87]/70 pb-1 border-b border-[rgba(212,175,55,0.12)] mb-2 mt-2">
                    {letter}
                  </div>

                  <div className="space-y-3">
                    {ragasInGroup.map((raag) => {
                      const matchingTracks = TRACK_CATALOG.filter((t) => raag.tracks.includes(t.id));

                      return (
                        <div
                          key={raag.name}
                          className="py-1.5 border-b border-[rgba(212,175,55,0.06)] last:border-b-0"
                        >
                          {/* Raga Header */}
                          <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
                            <h3 className="font-rozha text-sm tracking-wide text-[#f7f3e9] uppercase">
                              {raag.name}
                            </h3>
                            <span className="text-[10px] font-serif text-[#d6be96]/60">
                              {raag.thaat} Thaat · {raag.timeOfDay}
                            </span>
                          </div>

                          {/* Canonical Recordings */}
                          {matchingTracks.length > 0 && (
                            <div className="space-y-0.5 pl-2">
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
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                                      isPlayingThis
                                        ? 'bg-[rgba(212,175,55,0.15)] text-[#f7f3e9] font-medium'
                                        : 'text-[#d6be96]/80 hover:text-[#f7f3e9] hover:bg-[rgba(212,175,55,0.05)]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      {isPlayingThis ? (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d8be87] shrink-0" />
                                      ) : (
                                        <Play className="w-3 h-3 text-[#d8be87]/50 group-hover:text-[#d8be87] shrink-0" />
                                      )}
                                      <span className="truncate font-serif text-[12px]">{trk.title}</span>
                                      <span className="text-[11px] text-[#d6be96]/50 truncate">
                                        — {trk.artist}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-[#d6be96]/50 shrink-0">
                                      {isPlayingThis ? 'NOW PLAYING' : trk.duration}
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
              ))
            )
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-[#d6be96]/50 text-xs font-serif">
              No matching recitals found for &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTracks.map((track) => {
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
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                      isCurrent
                        ? 'bg-[rgba(212,175,55,0.15)] text-[#f7f3e9] font-medium'
                        : 'text-[#d6be96]/80 hover:text-[#f7f3e9] hover:bg-[rgba(212,175,55,0.05)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d8be87] shrink-0" />
                      ) : (
                        <Play className="w-3 h-3 text-[#d8be87]/50 group-hover:text-[#d8be87] shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-rozha text-[12.5px]">{track.title}</span>
                        <span className="text-[#d6be96]/60 text-[11px] font-serif"> — {track.artist}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#d6be96]/50 shrink-0">
                      {isCurrent ? 'NOW PLAYING' : track.duration}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer / Return Notice */}
        <div className="pt-2.5 mt-2.5 border-t border-[rgba(212,175,55,0.12)] flex items-center justify-between text-[10.5px] text-[#d6be96]/50 shrink-0 font-serif">
          <span>Click any recital to start listening</span>
          <button
            onClick={onClose}
            className="text-[#d8be87] hover:text-[#f7f3e9] underline underline-offset-2 cursor-pointer transition-colors"
          >
            Return to baithak
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
