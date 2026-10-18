/**
 * Game Over Modal for Jan Tar Runner
 * Displays run summary, reason of capture, high score celebrations, and Restart CTA.
 */

import React, { useEffect } from 'react';
import { RotateCcw, Award, AlertOctagon, ShieldAlert, Sparkles } from 'lucide-react';
import { GameOverDetails } from '../game/GameEngine';

interface GameOverModalProps {
  details: GameOverDetails;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ details, onRestart }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        onRestart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onRestart]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/85 z-30 pointer-events-auto">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Tricolor Ribbon Top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="w-1/3 bg-orange-500"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-emerald-600"></div>
        </div>

        {/* Status Icon */}
        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-red-500/10 border border-red-500/30">
          {details.reason === 'caught' ? (
            <ShieldAlert className="w-8 h-8 text-red-500" />
          ) : (
            <AlertOctagon className="w-8 h-8 text-amber-500" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white tracking-wide uppercase">
          {details.reason === 'caught' ? 'APPREHENDED BY POLICE' : 'ROADBLOCK COLLISION'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {details.reason === 'caught'
            ? 'The Delhi Police officer caught up after you hit the barricade!'
            : 'You crashed into an obstacle along the New Delhi escape route!'}
        </p>

        {/* New High Score Badge */}
        {details.isNewHigh && (
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold tracking-wider uppercase animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>NEW RECORD ESCAPE!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-6 text-left">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="block text-[11px] text-slate-400 font-semibold uppercase">SCORE</span>
            <span className="text-xl font-display font-bold text-amber-400 tabular-nums">
              {details.score.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="block text-[11px] text-slate-400 font-semibold uppercase">DISTANCE</span>
            <span className="text-xl font-display font-bold text-sky-400 tabular-nums">
              {details.distance}m
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="block text-[11px] text-slate-400 font-semibold uppercase">COINS</span>
            <span className="text-xl font-display font-bold text-emerald-400 tabular-nums">
              ₹{details.coins}
            </span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-display font-black text-base uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 fill-slate-950" />
          <span>TRY ESCAPING AGAIN</span>
          <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-950/20 text-xs font-mono">SPACE</span>
        </button>
      </div>
    </div>
  );
};
