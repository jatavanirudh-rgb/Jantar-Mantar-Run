/**
 * Mobile Touch & Gesture Controls for Jan Tar Runner
 * Supports touch swipes anywhere on the viewport plus ergonomic low-opacity corner buttons.
 */

import React, { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
}) => {
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartPos.current || e.changedTouches.length === 0) return;

      const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      const SWIPE_THRESHOLD = 30; // minimum pixels for a swipe

      if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
        if (absX > absY) {
          // Horizontal Swipe
          if (deltaX < 0) {
            onLeft();
          } else {
            onRight();
          }
        } else {
          // Vertical Swipe
          if (deltaY < 0) {
            onJump();
          } else {
            onSlide();
          }
        }
      }

      touchStartPos.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onLeft, onRight, onJump, onSlide]);

  return (
    <div className="absolute inset-x-0 bottom-3 px-4 flex justify-between items-end pointer-events-none z-10 sm:hidden">
      {/* Left/Right Directional Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLeft();
          }}
          className="pointer-events-auto w-13 h-13 rounded-2xl bg-slate-900/60 active:bg-amber-500/80 border border-slate-700/60 flex items-center justify-center text-white active:text-slate-950 transition-colors shadow-lg active:scale-95"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRight();
          }}
          className="pointer-events-auto w-13 h-13 rounded-2xl bg-slate-900/60 active:bg-amber-500/80 border border-slate-700/60 flex items-center justify-center text-white active:text-slate-950 transition-colors shadow-lg active:scale-95"
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Jump & Slide Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJump();
          }}
          className="pointer-events-auto w-13 h-13 rounded-2xl bg-slate-900/60 active:bg-sky-500/80 border border-slate-700/60 flex items-center justify-center text-white active:text-slate-950 transition-colors shadow-lg active:scale-95"
          aria-label="Jump"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSlide();
          }}
          className="pointer-events-auto w-13 h-13 rounded-2xl bg-slate-900/60 active:bg-emerald-500/80 border border-slate-700/60 flex items-center justify-center text-white active:text-slate-950 transition-colors shadow-lg active:scale-95"
          aria-label="Slide"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
