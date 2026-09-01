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
  notes?: string;
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
