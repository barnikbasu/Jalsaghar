import { TimeOfDay, TimePeriodInfo } from '../types';

export const CANONICAL_TIMEZONE = 'Asia/Kolkata';

export const TIME_PERIODS: Record<TimeOfDay, TimePeriodInfo> = {
  shokal: {
    id: 'shokal',
    name: 'SHOKAL',
    bengaliName: 'সকাল',
    period: '05:00 – 10:59',
    startHour: 5,
    endHour: 10,
    description: 'Dawn & Morning Light · Prabhat',
    ragas: 'Bhairav · Ahir Bhairav · Lalit · Todi · Jogiya',
    wideImage: '/bg/shokal-wide.png',
    tallImage: '/bg/shokal-tall.png',
    ambientTone: 'from-[#382d23] via-[#211a14] to-[#0d0a08]',
  },
  dupur: {
    id: 'dupur',
    name: 'DUPUR',
    bengaliName: 'দুপুর',
    period: '11:00 – 15:59',
    startHour: 11,
    endHour: 15,
    description: 'Midday Glow · Madhyanna',
    ragas: 'Multani · Bhimpalasi · Shuddh Sarang · Patdeep',
    wideImage: '/bg/dupur-wide.png',
    tallImage: '/bg/dupur-tall.png',
    ambientTone: 'from-[#423326] via-[#281e17] to-[#120d09]',
  },
  bikel: {
    id: 'bikel',
    name: 'BIKEL',
    bengaliName: 'বিকেল',
    period: '16:00 – 18:59',
    startHour: 16,
    endHour: 18,
    description: 'Golden Dusk & Twilight · Sandhiprakash',
    ragas: 'Yaman · Yaman Kalyan · Khamaj · Bageshree · Desh',
    wideImage: '/bg/bikel-wide.png',
    tallImage: '/bg/bikel-tall.png',
    ambientTone: 'from-[#3a221f] via-[#241315] to-[#0f0709]',
  },
  raat: {
    id: 'raat',
    name: 'RAAT',
    bengaliName: 'রাত',
    period: '19:00 – 04:59',
    startHour: 19,
    endHour: 4,
    description: 'Deep Night & Intimate Mehfil · Ratri',
    ragas: 'Darbari Kanada · Malkauns · Bihag · Jog · Kedar · Rageshree',
    wideImage: '/bg/raat-wide.png',
    tallImage: '/bg/raat-tall.png',
    ambientTone: 'from-[#1a212b] via-[#10151d] to-[#080a0f]',
  },
};

/**
 * Returns current date/time in Asia/Kolkata timezone
 */
export function getKolkataDate(): Date {
  const now = new Date();
  const kolkataTimeString = now.toLocaleString('en-US', { timeZone: CANONICAL_TIMEZONE });
  return new Date(kolkataTimeString);
}

/**
 * Computes current TimeOfDay according to Asia/Kolkata hour
 */
export function getCurrentTimeOfDay(customDate?: Date): TimeOfDay {
  const kolkataDate = customDate || getKolkataDate();
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
 * Formats current Kolkata time string (e.g., "10:42 PM")
 */
export function formatKolkataTime(customDate?: Date): string {
  const date = customDate || new Date();
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: CANONICAL_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formats full timestamp with Kolkata period (e.g., "10:42 PM · KOLKATA · RAAT")
 */
export function formatKolkataFullString(timeOfDay?: TimeOfDay): string {
  const timeStr = formatKolkataTime();
  const period = (timeOfDay || getCurrentTimeOfDay()).toUpperCase();
  return `${timeStr} · KOLKATA · ${period}`;
}
