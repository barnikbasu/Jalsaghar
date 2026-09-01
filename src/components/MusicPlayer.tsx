import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Track, PlaylistId, RepeatMode, PlaybackState } from '../types';
import { YouTubePlayer } from './YouTubePlayer';
import { GainController } from '../lib/audio/GainController';
import { ProgressBar } from './player/ProgressBar';
import { VolumeControl } from './player/VolumeControl';
import { UpNextPanel } from './player/UpNextPanel';
import { RaagIndexModal } from './player/RaagIndexModal';
import { trackEvent } from '../lib/analytics';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  ListMusic,
  BookOpen,
  Maximize2,
  Minimize2,
  Loader2,
  Disc3,
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
  // Audio state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedFraction, setBufferedFraction] = useState<number>(0);
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');

  // Controls state
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [showQueue, setShowQueue] = useState<boolean>(false);
  const [showRaagIndex, setShowRaagIndex] = useState<boolean>(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState<boolean>(false);

  // Gain & Volume controller
  const gainControllerRef = useRef<GainController | null>(null);
  const [effectiveVolume, setEffectiveVolume] = useState<number>(80);
  const [userVolume, setUserVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Initialize GainController once
  useEffect(() => {
    const controller = new GainController((effective) => {
      setEffectiveVolume(effective);
    });
    gainControllerRef.current = controller;
    setUserVolume(controller.getUserVolume());
    setIsMuted(controller.getIsMuted());
    setEffectiveVolume(controller.getEffectiveVolume());

    return () => {
      controller.destroy();
    };
  }, []);

  // Update track normalization gain on track switch
  useEffect(() => {
    if (gainControllerRef.current) {
      gainControllerRef.current.setNormalizationGain(currentTrack.normalizationGain || 1.0);
    }
  }, [currentTrack]);

  // Handle Play/Pause with smooth fade envelope
  const handlePlayPause = useCallback(async () => {
    const controller = gainControllerRef.current;
    if (isPlaying) {
      // Pause: fade down then pause
      if (controller) {
        await controller.fadeOut(380);
      }
      onTogglePlay();
    } else {
      // Play: resume and fade up
      onTogglePlay();
      if (controller) {
        controller.fadeIn(450);
      }
    }
  }, [isPlaying, onTogglePlay]);

  // Volume slider handler
  const handleVolumeChange = useCallback((newVol: number) => {
    if (gainControllerRef.current) {
      gainControllerRef.current.setUserVolume(newVol);
      setUserVolume(gainControllerRef.current.getUserVolume());
      setIsMuted(gainControllerRef.current.getIsMuted());
    }
  }, []);

  // Toggle mute handler with memory
  const handleToggleMute = useCallback(() => {
    if (gainControllerRef.current) {
      const muted = gainControllerRef.current.toggleMute();
      setIsMuted(muted);
      setUserVolume(gainControllerRef.current.getUserVolume());
      trackEvent(muted ? 'player_muted' : 'player_unmuted');
    }
  }, []);

  // Previous button logic: if currentTime > 3s, restart current track; else go to previous track
  const handlePreviousAction = useCallback(() => {
    if (currentTime > 3.5) {
      setSeekTarget(0);
      setCurrentTime(0);
      trackEvent('track_restarted_from_prev', { title: currentTrack.title });
    } else {
      onPrevious();
    }
  }, [currentTime, currentTrack, onPrevious]);

  // Next button action (supports shuffle if active)
  const handleNextAction = useCallback(() => {
    if (isShuffle && allTracks.length > 1) {
      const remainingTracks = allTracks.filter((t) => t.id !== currentTrack.id);
      const randomTrack = remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
      onTrackSelect(randomTrack);
    } else {
      onNext();
    }
  }, [isShuffle, allTracks, currentTrack, onTrackSelect, onNext]);

  // Handle Track Completion
  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      setSeekTarget(0);
      setCurrentTime(0);
      trackEvent('track_repeat_one', { title: currentTrack.title });
    } else if (repeatMode === 'all') {
      handleNextAction();
    } else {
      // Repeat off: if at end of playlist, pause; otherwise next
      const currentIndex = allTracks.findIndex((t) => t.id === currentTrack.id);
      if (currentIndex < allTracks.length - 1) {
        handleNextAction();
      } else {
        if (isPlaying) onTogglePlay();
      }
    }
  }, [repeatMode, currentTrack, handleNextAction, allTracks, isPlaying, onTogglePlay]);

  // Cycle repeat modes: off -> all -> one -> off
  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // YouTube progress update
  const handleProgress = useCallback((curr: number, total: number, loadedFraction: number) => {
    setCurrentTime(curr);
    if (total > 0 && duration !== total) {
      setDuration(total);
    }
    setBufferedFraction(loadedFraction);
  }, [duration]);

  // YouTube error handling (graceful fallback)
  const handleError = useCallback((code: number) => {
    console.warn('YouTube Player error code:', code);
    setPlaybackState('error');
    // Gracefully skip to next valid track after brief pause
    setTimeout(() => {
      onNext();
    }, 2400);
  }, [onNext]);

  // Seek commit from ProgressBar
  const handleSeekCommit = useCallback((targetTime: number) => {
    setSeekTarget(targetTime);
    setCurrentTime(targetTime);
    trackEvent('player_seeked', { targetTime });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (duration > 0) {
          handleSeekCommit(Math.min(duration, currentTime + 5));
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (duration > 0) {
          handleSeekCommit(Math.max(0, currentTime - 5));
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(Math.min(100, userVolume + 5));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(Math.max(0, userVolume - 5));
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNextAction();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePreviousAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, currentTime, duration, userVolume, handleSeekCommit, handleVolumeChange, handleToggleMute, handleNextAction, handlePreviousAction]);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-5 flex flex-col items-center pointer-events-none select-none safe-pb">
      {/* 1. UP NEXT / MEHFIL REPERTOIRE PANEL */}
      {showQueue && (
        <UpNextPanel
          currentTrack={currentTrack}
          allTracks={allTracks}
          currentPlaylist={currentPlaylist}
          onPlaylistChange={onPlaylistChange}
          onTrackSelect={onTrackSelect}
          onClose={() => setShowQueue(false)}
        />
      )}

      {/* 2. RAAG INDEX MODAL */}
      <RaagIndexModal
        isOpen={showRaagIndex}
        onClose={() => setShowRaagIndex(false)}
        onSelectTrack={onTrackSelect}
        currentTrackId={currentTrack.id}
      />

      {/* 3. DESKTOP PLAYER DOCK (THREE-ZONE ARCHITECTURE) */}
      <div
        id="desktop-music-player"
        className="hidden md:flex items-center justify-between w-full max-w-4xl px-5 py-3 rounded-full bg-[#120d0f]/80 backdrop-blur-2xl border border-white/10 shadow-[0_15px_45px_rgba(0,0,0,0.75)] pointer-events-auto text-[#f4ebdc] transition-all duration-200"
      >
        {/* ================= ZONE 1: ARCHIVAL METADATA ================= */}
        <div className="flex items-center gap-3.5 min-w-[220px] max-w-[280px] shrink-0">
          {/* Track Artwork / Vinyl Icon */}
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-sm shrink-0 flex items-center justify-center group">
            <Disc3 className={`w-6 h-6 text-[#d8be87] ${isPlaying ? 'animate-spin-slow' : 'opacity-75'}`} />
          </div>

          {/* Title & Archival Raag · Artist hierarchy */}
          <div className="min-w-0 flex-1 truncate transition-opacity duration-200">
            <h3 className="font-rozha text-sm tracking-wide text-[#f4ebdc] truncate font-medium">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-[#c9b596] truncate font-sans">
              {currentTrack.raga ? `${currentTrack.raga} · ` : ''}
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* ================= ZONE 2: CORE PLAYBACK & PRECISE SEEKER ================= */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-md px-4">
          {/* Transport Buttons */}
          <div className="flex items-center gap-4">
            {/* Previous */}
            <button
              onClick={handlePreviousAction}
              id="desktop-prev-btn"
              className="p-2 rounded-full text-[#d8be87]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#e8cca0]"
              aria-label="Previous track (P)"
              title="Previous (P)"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play / Pause */}
            <button
              onClick={handlePlayPause}
              id="desktop-play-pause-btn"
              className="w-10 h-10 rounded-full bg-[#e8cca0] hover:bg-[#fff0d4] text-black flex items-center justify-center shadow-[0_2px_18px_rgba(232,204,160,0.45)] transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#f4ebdc]"
              aria-label={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isBuffering ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin text-black" />
              ) : isPlaying ? (
                <Pause className="w-4.5 h-4.5 fill-black text-black" />
              ) : (
                <Play className="w-4.5 h-4.5 fill-black text-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNextAction}
              id="desktop-next-btn"
              className="p-2 rounded-full text-[#d8be87]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#e8cca0]"
              aria-label="Next track (N)"
              title="Next (N)"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Integrated Precise Seeker */}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            bufferedFraction={bufferedFraction}
            onSeekCommit={handleSeekCommit}
          />
        </div>

        {/* ================= ZONE 3: UTILITY CONTROLS ================= */}
        <div className="flex items-center gap-2.5 min-w-[210px] justify-end shrink-0">
          {/* Shuffle Toggle */}
          <button
            onClick={() => {
              setIsShuffle(!isShuffle);
              trackEvent('player_shuffle_toggled', { enabled: !isShuffle });
            }}
            id="desktop-shuffle-btn"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isShuffle
                ? 'bg-[#d8be87]/20 text-[#e8cca0]'
                : 'text-[#d8be87]/60 hover:text-white hover:bg-white/10'
            }`}
            title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
            aria-label={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          {/* Repeat Toggle */}
          <button
            onClick={cycleRepeatMode}
            id="desktop-repeat-btn"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              repeatMode !== 'off'
                ? 'bg-[#d8be87]/20 text-[#e8cca0]'
                : 'text-[#d8be87]/60 hover:text-white hover:bg-white/10'
            }`}
            title={`Repeat: ${repeatMode.toUpperCase()}`}
            aria-label={`Repeat ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-3.5 h-3.5 text-[#e8cca0]" />
            ) : (
              <Repeat className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Volume Control */}
          <VolumeControl
            volume={userVolume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
          />

          {/* Raag Index Trigger */}
          <button
            onClick={() => setShowRaagIndex(true)}
            id="desktop-raag-index-btn"
            className="p-1.5 rounded-full text-[#d8be87]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Open Raag Index"
            aria-label="Open Raag Index"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Repertoire / Up Next Trigger */}
          <button
            onClick={() => setShowQueue(!showQueue)}
            id="desktop-queue-btn"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              showQueue
                ? 'bg-[#d8be87]/20 text-[#e8cca0]'
                : 'text-[#d8be87]/70 hover:text-white hover:bg-white/10'
            }`}
            title="Mehfil Repertoire"
            aria-label="Toggle Mehfil Repertoire"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Visible YouTube Video 16:9 Slot (Mandatory requirement) */}
          <div
            className={`transition-all duration-300 relative ${
              isVideoExpanded
                ? 'fixed bottom-24 right-6 w-80 shadow-[0_15px_50px_rgba(0,0,0,0.95)] z-50 rounded-2xl overflow-hidden border border-[#d8be87]/40'
                : 'w-20 h-12 rounded-lg overflow-hidden border border-white/15 shadow-sm'
            }`}
          >
            <YouTubePlayer
              videoId={currentTrack.videoId}
              isPlaying={isPlaying}
              volume={effectiveVolume}
              isMuted={isMuted}
              onPlayStateChange={(playing) => {
                if (playing !== isPlaying) onTogglePlay();
              }}
              onBufferingChange={(buf) => setIsBuffering(buf)}
              onEnded={handleTrackEnded}
              onError={handleError}
              onProgress={handleProgress}
              seekToTimestamp={seekTarget}
              onSeekHandled={() => setSeekTarget(null)}
              className="w-full h-full"
            />

            {/* Expand / Minimize Pip overlay button */}
            <button
              onClick={() => setIsVideoExpanded(!isVideoExpanded)}
              className="absolute top-1 right-1 p-1 rounded-md bg-black/70 text-white/80 hover:text-white hover:bg-black transition-colors z-20"
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

      {/* 4. MOBILE TACTILE PLAYBACK SHEET (DEDICATED LISTENING ERGONOMICS) */}
      <div
        id="mobile-music-player"
        className="flex md:hidden flex-col w-full max-w-sm bg-[#120d0f]/90 backdrop-blur-2xl border border-white/12 rounded-3xl p-4 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.9)] pointer-events-auto text-[#f4ebdc]"
      >
        {/* Top: 16:9 Video & Metadata */}
        <div className="flex items-center gap-3.5 mb-3">
          {/* Visible YouTube 16:9 Player container */}
          <div className="w-24 h-14 rounded-xl overflow-hidden border border-white/15 shrink-0 relative bg-black shadow-inner">
            <YouTubePlayer
              videoId={currentTrack.videoId}
              isPlaying={isPlaying}
              volume={effectiveVolume}
              isMuted={isMuted}
              onPlayStateChange={(playing) => {
                if (playing !== isPlaying) onTogglePlay();
              }}
              onBufferingChange={(buf) => setIsBuffering(buf)}
              onEnded={handleTrackEnded}
              onError={handleError}
              onProgress={handleProgress}
              seekToTimestamp={seekTarget}
              onSeekHandled={() => setSeekTarget(null)}
              className="w-full h-full"
            />
          </div>

          {/* Track Titles */}
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="font-rozha text-sm sm:text-base text-[#f4ebdc] truncate leading-tight">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-[#c9b596] truncate font-sans mt-0.5">
              {currentTrack.raga ? `${currentTrack.raga} · ` : ''}
              {currentTrack.artist}
            </p>
          </div>

          {/* Utility Quick Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowRaagIndex(true)}
              className="p-2 rounded-full text-[#d8be87]/80 hover:text-white transition-colors"
              aria-label="Raag Index"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="p-2 rounded-full text-[#d8be87]/80 hover:text-white transition-colors"
              aria-label="Repertoire"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Large Tactile Seeker */}
        <div className="mb-2">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            bufferedFraction={bufferedFraction}
            onSeekCommit={handleSeekCommit}
          />
        </div>

        {/* Primary Controls Row */}
        <div className="flex items-center justify-between px-1">
          {/* Shuffle */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2.5 rounded-full transition-colors ${
              isShuffle ? 'text-[#e8cca0]' : 'text-white/40 hover:text-white'
            }`}
            aria-label={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            onClick={handlePreviousAction}
            id="mobile-prev-btn"
            className="p-2.5 rounded-full text-white/80 hover:text-white active:scale-95 transition-transform"
            aria-label="Previous Track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Central Dominant Play/Pause */}
          <button
            onClick={handlePlayPause}
            id="mobile-play-pause-btn"
            className="w-12 h-12 rounded-full bg-[#e8cca0] text-black flex items-center justify-center shadow-[0_2px_16px_rgba(232,204,160,0.5)] active:scale-95 transition-transform"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={handleNextAction}
            id="mobile-next-btn"
            className="p-2.5 rounded-full text-white/80 hover:text-white active:scale-95 transition-transform"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeatMode}
            className={`p-2.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-[#e8cca0]' : 'text-white/40 hover:text-white'
            }`}
            aria-label={`Repeat ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4 text-[#e8cca0]" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
