/**
 * Jalsaghar AudioEngine
 * Production-grade HTML5 Audio dual-deck playback engine with robust event handling,
 * race-condition mitigation, buffering telemetry, normalization, and crossfade foundation.
 * 
 * Pure TypeScript — zero React dependencies, zero Supabase dependencies.
 */

import {
  AudioTrack,
  AudioPlaybackState,
  AudioEngineSnapshot,
  AudioEngineEventType,
  AudioEngineEvents,
  AudioEngineListener,
} from './audioTypes';
import {
  clamp,
  calculateBufferedRanges,
  createConfiguredAudio,
  safeCleanupAudioElement,
  easeSineInOut,
  parseAudioTime,
} from './audioUtils';

interface DeckState {
  audio: HTMLAudioElement;
  slot: 'A' | 'B';
  track: AudioTrack | null;
  fadeGain: number; // 0.0 to 1.0
  listeners: Record<string, EventListener>;
}

export class AudioEngine {
  // Dual deck architecture
  private deckA: DeckState;
  private deckB: DeckState;
  private activeSlot: 'A' | 'B' = 'A';

  // State
  private playbackState: AudioPlaybackState = 'idle';
  private currentTrack: AudioTrack | null = null;
  private currentTime: number = 0;
  private duration: number = 0;
  private bufferedFraction: number = 0;
  private bufferedSeconds: number = 0;
  private errorMessage: string | null = null;

  // Volume & Normalization
  private userVolume: number = 0.8; // 0.0 to 1.0
  private previousNonZeroVolume: number = 0.8;
  private isMutedState: boolean = false;
  private normalizationGain: number = 1.0;

  // Concurrency & Race Condition Guard
  private currentOperationId: number = 0;
  private isDisposed: boolean = false;

  // Active Crossfade Animation Frame
  private crossfadeRafId: number | null = null;

  // Subscribers
  private snapshotListeners: Set<AudioEngineListener> = new Set();
  private eventHandlers: {
    [K in AudioEngineEventType]?: Set<(...args: unknown[]) => void>;
  } = {};

  constructor(initialVolume: number = 0.8) {
    this.userVolume = clamp(initialVolume, 0, 1);
    this.previousNonZeroVolume = this.userVolume > 0 ? this.userVolume : 0.8;

    // Instantiate dual decks
    this.deckA = this.createDeck('A');
    this.deckB = this.createDeck('B');

    // Attach lifecycle listeners to both decks
    this.attachDeckListeners(this.deckA);
    this.attachDeckListeners(this.deckB);
  }

  // ============================================================================
  // Deck Initialization & Lifecycle
  // ============================================================================

  private createDeck(slot: 'A' | 'B'): DeckState {
    const audio = createConfiguredAudio(`jalsaghar-deck-${slot.toLowerCase()}`);
    return {
      audio,
      slot,
      track: null,
      fadeGain: slot === 'A' ? 1.0 : 0.0,
      listeners: {},
    };
  }

