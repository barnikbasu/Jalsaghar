/**
 * YouTube Utility for Jalsaghar
 * Extracts video IDs from any standard, short, embed, or YouTube Music URL,
 * tolerating all tracking/playlist query parameters.
 */

export function extractYouTubeVideoId(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If already an 11-char ID without slashes/protocols
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const validUrlStr =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;

    const parsed = new URL(validUrlStr);
    const hostname = parsed.hostname.toLowerCase();

    // 1. youtu.be/VIDEO_ID
    if (hostname === 'youtu.be' || hostname.endsWith('.youtu.be')) {
      const id = parsed.pathname.replace(/^\/+/, '').split('/')[0];
      return id || '';
    }

    // 2. youtube.com, music.youtube.com, m.youtube.com
    if (
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtube-nocookie.com' ||
      hostname.endsWith('.youtube-nocookie.com')
    ) {
      // /watch?v=VIDEO_ID
      const v = parsed.searchParams.get('v');
      if (v) return v;

      // /embed/VIDEO_ID, /v/VIDEO_ID, or /shorts/VIDEO_ID
      const match = parsed.pathname.match(/^\/(?:embed|v|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch {
    // Fallback regex if URL parsing encounters an invalid format
  }

  const regex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regex);
  return match ? match[1] : '';
}
