import React, { useState } from 'react';
import { PlaylistId, Track } from '../types';
import { PLAYLISTS } from '../lib/tracks';
import { YouTubePlayer } from './YouTubePlayer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc3,
  Video,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface MusicPlayerProps {
  currentTrack: Track;
  currentPlaylist: PlaylistId;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  noticeMessage: string | null;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onSelectPlaylist: (playlist: PlaylistId) => void;
  onPlayerReady: () => void;
  onStateChange: (state: number) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onError: (code: number) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  currentPlaylist,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  volume,
  isMuted,
  noticeMessage,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSelectPlaylist,
  onPlayerReady,
  onStateChange,
  onTimeUpdate,
  onError,
}) => {
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [showVideoEmbed, setShowVideoEmbed] = useState<boolean>(false);

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec <= 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setIsSeeking(true);
    setSeekTime(val);
  };

  const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (seekTime !== null) {
      onSeek(seekTime);
    }
    setIsSeeking(false);
  };

  const progressPercent = duration > 0 ? ((currentTime / duration) * 100).toFixed(2) : '0';

  const playlists: PlaylistId[] = ['baithak', 'riyaz', 'mehfil'];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 sm:px-8 pb-3 sm:pb-6 safe-pb safe-pl safe-pr pointer-events-auto">
      {/* Notice Message Toast if track skipped */}
      {noticeMessage && (
        <div className="mb-2 max-w-md mx-auto px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#d8be87]/30 text-center text-xs font-rozha tracking-wider text-[#e6cca0] animate-in fade-in slide-in-from-bottom-2 duration-300">
          {noticeMessage}
        </div>
      )}

      {/* Main Glass Floating Card */}
      <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-[#140e10]/80 backdrop-blur-2xl border border-white/12 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] text-[#f7f3e9] overflow-hidden transition-all duration-300">
        {/* Visible YouTube Video Expandable Slot */}
        <div
          className={`transition-all duration-500 overflow-hidden bg-black/95 ${
            showVideoEmbed ? 'max-h-72 sm:max-h-80 border-b border-white/10 p-3' : 'max-h-0 p-0'
          }`}
        >
          <div className="max-w-md mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <YouTubePlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              seekTime={seekTime}
              onPlayerReady={onPlayerReady}
              onStateChange={onStateChange}
              onTimeUpdate={onTimeUpdate}
              onError={onError}
            />
          </div>
        </div>

        {/* Hidden permanent player instance when video collapse is closed */}
        {!showVideoEmbed && (
          <div className="w-[180px] h-[100px] absolute -bottom-9999 left-0 pointer-events-none opacity-1 overflow-hidden">
            <YouTubePlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              seekTime={seekTime}
              onPlayerReady={onPlayerReady}
              onStateChange={onStateChange}
              onTimeUpdate={onTimeUpdate}
              onError={onError}
            />
          </div>
        )}

        {/* Player Upper: Playlist Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-1 border-b border-white/5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {playlists.map((pid) => {
              const p = PLAYLISTS[pid];
              const isActive = currentPlaylist === pid;
              return (
                <button
                  key={pid}
                  onClick={() => onSelectPlaylist(pid)}
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-rozha tracking-[0.2em] uppercase transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#d8be87]/25 text-[#e6cca0] border border-[#d8be87]/40 shadow-sm'
                      : 'text-[#e3dac7]/60 hover:text-[#f7f3e9] hover:bg-white/5'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Toggle Video Visibility */}
          <button
            onClick={() => setShowVideoEmbed(!showVideoEmbed)}
            id="toggle-video-view-btn"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#d8be87] text-[10px] font-rozha tracking-wider uppercase transition-colors cursor-pointer"
            aria-label="Toggle visible video player"
          >
            <Video className="w-3 h-3" />
            <span className="hidden xs:inline">
              {showVideoEmbed ? 'HIDE VIDEO' : 'PERFORMANCE'}
            </span>
            {showVideoEmbed ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Player Core: Artwork/Vinyl, Track Meta, Transport Controls */}
        <div className="p-3.5 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* LEFT: Analogue Vinyl & Track Info */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {/* Spinning Vinyl Record (Decorative Analogue Element) */}
              <div className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black shadow-[0_4px_16px_rgba(0,0,0,0.8)] border border-neutral-800 flex items-center justify-center">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center animate-spin-slow ${
                    isPlaying ? '' : 'paused'
                  }`}
                >
                  <Disc3 className="w-full h-full text-neutral-800" />
                  {/* Vinyl Center Grooves & Label */}
                  <div className="absolute inset-0 rounded-full border border-neutral-700/40 m-2" />
                  <div className="absolute inset-0 rounded-full border border-neutral-700/30 m-3.5" />
                  <div className="absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#52231e] border border-[#d8be87]/50 flex items-center justify-center">
                    <span className="font-bengali text-[8px] text-[#e8cf9b]">জ</span>
                  </div>
                </div>
              </div>

              {/* Title & Artist Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-rozha text-sm sm:text-base md:text-lg text-[#f7f3e9] truncate drop-shadow-sm">
                    {currentTrack.title}
                  </h3>
                  {isBuffering && (
                    <span className="text-[9px] font-rozha tracking-widest text-[#d8be87] uppercase animate-pulse">
                      BUFFERING
                    </span>
                  )}
                </div>

                <p className="font-rozha text-xs sm:text-sm text-[#d8be87]/90 truncate">
                  {currentTrack.artist}
                  {currentTrack.raga && (
                    <span className="text-white/45 ml-2 font-normal text-[11px]">
                      · {currentTrack.raga}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* RIGHT: Transport Controls & Volume */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Previous Track */}
              <button
                onClick={onPrevious}
                id="player-previous-btn"
                className="p-2 sm:p-2.5 rounded-full text-[#e3dac7]/75 hover:text-[#f7f3e9] hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Previous recording"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={onPlayPause}
                id="player-play-pause-btn"
                className="p-2.5 sm:p-3.5 rounded-full bg-[#d8be87] hover:bg-[#ebd29f] text-[#140e10] shadow-[0_4px_16px_rgba(216,190,135,0.4)] hover:scale-105 transition-all cursor-pointer"
                aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={onNext}
                id="player-next-btn"
                className="p-2 sm:p-2.5 rounded-full text-[#e3dac7]/75 hover:text-[#f7f3e9] hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Next recording"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Volume Slider (Desktop) */}
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10">
                <button
                  onClick={onToggleMute}
                  className="text-[#e3dac7]/70 hover:text-white transition-colors cursor-pointer"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400/80" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#d8be87]"
                  aria-label="Volume slider"
                />
              </div>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="font-rozha text-[10px] text-[#e3dac7]/70 w-9 text-right tabular-nums">
              {formatSeconds(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center group">
              <input
                type="range"
                min="0"
                max={duration > 0 ? duration : 100}
                step="0.5"
                value={isSeeking && seekTime !== null ? seekTime : currentTime}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#d8be87] relative z-10"
                aria-label="Track progress seek bar"
              />
              <div
                className="absolute left-0 top-0 bottom-0 bg-[#d8be87] rounded-lg pointer-events-none transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="font-rozha text-[10px] text-[#e3dac7]/70 w-9 tabular-nums">
              {formatSeconds(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
