"use client";

import React from "react";
import { X, Heart, Star } from "lucide-react";
import { soundManager } from "@/lib/audio";

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gray-900/25 backdrop-blur-xs">
      <div className="relative max-w-xs sm:max-w-sm w-full bg-white/95 rounded-3xl p-5 shadow-xl border-2 border-pink-100 flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-2 border-b border-pink-100">
          <h2 className="text-base font-bold text-gray-700">あそびかた</h2>
          <button
            type="button"
            onClick={() => {
              soundManager?.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 flex items-center justify-center"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="py-3 space-y-3 text-xs text-gray-600">
          <div>
            <span className="font-bold text-pink-500 block mb-0.5">🎮 操作方法</span>
            <p>・[←][→] またはボタンで左右にてくてく移動</p>
            <p>・[スペース] または [JUMP] でぴょんとジャンプ！</p>
          </div>

          <div>
            <span className="font-bold text-pink-500 block mb-1">✨ 集めるアイテム</span>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>お星さま (+100点)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>ハート (+200点 / ライフ回復)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>🍬</span>
                <span>キャンディ (+150点)</span>
              </div>
            </div>
          </div>

          <div className="p-2 bg-pink-50/70 rounded-xl border border-pink-100 text-[11px] text-pink-700">
            ⏱️ <span className="font-bold">制限時間は60秒！</span> たまに落ちてくる暗い<span className="font-bold text-gray-700">⚡雨雲</span>をよけながら、時間内にハイスコアを目指そう！
          </div>
        </div>

        {/* とじる */}
        <button
          type="button"
          onClick={() => {
            soundManager?.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-full bg-pink-400 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
        >
          とじる
        </button>
      </div>
    </div>
  );
};
