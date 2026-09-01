import React, { useState } from 'react';
import { Volume2, Volume1, Volume, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number; // 0 - 100
  isMuted: boolean;
  onVolumeChange: (newVolume: number) => void;
  onToggleMute: () => void;
  className?: string;
  isExpandable?: boolean;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = '',
  isExpandable = true,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const effectiveDisplayVolume = isMuted ? 0 : volume;

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-4 h-4 text-[#d8be87]/60" />;
    }
    if (volume < 33) {
      return <Volume className="w-4 h-4 text-[#d8be87]/90" />;
    }
    if (volume < 66) {
      return <Volume1 className="w-4 h-4 text-[#d8be87]" />;
    }
    return <Volume2 className="w-4 h-4 text-[#e8cca0]" />;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-2 relative group ${className}`}
    >
      {/* Speaker Button */}
      <button
        onClick={onToggleMute}
        id="player-volume-mute-btn"
        className="p-1.5 rounded-full text-[#d8be87]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#e8cca0]"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        title={isMuted ? 'Unmute (M)' : `Mute (M) - ${Math.round(volume)}%`}
      >
        {renderVolumeIcon()}
      </button>

      {/* Volume Slider Track */}
      <div
        className={`flex items-center transition-all duration-200 ${
          isExpandable
            ? isHovered
              ? 'w-20 opacity-100'
              : 'w-16 opacity-75 sm:w-20 sm:opacity-90'
            : 'w-24 opacity-100'
        }`}
      >
        <div className="relative w-full flex items-center py-2">
          <input
            type="range"
            min={0}
            max={100}
            value={effectiveDisplayVolume}
            onChange={handleSliderChange}
            aria-label="Volume level"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(effectiveDisplayVolume)}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#e8cca0] group-hover:h-1.5 transition-all outline-none"
          />
        </div>
      </div>
    </div>
  );
};
