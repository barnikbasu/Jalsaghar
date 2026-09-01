import { track as vercelTrack } from '@vercel/analytics';

export function trackEvent(name: string, properties?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined') {
      vercelTrack(name, properties);
    }
  } catch {
    // Graceful fallback if analytics isn't connected
  }
}
