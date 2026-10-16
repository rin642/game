"use client";

import React from "react";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { soundManager } from "@/lib/audio";

interface TouchControlsProps {
  onControlChange: (controls: {
    left: boolean;
    right: boolean;
    jump: boolean;
  }) => void;
  activeControls: {
    left: boolean;
    right: boolean;
    jump: boolean;
  };
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onControlChange,
  activeControls,
}) => {
  const setKey = (key: "left" | "right" | "jump", active: boolean) => {
    if (key === "jump" && active && !activeControls.jump) {
      soundManager?.playJump();
    }
    onControlChange({
      ...activeControls,
      [key]: active,
    });
  };

  return (
    <div className="absolute bottom-3 left-0 right-0 px-4 sm:px-8 flex justify-between items-end pointer-events-none select-none z-20">
      {/* 左右移動ボタン */}
      <div className="flex gap-2.5 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            setKey("left", true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setKey("left", false);
          }}
          onTouchCancel={() => setKey("left", false)}
          onMouseDown={() => setKey("left", true)}
          onMouseUp={() => setKey("left", false)}
          onMouseLeave={() => setKey("left", false)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-pink-600 border border-pink-200 transition-transform active:scale-90 ${
            activeControls.left
              ? "bg-pink-300 scale-95 shadow-inner"
              : "bg-white/85 shadow-sm"
          }`}
          aria-label="左へ"
        >
          <ArrowLeft className="w-7 h-7 stroke-[2.2]" />
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            setKey("right", true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setKey("right", false);
          }}
          onTouchCancel={() => setKey("right", false)}
          onMouseDown={() => setKey("right", true)}
          onMouseUp={() => setKey("right", false)}
          onMouseLeave={() => setKey("right", false)}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-pink-600 border border-pink-200 transition-transform active:scale-90 ${
            activeControls.right
              ? "bg-pink-300 scale-95 shadow-inner"
              : "bg-white/85 shadow-sm"
          }`}
          aria-label="右へ"
        >
          <ArrowRight className="w-7 h-7 stroke-[2.2]" />
        </button>
      </div>

      {/* ジャンプボタン */}
      <div className="pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            setKey("jump", true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setKey("jump", false);
          }}
          onTouchCancel={() => setKey("jump", false)}
          onMouseDown={() => setKey("jump", true)}
          onMouseUp={() => setKey("jump", false)}
          onMouseLeave={() => setKey("jump", false)}
          className={`w-15 h-15 sm:w-17 sm:h-17 rounded-full flex flex-col items-center justify-center text-amber-600 border border-amber-200 transition-transform active:scale-90 ${
            activeControls.jump
              ? "bg-amber-200 scale-95 shadow-inner"
              : "bg-white/90 shadow-sm"
          }`}
          aria-label="ジャンプ"
        >
          <ArrowUp className="w-6 h-6 stroke-[2.5]" />
          <span className="text-[10px] font-bold tracking-wider text-amber-700">JUMP</span>
        </button>
      </div>
    </div>
  );
};
