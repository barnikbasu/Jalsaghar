import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Track, PlaylistId, RepeatMode, PlaybackState, PlaybackStatus, PlaybackErrorInfo } from '../types';
import { YouTubePlayer, YouTubePlayerRef } from './YouTubePlayer';
import { ProgressBar } from './player/ProgressBar';
import { VolumeControl } from './player/VolumeControl';
import { UpNextPanel } from './player/UpNextPanel';
import { RaagIndexModal } from './player/RaagIndexModal';
import { extractYouTubeVideoId } from '../lib/youtube';
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
  ListMusic,
  Loader2,
  Heart,
  Music2,
} from 'lucide-react';

const STORAGE_KEY_VOLUME = 'jalsaghar_user_volume';
const STORAGE_KEY_MUTED = 'jalsaghar_is_muted';
const STORAGE_KEY_LIKED = 'jalsaghar_liked_tracks';

export interface MusicPlayerHandle {
  playTrack: (trackOrIndex: Track | number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  getCurrentRequestId?: () => number;
}

interface MusicPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPlayChange?: (playing: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  onTrackSelect: (track: Track) => void;
  allTracks: Track[];
  currentPlaylist: PlaylistId;
  onPlaylistChange: (playlist: PlaylistId) => void;
  onOpenRaagIndex?: () => void;
  isRaagIndexOpen?: boolean;
}

export const MusicPlayer = forwardRef<MusicPlayerHandle, MusicPlayerProps>(
  (
    {
      currentTrack,
      isPlaying,
      onTogglePlay,
      onPlayChange,
      onNext,
      onPrevious,
      onTrackSelect,
      allTracks,
      currentPlaylist,
      onPlaylistChange,
      onOpenRaagIndex,
      isRaagIndexOpen = false,
    },
    ref
  ) => {
    // Direct imperative ref to YouTube IFrame API instance
    const youtubeRef = useRef<YouTubePlayerRef | null>(null);

    // Asynchronous lifecycle refs distinguishing requested track, user intent, and player state
    const currentTrackIndexRef = useRef<number>(0);
    const currentVideoIdRef = useRef<string>('');
    const playerReadyRef = useRef<boolean>(false);
    const intendedPlayingRef = useRef<boolean>(false);
    const pendingTrackIndexRef = useRef<number | null>(null);
    const playRequestIdRef = useRef<number>(0);

    // Playback & telemetry state
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [bufferedFraction, setBufferedFraction] = useState<number>(0);
    const [isBuffering, setIsBuffering] = useState<boolean>(false);
    const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
    const [errorInfo, setErrorInfo] = useState<PlaybackErrorInfo | null>(null);

    // Interactive controls state
    const [isShuffle, setIsShuffle] = useState<boolean>(false);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
    const [showQueue, setShowQueue] = useState<boolean>(false);
    const [showRaagIndex, setShowRaagIndex] = useState<boolean>(false);
    const [imgError, setImgError] = useState<boolean>(false);

    // Synchronize refs with currentTrack and allTracks
    useEffect(() => {
      const idx = allTracks.findIndex((t) => t.id === currentTrack.id);
      if (idx !== -1) {
        currentTrackIndexRef.current = idx;
      }
      currentVideoIdRef.current = extractYouTubeVideoId(currentTrack.youtubeUrl);
    }, [currentTrack, allTracks]);

    // Volume & Mute state with persistence
    const [userVolume, setUserVolume] = useState<number>(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
        if (saved !== null) {
          const parsed = parseFloat(saved);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
        }
      } catch {}
      return 80;
    });

    const [isMuted, setIsMuted] = useState<boolean>(() => {
      try {
        return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
      } catch {
        return false;
      }
    });

