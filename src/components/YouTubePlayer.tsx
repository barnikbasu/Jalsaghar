import React, { useEffect, useRef } from 'react';
import { Track } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  seekTime: number | null;
  onPlayerReady: () => void;
  onStateChange: (state: number) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onError: (errorCode: number) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  currentTrack,
  isPlaying,
  isMuted,
  volume,
  seekTime,
  onPlayerReady,
  onStateChange,
  onTimeUpdate,
  onError,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeIntervalRef = useRef<any>(null);
  const isApiReadyRef = useRef<boolean>(false);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        isApiReadyRef.current = true;
        initPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      isApiReadyRef.current = true;
      initPlayer();
    }

    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const initPlayer = () => {
    if (!containerRef.current || !window.YT || !window.YT.Player) return;

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: currentTrack.videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            if (isMuted) event.target.mute();
            event.target.setVolume(volume);
            if (isPlaying) {
              event.target.playVideo();
            }
            onPlayerReady();
            startTimeTracker();
          },
          onStateChange: (event: any) => {
            onStateChange(event.data);
          },
          onError: (event: any) => {
            console.warn('[Jalsaghar] YouTube Player Code:', event.data, 'for track:', currentTrack.title);
            onError(event.data);
          },
        },
      });
    } catch (err) {
      console.warn('[Jalsaghar] Player initialization error:', err);
    }
  };

  const startTimeTracker = () => {
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    timeIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const current = playerRef.current.getCurrentTime() || 0;
          const total = playerRef.current.getDuration() || 0;
          onTimeUpdate(current, total);
        } catch (e) {
          // ignore
        }
      }
    }, 500);
  };

  // Load new track when currentTrack changes
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById({
          videoId: currentTrack.videoId,
          startSeconds: 0,
        });
        if (!isPlaying) {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        // fallback
      }
    }
  }, [currentTrack.id, currentTrack.videoId]);

  // Handle Play/Pause
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      try {
        const state = playerRef.current.getPlayerState();
        if (isPlaying && state !== 1 && state !== 3) {
          playerRef.current.playVideo();
        } else if (!isPlaying && state === 1) {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isPlaying]);

  // Handle Seek
  useEffect(() => {
    if (seekTime !== null && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seekTime, true);
      } catch (e) {
        // ignore
      }
    }
  }, [seekTime]);

  // Handle Volume & Mute
  useEffect(() => {
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(volume);
        }
        if (isMuted && typeof playerRef.current.mute === 'function') {
          playerRef.current.mute();
        } else if (!isMuted && typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
      } catch (e) {
        // ignore
      }
    }
  }, [volume, isMuted]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/90 aspect-video shadow-inner">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
