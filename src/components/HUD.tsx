/**
 * World-Matched Low-Occlusion In-Game HUD
 * Compliant with Game Craft directives: perimeter clusters, tabular-nums, police chase proximity gauge.
 */

import React from 'react';
import { Volume2, VolumeX, Pause, Shield, Zap, Magnet, Footprints, AlertTriangle } from 'lucide-react';
import { GameStats, GameZone } from '../game/GameEngine';

interface HUDProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  bannerZone: GameZone | null;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isMuted,
  onToggleSound,
  onPause,
  bannerZone,
}) => {
  // Police proximity calculation: policeDistance is 0m to 15m
  // 15m is safe (green), 6m-10m is caution (yellow), < 5m is dangerous (red)!
  const distClamped = Math.min(15, Math.max(0, stats.policeDistance));
  const proximityPercent = Math.max(5, Math.min(100, (distClamped / 15) * 100));
  const isEmergency = stats.policeDistance < 4.5;
  const isWarning = stats.policeDistance < 8.0 && !isEmergency;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10 select-none">
      {/* Top Cluster Bar */}
      <div className="flex justify-between items-start w-full gap-4">
        {/* Top-Left: Score, Distance & Zone Tag */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-display font-black text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {stats.score.toLocaleString()}
            </span>
            {stats.multiplier > 1 && (
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-display font-bold text-xs uppercase animate-pulse">
                {stats.multiplier}x
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/60 tabular-nums">
              <span className="text-slate-400">DIST:</span>
              <span className="text-sky-300 font-bold">{stats.distance}m</span>
            </div>

            <div className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 text-amber-300 uppercase font-bold text-[11px]">
              {stats.zone}
            </div>
          </div>
        </div>

        {/* Top-Center: Police Pursuer Proximity Gauge */}
        <div className="flex flex-col items-center max-w-[200px] sm:max-w-xs w-full">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase mb-1 drop-shadow">
            {isEmergency ? (
              <span className="flex items-center gap-1 text-red-400 animate-pulse font-display">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                POLICE ON YOUR HEELS! ({stats.policeDistance.toFixed(1)}m)
              </span>
            ) : isWarning ? (
              <span className="text-amber-400 font-display">
                POLICE CLOSING IN ({stats.policeDistance.toFixed(1)}m)
              </span>
            ) : (
              <span className="text-slate-300 font-display">
                PURSUER DISTANCE ({stats.policeDistance.toFixed(1)}m)
              </span>
            )}
          </div>

          {/* Proximity Progress Bar */}
          <div className="w-full h-2.5 bg-slate-900/90 rounded-full border border-slate-700/70 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                isEmergency
                  ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                  : isWarning
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${proximityPercent}%` }}
            />
          </div>
        </div>

        {/* Top-Right: Coins, Audio & Pause CTAs */}
        <div className="flex items-center gap-2.5">
          {/* Rupee Coins Cluster */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-display font-bold text-sm tabular-nums shadow-sm">
            <span className="text-base text-amber-400">₹</span>
            <span>{stats.coins}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="pointer-events-auto p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="pointer-events-auto p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
            title="Pause Game (Esc / P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Zone Transition Announcement Banner */}
      {bannerZone && (
        <div className="self-center flex flex-col items-center px-6 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-bounce text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            ENTERING NEW SECTOR
          </span>
          <span className="text-lg sm:text-xl font-display font-black text-white tracking-wide uppercase">
            {bannerZone}
          </span>
        </div>
      )}

      {/* Bottom Center: Active Power-up Status Bars */}
      <div className="self-center flex items-center gap-3 mb-2">
        {stats.activePowerups.map((pu) => {
          const pct = Math.max(0, Math.min(100, (pu.remainingTime / pu.duration) * 100));
          const name =
            pu.type === 'chai_boost'
              ? 'Chai Nitro Shield'
              : pu.type === 'megaphone'
              ? '2x Multiplier'
              : pu.type === 'magnet'
              ? 'Coin Magnet'
              : 'Super Jump';

          const icon =
            pu.type === 'chai_boost' ? (
              <Zap className="w-3.5 h-3.5 text-orange-400" />
            ) : pu.type === 'megaphone' ? (
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            ) : pu.type === 'magnet' ? (
              <Magnet className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
            );

          return (
            <div
              key={pu.type}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-semibold text-slate-200 shadow-md min-w-[130px]"
            >
              {icon}
              <div className="flex flex-col flex-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>{name}</span>
                  <span className="tabular-nums font-mono text-slate-400">{Math.ceil(pu.remainingTime)}s</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
