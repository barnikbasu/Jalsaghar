import { TimeOfDay, TimePeriodConfig } from '../types';

export const CANONICAL_TIMEZONE = 'Asia/Kolkata';

/**
 * Canonical 4 Time-of-Day Configurations (Asia/Kolkata)
 * 05:00–10:59 → SHOKAL
 * 11:00–15:59 → DUPUR
 * 16:00–18:59 → BIKEL
 * 19:00–04:59 → RAAT
 */
export const TIME_PERIODS: Record<TimeOfDay, TimePeriodConfig> = {
  shokal: {
    id: 'shokal',
    name: 'SHOKAL',
    label: 'Dawn & Morning Light',
    startHour: 5,
    endHour: 10,
    wideImage: '/bg/shokal-wide.png',
    tallImage: '/bg/shokal-tall.png',
    ambientTone: 'from-[#382d23] via-[#211a14] to-[#0d0a08]',
  },
  dupur: {
    id: 'dupur',
    name: 'DUPUR',
    label: 'Midday Light',
    startHour: 11,
    endHour: 15,
    wideImage: '/bg/dupur-wide.png',
    tallImage: '/bg/dupur-tall.png',
    ambientTone: 'from-[#423326] via-[#281e17] to-[#120d09]',
  },
  bikel: {
    id: 'bikel',
    name: 'BIKEL',
    label: 'Twilight & Golden Dusk',
    startHour: 16,
    endHour: 18,
    wideImage: '/bg/bikel-wide.png',
    tallImage: '/bg/bikel-tall.png',
    ambientTone: 'from-[#3a221f] via-[#241315] to-[#0f0709]',
  },
  raat: {
    id: 'raat',
    name: 'RAAT',
    label: 'Deep Night & Mehfil',
    startHour: 19,
    endHour: 4,
    wideImage: '/bg/raat-wide.png',
    tallImage: '/bg/raat-tall.png',
    ambientTone: 'from-[#1a212b] via-[#10151d] to-[#080a0f]',
  },
};

/**
 * Returns current Date object converted to Asia/Kolkata timezone
 */
export function getKolkataDate(): Date {
  const now = new Date();
  const kolkataTimeString = now.toLocaleString('en-US', { timeZone: CANONICAL_TIMEZONE });
  return new Date(kolkataTimeString);
}

/**
 * Determines current TimeOfDay automatically from current Asia/Kolkata hour
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const kolkataDate = getKolkataDate();
  const hour = kolkataDate.getHours();

  if (hour >= 5 && hour < 11) {
    return 'shokal';
  } else if (hour >= 11 && hour < 16) {
    return 'dupur';
  } else if (hour >= 16 && hour < 19) {
    return 'bikel';
  } else {
    return 'raat';
  }
}

/**
 * Formats live Kolkata time (e.g., "1:44 AM · IST")
 */
export function formatKolkataTime(): string {
  const date = new Date();
  const timeFormatted = new Intl.DateTimeFormat('en-IN', {
    timeZone: CANONICAL_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${timeFormatted} · IST`;
}
