import React, { useEffect, useRef, useState } from 'react';
import { trackEvent } from '../lib/analytics';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  videoId: string;
  isPlaying: boolean;
  volume: number; // 0 - 100 effective volume
  isMuted: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
  onBufferingChange?: (isBuffering: boolean) => void;
  onEnded: () => void;
  onError: (errorCode: number) => void;
  onProgress: (currentTime: number, duration: number, bufferedFraction: number) => void;
  seekToTimestamp: number | null;
  onSeekHandled: () => void;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  isPlaying,
  volume,
  isMuted,
  onPlayStateChange,
  onBufferingChange,
  onEnded,
  onError,
  onProgress,
  seekToTimestamp,
  onSeekHandled,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load YouTube IFrame API script once safely
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

  // Initialize YT.Player when API and container are ready
  useEffect(() => {
    if (!isApiReady || !containerRef.current || playerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            try {
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
                event.target.setVolume(volume);
              }
              if (isPlaying) {
                event.target.playVideo();
              }
            } catch {}
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
            if (event.data === window.YT.PlayerState.PLAYING) {
              onPlayStateChange(true);
              if (onBufferingChange) onBufferingChange(false);
              setErrorMessage(null);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              onPlayStateChange(false);
              if (onBufferingChange) onBufferingChange(false);
            } else if (event.data === window.YT.PlayerState.BUFFERING) {
              if (onBufferingChange) onBufferingChange(true);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              if (onBufferingChange) onBufferingChange(false);
              trackEvent('track_ended', { videoId });
              onEnded();
            }
          },
          onError: (event: any) => {
            const errorCode = event.data;
            trackEvent('youtube_error', { errorCode, videoId });
            if (onBufferingChange) onBufferingChange(false);
            if (errorCode === 150 || errorCode === 101) {
              setErrorMessage("This recording isn't available here. Advancing gracefully...");
            } else {
              setErrorMessage('Audio stream unavailable. Advancing...');
            }
            onError(errorCode);
          },
        },
      });
    } catch {
      // Fallback
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [isApiReady]);

  // Load new video ID when track changes without destroying player
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.loadVideoById(videoId);
      } else {
        playerRef.current.cueVideoById(videoId);
      }
      setErrorMessage(null);
    } catch {}
  }, [videoId, isPlayerReady]);

  // Sync play / pause state
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    try {
      const state = playerRef.current.getPlayerState();
      if (isPlaying && state !== window.YT.PlayerState.PLAYING && state !== window.YT.PlayerState.BUFFERING) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      }
    } catch {}
  }, [isPlaying, isPlayerReady]);

  // Sync volume and mute with GainController outputs
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    } catch {}
  }, [volume, isMuted, isPlayerReady]);

  // Handle external seek requests
  useEffect(() => {
    if (seekToTimestamp !== null && isPlayerReady && playerRef.current) {
      try {
        playerRef.current.seekTo(seekToTimestamp, true);
        onSeekHandled();
      } catch {}
    }
  }, [seekToTimestamp, isPlayerReady]);

  // Polling loop for playback progress & buffered fraction (every 250ms for smooth UI)
  useEffect(() => {
    if (!isPlayerReady || !isPlaying) return;

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
  }, [isPlayerReady, isPlaying]);

  return (
    <div className={`relative aspect-video overflow-hidden rounded-lg bg-black/90 ${className}`}>
      {/* 16:9 YouTube Visible Player Container (Compliant with YouTube terms) */}
      <div ref={containerRef} className="w-full h-full object-cover" />

      {/* Graceful notification overlay on playback error */}
      {errorMessage && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-2 bg-black/85 text-center text-[#e8cca0] font-rozha text-xs">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

