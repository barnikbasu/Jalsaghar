import React, { useState, useEffect, useCallback } from 'react';
import { TimeOfDay, Track, PlaylistId } from './types';
import { getCurrentTimeOfDay } from './lib/time';
import { TRACK_CATALOG, getTracksByPlaylist } from './lib/tracks';
import { ArtworkView } from './components/ArtworkView';
import { Wordmark } from './components/Wordmark';
import { TopBar } from './components/TopBar';
import { MusicPlayer } from './components/MusicPlayer';
import { CurtainIntro } from './components/CurtainIntro';
import { ContextualModals } from './components/ContextualModals';
import { trackEvent } from './lib/analytics';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export function App() {
  // 1. Automatic Real-World Time-of-Day (Asia/Kolkata)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getCurrentTimeOfDay());

  // 2. Curtain Threshold Experience
  const [isCurtainOpen, setIsCurtainOpen] = useState<boolean>(false);

  // 3. Independent Music Playback State
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistId>('baithak');
  const playlistTracks = getTracksByPlaylist(currentPlaylist);
  const [currentTrack, setCurrentTrack] = useState<Track>(playlistTracks[0] || TRACK_CATALOG[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // 4. Floating Contextual Cards
  const [creatorsOpen, setCreatorsOpen] = useState<boolean>(false);
  const [supportOpen, setSupportOpen] = useState<boolean>(false);

  // Synchronize time-of-day with Asia/Kolkata on a regular interval
  useEffect(() => {
    const checkTime = () => {
      const detected = getCurrentTimeOfDay();
      setTimeOfDay((prev) => {
        if (prev !== detected) {
          trackEvent('atmosphere_auto_transition', { from: prev, to: detected });
          return detected;
        }
        return prev;
      });
    };

    checkTime();
    const interval = setInterval(checkTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update playlist selection (completely independent of time-of-day)
  const handlePlaylistChange = (playlist: PlaylistId) => {
    setCurrentPlaylist(playlist);
    const tracks = getTracksByPlaylist(playlist);
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
  };

  // Playback handlers
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      trackEvent(next ? 'play' : 'pause', {
        title: currentTrack.title,
        artist: currentTrack.artist,
      });
      return next;
    });
  }, [currentTrack]);

  const handleNext = useCallback(() => {
    const currentIndex = playlistTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlistTracks.length;
    const nextTrack = playlistTracks[nextIndex];
    setCurrentTrack(nextTrack);
    trackEvent('next_track', { title: nextTrack.title, artist: nextTrack.artist });
  }, [playlistTracks, currentTrack]);

  const handlePrevious = useCallback(() => {
    const currentIndex = playlistTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;
    const prevTrack = playlistTracks[prevIndex];
    setCurrentTrack(prevTrack);
    trackEvent('prev_track', { title: prevTrack.title, artist: prevTrack.artist });
  }, [playlistTracks, currentTrack]);

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-[#0a0607]">
      {/* VERCEL TELEMETRY */}
      <Analytics />
      <SpeedInsights />

      {/* 1. THE PAINTING / THE WORLD (LOCKED PRODUCTION ARTWORK) */}
      <ArtworkView timeOfDay={timeOfDay} />

      {/* 2. TOP FLOATING BAR (KOLKATA TIME · LIVE · STREAMING & UTILITY PILLS) */}
      <TopBar
        onOpenCreators={() => setCreatorsOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
      />

      {/* 3. CENTER BRAND WORDMARK (CALM IN THE WORLD) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-28 sm:pb-36 z-20">
        <Wordmark size="default" showSubtitle={true} />
      </div>

      {/* 4. FLOATING MUSIC PLAYER (DESKTOP DOCK / MOBILE CARD WITH VISIBLE YOUTUBE) */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onTrackSelect={handleTrackSelect}
        allTracks={playlistTracks}
        currentPlaylist={currentPlaylist}
        onPlaylistChange={handlePlaylistChange}
      />

      {/* 5. CONTEXTUAL MODALS (MADE WITH BHALOBASHA / SUPPORT NOTE) */}
      <ContextualModals
        creatorsOpen={creatorsOpen}
        supportOpen={supportOpen}
        onCloseCreators={() => setCreatorsOpen(false)}
        onCloseSupport={() => setSupportOpen(false)}
      />

      {/* 6. OPENING CURTAIN THRESHOLD EXPERIENCE */}
      <CurtainIntro
        isOpen={isCurtainOpen}
        onOpen={() => {
          setIsCurtainOpen(true);
          // Gently start playing on curtain entrance
          setIsPlaying(true);
        }}
      />
    </main>
  );
}

export default App;
