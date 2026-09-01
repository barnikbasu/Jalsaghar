/**
 * Jalsaghar Audio Gain Controller
 * Handles user volume, track-level normalization, and fade envelopes (fade-in, fade-out).
 * Effective level = clamp(userVolume * normalizationGain * fadeGain, 0, 100).
 */

const STORAGE_KEY_VOLUME = 'jalsaghar_user_volume';
const STORAGE_KEY_MUTED = 'jalsaghar_is_muted';

export class GainController {
  private userVolume: number = 80; // 0 - 100
  private previousNonZeroVolume: number = 80;
  private isMuted: boolean = false;
  private normalizationGain: number = 1.0; // 0.8 - 1.2
  private fadeGain: number = 1.0; // 0.0 - 1.0
  private onVolumeChangeCallback?: (effectiveVolume: number) => void;
  private fadeAnimationId: number | null = null;
  private fadeTimeoutId: NodeJS.Timeout | null = null;

  constructor(onVolumeChange?: (effectiveVolume: number) => void) {
    this.onVolumeChangeCallback = onVolumeChange;
    this.loadPersistedState();
  }

  private loadPersistedState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedVol = localStorage.getItem(STORAGE_KEY_VOLUME);
        if (savedVol !== null) {
          const parsed = parseFloat(savedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            this.userVolume = parsed;
            if (parsed > 0) this.previousNonZeroVolume = parsed;
          }
        }
        const savedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
        if (savedMuted === 'true') {
          this.isMuted = true;
        }
      }
    } catch {
      // Fallback to default in private modes or server context
    }
  }

  private persistState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_VOLUME, this.userVolume.toString());
        localStorage.setItem(STORAGE_KEY_MUTED, this.isMuted.toString());
      }
    } catch {
      // Ignore storage errors
    }
  }

  public setOnVolumeChange(callback: (effectiveVolume: number) => void) {
    this.onVolumeChangeCallback = callback;
    this.notify();
  }

  public getEffectiveVolume(): number {
    if (this.isMuted) return 0;
    const raw = this.userVolume * this.normalizationGain * this.fadeGain;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  public getUserVolume(): number {
    return this.userVolume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setUserVolume(volume: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    this.userVolume = clamped;
    if (clamped > 0) {
      this.previousNonZeroVolume = clamped;
      if (this.isMuted) {
        this.isMuted = false;
      }
    } else {
      this.isMuted = true;
    }
    this.persistState();
    this.notify();
  }

  public toggleMute(): boolean {
    if (this.isMuted) {
      this.isMuted = false;
      if (this.userVolume === 0) {
        this.userVolume = this.previousNonZeroVolume || 80;
      }
    } else {
      if (this.userVolume > 0) {
        this.previousNonZeroVolume = this.userVolume;
      }
      this.isMuted = true;
    }
    this.persistState();
    this.notify();
    return this.isMuted;
  }

  public setNormalizationGain(gain?: number) {
    this.normalizationGain = typeof gain === 'number' && !isNaN(gain) ? Math.max(0.5, Math.min(1.5, gain)) : 1.0;
    this.notify();
  }

  public cancelFade() {
    if (this.fadeAnimationId !== null) {
      cancelAnimationFrame(this.fadeAnimationId);
      this.fadeAnimationId = null;
    }
    if (this.fadeTimeoutId !== null) {
      clearTimeout(this.fadeTimeoutId);
      this.fadeTimeoutId = null;
    }
  }

  /**
   * Smoothly ramps fadeGain from start to target over durationMs
   */
  public rampFade(
    targetFade: number,
    durationMs: number = 450,
    onComplete?: () => void
  ): Promise<void> {
    this.cancelFade();

    return new Promise((resolve) => {
      const startFade = this.fadeGain;
      const startTime = performance.now();

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        
        // Smooth sine ease in-out
        const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        this.fadeGain = startFade + (targetFade - startFade) * eased;
        this.notify();

        if (progress < 1) {
          this.fadeAnimationId = requestAnimationFrame(step);
        } else {
          this.fadeGain = targetFade;
          this.fadeAnimationId = null;
          this.notify();
          if (onComplete) onComplete();
          resolve();
        }
      };

      this.fadeAnimationId = requestAnimationFrame(step);
    });
  }

  public fadeIn(durationMs: number = 450): Promise<void> {
    this.fadeGain = 0.05;
    this.notify();
    return this.rampFade(1.0, durationMs);
  }

  public fadeOut(durationMs: number = 400): Promise<void> {
    return this.rampFade(0.0, durationMs);
  }

  public resetFade() {
    this.cancelFade();
    this.fadeGain = 1.0;
    this.notify();
  }

  private notify() {
    if (this.onVolumeChangeCallback) {
      this.onVolumeChangeCallback(this.getEffectiveVolume());
    }
  }

  public destroy() {
    this.cancelFade();
    this.onVolumeChangeCallback = undefined;
  }
}
