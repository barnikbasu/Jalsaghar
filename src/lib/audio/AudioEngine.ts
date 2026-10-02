/**
 * JALSAGHAR — Authorized HTML5 Audio Transport Engine
 * 
 * Headless, single-instance HTML5 audio transport for recordings that JALSAGHAR
 * is legally authorized to host and stream directly.
 * 
 * Architecture invariants:
 * 1. Exactly one stable HTMLAudioElement instance.
 * 2. Never recreated across renders, track transitions, or volume changes.
 * 3. Protected by monotonic request generation tokens (activeRequestId).
 * 4. Stale callbacks from older requests are strictly discarded.
 * 5. Respects browser autoplay, power management, and interruption policies.
 */

export interface AudioEngineCallbacks {
  onProgress?: (currentTime: number, duration: number, bufferedFraction: number, requestId: number) => void;
  onPlayStateChange?: (playing: boolean, requestId: number) => void;
  onBufferingChange?: (buffering: boolean, requestId: number) => void;
  onEnded?: (requestId: number) => void;
  onError?: (error: { code: number; message: string; submessage?: string }, requestId: number) => void;
  onAutoplayBlocked?: (requestId: number) => void;
}

export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private activeRequestId: number = 0;
  private currentUrl: string = '';
  private callbacks: AudioEngineCallbacks = {};
  private isDestroyed: boolean = false;
  private intendedPlaying: boolean = false;

  constructor(callbacks?: AudioEngineCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
    this.initAudioElement();
  }

  private initAudioElement(): void {
    if (typeof window === 'undefined') return;

    try {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      this.audio.crossOrigin = 'anonymous';

      // Attach native DOM event listeners
      this.attachListeners();
    } catch (err) {
      console.warn('[JALSAGHAR AudioEngine] Failed to initialize HTMLAudioElement:', err);
    }
  }

  private attachListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('play', this.handlePlay);
    this.audio.addEventListener('playing', this.handlePlaying);
    this.audio.addEventListener('pause', this.handlePause);
    this.audio.addEventListener('waiting', this.handleWaiting);
    this.audio.addEventListener('canplay', this.handleCanPlay);
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('durationchange', this.handleDurationChange);
    this.audio.addEventListener('progress', this.handleProgress);
    this.audio.addEventListener('ended', this.handleEnded);
    this.audio.addEventListener('error', this.handleError);
  }

  private removeListeners(): void {
    if (!this.audio) return;

    this.audio.removeEventListener('play', this.handlePlay);
    this.audio.removeEventListener('playing', this.handlePlaying);
    this.audio.removeEventListener('pause', this.handlePause);
    this.audio.removeEventListener('waiting', this.handleWaiting);
    this.audio.removeEventListener('canplay', this.handleCanPlay);
    this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.removeEventListener('durationchange', this.handleDurationChange);
    this.audio.removeEventListener('progress', this.handleProgress);
    this.audio.removeEventListener('ended', this.handleEnded);
    this.audio.removeEventListener('error', this.handleError);
  }

  public setCallbacks(callbacks: AudioEngineCallbacks): void {
    this.callbacks = callbacks;
  }

  public getActiveRequestId(): number {
    return this.activeRequestId;
  }

  /**
   * Load an authorized audio URL with a monotonic request generation token.
   */
  public load(url: string, requestId: number, autoPlay: boolean = true): void {
    this.activeRequestId = requestId;
    this.currentUrl = url;
    this.intendedPlaying = autoPlay;

    if (this.isDestroyed || !this.audio) return;

    // Reset previous media pipeline
    this.audio.pause();
    this.audio.src = url;
    this.audio.load();

    if (autoPlay) {
      this.play(requestId);
    }
  }

  public async play(requestId?: number): Promise<void> {
    if (this.isDestroyed || !this.audio) return;
    const reqId = requestId ?? this.activeRequestId;

    // Stale generation guard
    if (reqId !== this.activeRequestId) return;

    this.intendedPlaying = true;

    try {
      await this.audio.play();
      if (reqId === this.activeRequestId) {
        this.callbacks.onPlayStateChange?.(true, reqId);
        this.callbacks.onBufferingChange?.(false, reqId);
      }
    } catch (err: any) {
      if (reqId !== this.activeRequestId) return;

      // Handle browser autoplay policy restrictions gracefully
      if (err?.name === 'NotAllowedError') {
        console.warn('[JALSAGHAR AudioEngine] Autoplay prevented by browser policy:', err);
        this.intendedPlaying = false;
        this.callbacks.onPlayStateChange?.(false, reqId);
        this.callbacks.onAutoplayBlocked?.(reqId);
      } else if (err?.name !== 'AbortError') {
        // AbortError is normal when rapid track transitions interrupt an ongoing play()
        console.warn('[JALSAGHAR AudioEngine] Playback error:', err);
        this.callbacks.onError?.(
          {
            code: 2,
            message: 'Audio Playback Error',
            submessage: err?.message || 'Failed to start authorized audio transport',
          },
          reqId
        );
      }
    }
  }

  public pause(requestId?: number): void {
    if (this.isDestroyed || !this.audio) return;
    const reqId = requestId ?? this.activeRequestId;

    if (reqId !== this.activeRequestId) return;

    this.intendedPlaying = false;
    this.audio.pause();
    this.callbacks.onPlayStateChange?.(false, reqId);
    this.callbacks.onBufferingChange?.(false, reqId);
  }

  /**
   * Completely disarms the audio transport when switching to YouTube.
   */
  public disarm(): void {
    if (!this.audio) return;
    this.intendedPlaying = false;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
    this.currentUrl = '';
  }

  public seekTo(seconds: number): void {
    if (this.isDestroyed || !this.audio) return;
    if (isNaN(seconds) || seconds < 0) return;

    const duration = this.audio.duration;
    if (isFinite(duration) && duration > 0) {
      this.audio.currentTime = Math.min(seconds, duration);
    } else {
      this.audio.currentTime = seconds;
    }

    this.dispatchProgress();
  }

  public setVolume(volume0to100: number): void {
    if (this.isDestroyed || !this.audio) return;
    const clamped = Math.max(0, Math.min(100, volume0to100));
    this.audio.volume = clamped / 100;
  }

  public setMuted(muted: boolean): void {
    if (this.isDestroyed || !this.audio) return;
    this.audio.muted = muted;
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public getDuration(): number {
    const dur = this.audio?.duration;
    return isFinite(dur || 0) ? (dur || 0) : 0;
  }

  public isPlaying(): boolean {
    return Boolean(this.audio && !this.audio.paused && !this.audio.ended && this.audio.readyState > 2);
  }

  // Native event handlers bound with monotonic generation checking
  private handlePlay = (): void => {
    if (this.activeRequestId > 0) {
      this.callbacks.onPlayStateChange?.(true, this.activeRequestId);
    }
  };

  private handlePlaying = (): void => {
    if (this.activeRequestId > 0) {
      this.callbacks.onBufferingChange?.(false, this.activeRequestId);
      this.callbacks.onPlayStateChange?.(true, this.activeRequestId);
    }
  };

  private handlePause = (): void => {
    if (this.activeRequestId > 0) {
      this.callbacks.onPlayStateChange?.(false, this.activeRequestId);
      this.callbacks.onBufferingChange?.(false, this.activeRequestId);
    }
  };

  private handleWaiting = (): void => {
    if (this.activeRequestId > 0 && this.intendedPlaying) {
      this.callbacks.onBufferingChange?.(true, this.activeRequestId);
    }
  };

  private handleCanPlay = (): void => {
    if (this.activeRequestId > 0) {
      this.callbacks.onBufferingChange?.(false, this.activeRequestId);
      if (this.intendedPlaying && this.audio?.paused) {
        this.play(this.activeRequestId);
      }
    }
  };

  private handleTimeUpdate = (): void => {
    this.dispatchProgress();
  };

  private handleDurationChange = (): void => {
    this.dispatchProgress();
  };

  private handleProgress = (): void => {
    this.dispatchProgress();
  };

  private dispatchProgress(): void {
    if (!this.audio || this.activeRequestId <= 0) return;

    const current = this.audio.currentTime || 0;
    const dur = this.audio.duration;
    const duration = isFinite(dur) ? dur : 0;

    let loadedFraction = 0;
    if (this.audio.buffered && this.audio.buffered.length > 0 && duration > 0) {
      try {
        const bufferedEnd = this.audio.buffered.end(this.audio.buffered.length - 1);
        loadedFraction = Math.min(1, Math.max(0, bufferedEnd / duration));
      } catch {}
    }

    this.callbacks.onProgress?.(current, duration, loadedFraction, this.activeRequestId);
  }

  private handleEnded = (): void => {
    if (this.activeRequestId > 0) {
      this.callbacks.onPlayStateChange?.(false, this.activeRequestId);
      this.callbacks.onEnded?.(this.activeRequestId);
    }
  };

  private handleError = (): void => {
    if (this.activeRequestId <= 0 || !this.currentUrl) return;

    const mediaError = this.audio?.error;
    let message = 'Audio playback error';
    let code = 2;

    if (mediaError) {
      code = mediaError.code;
      switch (mediaError.code) {
        case mediaError.MEDIA_ERR_ABORTED:
          return; // Aborted by caller, ignore
        case mediaError.MEDIA_ERR_NETWORK:
          message = 'Network error while loading recording';
          break;
        case mediaError.MEDIA_ERR_DECODE:
          message = 'Audio decode error';
          break;
        case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Audio format not supported or file unavailable';
          break;
      }
    }

    this.callbacks.onError?.(
      {
        code,
        message: 'Authorized Audio Error',
        submessage: message,
      },
      this.activeRequestId
    );
  };

  public destroy(): void {
    this.isDestroyed = true;
    this.disarm();
    this.removeListeners();
    this.audio = null;
    this.callbacks = {};
  }
}
