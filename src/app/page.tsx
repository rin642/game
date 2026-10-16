"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { GameHeader } from "@/components/GameHeader";
import { TouchControls } from "@/components/TouchControls";
import { StartModal } from "@/components/StartModal";
import { GameOverModal } from "@/components/GameOverModal";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { soundManager } from "@/lib/audio";
import { Play } from "lucide-react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [lives, setLives] = useState(3);
  const maxLives = 3;
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [lastStats, setLastStats] = useState({
    stars: 0,
    hearts: 0,
    candies: 0,
  });
  const [gameOverReason, setGameOverReason] = useState<"timeup" | "lives">("timeup");

  const [activeControls, setActiveControls] = useState({
    left: false,
    right: false,
    jump: false,
  });

  // ハイスコア読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dream_catch_highscore");
      if (saved) {
        setHighScore(parseInt(saved, 10) || 0);
      }
    } catch {
      // ignore
    }
  }, []);

  // スタート
  const handleStartGame = useCallback(() => {
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    setIsPlaying(true);

    if (soundEnabled) {
      soundManager?.startBgm();
    }
  }, [soundEnabled]);

  // ゲームオーバー / タイムアップ
  const handleGameOver = useCallback(
    (stats: {
      score: number;
      stars: number;
      hearts: number;
      candies: number;
      reason: "timeup" | "lives";
    }) => {
      soundManager?.stopBgm();
      setIsPlaying(false);
      setIsGameOver(true);
      setGameOverReason(stats.reason);
      setLastStats({
        stars: stats.stars,
        hearts: stats.hearts,
        candies: stats.candies,
      });

      if (stats.score > highScore) {
        setHighScore(stats.score);
        try {
          localStorage.setItem("dream_catch_highscore", stats.score.toString());
        } catch {
          // ignore
        }
      }
    },
    [highScore]
  );

  // ポーズ切替
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        soundManager?.stopBgm();
      } else {
        if (soundEnabled && isPlaying) {
          soundManager?.startBgm();
        }
      }
      return next;
    });
  }, [soundEnabled, isPlaying]);

  // サウンド切替
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundManager?.setSoundEnabled(next);
      if (next && isPlaying && !isPaused) {
        soundManager?.startBgm();
      } else {
        soundManager?.stopBgm();
      }
      return next;
    });
  }, [isPlaying, isPaused]);

  // タイトルへ
  const handleHome = useCallback(() => {
    soundManager?.stopBgm();
    setIsPlaying(false);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center w-full min-h-screen p-3 sm:p-6 bg-pink-50/60 select-none overflow-hidden">
      {/* ゲーム画面のコンテナ */}
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[700px] bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden flex flex-col">
        {/* HUDヘッダー */}
        {isPlaying && (
          <GameHeader
            score={score}
            timeLeft={timeLeft}
            lives={lives}
            maxLives={maxLives}
            soundEnabled={soundEnabled}
            isPaused={isPaused}
            onToggleSound={handleToggleSound}
            onTogglePause={handleTogglePause}
          />
        )}

        {/* キャンバス */}
        <div className="relative w-full h-full">
          <GameCanvas
            isPlaying={isPlaying}
            isPaused={isPaused}
            onGameOver={handleGameOver}
            onScoreUpdate={setScore}
            onLivesUpdate={setLives}
            onTimeUpdate={setTimeLeft}
            activeControls={activeControls}
          />

          {/* スマホ用コントローラー */}
          {isPlaying && !isPaused && (
            <TouchControls
              onControlChange={setActiveControls}
              activeControls={activeControls}
            />
          )}

          {/* ポーズ時のオーバーレイ */}
          {isPaused && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 text-center border border-pink-100 shadow-lg flex flex-col items-center">
                <span className="text-3xl mb-1">☕</span>
                <h3 className="text-lg font-bold text-gray-700 mb-3">ひとやすみ</h3>
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="py-2.5 px-6 rounded-full bg-pink-400 hover:bg-pink-500 text-white font-bold text-sm shadow-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>再開する</span>
                </button>
              </div>
            </div>
          )}

          {/* スタート画面 */}
          {!isPlaying && !isGameOver && (
            <StartModal
              highScore={highScore}
              soundEnabled={soundEnabled}
              onStart={handleStartGame}
              onOpenHowToPlay={() => setShowHowToPlay(true)}
              onToggleSound={handleToggleSound}
            />
          )}

          {/* ゲームオーバー画面 */}
          {isGameOver && (
            <GameOverModal
              score={score}
              highScore={highScore}
              reason={gameOverReason}
              stats={lastStats}
              onRetry={handleStartGame}
              onHome={handleHome}
            />
          )}

          {/* あそびかた画面 */}
          {showHowToPlay && (
            <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
          )}
        </div>
      </div>
    </main>
  );
}
