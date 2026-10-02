import React from 'react';
import { Volume2, Volume1, Volume, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number; // 0 - 100
  isMuted: boolean;
  onVolumeChange: (newVolume: number) => void;
  onToggleMute: () => void;
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = '',
}) => {
  const effectiveDisplayVolume = isMuted ? 0 : volume;

  const renderVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-3.5 h-3.5 text-[#d6be96]/60 hover:text-[#f7f3e9] transition-colors" />;
    }
    if (volume < 33) {
      return <Volume className="w-3.5 h-3.5 text-[#d6be96]/60 hover:text-[#f7f3e9] transition-colors" />;
    }
    if (volume < 66) {
      return <Volume1 className="w-3.5 h-3.5 text-[#d6be96]/80 hover:text-[#f7f3e9] transition-colors" />;
    }
    return <Volume2 className="w-3.5 h-3.5 text-[#d6be96]/80 hover:text-[#f7f3e9] transition-colors" />;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
  };

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      {/* Speaker Button */}
      <button
        onClick={onToggleMute}
        id="player-volume-mute-btn"
        className="p-1 rounded-full text-[#d6be96]/70 hover:text-[#f7f3e9] transition-colors cursor-pointer outline-none"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        title={isMuted ? 'Unmute (M)' : `Mute (M) - ${Math.round(volume)}%`}
      >
        {renderVolumeIcon()}
      </button>

      {/* Volume Slider Capsule */}
      <div className="relative w-14 sm:w-16 md:w-20 flex items-center">
        {/* Custom Hairline Track */}
        <div className="w-full h-[1.5px] group-hover:h-[2px] transition-all bg-[rgba(255,255,255,0.12)] rounded-full overflow-hidden relative pointer-events-none">
          <div
            className="h-full bg-[#f7f3e9] transition-all duration-75 rounded-full"
            style={{ width: `${effectiveDisplayVolume}%` }}
          />
        </div>

        {/* Transparent Interactive Range Input */}
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