    // Liked tracks local storage
    const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_LIKED);
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
          localStorage.setItem(STORAGE_KEY_LIKED, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }, [currentTrack]);

    // Reset img error on track change
    useEffect(() => {
      setImgError(false);
    }, [currentTrack.id]);

    // DIRECT Play/Pause handler invoked within trusted user gesture
    const handlePlayPause = useCallback(() => {
      // If the current track has an active embed restriction, do not issue repeated load/play commands to YouTube.
      // Instead, gracefully open the direct recording destination on YouTube in a new tab.
      if (
        playbackStatus === 'youtube-only' ||
        playbackStatus === 'config-error' ||
        playbackStatus === 'unavailable'
      ) {
        window.open(currentTrack.youtubeUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      if (isPlaying) {
        intendedPlayingRef.current = false;
        youtubeRef.current?.pause();
      } else {
        intendedPlayingRef.current = true;
        youtubeRef.current?.play();
      }
    }, [isPlaying, playbackStatus, currentTrack.youtubeUrl]);

    // Handle play state change notified directly by YouTube engine
    const handlePlayStateChange = useCallback(
      (playing: boolean, requestId?: number) => {
        // Monotonic generation check: discard callbacks from older requests (protects A -> B -> A)
        if (requestId !== undefined && requestId !== playRequestIdRef.current) {
          console.log(
            `[JALSAGHAR] Discarding play state change from stale request ${requestId} (active is ${playRequestIdRef.current})`
          );
          return;
        }

        if (onPlayChange) {
          onPlayChange(playing);
        } else if (playing !== isPlaying) {
          onTogglePlay();
        }
        if (playing) {
          setPlaybackStatus('playing');
          setErrorInfo(null);
        } else {
          setPlaybackStatus((prev) =>
            prev === 'youtube-only' ||
            prev === 'config-error' ||
            prev === 'unavailable' ||
            prev === 'error'
              ? prev
              : 'paused'
          );
        }
      },
      [isPlaying, onPlayChange, onTogglePlay]
    );

    // Canonical playTrack implementation: single canonical command for ALL track selections
    const playTrack = useCallback(
      (target: Track | number) => {
        const requestId = ++playRequestIdRef.current;

        let index: number;
        let track: Track;
        if (typeof target === 'number') {
          index = target;
          track = allTracks[index];
        } else {
          track = target;
          index = allTracks.findIndex((t) => t.id === track.id);
        }

        if (!track) return;

        const videoId = extractYouTubeVideoId(track.youtubeUrl);
        if (!videoId) return;

        currentTrackIndexRef.current = index;
        currentVideoIdRef.current = videoId;
        intendedPlayingRef.current = true;

        // Visual UI synchronization
        setCurrentTime(0);
        setErrorInfo(null);
        setPlaybackStatus('loading');
        onTrackSelect(track);

        if (!playerReadyRef.current) {
          pendingTrackIndexRef.current = index;
          return;
        }

        youtubeRef.current?.loadAndPlay(videoId, requestId);
      },
      [allTracks, onTrackSelect]
    );

    // Handle when YouTube player instance fires onReady
    const handlePlayerReady = useCallback(() => {
      playerReadyRef.current = true;
      if (pendingTrackIndexRef.current !== null) {
        const idx = pendingTrackIndexRef.current;
        pendingTrackIndexRef.current = null;
        const track = allTracks[idx];
        if (track) {
          const videoId = extractYouTubeVideoId(track.youtubeUrl);
          if (videoId) {
            youtubeRef.current?.loadAndPlay(videoId, playRequestIdRef.current);
          }
        }
      }
    }, [allTracks]);

    // Volume slider handler
    const handleVolumeChange = useCallback(
      (newVol: number) => {
        const clamped = Math.max(0, Math.min(100, Math.round(newVol)));
        setUserVolume(clamped);
        youtubeRef.current?.setVolume(clamped);
        if (clamped > 0 && isMuted) {
          setIsMuted(false);
          youtubeRef.current?.setMuted(false);
        }
        try {
          localStorage.setItem(STORAGE_KEY_VOLUME, clamped.toString());
          localStorage.setItem(STORAGE_KEY_MUTED, 'false');
        } catch {}
      },
      [isMuted]
    );

    // Toggle mute handler
    const handleToggleMute = useCallback(() => {
      setIsMuted((prev) => {
        const next = !prev;
        youtubeRef.current?.setMuted(next);
        try {
          localStorage.setItem(STORAGE_KEY_MUTED, next.toString());
        } catch {}
        trackEvent(next ? 'player_muted' : 'player_unmuted');
        return next;
      });
    }, []);

    // Previous button logic: if currentTime > 3.5s, restart current track; else go to previous track
    const handlePreviousAction = useCallback(() => {
      if (currentTime > 3.5) {
        youtubeRef.current?.seekTo(0);
        setCurrentTime(0);
        trackEvent('track_restarted_from_prev', { title: currentTrack.title });
      } else {
        const currentIndex =
          currentTrackIndexRef.current >= 0
            ? currentTrackIndexRef.current
            : allTracks.findIndex((t) => t.id === currentTrack.id);
        const prevIndex = (currentIndex - 1 + allTracks.length) % allTracks.length;
        playTrack(prevIndex);
      }
    }, [currentTime, currentTrack, allTracks, playTrack]);

    // Next button action (supports shuffle if active)
    const handleNextAction = useCallback(() => {
      let nextIndex: number;
      if (isShuffle && allTracks.length > 1) {
        const currentIndex =
          currentTrackIndexRef.current >= 0
            ? currentTrackIndexRef.current
            : allTracks.findIndex((t) => t.id === currentTrack.id);
        const remainingIndices = allTracks
          .map((_, i) => i)
          .filter((i) => i !== currentIndex);
        nextIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
      } else {
        const currentIndex =
          currentTrackIndexRef.current >= 0
            ? currentTrackIndexRef.current
            : allTracks.findIndex((t) => t.id === currentTrack.id);
        nextIndex = (currentIndex + 1) % allTracks.length;
      }
      playTrack(nextIndex);
    }, [isShuffle, allTracks, currentTrack, playTrack]);

    // Handle Track Completion based on RepeatMode
    const handleTrackEnded = useCallback(
      (requestId?: number) => {
        if (requestId !== undefined && requestId !== playRequestIdRef.current) {
          return;
        }
        if (repeatMode === 'one') {
          const currentIdx =
            currentTrackIndexRef.current >= 0
              ? currentTrackIndexRef.current
              : allTracks.findIndex((t) => t.id === currentTrack.id);
          playTrack(currentIdx);
          trackEvent('track_repeat_one', { title: currentTrack.title });
        } else if (repeatMode === 'all') {
          handleNextAction();
        } else {
          const currentIdx =
            currentTrackIndexRef.current >= 0
              ? currentTrackIndexRef.current
              : allTracks.findIndex((t) => t.id === currentTrack.id);
          if (currentIdx < allTracks.length - 1) {
            handleNextAction();
          } else {
            intendedPlayingRef.current = false;
            youtubeRef.current?.pause();
          }
        }
      },
      [repeatMode, currentTrack, allTracks, handleNextAction, playTrack]
    );

    // Cycle repeat modes: off -> all -> one -> off
    const cycleRepeatMode = () => {
      setRepeatMode((prev) => {
        if (prev === 'off') return 'all';
        if (prev === 'all') return 'one';
        return 'off';
      });
    };

    // Expose imperative handle so parent (App) or siblings can play tracks immediately
    useImperativeHandle(
      ref,
      () => ({
        playTrack,
        playVideo: () => {
          intendedPlayingRef.current = true;
          youtubeRef.current?.play();
        },
        pauseVideo: () => {
          intendedPlayingRef.current = false;
          youtubeRef.current?.pause();
        },
        handleNext: handleNextAction,
        handlePrevious: handlePreviousAction,
        getCurrentRequestId: () => playRequestIdRef.current,
      }),
      [playTrack, handleNextAction, handlePreviousAction]
    );

    // YouTube progress update
    const handleProgress = useCallback(
      (curr: number, total: number, loadedFraction: number, requestId?: number) => {
        if (requestId !== undefined && requestId !== playRequestIdRef.current) {
          return;
        }
        setCurrentTime(curr);
        if (total > 0 && duration !== total) {
          setDuration(total);
        }
        setBufferedFraction(loadedFraction);
      },
      [duration]
    );

    // YouTube error handling
    const handleError = useCallback(
      (
        code: number,
        msg: string,
        errorType: 'youtube-only' | 'config-error' | 'unavailable' | 'error',
        requestId?: number
      ) => {
        // Monotonic generation check: discard errors from older requests (protects A -> B -> A)
        if (requestId !== undefined && requestId !== playRequestIdRef.current) {
          console.log(
            `[JALSAGHAR] Discarding error from stale request ${requestId} (active is ${playRequestIdRef.current})`
          );
          return;
        }

        console.warn(`[JALSAGHAR] YouTube Player error (${code}):`, msg);

        let title = 'PLAYBACK ERROR';
        let submessage = "This recording can't be played inside JALSAGHAR.";

        if (errorType === 'youtube-only') {
          title = 'AVAILABLE ON YOUTUBE';
          submessage = "This recording can't be played inside JALSAGHAR.";
        } else if (errorType === 'config-error') {
          title = 'YOUTUBE EMBED CONFIGURATION ERROR (153)';
          submessage = 'Embedder identity or Referer verification failed.';
        } else if (errorType === 'unavailable') {
          title = 'RECORDING UNAVAILABLE (100)';
          submessage = 'This video was removed or marked private on YouTube.';
        } else if (code === 5) {
          title = 'HTML5 PLAYER ERROR (5)';
          submessage = 'The HTML5 browser player encountered an error.';
        } else if (code === 2) {
          title = 'INVALID RECORDING PARAMETER (2)';
          submessage = 'Invalid video parameter.';
        }

        setPlaybackStatus(errorType);
        setErrorInfo({
          code,
          status: errorType,
          title,
          message: msg,
          submessage,
          youtubeUrl: currentTrack.youtubeUrl,
          videoId: currentVideoIdRef.current,
        });

        if (onPlayChange) {
          onPlayChange(false);
        }
      },
      [currentTrack.youtubeUrl, onPlayChange]
    );

    // YouTube autoplay blocked by browser policy
    const handleAutoplayBlocked = useCallback(
      (requestId?: number) => {
        if (requestId !== undefined && requestId !== playRequestIdRef.current) {
          return;
        }
        setPlaybackStatus('autoplay-blocked');
        if (onPlayChange) {
          onPlayChange(false);
        }
      },
      [onPlayChange]
    );

    // YouTube buffering state change
    const handleBufferingChange = useCallback(
      (buffering: boolean, requestId?: number) => {
        if (requestId !== undefined && requestId !== playRequestIdRef.current) {
          return;
        }
        setIsBuffering(buffering);
        if (buffering) {
          setPlaybackStatus((prev) =>
            prev === 'youtube-only' ||
            prev === 'config-error' ||
            prev === 'unavailable' ||
            prev === 'error'
              ? prev
              : 'buffering'
          );
        }
      },
      []
    );

    // Seek commit from ProgressBar
    const handleSeekCommit = useCallback((targetTime: number) => {
      youtubeRef.current?.seekTo(targetTime);
      setCurrentTime(targetTime);
      trackEvent('player_seeked', { targetTime });
    }, []);

    // Open Archival Index Handler
    const handleOpenIndex = useCallback(() => {
      if (onOpenRaagIndex) {
        onOpenRaagIndex();
      } else {
        setShowRaagIndex(true);
      }
    }, [onOpenRaagIndex]);

    // Global Keyboard Shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // If Archival Index is open, do not handle player shortcuts
        if (isRaagIndexOpen || showRaagIndex) {
          return;
        }

        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (
          activeTag === 'input' ||
          activeTag === 'textarea' ||
          (document.activeElement as HTMLElement)?.isContentEditable
        ) {
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
        } else if (e.key === 'q' || e.key === 'Q') {
          e.preventDefault();
          setShowQueue((prev) => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
      handlePlayPause,
      currentTime,
      duration,
      userVolume,
      handleSeekCommit,
      handleVolumeChange,
      handleToggleMute,
      handleNextAction,
      handlePreviousAction,
      toggleLike,
      isRaagIndexOpen,
      showRaagIndex,
    ]);

    const currentVideoId = extractYouTubeVideoId(currentTrack.youtubeUrl);
    const trackArtworkUrl = currentVideoId
      ? `https://img.youtube.com/vi/${currentVideoId}/hqdefault.jpg`
      : '';

    return (
      <div className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-5 flex flex-col items-center pointer-events-none select-none safe-pb">
        {/* 1. UP NEXT / MEHFIL REPERTOIRE PANEL */}
        {showQueue && (
          <UpNextPanel
            currentTrack={currentTrack}
            allTracks={allTracks}
            currentPlaylist={currentPlaylist}
            onPlaylistChange={onPlaylistChange}
            onTrackSelect={(track) => {
              playTrack(track);
              setShowQueue(false);
            }}
            onClose={() => setShowQueue(false)}
          />
        )}

        {/* 2. RAAG INDEX MODAL (Only when not controlled by App root) */}
        {!onOpenRaagIndex && (
          <RaagIndexModal
            isOpen={showRaagIndex}
            onClose={() => setShowRaagIndex(false)}
            onSelectTrack={(track) => {
              playTrack(track);
              setShowRaagIndex(false);
            }}
            currentTrackId={currentTrack.id}
          />
        )}

        {/* 3. UNOBTRUSIVE COMPLIANT YOUTUBE VIEWPORT (Quiet upper-middle on mobile/tablet portrait; bottom-right on desktop & landscape) */}
        <div
          id="jalsaghar-video-viewport"
          className="fixed z-30 pointer-events-auto transition-all duration-300 ease-out top-16 left-1/2 -translate-x-1/2 flex flex-col items-center landscape:max-md:top-auto landscape:max-md:bottom-3 landscape:max-md:right-4 landscape:max-md:left-auto landscape:max-md:translate-x-0 landscape:max-md:items-end portrait:md:top-20 portrait:md:left-1/2 portrait:md:-translate-x-1/2 portrait:md:items-center portrait:md:bottom-auto portrait:md:right-auto landscape:md:top-auto landscape:md:bottom-6 landscape:md:right-6 landscape:md:left-auto landscape:md:translate-x-0 landscape:md:items-end lg:top-auto lg:bottom-6 lg:right-6 lg:left-auto lg:translate-x-0 lg:items-end"
          aria-label="Archival Recording Video Window"
        >
          {/* Subtle archival monitor badge on desktop only */}
          {errorInfo ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 mb-1.5 bg-[#140c0f]/95 backdrop-blur-md rounded-md border border-amber-900/40 text-[10px] font-sans tracking-wide text-amber-200 select-none shadow-md">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  errorInfo.status === 'youtube-only' ? 'bg-amber-400' : 'bg-rose-400'
                }`}
              />
              <span className="font-serif tracking-widest text-[9px] uppercase">
                {errorInfo.title}
              </span>
              <a
                href={currentTrack.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-amber-300 hover:text-white underline font-medium"
              >
                Listen on YouTube ↗
              </a>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 mb-1 bg-black/80 backdrop-blur-md rounded-md border border-amber-900/30 text-[9px] font-serif tracking-widest text-amber-200/70 select-none shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>ARCHIVAL RECORDING FEED</span>
            </div>
          )}

          <YouTubePlayer
            ref={youtubeRef}
            youtubeUrl={currentTrack.youtubeUrl}
            trackTitle={currentTrack.title}
            trackArtist={currentTrack.artist}
            volume={userVolume}
            isMuted={isMuted}
            isPlaying={isPlaying}
            onPlayerReady={handlePlayerReady}
            onPlayStateChange={handlePlayStateChange}
            onBufferingChange={handleBufferingChange}
            onEnded={handleTrackEnded}
            onError={handleError}
            onAutoplayBlocked={handleAutoplayBlocked}
            onProgress={handleProgress}
          >
            {/* Tasteful JALSAGHAR Archival State when restricted / YouTube-only */}
            {errorInfo && (
              <div
                className="absolute inset-0 bg-[#0d0a0b]/96 backdrop-blur-md flex flex-col justify-between p-2 z-20 text-center select-none"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-0.5">
                  <span className="text-[7.5px] font-serif tracking-widest uppercase text-amber-300/80">
                    JALSAGHAR
                  </span>
                  <span className="text-[7.5px] font-mono tracking-wider px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200">
                    {errorInfo.status === 'youtube-only'
                      ? 'YOUTUBE ONLY'
                      : errorInfo.status === 'config-error'
                      ? 'CONFIG (153)'
                      : errorInfo.status === 'unavailable'
                      ? 'UNAVAILABLE'
                      : `ERR ${errorInfo.code}`}
                  </span>
                </div>

                <div className="my-auto py-0.5">
                  <h4 className="text-[9px] font-serif tracking-widest text-amber-200 font-medium uppercase leading-tight">
                    {errorInfo.title}
                  </h4>
                  <p className="text-[8px] text-zinc-300 leading-tight max-w-[170px] mx-auto font-sans">
                    {errorInfo.submessage || errorInfo.message}
                  </p>
                </div>

                <a
                  href={currentTrack.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 hover:border-amber-400/60 text-amber-100 hover:text-white text-[8.5px] font-medium tracking-wide transition-all shadow-sm active:scale-98"
                >
                  <span>Listen on YouTube</span>
                  <span className="text-[8.5px]">↗</span>
                </a>
              </div>
            )}
          </YouTubePlayer>
        </div>

        {/* 4. MAIN MUSIC PLAYER BAR DOCK (DESKTOP) */}
        <div
          id="desktop-music-player"
          className="hidden md:grid grid-cols-[1.1fr_1.8fr_1.1fr] items-center w-full max-w-5xl px-6 py-3.5 rounded-2xl bg-[#0c0d10]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] pointer-events-auto text-white transition-all gap-4"
        >
          {/* ================= ZONE 1: TRACK ARTWORK & METADATA ================= */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Track Artwork / Thumbnail */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shadow-md shrink-0">
              {trackArtworkUrl && !imgError ? (
                <img
                  src={trackArtworkUrl}
                  alt={currentTrack.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-200/60">
                  <Music2 className="w-5 h-5" />
                </div>
              )}
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
              {errorInfo && (
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                  <span className="text-amber-300 font-serif tracking-wider uppercase font-medium">
                    {errorInfo.status === 'youtube-only'
                      ? 'Available on YouTube'
                      : errorInfo.status === 'config-error'
                      ? 'Config Error (153)'
                      : errorInfo.status === 'unavailable'
                      ? 'Unavailable (100)'
                      : 'Playback Error'}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <a
                    href={currentTrack.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-200/90 hover:text-white underline underline-offset-2 flex items-center gap-0.5"
                  >
                    <span>Listen ↗</span>
                  </a>
                </div>
              )}
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
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Play / Pause button */}
              <button
                onClick={handlePlayPause}
                id="desktop-play-btn"
                className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer outline-none"
                aria-label={
                  errorInfo?.status === 'youtube-only'
                    ? 'Available on YouTube (Open in new tab)'
                    : errorInfo?.status === 'config-error'
                    ? 'Embed Configuration Error (Open on YouTube)'
                    : isPlaying
                    ? 'Pause playback (Space)'
                    : 'Start playback (Space)'
                }
                title={
                  errorInfo?.status === 'youtube-only'
                    ? 'Available on YouTube (Open in new tab)'
                    : errorInfo?.status === 'config-error'
                    ? 'Embed Configuration Error (Open on YouTube)'
                    : isPlaying
                    ? 'Pause (Space)'
                    : 'Play (Space)'
                }
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
                id="desktop-next-btn"
                className="p-1.5 rounded-full text-zinc-300 hover:text-white transition-colors cursor-pointer outline-none"
                aria-label="Next track (N)"
                title="Next (N)"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Repeat Modes (Off -> All -> One) */}
              <button
                onClick={cycleRepeatMode}
                id="desktop-repeat-btn"
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  repeatMode !== 'off' ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode.toUpperCase()}`}
                aria-label={`Repeat: ${repeatMode}`}
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
          <div className="flex items-center gap-3 justify-end shrink-0">
            {/* Volume Control Slider */}
            <VolumeControl
              volume={userVolume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
            />

            {/* Up Next / Repertoire Button */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              id="desktop-queue-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-sm active:scale-95 ${
                showQueue
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-200'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 hover:border-white/25 text-white/90 hover:text-white'
              }`}
              title="Up Next / Mehfil Repertoire (Q)"
              aria-label="Up Next / Mehfil Repertoire"
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>QUEUE</span>
            </button>

            {/* INDEX Button */}
            <button
              onClick={handleOpenIndex}
              id="desktop-raag-index-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/25 text-white/90 hover:text-white text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-sm active:scale-95"
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
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0 relative">
              {trackArtworkUrl && !imgError ? (
                <img
                  src={trackArtworkUrl}
                  alt={currentTrack.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-amber-200/60">
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
              {errorInfo && (
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                  <span className="text-amber-300 font-serif tracking-wider uppercase font-medium">
                    {errorInfo.status === 'youtube-only'
                      ? 'Available on YouTube'
                      : errorInfo.status === 'config-error'
                      ? 'Config Error (153)'
                      : errorInfo.status === 'unavailable'
                      ? 'Unavailable (100)'
                      : 'Playback Error'}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <a
                    href={currentTrack.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-200/90 hover:text-white underline underline-offset-2"
                  >
                    Listen ↗
                  </a>
                </div>
              )}
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
                onClick={() => setShowQueue(!showQueue)}
                className="p-1.5 rounded-md bg-white/5 border border-white/15 text-white"
                aria-label="Queue"
                title="Queue"
              >
                <ListMusic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleOpenIndex}
                className="px-2 py-1 rounded-md bg-white/5 border border-white/15 text-[10px] font-medium uppercase tracking-wider text-white"
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
              aria-label={
                errorInfo?.status === 'youtube-only'
                  ? 'Available on YouTube'
                  : isPlaying
                  ? 'Pause'
                  : 'Play'
              }
              title={
                errorInfo?.status === 'youtube-only'
                  ? 'Available on YouTube'
                  : isPlaying
                  ? 'Pause'
                  : 'Play'
              }
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
  }
);

MusicPlayer.displayName = 'MusicPlayer';
