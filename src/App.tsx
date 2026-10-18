/**
 * Jan Tar Runner: The Protest Escape
 * Main Game Shell & Viewport Mount
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, GameStats, GameOverDetails, GameZone } from './game/GameEngine';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { MobileControls } from './components/MobileControls';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover'>('title');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    coins: 0,
    multiplier: 1,
    policeDistance: 11.0,
    zone: 'Jantar Mantar',
    speed: 19,
    activePowerups: [],
  });
  const [gameOverDetails, setGameOverDetails] = useState<GameOverDetails | null>(null);
  const [bestScore, setBestScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('jantar_runner_highscore') || '0', 10);
  });
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [bannerZone, setBannerZone] = useState<GameZone | null>(null);

  // Initialize GameEngine once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(canvasMountRef.current);
    engineRef.current = engine;

    engine.onStatsUpdate = (newStats) => {
      setStats({ ...newStats });
    };

    engine.onGameOverCallback = (details) => {
      setGameOverDetails(details);
      setGameState('gameover');
      if (details.isNewHigh) {
        setBestScore(details.score);
      }
    };

    engine.onZoneChange = (zone) => {
      setBannerZone(zone);
      setTimeout(() => {
        setBannerZone(null);
      }, 3200);
    };

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.startGame();
    setGameState('playing');
    setGameOverDetails(null);
  };

  const handlePause = () => {
    if (!engineRef.current) return;
    const paused = engineRef.current.togglePause();
    setGameState(paused ? 'paused' : 'playing');
  };

  const handleResume = () => {
    if (!engineRef.current) return;
    engineRef.current.togglePause();
    setGameState('playing');
  };

  const handleRestart = () => {
    if (!engineRef.current) return;
    engineRef.current.startGame();
    setGameState('playing');
    setGameOverDetails(null);
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Container (Isolated mount, never re-rendered by React) */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Title Screen View */}
      {gameState === 'title' && (
        <TitleScreen onStart={handleStartGame} bestScore={bestScore} />
      )}

      {/* In-Game Active HUD */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <HUD
            stats={stats}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
            onPause={handlePause}
            bannerZone={bannerZone}
          />

          {/* On-Screen Mobile Controls for Touch Screens */}
          <MobileControls
            onLeft={() => engineRef.current?.moveLeft()}
            onRight={() => engineRef.current?.moveRight()}
            onJump={() => engineRef.current?.jump()}
            onSlide={() => engineRef.current?.slide()}
          />
        </>
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && gameOverDetails && (
        <GameOverModal details={gameOverDetails} onRestart={handleRestart} />
      )}
    </div>
  );
}
