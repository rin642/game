"use client";

import React from "react";
import { Heart, Star, Volume2, VolumeX, Pause, Play, Clock } from "lucide-react";
import { soundManager } from "@/lib/audio";

interface GameHeaderProps {
  score: number;
  timeLeft: number;
  lives: number;
  maxLives: number;
  soundEnabled: boolean;
  isPaused: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  timeLeft,
  lives,
  maxLives,
  soundEnabled,
  isPaused,
  onToggleSound,
  onTogglePause,
}) => {
  const isTimeLow = timeLeft <= 10;

  return (
    <div className="absolute top-3 left-0 right-0 px-3 sm:px-6 flex justify-between items-center pointer-events-none select-none z-20">
      {/* スコア表示（シンプルでかわいいバッジ） */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-xs px-3 sm:px-3.5 py-1.5 rounded-full shadow-sm border border-pink-200">
        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
        <span className="text-base sm:text-xl font-bold text-gray-700 tracking-wide font-sans">
          {score.toLocaleString()}
        </span>
      </div>

      {/* 残り時間表示（中央） */}
      <div
        className={`pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full shadow-sm border transition-all ${
          isTimeLow
            ? "bg-rose-50/95 border-rose-300 text-rose-500 scale-105 animate-pulse"
            : "bg-white/90 border-sky-200 text-sky-600"
        }`}
      >
        <Clock className={`w-4 h-4 ${isTimeLow ? "text-rose-500 animate-spin-slow" : "text-sky-500"}`} />
        <span className="text-base sm:text-lg font-black font-sans tracking-tight">
          {Math.ceil(timeLeft)}s
        </span>
      </div>

      {/* ライフ ＆ ボタン */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5">
        {/* ハート */}
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2.5 sm:px-3 py-1.5 rounded-full shadow-sm border border-pink-200">
          {Array.from({ length: maxLives }).map((_, idx) => (
            <Heart
              key={idx}
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                idx < lives
                  ? "text-rose-400 fill-rose-400 scale-100"
                  : "text-gray-200 fill-gray-200 scale-90"
              }`}
            />
          ))}
        </div>

        {/* 音声切替 */}
        <button
          type="button"
          onClick={() => {
            soundManager?.playClick();
            onToggleSound();
          }}
          className="w-8 h-8 rounded-full bg-white/90 text-gray-500 hover:text-pink-500 border border-pink-200 flex items-center justify-center shadow-xs active:scale-95 transition-all"
          aria-label={soundEnabled ? "音を消す" : "音を鳴らす"}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* 一時停止 */}
        <button
          type="button"
          onClick={() => {
            soundManager?.playClick();
            onTogglePause();
          }}
          className="w-8 h-8 rounded-full bg-white/90 text-pink-500 border border-pink-200 flex items-center justify-center shadow-xs active:scale-95 transition-all"
          aria-label={isPaused ? "再開" : "一時停止"}
        >
          {isPaused ? <Play className="w-4 h-4 fill-pink-500" /> : <Pause className="w-4 h-4 fill-pink-500" />}
        </button>
      </div>
    </div>
  );
};
