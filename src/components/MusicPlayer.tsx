import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  BookOpen,
  Maximize2,
  Minimize2,
  Loader2,
  Heart,
  Music2,
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
  const [imgError, setImgError] = useState<boolean>(false);

  // Liked tracks local storage
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jalsaghar_liked_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isCurrentTrackLiked = likedTrackIds.includes(currentTrack.id);

  const toggleLike = useCallback(() => {
    setLikedTrackIds((prev) => {
      let updated: string[];
      if (prev.includes(currentTrack.id)) {
        updated = prev.filter((id) => id !== currentTrack.id);
        trackEvent('track_unliked', { title: currentTrack.title });
      } else {
        updated = [...prev, currentTrack.id];
        trackEvent('track_liked', { title: currentTrack.title });
      }
      try {
        localStorage.setItem('jalsaghar_liked_tracks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [currentTrack]);

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

  // Reset img error on track change
  useEffect(() => {
    setImgError(false);
  }, [currentTrack.id]);

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
      if (controller) {
        await controller.fadeOut(380);
      }
      onTogglePlay();
    } else {
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

  // Previous button logic: if currentTime > 3.5s, restart current track; else go to previous track
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

  // YouTube error handling
  const handleError = useCallback((code: number) => {
    console.warn('YouTube Player error code:', code);
    setPlaybackState('error');
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
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        toggleLike();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, currentTime, duration, userVolume, handleSeekCommit, handleVolumeChange, handleToggleMute, handleNextAction, handlePreviousAction, toggleLike]);

  const trackArtworkUrl = `https://img.youtube.com/vi/${currentTrack.videoId}/hqdefault.jpg`;

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

      {/* 3. FLOATING PIP VIDEO CONTAINER (WHEN EXPANDED) */}
      <div
        className={`pointer-events-auto transition-all duration-300 ${
          isVideoExpanded
            ? 'fixed bottom-28 right-6 w-80 h-48 shadow-[0_20px_50px_rgba(0,0,0,0.95)] z-50 rounded-2xl overflow-hidden border border-white/20 bg-black'
            : 'absolute w-0.5 h-0.5 opacity-0 overflow-hidden pointer-events-none'
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

        {isVideoExpanded && (
          <button
            onClick={() => setIsVideoExpanded(false)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-white/90 hover:text-white hover:bg-black transition-colors z-20 cursor-pointer shadow-md"
            title="Minimize Video"
            aria-label="Minimize Video"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Non-expanded DOM Player instance to maintain seamless continuous playback */}
      {!isVideoExpanded && (
        <div className="absolute w-0.5 h-0.5 opacity-0 overflow-hidden pointer-events-none">
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
      )}

      {/* 4. MAIN MUSIC PLAYER BAR DOCK */}
      <div
        id="desktop-music-player"
        className="hidden md:grid grid-cols-[1.1fr_1.8fr_1.1fr] items-center w-full max-w-5xl px-6 py-3.5 rounded-2xl bg-[#0c0d10]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] pointer-events-auto text-white transition-all gap-4"
      >
        {/* ================= ZONE 1: TRACK ARTWORK & METADATA ================= */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Track Artwork / Video Thumbnail */}
          <div
            onClick={() => setIsVideoExpanded(!isVideoExpanded)}
            className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shadow-md shrink-0 group cursor-pointer"
            title={isVideoExpanded ? 'Minimize video' : 'Click to watch performance'}
          >
            {!imgError ? (
              <img
                src={trackArtworkUrl}
                alt={currentTrack.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400">
                <Music2 className="w-5 h-5" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Title & Artist hierarchy */}
          <div className="min-w-0 flex-1 truncate">
            <h3 className="text-sm font-semibold text-white tracking-tight truncate">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {currentTrack.raga ? `${currentTrack.raga} · ` : ''}
              {currentTrack.artist}
            </p>
          </div>

          {/* Like / Heart Action */}
          <button
            onClick={toggleLike}
            id="player-like-btn"
            className="p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer outline-none shrink-0"
            title={isCurrentTrackLiked ? 'Unlike (L)' : 'Like (L)'}
            aria-label={isCurrentTrackLiked ? 'Unlike track' : 'Like track'}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 active:scale-125 ${
                isCurrentTrackLiked
                  ? 'text-rose-500 fill-rose-500 hover:text-rose-400 hover:fill-rose-400'
                  : 'hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* ================= ZONE 2: CONTROLS & TIMELINE ================= */}
        <div className="flex flex-col items-center gap-1.5 w-full max-w-md mx-auto">
          {/* Media Playback Controls Row */}
          <div className="flex items-center gap-5">
            {/* Shuffle */}
            <button
              onClick={() => {
                setIsShuffle(!isShuffle);
                trackEvent('player_shuffle_toggled', { enabled: !isShuffle });
              }}
              id="desktop-shuffle-btn"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isShuffle ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
              aria-label={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={handlePreviousAction}
              id="desktop-prev-btn"
              className="p-1.5 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer outline-none"
              aria-label="Previous track (P)"
              title="Previous (P)"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play / Pause Pill */}
            <button
              onClick={handlePlayPause}
              id="desktop-play-pause-btn"
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none"
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
              className="p-1.5 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer outline-none"
              aria-label="Next track (N)"
              title="Next (N)"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              id="desktop-repeat-btn"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                repeatMode !== 'off' ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
              aria-label={`Repeat ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4 text-white" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Integrated Seeker Bar */}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            bufferedFraction={bufferedFraction}
            onSeekCommit={handleSeekCommit}
          />
        </div>

        {/* ================= ZONE 3: UTILITY & RAAG INDEX ================= */}
        <div className="flex items-center gap-4 justify-end shrink-0">
          {/* Volume Control Slider */}
          <VolumeControl
            volume={userVolume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
          />

          {/* INDEX Button */}
          <button
            onClick={() => setShowRaagIndex(true)}
            id="desktop-raag-index-btn"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white/90 hover:text-white text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-sm active:scale-95"
            title="Open Raag & Repertoire Index"
            aria-label="Open Raag & Repertoire Index"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
            <span>INDEX</span>
          </button>
        </div>
      </div>

      {/* 5. MOBILE PLAYER DOCK */}
      <div
        id="mobile-music-player"
        className="flex md:hidden flex-col w-full max-w-sm bg-[#0c0d10]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] pointer-events-auto text-white"
      >
        {/* Top: Artwork, Titles, Heart & Index */}
        <div className="flex items-center gap-3 mb-3">
          <div
            onClick={() => setIsVideoExpanded(!isVideoExpanded)}
            className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0 relative cursor-pointer"
          >
            {!imgError ? (
              <img
                src={trackArtworkUrl}
                alt={currentTrack.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-400">
                <Music2 className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <h3 className="text-sm font-semibold text-white truncate leading-tight">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {currentTrack.raga ? `${currentTrack.raga} · ` : ''}
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleLike}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors"
              aria-label="Like"
            >
              <Heart
                className={`w-4 h-4 ${
                  isCurrentTrackLiked ? 'text-rose-500 fill-rose-500' : ''
                }`}
              />
            </button>
            <button
              onClick={() => setShowRaagIndex(true)}
              className="px-2.5 py-1 rounded-md bg-white/5 border border-white/15 text-[11px] font-medium uppercase tracking-wider text-white"
              aria-label="Index"
            >
              INDEX
            </button>
          </div>
        </div>

        {/* Mobile Seeker */}
        <div className="mb-2">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            bufferedFraction={bufferedFraction}
            onSeekCommit={handleSeekCommit}
          />
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-full transition-colors ${
              isShuffle ? 'text-white' : 'text-zinc-400'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={handlePreviousAction}
            className="p-2 rounded-full text-zinc-300 hover:text-white"
            aria-label="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-md active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="w-4.5 h-4.5 fill-black text-black" />
            ) : (
              <Play className="w-4.5 h-4.5 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNextAction}
            className="p-2 rounded-full text-zinc-300 hover:text-white"
            aria-label="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={cycleRepeatMode}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-white' : 'text-zinc-400'
            }`}
            aria-label="Repeat"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4 text-white" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

