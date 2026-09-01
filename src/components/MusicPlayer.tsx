import React, { useState } from 'react';
import { Track, PlaylistId } from '../types';
import { YouTubePlayer } from './YouTubePlayer';
import { trackEvent } from '../lib/analytics';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ListMusic,
} from 'lucide-react';

interface MusicPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onTrackSelect: (track: Track) => void;
  allTracks: Track[];
  currentPlaylist: PlaylistId;
  onPlaylistChange: (playlist: PlaylistId) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onTrackSelect,
  allTracks,
  currentPlaylist,
  onPlaylistChange,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [showQueue, setShowQueue] = useState<boolean>(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState<boolean>(false);

  const handleProgress = (curr: number, total: number) => {
    setCurrentTime(curr);
    if (total > 0 && duration !== total) {
      setDuration(total);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setSeekTarget(newTime);
  };

  const handleEnded = () => {
    if (isRepeat) {
      setSeekTarget(0);
    } else {
      onNext();
    }
  };

  const handleError = (code: number) => {
    console.warn('YouTube Player error code:', code);
    // Gracefully skip to next track after 2 seconds
    setTimeout(() => {
      onNext();
    }, 2500);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-6 flex flex-col items-center pointer-events-none select-none safe-pb">
      {/* EXPANDABLE PLAYLIST DRAWER / QUEUE */}
      {showQueue && (
        <div className="w-full max-w-2xl mb-3 bg-[#120d0f]/95 backdrop-blur-xl border border-[#d8be87]/20 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.85)] pointer-events-auto max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#d8be87]/15">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-[#d8be87]" />
              <span className="font-rozha text-xs uppercase tracking-widest text-[#e8cca0]">
                MEHFIL REPERTOIRE
              </span>
            </div>
            {/* Playlist Collections */}
            <div className="flex items-center gap-1">
              {(['baithak', 'riyaz', 'mehfil'] as PlaylistId[]).map((pid) => (
                <button
                  key={pid}
                  onClick={() => onPlaylistChange(pid)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-rozha uppercase tracking-wider transition-all cursor-pointer ${
                    currentPlaylist === pid
                      ? 'bg-[#d8be87] text-black font-semibold'
                      : 'text-[#d8be87]/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {pid}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {allTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  onTrackSelect(track);
                  trackEvent('track_selected', { title: track.title, artist: track.artist });
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  currentTrack.id === track.id
                    ? 'bg-white/10 text-[#e8cca0]'
                    : 'text-[#e5d8c3]/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="font-rozha truncate font-medium">{track.title}</p>
                  <p className="text-[10px] text-[#b09e86] truncate">{track.artist}</p>
                </div>
                <span className="text-[10px] text-[#8e7e69] font-mono">{track.duration}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DESKTOP PLAYER (HORIZONTAL SLEEK DOCK) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-3xl px-5 py-3 rounded-full bg-black/45 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.7)] pointer-events-auto text-[#f5ede0]">
        {/* LEFT: Track Info */}
        <div className="flex items-center gap-3 min-w-[200px] max-w-[260px]">
          <div className="truncate">
            <h3 className="font-rozha text-sm tracking-wide text-[#f4ebdc] truncate">
              {currentTrack.title}
            </h3>
            <p className="font-rozha text-xs text-[#c9b596] truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* CENTER: Transport Controls & Seek */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-sm px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onPrevious}
              id="desktop-prev-btn"
              className="p-1.5 rounded-full text-[#d8be87]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              id="desktop-play-pause-btn"
              className="w-10 h-10 rounded-full bg-[#e8cca0] hover:bg-[#fff0d4] text-black flex items-center justify-center shadow-[0_2px_15px_rgba(232,204,160,0.4)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4.5 h-4.5 fill-black text-black" />
              ) : (
                <Play className="w-4.5 h-4.5 fill-black text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              id="desktop-next-btn"
              className="p-1.5 rounded-full text-[#d8be87]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Minimal Integrated Scrubber Bar */}
          <div className="w-full flex items-center gap-2 text-[10px] text-[#b5a38b] font-mono">
            <span>{formatTime(currentTime)}</span>
            <div className="relative flex-1 flex items-center group cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#e8cca0] group-hover:h-1.5 transition-all"
                aria-label="Seek track position"
              />
            </div>
            <span>{formatTime(duration) || currentTrack.duration}</span>
          </div>
        </div>

        {/* RIGHT: Visible 16:9 YouTube Video Slot & Repertoire Button */}
        <div className="flex items-center gap-2 min-w-[180px] justify-end">
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showQueue ? 'bg-white/20 text-[#e8cca0]' : 'text-[#d8be87]/80 hover:text-white hover:bg-white/10'
            }`}
            title="Repertoire Catalog"
            aria-label="Toggle Repertoire"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Visible YouTube Video Container (16:9) */}
          <div
            className={`transition-all duration-300 relative ${
              isVideoExpanded
                ? 'fixed bottom-24 right-6 w-80 shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 rounded-xl overflow-hidden border border-[#d8be87]/30'
                : 'w-24 h-14 rounded-lg overflow-hidden border border-white/10 shadow-md'
            }`}
          >
            <YouTubePlayer
              videoId={currentTrack.videoId}
              isPlaying={isPlaying}
              onPlayStateChange={(playing) => {
                if (playing !== isPlaying) onTogglePlay();
              }}
              onEnded={handleEnded}
              onError={handleError}
              onProgress={handleProgress}
              seekToTimestamp={seekTarget}
              onSeekHandled={() => setSeekTarget(null)}
              className="w-full h-full"
            />

            {/* Toggle Full Video / Expand Button */}
            <button
              onClick={() => setIsVideoExpanded(!isVideoExpanded)}
              className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition-colors z-20"
              title={isVideoExpanded ? 'Minimize Video' : 'Expand Video'}
              aria-label={isVideoExpanded ? 'Minimize Video' : 'Expand Video'}
            >
              {isVideoExpanded ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE PLAYER (STACKED COMPACT CARD) */}
      <div className="flex md:hidden flex-col w-full max-w-sm bg-black/55 backdrop-blur-xl border border-white/12 rounded-3xl p-4 shadow-[0_12px_45px_rgba(0,0,0,0.85)] pointer-events-auto text-[#f5ede0]">
        {/* Top Row: Mini Video/Artwork, Title, Subtitle, Heart */}
        <div className="flex items-center gap-3 mb-3">
          {/* Visible 16:9 YouTube Player */}
          <div className="w-24 h-14 rounded-xl overflow-hidden border border-white/15 shrink-0 relative bg-black">
            <YouTubePlayer
              videoId={currentTrack.videoId}
              isPlaying={isPlaying}
              onPlayStateChange={(playing) => {
                if (playing !== isPlaying) onTogglePlay();
              }}
              onEnded={handleEnded}
              onError={handleError}
              onProgress={handleProgress}
              seekToTimestamp={seekTarget}
              onSeekHandled={() => setSeekTarget(null)}
              className="w-full h-full"
            />
          </div>

          {/* Track Details */}
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="font-rozha text-sm text-[#f4ebdc] truncate leading-snug">
              {currentTrack.title}
            </h3>
            <p className="font-rozha text-xs text-[#c9b596] truncate">
              {currentTrack.artist}
            </p>
          </div>

          {/* Action / Favorite Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-full text-[#d8be87]/80 hover:text-red-400 transition-colors"
              aria-label="Save Track"
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
              />
            </button>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="p-2 rounded-full text-[#d8be87]/80 hover:text-white transition-colors"
              aria-label="View Repertoire"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Middle Row: Progress Scrubber & Timestamps */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#e8cca0]"
            aria-label="Seek track position"
          />
          <div className="flex items-center justify-between text-[10px] text-[#b5a38b] font-mono mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration) || currentTrack.duration}</span>
          </div>
        </div>

        {/* Bottom Row: Controls */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-full transition-colors ${
              isShuffle ? 'text-[#e8cca0]' : 'text-white/40 hover:text-white'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevious}
            id="mobile-prev-btn"
            className="p-2 rounded-full text-white/80 hover:text-white transition-colors"
            aria-label="Previous Track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            id="mobile-play-pause-btn"
            className="w-12 h-12 rounded-full bg-[#e8cca0] text-black flex items-center justify-center shadow-[0_2px_15px_rgba(232,204,160,0.4)] active:scale-95 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            id="mobile-next-btn"
            className="p-2 rounded-full text-white/80 hover:text-white transition-colors"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-2 rounded-full transition-colors ${
              isRepeat ? 'text-[#e8cca0]' : 'text-white/40 hover:text-white'
            }`}
            aria-label="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
