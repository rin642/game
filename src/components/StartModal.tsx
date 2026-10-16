"use client";

import React from "react";
import { Sparkles, HelpCircle, Trophy } from "lucide-react";
import { soundManager } from "@/lib/audio";

interface StartModalProps {
  highScore: number;
  soundEnabled: boolean;
  onStart: () => void;
  onOpenHowToPlay: () => void;
  onToggleSound: () => void;
}

export const StartModal: React.FC<StartModalProps> = ({
  highScore,
  onStart,
  onOpenHowToPlay,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-sky-100/40 backdrop-blur-xs">
      <div className="relative max-w-xs sm:max-w-sm w-full bg-white/95 rounded-3xl p-6 shadow-xl border-2 border-pink-100 text-center flex flex-col items-center">
        {/* かわいいモチモチうさちゃんのイラスト */}
        <div className="w-20 h-20 mb-3 flex items-center justify-center bg-pink-50 rounded-full border border-pink-100">
          <svg viewBox="0 0 100 100" className="w-16 h-16" aria-label="うさちゃん">
            {/* 耳 */}
            <ellipse cx="38" cy="26" rx="6.5" ry="16" fill="#FFFFFF" stroke="#FBCFE8" strokeWidth="2" transform="rotate(-6 38 26)" />
            <ellipse cx="38" cy="27" rx="3.5" ry="10" fill="#F472B6" transform="rotate(-6 38 27)" />
            <ellipse cx="62" cy="26" rx="6.5" ry="16" fill="#FFFFFF" stroke="#FBCFE8" strokeWidth="2" transform="rotate(6 62 26)" />
            <ellipse cx="62" cy="27" rx="3.5" ry="10" fill="#F472B6" transform="rotate(6 62 27)" />
            {/* かお */}
            <circle cx="50" cy="58" r="26" fill="#FFFFFF" stroke="#FBCFE8" strokeWidth="2" />
            {/* ほっぺ */}
            <circle cx="34" cy="62" r="5" fill="#F472B6" opacity="0.5" />
            <circle cx="66" cy="62" r="5" fill="#F472B6" opacity="0.5" />
            {/* つぶらな目 */}
            <circle cx="42" cy="55" r="3.2" fill="#374151" />
            <circle cx="58" cy="55" r="3.2" fill="#374151" />
            <circle cx="40.5" cy="53.5" r="1.2" fill="#FFFFFF" />
            <circle cx="56.5" cy="53.5" r="1.2" fill="#FFFFFF" />
            {/* おくち */}
            <path d="M47 62 Q50 65 53 62" stroke="#F472B6" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* タイトル */}
        <h1 className="text-2xl sm:text-3xl font-black text-pink-500 mb-1 tracking-tight">
          ドリームキャッチ ✨
        </h1>
        <p className="text-xs text-gray-400 font-bold mb-4">
          お星さまとハートをあつめよう
        </p>

        {/* ハイスコア */}
        {highScore > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>ベスト: {highScore.toLocaleString()} 点</span>
          </div>
        )}

        {/* スタートボタン */}
        <button
          type="button"
          onClick={() => {
            soundManager?.playClick();
            onStart();
          }}
          className="w-full py-3.5 px-6 rounded-full bg-pink-400 hover:bg-pink-500 text-white font-bold text-base shadow-md shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mb-2.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>スタート！</span>
        </button>

        {/* あそびかたボタン */}
        <button
          type="button"
          onClick={() => {
            soundManager?.playClick();
            onOpenHowToPlay();
          }}
          className="w-full py-2 px-4 rounded-full text-gray-500 hover:text-pink-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>あそびかた</span>
        </button>
      </div>
    </div>
  );
};
