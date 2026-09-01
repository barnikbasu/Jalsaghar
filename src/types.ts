export type TimeOfDay = 'shokal' | 'dupur' | 'bikel' | 'raat';

export type PlaylistId = 'baithak' | 'riyaz' | 'mehfil';

export type RepeatMode = 'off' | 'all' | 'one';

export type PlaybackState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error';

export type AudioTransitionState =
  | 'idle'
  | 'fading-in'
  | 'playing'
  | 'fading-out'
  | 'transitioning';

export interface Track {
  id: string;
  title: string;
  artist: string;
  raga?: string;
  gharana?: string;
  film?: string;
  year?: string;
  duration?: string;
  videoId: string;
  playlistId: PlaylistId;
  notes?: string;
  normalizationGain?: number;
}

export interface RaagInfo {
  name: string;
  timeOfDay: string;
  thaat: string;
  mood: string;
  tracks: string[]; // Track IDs
}

export interface TimePeriodConfig {
  id: TimeOfDay;
  name: string; // 'SHOKAL', 'DUPUR', 'BIKEL', 'RAAT'
  label: string; // 'Morning', 'Midday', 'Twilight', 'Night Mehfil'
  startHour: number;
  endHour: number;
  wideImage: string;
  tallImage: string;
  ambientTone: string;
}
