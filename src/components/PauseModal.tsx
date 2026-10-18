/**
 * Pause Modal for Jan Tar Runner
 */

import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleSound,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-30 pointer-events-auto">
      <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
        <h3 className="text-xl font-display font-black text-white tracking-wider uppercase mb-1">
          CHASE PAUSED
        </h3>
        <p className="text-xs text-slate-400 mb-6">Take a breather before resuming the escape.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-display font-bold uppercase text-sm tracking-wider hover:opacity-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME RUN (ESC)</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            onClick={onToggleSound}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
