import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TimeOfDay, PlaylistId, Track } from './types';
import { getCurrentTimeOfDay } from './lib/time';
import { TRACK_CATALOG, getTracksByPlaylist } from './lib/tracks';
import { ArtworkView } from './components/ArtworkView';
import { CurtainIntro } from './components/CurtainIntro';
import { Header } from './components/Header';
import { Wordmark } from './components/Wordmark';
import { MusicPlayer } from './components/MusicPlayer';
import { AboutDrawer } from './components/AboutDrawer';

export default function App() {
  // Time-of-day state
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => getCurrentTimeOfDay());
  const [isAutoTime, setIsAutoTime] = useState<boolean>(true);

  // Entrance Curtain State
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  // Music Player State
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistId>('baithak');
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [unavailableTrackIds, setUnavailableTrackIds] = useState<Set<string>>(new Set());
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Info modal state
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // Automatic Time-of-day interval (updates every minute to sync with Kolkata time)
  useEffect(() => {
    if (!isAutoTime) return;

    const syncTime = () => {
      const current = getCurrentTimeOfDay();
      setTimeOfDay(current);
    };

    syncTime();
    const interval = setInterval(syncTime, 60000);
    return () => clearInterval(interval);
  }, [isAutoTime]);

  // Active playlist tracks
  const playlistTracks = useMemo(() => {
    const list = getTracksByPlaylist(currentPlaylist);
    return list.length > 0 ? list : TRACK_CATALOG;
  }, [currentPlaylist]);

  const currentTrack: Track = useMemo(() => {
    if (currentTrackIndex >= 0 && currentTrackIndex < playlistTracks.length) {
      return playlistTracks[currentTrackIndex];
    }
    return playlistTracks[0] || TRACK_CATALOG[0];
  }, [playlistTracks, currentTrackIndex]);

  // Handle manual/auto time of day selection
  const handleSelectTimeOfDay = (newTime: TimeOfDay, isManual: boolean) => {
    setTimeOfDay(newTime);
    setIsAutoTime(!isManual);
  };

  // Next Track with skipping unavailable tracks
  const handleNextTrack = useCallback(() => {
    let nextIdx = (currentTrackIndex + 1) % playlistTracks.length;
    let attempts = 0;

    // Find next playable track if current is marked unavailable
    while (unavailableTrackIds.has(playlistTracks[nextIdx]?.id) && attempts < playlistTracks.length) {
      nextIdx = (nextIdx + 1) % playlistTracks.length;
      attempts++;
    }

    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [currentTrackIndex, playlistTracks, unavailableTrackIds]);

  // Previous Track
  const handlePreviousTrack = useCallback(() => {
    let prevIdx = (currentTrackIndex - 1 + playlistTracks.length) % playlistTracks.length;
    let attempts = 0;

    while (unavailableTrackIds.has(playlistTracks[prevIdx]?.id) && attempts < playlistTracks.length) {
      prevIdx = (prevIdx - 1 + playlistTracks.length) % playlistTracks.length;
      attempts++;
    }

    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [currentTrackIndex, playlistTracks, unavailableTrackIds]);

  // Switch Playlist
  const handleSelectPlaylist = (newPlaylist: PlaylistId) => {
    if (newPlaylist === currentPlaylist) return;
    setCurrentPlaylist(newPlaylist);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Play / Pause
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // YouTube Player Event Handlers
  const handlePlayerReady = () => {
    // If visitor already entered, begin playback quietly
    if (hasEntered) {
      setIsPlaying(true);
    }
  };

  const handleStateChange = (state: number) => {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (state === 1) {
      setIsPlaying(true);
      setIsBuffering(false);
    } else if (state === 2) {
      setIsPlaying(false);
      setIsBuffering(false);
    } else if (state === 3) {
      setIsBuffering(true);
    } else if (state === 0) {
      // Track ended: advance to next
      handleNextTrack();
    }
  };

  const handleTimeUpdate = (curr: number, dur: number) => {
    setCurrentTime(curr);
    if (dur > 0) setDuration(dur);
  };

  const handlePlayerError = (errorCode: number) => {
    console.warn(`[Jalsaghar] Playback code ${errorCode} on track:`, currentTrack.title);
    
    // Mark track unavailable for this session
    setUnavailableTrackIds((prev) => {
      const updated = new Set(prev);
      updated.add(currentTrack.id);
      return updated;
    });

    // Quiet notification
    setNoticeMessage('This recording is resting. Transitioning to the next raga...');
    setTimeout(() => {
      setNoticeMessage(null);
    }, 4000);

    // Auto advance to next valid recording
    setTimeout(() => {
      handleNextTrack();
    }, 1200);
  };

  // Visitor enters the Jalsaghar room
  const handleEnterMehfil = () => {
    setHasEntered(true);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#090607]">
      {/* 1. Full-Screen Artwork Layer with Crossfade & Orientation Detection */}
      <ArtworkView timeOfDay={timeOfDay} />

      {/* 2. Opening Curtain Physical Entrance (Transitional Layer) */}
      {!hasEntered && (
        <CurtainIntro timeOfDay={timeOfDay} onEnter={handleEnterMehfil} />
      )}

      {/* 3. Main Minimal Jalsaghar UI Experience */}
      {hasEntered && (
        <div className="relative z-30 w-full h-full flex flex-col justify-between pointer-events-none">
          {/* Top Header */}
          <Header
            timeOfDay={timeOfDay}
            isAutoTime={isAutoTime}
            onSelectTimeOfDay={handleSelectTimeOfDay}
            onToggleInfo={() => setIsInfoOpen(true)}
          />

          {/* Central Bengali Wordmark - Softly illuminated into the painting atmosphere */}
          <main className="my-auto w-full flex flex-col items-center justify-center px-4 pb-20 sm:pb-28">
            <Wordmark size="large" />
          </main>

          {/* Floating Horizontal Glass Music Player */}
          <MusicPlayer
            currentTrack={currentTrack}
            currentPlaylist={currentPlaylist}
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            noticeMessage={noticeMessage}
            onPlayPause={handlePlayPause}
            onPrevious={handlePreviousTrack}
            onNext={handleNextTrack}
            onSeek={(sec) => setCurrentTime(sec)}
            onVolumeChange={(v) => {
              setVolume(v);
              if (isMuted) setIsMuted(false);
            }}
            onToggleMute={() => setIsMuted((prev) => !prev)}
            onSelectPlaylist={handleSelectPlaylist}
            onPlayerReady={handlePlayerReady}
            onStateChange={handleStateChange}
            onTimeUpdate={handleTimeUpdate}
            onError={handlePlayerError}
          />
        </div>
      )}

      {/* 4. About Jalsaghar Information Modal */}
      <AboutDrawer isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
}
