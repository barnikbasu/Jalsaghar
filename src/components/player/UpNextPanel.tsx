import React from 'react';
import { Track, PlaylistId } from '../../types';
import { ListMusic, Sparkles, X } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';

interface UpNextPanelProps {
  currentTrack: Track;
  allTracks: Track[];
  currentPlaylist: PlaylistId;
  onPlaylistChange: (playlist: PlaylistId) => void;
  onTrackSelect: (track: Track) => void;
  onClose: () => void;
}

export const UpNextPanel: React.FC<UpNextPanelProps> = ({
  currentTrack,
  allTracks,
  currentPlaylist,
  onPlaylistChange,
  onTrackSelect,
  onClose,
}) => {
  return (
    <div className="w-full max-w-xl mb-3 bg-[rgba(14,8,10,0.96)] backdrop-blur-md border border-[rgba(212,175,55,0.18)] rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] pointer-events-auto max-h-72 overflow-y-auto z-50 text-[#f5ede0] animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(212,175,55,0.12)]">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[#d8be87]" />
          <span className="font-rozha text-xs uppercase tracking-widest text-[#e8cca0]">
            MEHFIL REPERTOIRE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Playlist / Collection Filters */}
          <div className="flex items-center gap-1 bg-[rgba(11,6,7,0.72)] p-0.5 rounded-full border border-[rgba(212,175,55,0.12)]">
            {(['baithak', 'riyaz', 'mehfil'] as PlaylistId[]).map((pid) => (
              <button
                key={pid}
                onClick={() => onPlaylistChange(pid)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-rozha uppercase tracking-wider transition-all cursor-pointer ${
                  currentPlaylist === pid
                    ? 'bg-[rgba(212,175,55,0.25)] text-[#f7f3e9] border border-[rgba(212,175,55,0.35)] font-semibold shadow-sm'
                    : 'text-[#d8be87]/70 hover:text-white hover:bg-[rgba(212,175,55,0.10)]'
                }`}
              >
                {pid}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#d6be96]/60 hover:text-white hover:bg-[rgba(212,175,55,0.10)] transition-colors"
            aria-label="Close Up Next Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-1">
        {allTracks.map((track, idx) => {
          const isCurrent = currentTrack.id === track.id;
          return (
            <button
              key={track.id}
              onClick={() => {
                onTrackSelect(track);
                trackEvent('track_selected_from_queue', { title: track.title, artist: track.artist });
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer group ${
                isCurrent
                  ? 'bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.25)] text-[#f7f3e9]'
                  : 'text-[#e5d8c3]/80 hover:bg-[rgba(212,175,55,0.06)] hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="font-mono text-[10px] text-[#b5a38b] w-4 shrink-0 text-center">
                  {isCurrent ? (
                    <Sparkles className="w-3 h-3 text-[#d8be87] animate-pulse inline" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <div className="truncate">
                  <p className="font-rozha text-xs sm:text-sm text-[#f7f3e9] truncate font-medium">
                    {track.title}
                  </p>
                  <p className="text-[10px] text-[#b09e86] truncate">
                    {track.raga ? `${track.raga} · ` : ''}
                    {track.artist}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-[#8e7e69] font-mono shrink-0">
                {track.duration}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
