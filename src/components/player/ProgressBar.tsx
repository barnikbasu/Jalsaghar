import React, { useState, useRef, useCallback } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  bufferedFraction?: number; // 0.0 to 1.0
  onSeekCommit: (timestamp: number) => void;
  className?: string;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  bufferedFraction = 0,
  onSeekCommit,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragTime, setDragTime] = useState<number>(0);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; time: number } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const displayTime = isDragging ? dragTime : currentTime;
  const effectiveDuration = duration > 0 ? duration : 1;
  const playedPercent = Math.min(100, Math.max(0, (displayTime / effectiveDuration) * 100));
  const bufferedPercent = Math.min(100, Math.max(0, bufferedFraction * 100));

  const calculateTimeFromEvent = useCallback(
    (clientX: number): number => {
      if (!barRef.current) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const fraction = Math.max(0, Math.min(1, clickX / rect.width));
      return fraction * (duration || 0);
    },
    [duration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const newTime = calculateTimeFromEvent(e.clientX);
    setDragTime(newTime);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newTime = calculateTimeFromEvent(e.clientX);
      setDragTime(newTime);
    } else if (barRef.current && duration > 0) {
      const rect = barRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const time = (x / rect.width) * duration;
      setHoverPosition({ x, time });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const finalTime = calculateTimeFromEvent(e.clientX);
      setIsDragging(false);
      onSeekCommit(finalTime);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const step = 5;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeekCommit(Math.min(duration, currentTime + step));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeekCommit(Math.max(0, currentTime - step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSeekCommit(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSeekCommit(duration);
    }
  };

  return (
    <div className={`w-full flex items-center gap-3 select-none ${className}`}>
      {/* Elapsed time */}
      <span className="font-mono text-xs text-zinc-400 font-medium tracking-tight shrink-0 min-w-[34px] text-right">
        {formatTime(displayTime)}
      </span>

      {/* Seeker Track Container */}
      <div
        ref={barRef}
        role="slider"
        aria-label="Seek track position"
        aria-valuemin={0}
        aria-valuemax={duration || 100}
        aria-valuenow={Math.round(displayTime)}
        aria-valuetext={`${formatTime(displayTime)} of ${formatTime(duration)}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="relative flex-1 py-2 cursor-pointer group flex items-center touch-none outline-none rounded-full"
      >
        {/* Background track */}
        <div className="w-full h-1 group-hover:h-1.5 transition-all duration-150 rounded-full bg-white/15 relative overflow-hidden">
          {/* Buffered Progress Bar */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-white/25 transition-all duration-300 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Played Progress Bar */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-white transition-all duration-75 rounded-full"
            style={{ width: `${playedPercent}%` }}
          />
        </div>

        {/* Tactile Scrubber Thumb Handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md pointer-events-none transition-transform duration-100 ${
            isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'
          }`}
          style={{ left: `${playedPercent}%` }}
        />

        {/* Hover Time Tooltip */}
        {hoverPosition && !isDragging && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-white text-[10px] font-mono pointer-events-none shadow-lg z-30"
            style={{ left: `${hoverPosition.x}px` }}
          >
            {formatTime(hoverPosition.time)}
          </div>
        )}
      </div>

      {/* Duration time */}
      <span className="font-mono text-xs text-zinc-400 font-medium tracking-tight shrink-0 min-w-[34px] text-left">
        {formatTime(duration)}
      </span>
    </div>
  );
};

