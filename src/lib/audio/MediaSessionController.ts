/**
 * JALSAGHAR — W3C Media Session API Controller
 * 
 * Provides integration with OS lock-screen media controls, Bluetooth headunits,
 * notification shade players, and system hardware keys.
 * 
 * Standards-based, feature-detected, and gracefully degrades when unsupported.
 */

import { Track } from '../../types';

export interface MediaSessionCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeekTo: (seconds: number) => void;
  onSeekBackward?: (offset: number) => void;
  onSeekForward?: (offset: number) => void;
  onStop?: () => void;
}

export class MediaSessionController {
  private isAvailable: boolean = false;
  private callbacks: MediaSessionCallbacks | null = null;

  constructor(callbacks?: MediaSessionCallbacks) {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      this.isAvailable = true;
    }
    if (callbacks) {
      this.setCallbacks(callbacks);
    }
  }

  public setCallbacks(callbacks: MediaSessionCallbacks): void {
    this.callbacks = callbacks;
    if (!this.isAvailable) return;
    this.registerActionHandlers();
  }

  private registerActionHandlers(): void {
    if (!this.isAvailable || !this.callbacks) return;

    const actionMap: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => this.callbacks?.onPlay()],
      ['pause', () => this.callbacks?.onPause()],
      ['previoustrack', () => this.callbacks?.onPrevious()],
      ['nexttrack', () => this.callbacks?.onNext()],
      [
        'seekto',
        (details) => {
          if (details.seekTime !== undefined && !isNaN(details.seekTime)) {
            this.callbacks?.onSeekTo(details.seekTime);
          }
        },
      ],
      [
        'seekbackward',
        (details) => {
          const offset = details.seekOffset || 10;
          this.callbacks?.onSeekBackward?.(offset);
        },
      ],
      [
        'seekforward',
        (details) => {
          const offset = details.seekOffset || 10;
          this.callbacks?.onSeekForward?.(offset);
        },
      ],
      [
        'stop',
        () => {
          this.callbacks?.onStop?.();
        },
      ],
    ];

    actionMap.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Individual actions may be unsupported on certain browser engines
      }
    });
  }

  /**
   * Update lockscreen / notification metadata for the current recording
   */
  public updateMetadata(track: Track): void {
    if (!this.isAvailable) return;

    try {
      const albumTitle = track.raga
        ? `Raag ${track.raga} · JALSAGHAR`
        : 'JALSAGHAR · জলসাঘর';

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: albumTitle,
        artwork: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/bg/dupur-wide.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });
    } catch (err) {
      console.warn('[JALSAGHAR MediaSession] Failed to update metadata:', err);
    }
  }

  /**
   * Synchronize system lockscreen scrubber position with strict validation
   */
  public updatePositionState(duration: number, currentTime: number, playbackRate: number = 1.0): void {
    if (!this.isAvailable || !('setPositionState' in navigator.mediaSession)) return;

    // Strict numerical boundary validation
    if (
      isNaN(duration) ||
      isNaN(currentTime) ||
      !isFinite(duration) ||
      !isFinite(currentTime) ||
      duration <= 0 ||
      currentTime < 0
    ) {
      return;
    }

    try {
      const safePosition = Math.min(currentTime, duration);
      navigator.mediaSession.setPositionState({
        duration: Math.round(duration * 100) / 100,
        playbackRate,
        position: Math.round(safePosition * 100) / 100,
      });
    } catch {
      // Avoid throwing on rapid scrub transitions
    }
  }

  /**
   * Synchronize system playback status ('playing' | 'paused' | 'none')
   */
  public updatePlaybackState(isPlaying: boolean): void {
    if (!this.isAvailable) return;

    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {}
  }

  public clear(): void {
    if (!this.isAvailable) return;

    try {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      const actions: MediaSessionAction[] = [
        'play',
        'pause',
        'previoustrack',
        'nexttrack',
        'seekto',
        'seekbackward',
        'seekforward',
        'stop',
      ];
      actions.forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {}
      });
    } catch {}
  }

  public destroy(): void {
    this.clear();
    this.callbacks = null;
  }
}
