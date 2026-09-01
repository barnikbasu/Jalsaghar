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
  onPlayStateChange: (isPlaying: boolean) => void;
  onEnded: () => void;
  onError: (errorCode: number) => void;
  onProgress: (currentTime: number, duration: number) => void;
  seekToTimestamp: number | null;
  onSeekHandled: () => void;
  className?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  isPlaying,
  onPlayStateChange,
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

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
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
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
            if (event.data === window.YT.PlayerState.PLAYING) {
              onPlayStateChange(true);
              setErrorMessage(null);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              onPlayStateChange(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              trackEvent('track_ended', { videoId });
              onEnded();
            }
          },
          onError: (event: any) => {
            const errorCode = event.data;
            trackEvent('youtube_error', { errorCode, videoId });
            if (errorCode === 150 || errorCode === 101) {
              setErrorMessage("This recording isn't available here. Skipping...");
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
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [isApiReady]);

  // Load new video ID when track changes
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
      if (isPlaying && state !== window.YT.PlayerState.PLAYING) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      }
    } catch {}
  }, [isPlaying, isPlayerReady]);

  // Handle external seek requests
  useEffect(() => {
    if (seekToTimestamp !== null && isPlayerReady && playerRef.current) {
      try {
        playerRef.current.seekTo(seekToTimestamp, true);
        onSeekHandled();
      } catch {}
    }
  }, [seekToTimestamp, isPlayerReady]);

  // Polling loop for playback progress
  useEffect(() => {
    if (!isPlayerReady || !isPlaying) return;

    const interval = setInterval(() => {
      try {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const current = playerRef.current.getCurrentTime() || 0;
          const total = playerRef.current.getDuration() || 0;
          onProgress(current, total);
        }
      } catch {}
    }, 500);

    return () => clearInterval(interval);
  }, [isPlayerReady, isPlaying]);

  return (
    <div className={`relative aspect-video overflow-hidden rounded-lg bg-black/90 ${className}`}>
      {/* 16:9 YouTube Visible Player Container */}
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