  private attachDeckListeners(deck: DeckState) {
    const audio = deck.audio;

    const onPlay = () => {
      if (this.isActiveDeck(deck)) {
        this.setPlaybackState('playing');
      }
    };

    const onPause = () => {
      if (this.isActiveDeck(deck)) {
        // Only set paused if we aren't currently loading/ended/buffering/error
        if (
          this.playbackState !== 'loading' &&
          this.playbackState !== 'ended' &&
          this.playbackState !== 'error' &&
          this.playbackState !== 'buffering'
        ) {
          this.setPlaybackState('paused');
        }
      }
    };

    const onWaiting = () => {
      if (this.isActiveDeck(deck) && this.playbackState === 'playing') {
        this.setPlaybackState('buffering');
      }
    };

    const onPlaying = () => {
      if (this.isActiveDeck(deck)) {
        this.setPlaybackState('playing');
      }
    };

    const onCanPlay = () => {
      if (this.isActiveDeck(deck)) {
        if (this.playbackState === 'buffering') {
          this.setPlaybackState('playing');
        } else if (this.playbackState === 'loading') {
          // If paused by default after load, transition to paused
          if (audio.paused) {
            this.setPlaybackState('paused');
          } else {
            this.setPlaybackState('playing');
          }
        }
      }
    };

    const onLoadedMetadata = () => {
      if (this.isActiveDeck(deck)) {
        const rawDuration = audio.duration;
        if (isFinite(rawDuration) && rawDuration > 0) {
          this.duration = rawDuration;
        } else if (deck.track?.duration) {
          this.duration =
            typeof deck.track.duration === 'number'
              ? deck.track.duration
              : parseAudioTime(deck.track.duration);
        }
        this.emit('durationChange', this.duration);
        this.updateBufferedProgress(deck);
        this.notifySnapshot();
      }
    };

    const onTimeUpdate = () => {
      if (this.isActiveDeck(deck)) {
        this.currentTime = audio.currentTime;
        if (isFinite(audio.duration) && audio.duration > 0) {
          this.duration = audio.duration;
        }
        this.emit('timeUpdate', this.currentTime, this.duration);
        this.updateBufferedProgress(deck);
      }
    };

    const onProgress = () => {
      if (this.isActiveDeck(deck)) {
        this.updateBufferedProgress(deck);
      }
    };

    const onEnded = () => {
      if (this.isActiveDeck(deck)) {
        this.setPlaybackState('ended');
        if (deck.track) {
          this.emit('trackEnded', deck.track);
        }
      }
    };

    const onError = () => {
      if (this.isActiveDeck(deck)) {
        let message = 'Audio playback error';
        if (audio.error) {
          switch (audio.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              // User aborted or fetch was aborted — ignore if rapid track change
              return;
            case MediaError.MEDIA_ERR_NETWORK:
              message = 'Network error during audio stream retrieval.';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              message = 'Audio decoding failed or corrupted media.';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              message = 'Audio format not supported or URL unavailable.';
              break;
            default:
              message = audio.error.message || 'Unknown media playback error.';
          }
        }
        this.errorMessage = message;
        this.setPlaybackState('error');
        this.emit('error', message, audio.error);
      }
    };

    deck.listeners = {
      play: onPlay as EventListener,
      pause: onPause as EventListener,
      waiting: onWaiting as EventListener,
      playing: onPlaying as EventListener,
      canplay: onCanPlay as EventListener,
      loadedmetadata: onLoadedMetadata as EventListener,
      timeupdate: onTimeUpdate as EventListener,
      progress: onProgress as EventListener,
      ended: onEnded as EventListener,
      error: onError as EventListener,
    };

    Object.entries(deck.listeners).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });
  }

  private detachDeckListeners(deck: DeckState) {
    const audio = deck.audio;
    Object.entries(deck.listeners).forEach(([event, handler]) => {
      audio.removeEventListener(event, handler);
    });
    deck.listeners = {};
  }

  private isActiveDeck(deck: DeckState): boolean {
    return deck.slot === this.activeSlot;
  }

  private getActiveDeck(): DeckState {
    return this.activeSlot === 'A' ? this.deckA : this.deckB;
  }

  private getStandbyDeck(): DeckState {
    return this.activeSlot === 'A' ? this.deckB : this.deckA;
  }

  // ============================================================================
  // Playback Controls
  // ============================================================================

  /**
   * Loads an AudioTrack into the active deck.
   * Cancels any pending in-flight playback operations to prevent race conditions.
   * 
   * @param track The track containing metadata and audioSrc
   * @param autoPlay Whether to immediately begin playback once ready
   */
  public async load(track: AudioTrack, autoPlay: boolean = false): Promise<void> {
    if (this.isDisposed) return;

    // Increment operation ID to invalidate any prior in-flight loads or plays
    const operationId = ++this.currentOperationId;

    this.cancelCrossfade();
    this.errorMessage = null;
    this.currentTrack = track;
    this.currentTime = 0;
    this.bufferedFraction = 0;
    this.bufferedSeconds = 0;

    // Estimate duration if provided as string or number in track
    if (track.duration) {
      this.duration =
        typeof track.duration === 'number'
          ? track.duration
          : parseAudioTime(track.duration);
    } else {
      this.duration = 0;
    }

    this.normalizationGain =
      typeof track.normalizationGain === 'number' && !isNaN(track.normalizationGain)
        ? clamp(track.normalizationGain, 0.5, 1.5)
        : 1.0;

    const activeDeck = this.getActiveDeck();
    activeDeck.track = track;
    activeDeck.fadeGain = 1.0;

    this.setPlaybackState('loading');

    const srcUrl = track.audioSrc;
    if (!srcUrl) {
      // If audioSrc is empty or not provided
      this.errorMessage = 'No audio source URL provided for this track.';
      this.setPlaybackState('error');
      this.emit('error', this.errorMessage);
      return;
    }

    try {
      // Pause any ongoing playback on the deck
      activeDeck.audio.pause();
      activeDeck.audio.currentTime = 0;

      // Assign new source URL
      activeDeck.audio.src = srcUrl;
      activeDeck.audio.load();

      this.syncDeckVolume(activeDeck);

      // Verify that this operation has not been superseded by a newer load call
      if (this.currentOperationId !== operationId) {
        return;
      }

      if (autoPlay) {
        await this.play();
      }
    } catch (err: unknown) {
      if (this.currentOperationId !== operationId) return;

      const errObj = err instanceof Error ? err : new Error(String(err));
      // AbortError is normal during quick skipping
      if (errObj.name !== 'AbortError') {
        this.errorMessage = errObj.message;
        this.setPlaybackState('error');
        this.emit('error', errObj.message, errObj);
      }
    }
  }

  /**
   * Resumes or starts playback on the active deck.
   * Gracefully handles browser Autoplay policies and AbortErrors.
   */
  public async play(): Promise<void> {
    if (this.isDisposed) return;

    const operationId = this.currentOperationId;
    const activeDeck = this.getActiveDeck();

    if (!activeDeck.audio.src) {
      if (this.currentTrack?.audioSrc) {
        await this.load(this.currentTrack, true);
        return;
      }
      this.setPlaybackState('idle');
      return;
    }

    try {
      this.syncDeckVolume(activeDeck);
      const playPromise = activeDeck.audio.play();

      if (playPromise !== undefined) {
        await playPromise;
      }

      if (this.currentOperationId === operationId) {
        this.setPlaybackState('playing');
      }
    } catch (err: unknown) {
      if (this.currentOperationId !== operationId) return;

      const errObj = err instanceof Error ? err : new Error(String(err));
      if (errObj.name === 'NotAllowedError') {
        // Browser prevented autoplay without prior user interaction
        this.setPlaybackState('paused');
        this.errorMessage = 'Autoplay blocked: user interaction required.';
        this.notifySnapshot();
      } else if (errObj.name === 'AbortError') {
        // The play request was interrupted by pause() or another load()
        // No action required
      } else {
        this.errorMessage = errObj.message;
        this.setPlaybackState('error');
        this.emit('error', errObj.message, errObj);
      }
    }
  }

  /**
   * Pauses the active deck.
   */
  public pause(): void {
    if (this.isDisposed) return;
    const activeDeck = this.getActiveDeck();
    try {
      activeDeck.audio.pause();
    } catch {
      // Ignore pause failure
    }
    this.setPlaybackState('paused');
  }

  /**
   * Stops playback and resets the position to zero.
   */
  public stop(): void {
    if (this.isDisposed) return;
    this.currentOperationId++;
    this.cancelCrossfade();

    const activeDeck = this.getActiveDeck();
    try {
      activeDeck.audio.pause();
      activeDeck.audio.currentTime = 0;
    } catch {
      // Ignore
    }
    this.currentTime = 0;
    this.setPlaybackState('idle');
  }

  /**
   * Seeks to a specific timestamp in seconds.
   */
  public seek(seconds: number): void {
    if (this.isDisposed) return;
    const activeDeck = this.getActiveDeck();
    const clampedSecs = clamp(seconds, 0, this.duration > 0 ? this.duration : seconds);

    try {
      activeDeck.audio.currentTime = clampedSecs;
      this.currentTime = clampedSecs;
      this.emit('timeUpdate', this.currentTime, this.duration);
      this.notifySnapshot();
    } catch {
      // Ignore seek boundary errors
    }
  }

  // ============================================================================
  // Volume & Normalization
  // ============================================================================

  /**
   * Sets the user master volume (0.0 to 1.0).
   */
  public setVolume(volume: number): void {
    const clamped = clamp(volume, 0, 1);
    this.userVolume = clamped;

    if (clamped > 0) {
      this.previousNonZeroVolume = clamped;
      if (this.isMutedState) {
        this.isMutedState = false;
      }
    } else {
      this.isMutedState = true;
    }

    this.syncAllDeckVolumes();
    this.emit('volumeChange', this.userVolume, this.getEffectiveVolume(), this.isMutedState);
    this.notifySnapshot();
  }

  /**
   * Mute all audio output.
   */
  public mute(): void {
    if (this.isMutedState) return;
    if (this.userVolume > 0) {
      this.previousNonZeroVolume = this.userVolume;
    }
    this.isMutedState = true;
    this.syncAllDeckVolumes();
    this.emit('volumeChange', this.userVolume, this.getEffectiveVolume(), this.isMutedState);
    this.notifySnapshot();
  }

  /**
   * Unmute audio output.
   */
  public unmute(): void {
    if (!this.isMutedState) return;
    this.isMutedState = false;
    if (this.userVolume === 0) {
      this.userVolume = this.previousNonZeroVolume || 0.8;
    }
    this.syncAllDeckVolumes();
    this.emit('volumeChange', this.userVolume, this.getEffectiveVolume(), this.isMutedState);
    this.notifySnapshot();
  }

  /**
   * Toggle mute state. Returns current muted state.
   */
  public toggleMute(): boolean {
    if (this.isMutedState) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMutedState;
  }

  public getVolume(): number {
    return this.userVolume;
  }

  public getEffectiveVolume(): number {
    if (this.isMutedState) return 0;
    return clamp(this.userVolume * this.normalizationGain, 0, 1);
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  private calculateDeckVolume(deck: DeckState): number {
    if (this.isMutedState) return 0;
    const norm =
      deck.track && typeof deck.track.normalizationGain === 'number'
        ? clamp(deck.track.normalizationGain, 0.5, 1.5)
        : this.normalizationGain;

    const raw = this.userVolume * norm * deck.fadeGain;
    return clamp(raw, 0, 1);
  }

  private syncDeckVolume(deck: DeckState) {
    try {
      deck.audio.volume = this.calculateDeckVolume(deck);
      deck.audio.muted = this.isMutedState;
    } catch {
      // Ignore volume constraint violations
    }
  }

  private syncAllDeckVolumes() {
    this.syncDeckVolume(this.deckA);
    this.syncDeckVolume(this.deckB);
  }

  // ============================================================================
  // True Dual-Deck Crossfade Architecture Foundation
  // ============================================================================

  /**
   * Crossfades smoothly from the current active deck to the standby deck
   * playing `nextTrack`.
   * 
   * @param nextTrack The incoming track to crossfade to
   * @param durationMs Duration of crossfade transition in milliseconds (e.g. 1500ms)
   */
  public async crossfadeTo(nextTrack: AudioTrack, durationMs: number = 1500): Promise<void> {
    if (this.isDisposed) return;

    this.cancelCrossfade();
    const operationId = ++this.currentOperationId;

    const outgoingDeck = this.getActiveDeck();
    const incomingDeck = this.getStandbyDeck();

    incomingDeck.track = nextTrack;
    incomingDeck.fadeGain = 0.0;
    this.syncDeckVolume(incomingDeck);

    if (!nextTrack.audioSrc) {
      await this.load(nextTrack, true);
      return;
    }

    try {
      incomingDeck.audio.src = nextTrack.audioSrc;
      incomingDeck.audio.currentTime = 0;
      incomingDeck.audio.load();

      await incomingDeck.audio.play();

      if (this.currentOperationId !== operationId) {
        incomingDeck.audio.pause();
        return;
      }

      // Switch activeSlot so UI immediately reflects incoming track
      this.activeSlot = incomingDeck.slot;
      this.currentTrack = nextTrack;
      this.normalizationGain = nextTrack.normalizationGain ?? 1.0;
      this.setPlaybackState('playing');

      const startTime = performance.now();
      const outgoingStartGain = outgoingDeck.fadeGain;

      await new Promise<void>((resolve) => {
        const step = (now: number) => {
          if (this.currentOperationId !== operationId) {
            resolve();
            return;
          }

          const elapsed = now - startTime;
          const progress = clamp(elapsed / durationMs, 0, 1);
          const eased = easeSineInOut(progress);

          incomingDeck.fadeGain = eased;
          outgoingDeck.fadeGain = outgoingStartGain * (1.0 - eased);

          this.syncDeckVolume(incomingDeck);
          this.syncDeckVolume(outgoingDeck);

          if (progress < 1) {
            this.crossfadeRafId = requestAnimationFrame(step);
          } else {
            // Transition complete
            incomingDeck.fadeGain = 1.0;
            outgoingDeck.fadeGain = 0.0;
            this.syncDeckVolume(incomingDeck);
            this.syncDeckVolume(outgoingDeck);

            outgoingDeck.audio.pause();
            outgoingDeck.audio.removeAttribute('src');
            outgoingDeck.audio.load();

            this.crossfadeRafId = null;
            this.notifySnapshot();
            resolve();
          }
        };

        this.crossfadeRafId = requestAnimationFrame(step);
      });
    } catch (err: unknown) {
      if (this.currentOperationId !== operationId) return;
      const errObj = err instanceof Error ? err : new Error(String(err));
      this.errorMessage = errObj.message;
      this.setPlaybackState('error');
      this.emit('error', errObj.message, errObj);
    }
  }

  private cancelCrossfade() {
    if (this.crossfadeRafId !== null) {
      cancelAnimationFrame(this.crossfadeRafId);
      this.crossfadeRafId = null;
    }
  }

  // ============================================================================
  // Telemetry & State Reporting
  // ============================================================================

  private updateBufferedProgress(deck: DeckState) {
    const audio = deck.audio;
    const dur = this.duration > 0 ? this.duration : audio.duration || 0;
    const { fraction, seconds } = calculateBufferedRanges(audio.buffered, dur, audio.currentTime);

    const changed =
      Math.abs(this.bufferedFraction - fraction) > 0.01 ||
      Math.abs(this.bufferedSeconds - seconds) > 0.5;

    this.bufferedFraction = fraction;
    this.bufferedSeconds = seconds;

    if (changed) {
      this.emit('bufferedChange', fraction, seconds);
    }
  }

  private setPlaybackState(state: AudioPlaybackState) {
    if (this.playbackState !== state) {
      this.playbackState = state;
      const snapshot = this.getSnapshot();
      this.emit('stateChange', state, snapshot);
      this.notifySnapshot();
    }
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.duration;
  }

  public getBufferedFraction(): number {
    return this.bufferedFraction;
  }

  public getBufferedSeconds(): number {
    return this.bufferedSeconds;
  }

  public getPlaybackState(): AudioPlaybackState {
    return this.playbackState;
  }

  public getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  public getSnapshot(): AudioEngineSnapshot {
    return {
      currentTrack: this.currentTrack,
      playbackState: this.playbackState,
      currentTime: this.currentTime,
      duration: this.duration,
      bufferedFraction: this.bufferedFraction,
      bufferedSeconds: this.bufferedSeconds,
      volume: this.userVolume,
      effectiveVolume: this.getEffectiveVolume(),
      isMuted: this.isMutedState,
      isLoading: this.playbackState === 'loading',
      isPlaying: this.playbackState === 'playing',
      isBuffering: this.playbackState === 'buffering',
      error: this.errorMessage,
      activeDeck: this.activeSlot,
    };
  }

  // ============================================================================
  // Subscription & Event Dispatcher
  // ============================================================================

  public subscribe(listener: AudioEngineListener): () => void {
    this.snapshotListeners.add(listener);
    // Immediately deliver current snapshot to the new subscriber
    listener(this.getSnapshot());

    return () => {
      this.snapshotListeners.delete(listener);
    };
  }

  public on<K extends AudioEngineEventType>(
    event: K,
    handler: AudioEngineEvents[K]
  ): () => void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = new Set();
    }
    const set = this.eventHandlers[event]!;
    const untypedHandler = handler as unknown as (...args: unknown[]) => void;
    set.add(untypedHandler);

    return () => {
      set.delete(untypedHandler);
    };
  }

  private emit<K extends AudioEngineEventType>(
    event: K,
    ...args: Parameters<AudioEngineEvents[K]>
  ) {
    const handlers = this.eventHandlers[event];
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          (handler as (...a: unknown[]) => void)(...args);
        } catch (e) {
          console.error(`Error in AudioEngine event listener (${event}):`, e);
        }
      });
    }
  }

  private notifySnapshot() {
    const snapshot = this.getSnapshot();
    this.snapshotListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (e) {
        console.error('Error in AudioEngine snapshot listener:', e);
      }
    });
  }

  // ============================================================================
  // Teardown & Resource Cleanup
  // ============================================================================

  /**
   * Destroys the audio engine, detaches event listeners, cleans up HTMLAudioElements,
   * cancels animation frames, and removes all subscribers.
   */
  public destroy(): void {
    this.isDisposed = true;
    this.currentOperationId++;
    this.cancelCrossfade();

    this.detachDeckListeners(this.deckA);
    this.detachDeckListeners(this.deckB);

    safeCleanupAudioElement(this.deckA.audio);
    safeCleanupAudioElement(this.deckB.audio);

    this.snapshotListeners.clear();
    this.eventHandlers = {};
  }
}
