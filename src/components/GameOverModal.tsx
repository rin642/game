"use client";

import React from "react";
import { RotateCcw, Home, Star, Heart } from "lucide-react";
import { soundManager } from "@/lib/audio";

interface GameOverModalProps {
  score: number;
  highScore: number;
  stats: {
    stars: number;
    hearts: number;
    candies: number;
  };
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  stats,
  onRetry,
  onHome,
}) => {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-gray-900/25 backdrop-blur-xs">
      <div className="relative max-w-xs sm:max-w-sm w-full bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-pink-100 text-center flex flex-col items-center">
        {/* アイコン */}
        <div className="text-3xl mb-1">{isNewHighScore ? "👑" : "💤"}</div>

        <h2 className="text-xl font-bold text-gray-700 mb-1">
          {isNewHighScore ? "ハイスコア！" : "おつかれさま！"}
        </h2>

        {/* スコア */}
        <div className="my-3 py-2 px-6 bg-pink-50 rounded-2xl border border-pink-100 flex flex-col items-center">
          <span className="text-[11px] font-bold text-pink-400">SCORE</span>
          <span className="text-3xl font-black text-pink-500 font-sans">
            {score.toLocaleString()}
          </span>
        </div>

        {/* アイテム集計 */}
        <div className="flex gap-4 text-xs font-bold text-gray-500 mb-5">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{stats.stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>{stats.hearts}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🍬</span>
            <span>{stats.candies}</span>
          </div>
        </div>

        {/* リトライ */}
        <button
          type="button"
          onClick={() => {
            soundManager?.playClick();
            onRetry();
          }}
          className="w-full py-3 px-6 rounded-full bg-pink-400 hover:bg-pink-500 text-white font-bold text-sm shadow-md shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mb-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>もう一度あそぶ</span>
        </button>

        {/* タイトルへ */}
        <button
          type="button"
          onClick={() => {
            soundManager?.playClick();
            onHome();
          }}
          className="w-full py-2 px-4 rounded-full text-gray-400 hover:text-gray-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>タイトルへもどる</span>
        </button>
      </div>
    </div>
  );
};
