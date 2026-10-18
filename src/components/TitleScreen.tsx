/**
 * Title Screen for Jan Tar Runner: The Protest Escape
 * Bespoke SVG title lockup, authentic Delhi protest escape theme, controls summary.
 */

import React, { useEffect, useState } from 'react';
import { Play, Volume2, VolumeX, Shield, Award, Sparkles } from 'lucide-react';
import { sound } from '../game/audio';

interface TitleScreenProps {
  onStart: () => void;
  bestScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, bestScore }) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onStart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-auto bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80 z-20">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
        {/* Location Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-amber-400 backdrop-blur-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>JANTAR MANTAR • NEW DELHI</span>
        </div>

        {/* High Score & Audio Toggle */}
        <div className="flex items-center gap-3">
          {bestScore > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tabular-nums">
              <Award className="w-4 h-4 text-amber-400" />
              <span>RECORD: {bestScore.toLocaleString()}</span>
            </div>
          )}

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-2xl mx-auto">
        {/* Tricolor accent bar */}
        <div className="flex w-32 h-1.5 rounded-full overflow-hidden mb-3 shadow-md">
          <div className="w-1/3 bg-orange-500"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-emerald-600"></div>
        </div>

        {/* Bespoke SVG Title Lockup */}
        <svg
          viewBox="0 0 640 110"
          className="w-full max-w-lg filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
          aria-label="Jan Tar Runner Title"
        >
          <defs>
            <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Main Title */}
          <text
            x="320"
            y="65"
            textAnchor="middle"
            fill="url(#titleGrad)"
            stroke="#0f172a"
            strokeWidth="5"
            paintOrder="stroke fill"
            fontFamily="'Chakra Petch', sans-serif"
            fontWeight="900"
            fontSize="62"
            letterSpacing="2"
          >
            JAN TAR RUNNER
          </text>

          {/* Subtitle */}
          <text
            x="320"
            y="98"
            textAnchor="middle"
            fill="url(#subGrad)"
            fontFamily="'Outfit', sans-serif"
            fontWeight="800"
            fontSize="22"
            letterSpacing="6"
          >
            THE PROTEST ESCAPE
          </text>
        </svg>

        <p className="mt-2 text-sm text-slate-300 max-w-md font-medium leading-relaxed drop-shadow">
          You joined the peaceful demonstration near Jantar Mantar. The police are giving chase — dodge barricades, slide beneath checkpoints, and outrun the squad!
        </p>

        {/* Primary Start CTA Button */}
        <button
          onClick={onStart}
          className="mt-6 group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-slate-950 font-display font-bold text-lg tracking-wider uppercase shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_45px_rgba(245,158,11,0.8)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>START ESCAPE RUN</span>
          <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded bg-slate-950/20 text-xs font-mono text-slate-950">
            SPACE
          </span>
        </button>

        {/* How to play mechanics pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-8 w-full max-w-xl text-left">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="block font-bold text-amber-400">A / D or ◄ / ►</span>
            <span className="text-slate-400 text-[11px]">Switch 3 Lanes</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="block font-bold text-sky-400">W, ▲ or Space</span>
            <span className="text-slate-400 text-[11px]">Jump Barricades</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="block font-bold text-emerald-400">S or ▼</span>
            <span className="text-slate-400 text-[11px]">Slide Under Beams</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="block font-bold text-orange-400">Masala Chai</span>
            <span className="text-slate-400 text-[11px]">Nitro & Shield</span>
          </div>
        </div>
      </div>

      {/* Flat control-hint line (Game Craft Directive) */}
      <div className="text-center text-xs text-slate-400 font-mono tracking-wide">
        <span>WASD / Arrow Keys Move · Space Jump · S/Down Slide · Esc/P Pause</span>
      </div>
    </div>
  );
};
