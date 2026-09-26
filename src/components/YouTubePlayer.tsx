import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { trackEvent } from '../lib/analytics';
import { extractYouTubeVideoId } from '../lib/youtube';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YouTubePlayerRef {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  isReady: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface YouTubePlayerProps {
  youtubeUrl: string;
  volume: number; // 0 - 100
  isMuted: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
  onBufferingChange?: (isBuffering: boolean) => void;
  onEnded: () => void;
  onError?: (errorCode: number, message?: string) => void;
  onProgress: (currentTime: number, duration: number, bufferedFraction: number) => void;
  className?: string;
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  (
    {
      youtubeUrl,
      volume,
      isMuted,
      onPlayStateChange,
      onBufferingChange,
      onEnded,
      onError,
      onProgress,
      className = '',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    // Track initialization, readiness, and user intent
    const isPlayerReadyRef = useRef<boolean>(false);
    const intendedPlayingRef = useRef<boolean>(false);
    const currentVideoIdRef = useRef<string>('');
    const volumeRef = useRef<number>(volume);
    const isMutedRef = useRef<boolean>(isMuted);

    const [isApiReady, setIsApiReady] = useState<boolean>(false);
    const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

    // Keep refs in sync with latest props
    volumeRef.current = volume;
    isMutedRef.current = isMuted;

    const videoId = extractYouTubeVideoId(youtubeUrl);
    currentVideoIdRef.current = videoId;

    // Expose direct imperative playback controls to the JALSAGHAR music player
    useImperativeHandle(
      ref,
      () => ({
        playVideo: () => {
          intendedPlayingRef.current = true;
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.playVideo();
            } catch (err) {
              console.warn('Direct playVideo error:', err);
            }
          }
        },
        pauseVideo: () => {
          intendedPlayingRef.current = false;
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.pauseVideo();
            } catch (err) {
              console.warn('Direct pauseVideo error:', err);
            }
          }
        },
        seekTo: (seconds: number) => {
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.seekTo(seconds, true);
            } catch (err) {
              console.warn('Direct seekTo error:', err);
            }
          }
        },
        setVolume: (vol: number) => {
          volumeRef.current = vol;
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.setVolume(vol);
            } catch {}
          }
        },
        setMuted: (muted: boolean) => {
          isMutedRef.current = muted;
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              if (muted) {
                playerRef.current.mute();
              } else {
                playerRef.current.unMute();
                playerRef.current.setVolume(volumeRef.current);
              }
            } catch {}
          }
        },
        isReady: () => isPlayerReadyRef.current,
        getCurrentTime: () => {
          try {
            return playerRef.current?.getCurrentTime?.() || 0;
          } catch {
            return 0;
          }
        },
        getDuration: () => {
          try {
            return playerRef.current?.getDuration?.() || 0;
          } catch {
            return 0;
          }
        },
      }),
      []
    );

    // 1. Load YouTube IFrame API script once safely
    useEffect(() => {
      if (window.YT && window.YT.Player) {
        setIsApiReady(true);
        return;
      }

      const existingTag = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existingTag) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        setIsApiReady(true);
      };
    }, []);

    // 2. Initialize YT.Player ONCE when API and container are ready
    useEffect(() => {
      if (!isApiReady || !containerRef.current || playerRef.current) return;

      const initialVideoId = currentVideoIdRef.current;
      if (!initialVideoId) return;

      try {
        const originParam =
          typeof window !== 'undefined' &&
          window.location.origin &&
          window.location.origin !== 'null'
            ? window.location.origin
            : undefined;

        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: initialVideoId,
          width: '200',
          height: '113',
          playerVars: {
            autoplay: 0,
            controls: 0, // CRITICAL: Disable native YouTube controls so custom JALSAGHAR player is primary!
            enablejsapi: 1, // CRITICAL: REQUIRED to allow JavaScript API commands!
            disablekb: 1, // Disable YouTube keyboard shortcuts so JALSAGHAR handles them
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: originParam,
          },
          events: {
            onReady: (event: any) => {
              isPlayerReadyRef.current = true;
              setIsPlayerReady(true);

              // Apply initial volume & mute state
              try {
                if (isMutedRef.current) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                  event.target.setVolume(volumeRef.current);
                }
              } catch {}

              // Initial duration check
              try {
                const total = event.target?.getDuration?.() || 0;
                const curr = event.target?.getCurrentTime?.() || 0;
                const loaded = event.target?.getVideoLoadedFraction?.() || 0;
                if (total > 0) {
                  onProgress(curr, total, loaded);
                }
              } catch {}

              // Fulfill user's play intent if Play was clicked before onReady
              if (intendedPlayingRef.current) {
                try {
                  event.target.playVideo();
                } catch (err) {
                  console.warn('onReady playVideo error:', err);
                }
              }
            },
            onStateChange: (event: any) => {
              if (!window.YT) return;
              const state = event.data;

              // Immediately check duration and update progress
              try {
                const total = event.target?.getDuration?.() || 0;
                const curr = event.target?.getCurrentTime?.() || 0;
                const loaded = event.target?.getVideoLoadedFraction?.() || 0;
                if (total > 0) {
                  onProgress(curr, total, loaded);
                }
              } catch {}

              if (state === window.YT.PlayerState.PLAYING) {
                intendedPlayingRef.current = true;
                onPlayStateChange(true);
                if (onBufferingChange) onBufferingChange(false);
              } else if (state === window.YT.PlayerState.PAUSED) {
                intendedPlayingRef.current = false;
                onPlayStateChange(false);
                if (onBufferingChange) onBufferingChange(false);
              } else if (state === window.YT.PlayerState.BUFFERING) {
                if (onBufferingChange) onBufferingChange(true);
              } else if (state === window.YT.PlayerState.ENDED) {
                intendedPlayingRef.current = false;
                onPlayStateChange(false);
                if (onBufferingChange) onBufferingChange(false);
                trackEvent('track_ended', { videoId: currentVideoIdRef.current });
                onEnded();
              } else if (state === window.YT.PlayerState.CUED) {
                if (onBufferingChange) onBufferingChange(false);
              }
            },
            onError: (event: any) => {
              const errorCode = event.data;
              trackEvent('youtube_error', { errorCode, videoId: currentVideoIdRef.current });
              if (onBufferingChange) onBufferingChange(false);

              let msg = 'Playback restricted for this archival recording.';
              if (errorCode === 101 || errorCode === 150) {
                msg = 'Embedding restricted by publisher. Please use Next or Previous to continue.';
              } else if (errorCode === 2) {
                msg = 'Invalid recording identifier.';
              } else if (errorCode === 5) {
                msg = 'HTML5 player error.';
              }

              if (onError) onError(errorCode, msg);
            },
          },
        });
      } catch (err) {
        console.warn('Error instantiating YT.Player:', err);
      }

      return () => {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try {
            playerRef.current.destroy();
          } catch {}
          playerRef.current = null;
          isPlayerReadyRef.current = false;
        }
      };
    }, [isApiReady]);

    // 3. Track transition without recreating or resetting the player instance
    useEffect(() => {
      if (!isPlayerReadyRef.current || !playerRef.current || !videoId) return;

      try {
        if (intendedPlayingRef.current) {
          playerRef.current.loadVideoById(videoId);
        } else {
          playerRef.current.cueVideoById(videoId);
        }
      } catch (err) {
        console.warn('Error loading new video on track change:', err);
      }
    }, [videoId]);

    // 4. Volume and mute synchronization
    useEffect(() => {
      if (!isPlayerReadyRef.current || !playerRef.current) return;
      try {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
        }
      } catch {}
    }, [volume, isMuted, isPlayerReady]);

    // 5. Lightweight progress polling loop (250ms)
    useEffect(() => {
      if (!isPlayerReady) return;

      const interval = setInterval(() => {
        try {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const current = playerRef.current.getCurrentTime() || 0;
            const total = playerRef.current.getDuration() || 0;
            const loadedFraction =
              typeof playerRef.current.getVideoLoadedFraction === 'function'
                ? playerRef.current.getVideoLoadedFraction() || 0
                : 0;
            onProgress(current, total, loadedFraction);
          }
        } catch {}
      }, 250);

      return () => clearInterval(interval);
    }, [isPlayerReady, onProgress]);

    return (
      <div
        className={`w-[200px] h-[113px] rounded-xl overflow-hidden shadow-2xl border border-amber-900/30 bg-black pointer-events-auto ${className}`}
      >
        {/* Unobtrusive, 100% compliant, standard minimum 200x113 YouTube iframe container */}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';
