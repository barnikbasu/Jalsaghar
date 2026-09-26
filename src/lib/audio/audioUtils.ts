/**
 * Jalsaghar Audio Utilities
 * Math, formatting, and DOM-safe audio helper functions.
 */

/**
 * Format raw seconds into standard MM:SS or HH:MM:SS display string.
 */
export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) {
    return '0:00';
  }

  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const paddedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const paddedMins = mins.toString().padStart(2, '0');
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${mins}:${paddedSecs}`;
}

/**
 * Parse a timestamp like "16:30" or "01:15:30" into total seconds.
 */
export function parseAudioTime(timeStr?: string): number {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.trim().split(':').map((p) => parseFloat(p));
  if (parts.some((p) => isNaN(p))) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

/**
 * Constrain a numeric value within [min, max].
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Calculate the buffered fraction (0.0 to 1.0) and buffered forward seconds
 * corresponding to the current playback position.
 */
export function calculateBufferedRanges(
  buffered: TimeRanges | null | undefined,
  duration: number,
  currentTime: number = 0
): { fraction: number; seconds: number } {
  if (!buffered || buffered.length === 0 || !duration || duration <= 0) {
    return { fraction: 0, seconds: 0 };
  }

  // Look for the range encompassing or immediately following currentTime
  let bufferedEnd = 0;
  for (let i = 0; i < buffered.length; i++) {
    const start = buffered.start(i);
    const end = buffered.end(i);

    // If currentTime falls inside this buffered segment
    if (currentTime >= start && currentTime <= end) {
      bufferedEnd = end;
      break;
    }

    // Or track the highest buffered end if not strictly enclosed
    if (end > bufferedEnd) {
      bufferedEnd = end;
    }
  }

  const fraction = clamp(bufferedEnd / duration, 0, 1);
  return { fraction, seconds: bufferedEnd };
}

/**
 * Creates and configures an HTMLAudioElement with production-grade defaults.
 */
export function createConfiguredAudio(label: string = 'jalsaghar-audio'): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';
  (audio as unknown as { playsInline?: boolean }).playsInline = true;
  audio.setAttribute('data-deck-label', label);
  return audio;
}

/**
 * Safely tear down an HTMLAudioElement, detaching media resources.
 */
export function safeCleanupAudioElement(audio: HTMLAudioElement): void {
  try {
    audio.pause();
    audio.removeAttribute('src');
    // Calling load() after removing src resets the media pipeline and frees buffers
    audio.load();
  } catch {
    // Ignore teardown errors
  }
}

/**
 * Sine ease in-out smoothing curve for gain ramping and crossfading.
 */
export function easeSineInOut(progress: number): number {
  const t = clamp(progress, 0, 1);
  return 0.5 - 0.5 * Math.cos(t * Math.PI);
}
