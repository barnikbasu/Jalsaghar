import React, { useState, useEffect } from 'react';
import { TimeOfDay } from '../types';
import { formatKolkataFullString, TIME_PERIODS } from '../lib/time';
import { Clock, Info, Sparkles } from 'lucide-react';

interface HeaderProps {
  timeOfDay: TimeOfDay;
  isAutoTime: boolean;
  onSelectTimeOfDay: (time: TimeOfDay, isManual: boolean) => void;
  onToggleInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  timeOfDay,
  isAutoTime,
  onSelectTimeOfDay,
  onToggleInfo,
}) => {
  const [clockString, setClockString] = useState<string>('');
  const [showTimeDropdown, setShowTimeDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      setClockString(formatKolkataFullString(timeOfDay));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeOfDay]);

  const periods: TimeOfDay[] = ['shokal', 'dupur', 'bikel', 'raat'];

  return (
    <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 safe-pt safe-pl safe-pr pointer-events-auto">
      {/* LEFT: Live Kolkata Clock & Period */}
      <div className="flex items-center gap-2 text-[#e3dac7]/85 font-rozha text-[11px] sm:text-xs tracking-[0.2em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
        <Clock className="w-3.5 h-3.5 text-[#d8be87] opacity-80" />
        <span>{clockString || 'KOLKATA TIME'}</span>
      </div>

      {/* CENTER: Honest Live Presence */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[#d8be87] font-rozha text-[10px] tracking-[0.25em] uppercase shadow-lg">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>ON AIR · JALSAGHAR MEHFIL</span>
      </div>

      {/* RIGHT: Time of Day World Selector & Artifact Info */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Time of day pill */}
        <div className="relative">
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            id="time-of-day-selector-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-[#d8be87]/20 hover:border-[#d8be87]/40 text-[#e6cca0] font-rozha text-[10px] sm:text-xs tracking-widest uppercase transition-all shadow-md cursor-pointer"
            aria-label="Change time of day atmosphere"
          >
            <Sparkles className="w-3 h-3 text-[#d8be87]" />
            <span>{TIME_PERIODS[timeOfDay].name}</span>
            {isAutoTime && (
              <span className="text-[9px] px-1 py-0.2 bg-[#d8be87]/20 text-[#e8cf9b] rounded ml-1">
                SYNC
              </span>
            )}
          </button>

          {/* Time of Day Dropdown */}
          {showTimeDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#140e10]/95 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[9px] font-rozha tracking-widest uppercase text-[#d8be87]/70 border-b border-white/10 mb-1">
                Select Atmosphere
              </div>

              {periods.map((p) => {
                const info = TIME_PERIODS[p];
                const active = timeOfDay === p && !isAutoTime;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      onSelectTimeOfDay(p, true);
                      setShowTimeDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-rozha tracking-wider transition-colors ${
                      active
                        ? 'bg-[#d8be87]/20 text-[#e6cca0]'
                        : 'text-[#e3dac7]/80 hover:bg-white/10 hover:text-[#f7f3e9]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-rozha text-xs uppercase">{info.name}</span>
                      <span className="text-[9px] text-white/50">{info.period}</span>
                    </div>
                    <span className="font-bengali text-xs text-[#d8be87]">
                      {info.bengaliName}
                    </span>
                  </button>
                );
              })}

              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  onClick={() => {
                    onSelectTimeOfDay(timeOfDay, false);
                    setShowTimeDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-rozha tracking-wider transition-colors ${
                    isAutoTime
                      ? 'bg-[#d8be87]/20 text-[#e6cca0]'
                      : 'text-[#e3dac7]/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>LIVE KOLKATA SYNC</span>
                  {isAutoTime && <span className="text-[#d8be87]">✓</span>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info button */}
        <button
          onClick={onToggleInfo}
          id="info-toggle-btn"
          className="p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#d8be87]/30 text-[#e3dac7]/80 hover:text-[#f7f3e9] transition-all shadow-md cursor-pointer"
          aria-label="About Jalsaghar Mehfil"
        >
          <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};
