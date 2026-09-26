/**
 * Audio Engine Types for Jalsaghar
 * Provides strongly-typed models for playback state, tracks, listeners, and dual-deck engine snapshots.
 */

import { Track } from '../../types';

export type AudioPlaybackState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error';

export interface AudioTrack extends Omit<Partial<Track>, 'duration'> {
  id: string;
  title: string;
  artist: string;
  audioSrc?: string; // Path (e.g. '/audio/test-yaman.mp3') or HTTPS URL
  duration?: string | number;
  normalizationGain?: number;
  [key: string]: unknown;
}

export interface AudioEngineSnapshot {
  currentTrack: AudioTrack | null;
  playbackState: AudioPlaybackState;
  currentTime: number;
  duration: number;
  bufferedFraction: number;
  bufferedSeconds: number;
  volume: number; // 0.0 to 1.0 (user volume)
  effectiveVolume: number; // 0.0 to 1.0 (after normalization and fades)
  isMuted: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  activeDeck: 'A' | 'B';
}

export type AudioEngineEventType =
  | 'stateChange'
  | 'timeUpdate'
  | 'durationChange'
  | 'bufferedChange'
  | 'volumeChange'
  | 'trackEnded'
  | 'error';

export interface AudioEngineEvents {
  stateChange: (state: AudioPlaybackState, snapshot: AudioEngineSnapshot) => void;
  timeUpdate: (currentTime: number, duration: number) => void;
  durationChange: (duration: number) => void;
  bufferedChange: (bufferedFraction: number, bufferedSeconds: number) => void;
  volumeChange: (userVolume: number, effectiveVolume: number, isMuted: boolean) => void;
  trackEnded: (track: AudioTrack) => void;
  error: (errorMessage: string, error?: Error | MediaError | null) => void;
}

export type AudioEngineListener = (snapshot: AudioEngineSnapshot) => void;
