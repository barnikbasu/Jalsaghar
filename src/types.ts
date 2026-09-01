export type TimeOfDay = 'shokal' | 'dupur' | 'bikel' | 'raat';

export type PlaylistId = 'baithak' | 'riyaz' | 'mehfil';

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
  timeOfDay?: TimeOfDay;
  notes?: string;
}

export interface PlaylistInfo {
  id: PlaylistId;
  name: string;
  description: string;
  subtitle: string;
}

export interface TimePeriodInfo {
  id: TimeOfDay;
  name: string;
  bengaliName: string;
  period: string;
  startHour: number;
  endHour: number;
  description: string;
  ragas: string;
  wideImage: string;
  tallImage: string;
  ambientTone: string;
}
