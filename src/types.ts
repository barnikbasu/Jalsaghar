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
  taal?: string;
  gharana?: string;
  album?: string;
  film?: string;
  year?: number | string;
  duration?: string;
  instrument?: string;
  tradition?: 'Hindustani' | 'Carnatic' | 'Dhrupad';
  playlistId?: PlaylistId;
  notes?: string;
  youtubeUrl: string;
}

export interface RaagInfo {
  name: string;
  timeOfDay?: string;
  thaat?: string;
  mood?: string;
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
