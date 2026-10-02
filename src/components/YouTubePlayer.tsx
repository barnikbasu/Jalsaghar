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
  play: () => void;
  pause: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  loadAndPlay: (videoId: string, requestId?: number) => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  isReady: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getActiveRequestId: () => number;
}

interface YouTubePlayerProps {
  youtubeUrl: string;
  trackTitle?: string;
  trackArtist?: string;
  volume: number; // 0 - 100
  isMuted: boolean;
  isPlaying?: boolean;
  onPlayerReady?: () => void;
  onPlayStateChange: (isPlaying: boolean, requestId?: number) => void;
  onBufferingChange?: (isBuffering: boolean, requestId?: number) => void;
  onEnded: (requestId?: number) => void;
  onError?: (
    errorCode: number,
    message: string,
    errorType: 'youtube-only' | 'config-error' | 'unavailable' | 'error',
    requestId?: number
  ) => void;
  onAutoplayBlocked?: (requestId?: number) => void;
  onProgress: (
    currentTime: number,
    duration: number,
    bufferedFraction: number,
    requestId?: number
  ) => void;
  className?: string;
  children?: React.ReactNode;
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  (
    {
      youtubeUrl,
      trackTitle,
      trackArtist,
      volume,
      isMuted,
      isPlaying,
      onPlayerReady,
      onPlayStateChange,
      onBufferingChange,
      onEnded,
      onError,
      onAutoplayBlocked,
      onProgress,
      className = '',
      children,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    // Track initialization, readiness, and user intent
    const isPlayerReadyRef = useRef<boolean>(false);
    const intendedPlayingRef = useRef<boolean>(false);
    const isTransitioningRef = useRef<boolean>(false);
    const currentVideoIdRef = useRef<string>('');
    const currentLoadedVideoIdRef = useRef<string>('');
    const pendingVideoIdRef = useRef<string | null>(null);
    const playRequestIdRef = useRef<number>(0);
    const activeRequestIdRef = useRef<number>(0);
    const lastLoadedRequestIdRef = useRef<number>(0);
    const volumeRef = useRef<number>(volume);
    const isMutedRef = useRef<boolean>(isMuted);

    const [isApiReady, setIsApiReady] = useState<boolean>(false);
    const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

    // Keep refs in sync with latest props
    volumeRef.current = volume;
    isMutedRef.current = isMuted;
    if (isPlaying !== undefined) {
      intendedPlayingRef.current = isPlaying;
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    currentVideoIdRef.current = videoId;

    // Expose direct imperative playback controls to the JALSAGHAR music player
    // NO timers, NO fake clicks, NO repeated playVideo(), NO retry loops
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          intendedPlayingRef.current = true;
          isTransitioningRef.current = false;
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.playVideo();
            } catch (err) {
              console.warn('[JALSAGHAR] Direct play error:', err);
            }
          }
        },
        playVideo: () => {
          intendedPlayingRef.current = true;
          isTransitioningRef.current = false;
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.playVideo();
            } catch (err) {
              console.warn('[JALSAGHAR] Direct playVideo error:', err);
            }
          }
        },
        pause: () => {
          intendedPlayingRef.current = false;
          isTransitioningRef.current = false;
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.pauseVideo();
            } catch (err) {
              console.warn('[JALSAGHAR] Direct pause error:', err);
            }
          }
        },
        pauseVideo: () => {
          intendedPlayingRef.current = false;
          isTransitioningRef.current = false;
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.pauseVideo();
            } catch (err) {
              console.warn('[JALSAGHAR] Direct pauseVideo error:', err);
            }
          }
        },
        loadAndPlay: (vid: string, requestId?: number) => {
          if (!vid) return;
          const reqId = requestId ?? ++playRequestIdRef.current;
          activeRequestIdRef.current = reqId;
          lastLoadedRequestIdRef.current = reqId;
          intendedPlayingRef.current = true;
          isTransitioningRef.current = true;
          currentVideoIdRef.current = vid;
          currentLoadedVideoIdRef.current = vid;
          pendingVideoIdRef.current = null;

          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              // Direct canonical loadVideoById without retry loops or masked hacks
              playerRef.current.loadVideoById(vid);
            } catch (err) {
              console.warn('[JALSAGHAR] Direct loadVideoById error:', err);
            }
          } else {
            pendingVideoIdRef.current = vid;
          }
        },
        seekTo: (seconds: number) => {
          if (isPlayerReadyRef.current && playerRef.current) {
            try {
              playerRef.current.seekTo(seconds, true);
            } catch (err) {
              console.warn('[JALSAGHAR] Direct seekTo error:', err);
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
        getActiveRequestId: () => activeRequestIdRef.current,
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

        console.log('[JALSAGHAR] Initializing YouTube Player instance:', {
          initialVideoId,
          origin: window.location.origin,
          originParam,
        });

        currentLoadedVideoIdRef.current = initialVideoId;

        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId: initialVideoId,
          width: '100%',
          height: '100%',
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

              // Verify and log iframe element properties
              try {
                const iframe =
                  event.target?.getIframe?.() as HTMLIFrameElement | null;
                if (iframe) {
                  const currentAllow = iframe.getAttribute('allow') || '';
                  if (
                    !currentAllow.includes('autoplay') ||
                    !currentAllow.includes('encrypted-media')
                  ) {
                    iframe.setAttribute(
                      'allow',
                      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                    );
                  }
                  console.log('[JALSAGHAR] YouTube iframe verified:', {
                    src: iframe.src,
                    allow: iframe.getAttribute('allow'),
                    width: iframe.offsetWidth,
                    height: iframe.offsetHeight,
                    originParam,
                  });
                }
              } catch (e) {
                console.warn('[JALSAGHAR] Error inspecting iframe element:', e);
              }

              if (onPlayerReady) {
                onPlayerReady();
              }

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

              // Fulfill user's play intent if a track was selected before onReady
              if (pendingVideoIdRef.current) {
                const toPlay = pendingVideoIdRef.current;
                pendingVideoIdRef.current = null;
                currentLoadedVideoIdRef.current = toPlay;
                try {
                  event.target.loadVideoById(toPlay);
                } catch (err) {
                  console.warn('[JALSAGHAR] onReady loadVideoById error:', err);
                }
              } else if (intendedPlayingRef.current) {
                try {
                  event.target.playVideo();
                } catch (err) {
                  console.warn('[JALSAGHAR] onReady playVideo error:', err);
                }
              }
            },
            onStateChange: (event: any) => {
              if (!window.YT) return;
              const state = event.data;

              // Guard against stale asynchronous callbacks:
              // 1. Generation check (protects A -> B -> A race conditions)
              if (
                event?.requestId !== undefined &&
                event.requestId !== activeRequestIdRef.current
              ) {
                console.log(
                  `[JALSAGHAR] Discarding stale YouTube state (${state}) from request ${event.requestId} (active is ${activeRequestIdRef.current})`
                );
                return;
              }

              // 2. Video ID check (protects against delayed events for previous different tracks)
              const activeVideoId = event.target?.getVideoData?.()?.video_id;
              if (
                activeVideoId &&
                currentVideoIdRef.current &&
                activeVideoId !== currentVideoIdRef.current
              ) {
                console.log(
                  `[JALSAGHAR] Discarding stale YouTube state (${state}) for video: ${activeVideoId} (active authoritative is ${currentVideoIdRef.current})`
                );
                return;
              }

              // Duration & progress inspection for current authoritative track
              try {
                const total = event.target?.getDuration?.() || 0;
                const curr = event.target?.getCurrentTime?.() || 0;
                const loaded = event.target?.getVideoLoadedFraction?.() || 0;
                if (total > 0) {
                  onProgress(curr, total, loaded, activeRequestIdRef.current);
                }
              } catch {}

              if (state === window.YT.PlayerState.PLAYING) {
                console.log(
                  '[JALSAGHAR] YouTube State: PLAYING (1) for videoId:',
                  currentVideoIdRef.current,
                  'reqId:',
                  activeRequestIdRef.current
                );
                isTransitioningRef.current = false;
                intendedPlayingRef.current = true;
                onPlayStateChange(true, activeRequestIdRef.current);
                if (onBufferingChange) onBufferingChange(false, activeRequestIdRef.current);
              } else if (state === window.YT.PlayerState.BUFFERING) {
                console.log(
                  '[JALSAGHAR] YouTube State: BUFFERING (3) for videoId:',
                  currentVideoIdRef.current,
                  'reqId:',
                  activeRequestIdRef.current
                );
                // Allow YouTube player to resolve buffering naturally. NO timers, NO watchdog retries.
                if (onBufferingChange) onBufferingChange(true, activeRequestIdRef.current);
              } else if (state === window.YT.PlayerState.PAUSED) {
                console.log(
                  '[JALSAGHAR] YouTube State: PAUSED (2) for videoId:',
                  currentVideoIdRef.current,
                  'reqId:',
                  activeRequestIdRef.current
                );
                // Distinguish genuine user pause from transient transition pause
                if (!isTransitioningRef.current || !intendedPlayingRef.current) {
                  intendedPlayingRef.current = false;
                  onPlayStateChange(false, activeRequestIdRef.current);
                }
                if (onBufferingChange) onBufferingChange(false, activeRequestIdRef.current);
              } else if (state === window.YT.PlayerState.ENDED) {
                console.log(
                  '[JALSAGHAR] YouTube State: ENDED (0) for videoId:',
                  currentVideoIdRef.current,
                  'reqId:',
                  activeRequestIdRef.current
                );
                isTransitioningRef.current = false;
                intendedPlayingRef.current = false;
                onPlayStateChange(false, activeRequestIdRef.current);
                if (onBufferingChange) onBufferingChange(false, activeRequestIdRef.current);
                trackEvent('track_ended', { videoId: currentVideoIdRef.current });
                onEnded(activeRequestIdRef.current);
              } else if (state === window.YT.PlayerState.CUED) {
                console.log(
                  '[JALSAGHAR] YouTube State: CUED (5) for videoId:',
                  currentVideoIdRef.current
                );
                if (onBufferingChange) onBufferingChange(false, activeRequestIdRef.current);
              }
            },
            onAutoplayBlocked: (event?: any) => {
              if (
                event?.requestId !== undefined &&
                event.requestId !== activeRequestIdRef.current
              ) {
                return;
              }
              const activeVideoId =
                playerRef.current?.getVideoData?.()?.video_id || currentVideoIdRef.current;
              if (
                activeVideoId &&
                currentVideoIdRef.current &&
                activeVideoId !== currentVideoIdRef.current
              ) {
                return;
              }
              console.warn(
                '[JALSAGHAR] YouTube autoplay blocked by browser policy for videoId:',
                currentVideoIdRef.current,
                'reqId:',
                activeRequestIdRef.current
              );
              isTransitioningRef.current = false;
              intendedPlayingRef.current = false;
              onPlayStateChange(false, activeRequestIdRef.current);
              if (onBufferingChange) onBufferingChange(false, activeRequestIdRef.current);
              if (onAutoplayBlocked) onAutoplayBlocked(activeRequestIdRef.current);
            },
            onError: (event: any) => {
              const errorCode = event.data;

              // Guard against stale errors from previously requested tracks:
              // 1. Generation check (protects A -> B -> A race conditions)
              if (
                event?.requestId !== undefined &&
                event.requestId !== activeRequestIdRef.current
              ) {
                console.log(
                  `[JALSAGHAR] Discarding stale YouTube error (${errorCode}) from request ${event.requestId} (active is ${activeRequestIdRef.current})`
                );
                return;
              }

              // 2. Video ID check
              const activeVideoId =
                event.target?.getVideoData?.()?.video_id || currentVideoIdRef.current;
              if (
                activeVideoId &&
                currentVideoIdRef.current &&
                activeVideoId !== currentVideoIdRef.current
              ) {
                console.log(
                  `[JALSAGHAR] Discarding stale YouTube error (${errorCode}) for video: ${activeVideoId} (active authoritative is ${currentVideoIdRef.current})`
                );
                return;
              }

              const errorMap: Record<number, string> = {
                2: 'INVALID_PARAMETER',
                5: 'HTML5_PLAYER_ERROR',
                100: 'VIDEO_NOT_FOUND_OR_PRIVATE',
                101: 'EMBED_NOT_ALLOWED',
                150: 'EMBED_NOT_ALLOWED',
                153: 'REFERER_OR_API_CLIENT_ID_MISSING',
              };
              const errorName = errorMap[errorCode] || `UNKNOWN_CODE_${errorCode}`;

              // Required explicit console logs
              console.log('[JALSAGHAR] YOUTUBE ERROR', event.data);
              console.log(
                `[JALSAGHAR] YOUTUBE ERROR\ncode: ${errorCode} (${errorName})\nvideoId: ${currentVideoIdRef.current}\nyoutubeUrl: ${youtubeUrl}\ntrack: ${trackTitle || 'Unknown'}\nartist: ${trackArtist || 'Unknown'}\nreqId: ${activeRequestIdRef.current}`
              );

              // Surface error genuine and unmasked: DO NOT retry automatically
              isTransitioningRef.current = false;
              intendedPlayingRef.current = false;
              if (onBufferingChange) onBufferingChange(false, activeRequestIdRef.current);
              onPlayStateChange(false, activeRequestIdRef.current);

              let errorType: 'youtube-only' | 'config-error' | 'unavailable' | 'error' = 'error';
              let msg = `Archival recording unavailable (${errorName}).`;

              if (errorCode === 101 || errorCode === 150) {
                errorType = 'youtube-only';
                msg = "This recording can't be played inside JALSAGHAR.";
              } else if (errorCode === 153) {
                errorType = 'config-error';
                msg = 'YouTube embedder identity or Referer verification failed.';
              } else if (errorCode === 100) {
                errorType = 'unavailable';
                msg = 'This video was removed or marked private on YouTube.';
              } else if (errorCode === 5) {
                errorType = 'error';
                msg = 'The HTML5 browser player encountered an error.';
              } else if (errorCode === 2) {
                errorType = 'error';
                msg = 'Invalid video parameter value.';
              }

              trackEvent('youtube_error', {
                errorCode,
                errorName,
                errorType,
                videoId: currentVideoIdRef.current,
                trackTitle,
                trackArtist,
                requestId: activeRequestIdRef.current,
              });

              if (onError) onError(errorCode, msg, errorType, activeRequestIdRef.current);
            },
          },
        });
      } catch (err) {
        console.warn('[JALSAGHAR] Error instantiating YT.Player:', err);
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

    // 3. Fallback synchronization if videoId changed from outside without loadAndPlay
    useEffect(() => {
      if (!isPlayerReadyRef.current || !playerRef.current || !videoId) return;

      // If loadAndPlay has already loaded this video, do not re-load
      if (currentLoadedVideoIdRef.current === videoId) return;
      currentLoadedVideoIdRef.current = videoId;
      currentVideoIdRef.current = videoId;

      try {
        if (intendedPlayingRef.current || isPlaying) {
          playerRef.current.loadVideoById(videoId);
        }
      } catch (err) {
        console.warn('[JALSAGHAR] Error loading video on external prop change:', err);
      }
    }, [videoId, isPlaying]);

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
            const activeVideoId = playerRef.current.getVideoData?.()?.video_id;
            if (
              activeVideoId &&
              currentVideoIdRef.current &&
              activeVideoId !== currentVideoIdRef.current
            ) {
              return; // Do not leak old track's progress during transition
            }

            const current = playerRef.current.getCurrentTime() || 0;
            const total = playerRef.current.getDuration() || 0;
            const loadedFraction =
              typeof playerRef.current.getVideoLoadedFraction === 'function'
                ? playerRef.current.getVideoLoadedFraction() || 0
                : 0;
            onProgress(current, total, loadedFraction, activeRequestIdRef.current);
          }
        } catch {}
      }, 250);

      return () => clearInterval(interval);
    }, [isPlayerReady, onProgress]);

    return (
      <div
        className={`relative w-[200px] h-[200px] rounded-lg overflow-hidden shadow-2xl border border-[rgba(212,175,55,0.15)] bg-[#0b0607] pointer-events-auto transition-[width,height] duration-200 ${className}`}
        role="region"
        aria-label="Archival Recording Window"
      >
        {/* Compliant minimum 200x200 viewport to satisfy YouTube embedded player minimums */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Optional overlay (e.g. graceful JALSAGHAR archival state) */}
        {children}
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';
