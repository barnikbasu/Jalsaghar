import React, { useState, useEffect } from 'react';
import { formatKolkataTime } from '../lib/time';
import { EXTERNAL_LINKS } from '../lib/tracks';
import { trackEvent } from '../lib/analytics';
import { Clock } from 'lucide-react';

interface TopBarProps {
  onOpenCreators: () => void;
  onOpenSupport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCreators,
  onOpenSupport,
}) => {
  const [clockString, setClockString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setClockString(formatKolkataTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenExternal = (service: 'youtubeMusic' | 'spotify', url: string) => {
    trackEvent('external_playlist_click', { service });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-5 safe-pt safe-pl safe-pr pointer-events-auto select-none">
      {/* TOP-LEFT: Real-world Kolkata Time (Small quiet floating object) */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(11,6,7,0.72)] border border-[rgba(212,175,55,0.12)] text-[#f7f3e9] font-rozha text-[11px] sm:text-xs tracking-wider shadow-sm opacity-60 hover:opacity-90 focus-within:opacity-90 transition-opacity duration-200 cursor-default"
        title="Current Time in Kolkata (Asia/Kolkata)"
      >
        <Clock className="w-3 h-3 text-[#d8be87]" />
        <span>{clockString || '1:44 AM · IST'}</span>
      </div>

      {/* TOP-CENTER: Live Room Presence (Subtle room status, not a streaming badge) */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[rgba(11,6,7,0.72)] border border-[rgba(212,175,55,0.12)] text-[#d8be87]/80 font-rozha text-[10px] tracking-[0.2em] uppercase shadow-sm opacity-60 hover:opacity-90 transition-opacity duration-200">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d8be87]/90" />
        <span>LIVE</span>
      </div>

      {/* TOP-RIGHT: Four Small Artifacts (Thin treatment, lower opacity at rest) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* ARTIFACT 1 & 2: Media & Streaming [ YouTube Music | Spotify ] */}
        <div className="flex items-center rounded-full bg-[rgba(11,6,7,0.72)] border border-[rgba(212,175,55,0.12)] p-0.5 shadow-sm opacity-60 hover:opacity-90 focus-within:opacity-90 transition-opacity duration-200 text-[#f7f3e9]">
          {/* YouTube Music Button */}
          <button
            onClick={() => handleOpenExternal('youtubeMusic', EXTERNAL_LINKS.youtubeMusic)}
            id="youtube-music-external-btn"
            className="p-1.5 sm:p-2 rounded-full hover:bg-[rgba(212,175,55,0.10)] text-[#f7f3e9]/80 hover:text-[#f7f3e9] transition-colors cursor-pointer"
            aria-label="Open Jalsaghar playlist on YouTube Music"
            title="YouTube Music Playlist"
          >
            {/* Minimal Vector Icon for YouTube Music */}
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <polygon points="10,9 16,12 10,15" fill="currentColor" />
            </svg>
          </button>

          {/* Thin Hairline Divider */}
          <div className="w-[1px] h-3 bg-[rgba(212,175,55,0.15)] mx-0.5" />

          {/* Spotify Button */}
          <button
            onClick={() => handleOpenExternal('spotify', EXTERNAL_LINKS.spotify)}
            id="spotify-external-btn"
            className="p-1.5 sm:p-2 rounded-full hover:bg-[rgba(212,175,55,0.10)] text-[#f7f3e9]/80 hover:text-[#f7f3e9] transition-colors cursor-pointer"
            aria-label="Open Jalsaghar playlist on Spotify"
            title="Spotify Playlist"
          >
            {/* Minimal Vector Icon for Spotify */}
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.436-5.308-1.76-8.793-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.81-.87 7.076-.503 9.722 1.113.294.18.386.563.207.857zm1.226-2.724c-.226.367-.71.482-1.077.256-2.69-1.653-6.79-2.133-9.972-1.168-.413.125-.85-.11-.975-.523-.125-.413.11-.85.523-.975 3.633-1.102 8.147-.568 11.245 1.333.367.226.482.71.256 1.077zm.106-2.836C14.693 8.94 9.37 8.764 6.275 9.704c-.494.15-1.018-.13-1.168-.624-.15-.494.13-1.018.624-1.168 3.555-1.079 9.432-.87 13.142 1.332.445.264.59.838.326 1.283-.264.444-.838.59-1.282.326z" />
            </svg>
          </button>
        </div>

        {/* ARTIFACT 3 & 4: Utility & Connection [ Group | Chai ] */}
        <div className="flex items-center rounded-full bg-[rgba(11,6,7,0.72)] border border-[rgba(212,175,55,0.12)] p-0.5 shadow-sm opacity-60 hover:opacity-90 focus-within:opacity-90 transition-opacity duration-200 text-[#f7f3e9]">
          {/* Group / Community Icon Button */}
          <button
            onClick={() => {
              trackEvent('creator_card_open');
              onOpenCreators();
            }}
            id="group-creators-btn"
            className="p-1.5 sm:p-2 rounded-full hover:bg-[rgba(212,175,55,0.10)] text-[#f7f3e9]/80 hover:text-[#f7f3e9] transition-colors cursor-pointer"
            aria-label="About the creator"
            title="Made with Bhalobasha"
          >
            {/* Minimal Vector Icon: Human Silhouettes */}
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="3.2" />
              <path d="M2.5 19c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5v1h-11v-1z" />
              <circle cx="16.5" cy="9.5" r="2.6" opacity="0.85" />
              <path
                d="M13.5 15.2c.85-.45 1.84-.7 2.9-.7 2.65 0 4.8 1.95 4.8 4.5v1h-4.5v-.5c0-1.78-.96-3.3-2.4-4.1z"
                opacity="0.85"
              />
            </svg>
          </button>

          {/* Thin Hairline Divider */}
          <div className="w-[1px] h-3 bg-[rgba(212,175,55,0.15)] mx-0.5" />

          {/* Coffee Cup / Chai Support Button */}
          <button
            onClick={() => {
              trackEvent('support_card_open');
              onOpenSupport();
            }}
            id="buy-chai-btn"
            className="p-1.5 sm:p-2 rounded-full hover:bg-[rgba(212,175,55,0.10)] text-[#f7f3e9]/80 hover:text-[#f7f3e9] transition-colors cursor-pointer"
            aria-label="Buy us a chai to support Jalsaghar"
            title="Buy Us a Chai"
          >
            {/* Minimal Line-Art Coffee Mug with Steam Lines */}
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-current fill-none stroke-[1.5] stroke-linecap-round stroke-linejoin-round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 8h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
              <path d="M16 10h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" />
              <path d="M7 3v2" />
              <path d="M10 2v3" />
              <path d="M13 3v2" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
