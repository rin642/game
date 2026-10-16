"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { soundManager } from "@/lib/audio";
import {
  Player,
  FallingItem,
  FallingObstacle,
  Particle,
  FloatingText,
  SimpleCloud,
  ItemType,
} from "@/types/game";

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused: boolean;
  onGameOver: (stats: {
    score: number;
    stars: number;
    hearts: number;
    candies: number;
    reason: "timeup" | "lives";
  }) => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onTimeUpdate: (timeLeft: number) => void;
  activeControls: {
    left: boolean;
    right: boolean;
    jump: boolean;
  };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  isPaused,
  onGameOver,
  onScoreUpdate,
  onLivesUpdate,
  onTimeUpdate,
  activeControls,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    maxLives: 3,
    timeLeft: 60,
    lastTickSecond: 60,
    starsCount: 0,
    heartsCount: 0,
    candiesCount: 0,
    nextItemSpawn: 30,
    nextObstacleSpawn: 90,
    idCounter: 0,
    floorY: 0,
  });

  const playerRef = useRef<Player>({
    x: 200,
    y: 0,
    vx: 0,
    vy: 0,
    width: 44,
    height: 48,
    isGrounded: true,
    facing: "right",
    walkCycle: 0,
    squishY: 1,
    invincibleTimer: 0,
    isBlinking: false,
  });

  const itemsRef = useRef<FallingItem[]>([]);
  const obstaclesRef = useRef<FallingObstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const cloudsRef = useRef<SimpleCloud[]>([]);

  // パーティクル生成（やさしく舞う星屑）
  const spawnCollectParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7 + (Math.random() - 0.5);
      const speed = Math.random() * 2.5 + 1.2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: Math.random() * 5 + 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 22,
        shape: Math.random() > 0.5 ? "circle" : "star",
      });
    }
  }, []);

  // スコアポップアップ
  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    gameStateRef.current.idCounter++;
    floatingTextsRef.current.push({
      id: gameStateRef.current.idCounter,
      x,
      y,
      text,
      color,
      alpha: 1,
    });
  }, []);

  // 背景の雲を初期化（シンプルに2〜3個）
  const initClouds = useCallback((width: number, height: number) => {
    cloudsRef.current = [
      { x: width * 0.15, y: height * 0.22, size: 70, speed: 0.25, opacity: 0.8 },
      { x: width * 0.65, y: height * 0.35, size: 90, speed: 0.35, opacity: 0.7 },
      { x: width * 0.9, y: height * 0.18, size: 60, speed: 0.2, opacity: 0.65 },
    ];
  }, []);

  // リセット
  const resetGame = useCallback(() => {
    gameStateRef.current = {
      score: 0,
      lives: 3,
      maxLives: 3,
      timeLeft: 60,
      lastTickSecond: 60,
      starsCount: 0,
      heartsCount: 0,
      candiesCount: 0,
      nextItemSpawn: 30,
      nextObstacleSpawn: 90,
      idCounter: 0,
      floorY: 0,
    };

    playerRef.current = {
      x: 200,
      y: 0,
      vx: 0,
      vy: 0,
      width: 44,
      height: 48,
      isGrounded: true,
      facing: "right",
      walkCycle: 0,
      squishY: 1,
      invincibleTimer: 0,
      isBlinking: false,
    };

    itemsRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    onScoreUpdate(0);
    onLivesUpdate(3);
    onTimeUpdate(60);
  }, [onScoreUpdate, onLivesUpdate, onTimeUpdate]);

  // リサイズ処理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      initClouds(rect.width, rect.height);
      gameStateRef.current.floorY = rect.height - 50;
      if (playerRef.current.y === 0) {
        playerRef.current.y = gameStateRef.current.floorY;
        playerRef.current.x = rect.width / 2;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initClouds]);

  useEffect(() => {
    if (isPlaying) {
      resetGame();
    }
  }, [isPlaying, resetGame]);

  // メインゲームループ
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const keys = { left: false, right: false, jump: false };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        if (!keys.jump && playerRef.current.isGrounded && isPlaying && !isPaused) {
          playerRef.current.vy = -12.5; // 自然で気持ちいいジャンプの初速
          playerRef.current.isGrounded = false;
          playerRef.current.squishY = 1.25; // 縦に伸びる
          soundManager?.playJump();
        }
        keys.jump = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        keys.jump = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // 単純でかわいい雲の描画
    const drawSimpleCloud = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      opacity: number
    ) => {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
      ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.38, 0, Math.PI * 2);
      ctx.arc(x + size * 0.65, y, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // シンプルで愛らしいうさちゃんの描画
    const drawBunny = (ctx: CanvasRenderingContext2D, p: Player) => {
      ctx.save();
      ctx.translate(p.x, p.y);

      // 無敵時の点滅
      if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer * 12) % 2 === 0) {
        ctx.globalAlpha = 0.45;
      }

      // 向き反転
      if (p.facing === "left") {
        ctx.scale(-1, 1);
      }

      // ぽよん伸縮（ジャンプや着地）
      ctx.scale(2 - p.squishY, p.squishY);

      // てくてく歩きのアニメーション（地面にいる時）
      let walkTilt = 0;
      let walkBounce = 0;
      if (p.isGrounded && Math.abs(p.vx) > 0.1) {
        walkTilt = Math.sin(p.walkCycle) * 0.08;
        walkBounce = Math.abs(Math.sin(p.walkCycle)) * -3;
      }
      ctx.translate(0, walkBounce);
      ctx.rotate(walkTilt);

      // 影
      ctx.fillStyle = "rgba(220, 205, 215, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, 2, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 耳（左耳・右耳）
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#FBCFE8";
      ctx.lineWidth = 1.5;

      // 左耳
      ctx.beginPath();
      ctx.ellipse(-8, -32, 5.5, 12, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 左耳の内側ピンク
      ctx.fillStyle = "#F472B6";
      ctx.beginPath();
      ctx.ellipse(-8, -31, 3, 7.5, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // 右耳
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(8, -32, 5.5, 12, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 右耳の内側ピンク
      ctx.fillStyle = "#F472B6";
      ctx.beginPath();
      ctx.ellipse(8, -31, 3, 7.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // まるっこい体・あたま（一体型のモチモチシルエット）
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, -14, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // ほっぺ（やさしいピンク）
      ctx.fillStyle = "rgba(244, 114, 182, 0.55)";
      ctx.beginPath();
      ctx.arc(-10, -11, 4, 0, Math.PI * 2);
      ctx.arc(10, -11, 4, 0, Math.PI * 2);
      ctx.fill();

      // おめめ（つぶらな黒丸）
      ctx.fillStyle = "#374151";
      if (p.invincibleTimer > 1.2) {
        // 当たった直後のぴえん目 (> <)
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-9, -17);
        ctx.lineTo(-6, -15);
        ctx.lineTo(-9, -13);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(9, -17);
        ctx.lineTo(6, -15);
        ctx.lineTo(9, -13);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(-6, -15, 2.5, 0, Math.PI * 2);
        ctx.arc(6, -15, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 瞳のちいさな白いハイライト
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(-7, -16, 1, 0, Math.PI * 2);
        ctx.arc(5, -16, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // お口（小さなかわいいω）
      ctx.strokeStyle = "#F472B6";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(-1.5, -10, 1.8, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(1.5, -10, 1.8, 0, Math.PI);
      ctx.stroke();

      // まるいしっぽ
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-16, -8, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    // 星の描画
    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#FBBF24";
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const ox = Math.cos(outerAngle) * r;
        const oy = Math.sin(outerAngle) * r;
        const ix = Math.cos(innerAngle) * (r * 0.48);
        const iy = Math.sin(innerAngle) * (r * 0.48);
        if (i === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    // ハートの描画
    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
      ctx.save();
      ctx.translate(x, y - s * 0.3);
      ctx.fillStyle = "#FB7185";
      ctx.strokeStyle = "#F43F5E";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      const topCurve = s * 0.35;
      ctx.moveTo(0, topCurve);
      ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, topCurve);
      ctx.bezierCurveTo(-s / 2, (s + topCurve) / 2, 0, (s + topCurve) / 2 + s * 0.2, 0, s);
      ctx.bezierCurveTo(0, (s + topCurve) / 2 + s * 0.2, s / 2, (s + topCurve) / 2, s / 2, topCurve);
      ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, topCurve);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    // キャンディの描画
    const drawCandy = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      ctx.save();
      ctx.translate(x, y);

      // ひだ
      ctx.fillStyle = "#C084FC";
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, 0);
      ctx.lineTo(-r * 1.1, -r * 0.45);
      ctx.lineTo(-r * 1.1, r * 0.45);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(r * 0.6, 0);
      ctx.lineTo(r * 1.1, -r * 0.45);
      ctx.lineTo(r * 1.1, r * 0.45);
      ctx.closePath();
      ctx.fill();

      // まるいキャンディ
      ctx.fillStyle = "#F472B6";
      ctx.strokeStyle = "#EC4899";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 模様
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 障害物（ちいさな雷雲）の描画
    const drawObstacle = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
      ctx.save();
      ctx.translate(x, y);

      // ぷにっとした暗めパープルの雲
      ctx.fillStyle = "#6B7280";
      ctx.beginPath();
      ctx.arc(-s * 0.3, 0, s * 0.35, 0, Math.PI * 2);
      ctx.arc(0, -s * 0.2, s * 0.42, 0, Math.PI * 2);
      ctx.arc(s * 0.3, 0, s * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // ちいさな稲妻
      ctx.strokeStyle = "#FDE047";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.25);
      ctx.lineTo(-3, s * 0.55);
      ctx.lineTo(2, s * 0.55);
      ctx.lineTo(-1, s * 0.85);
      ctx.stroke();

      ctx.restore();
    };

    // メイン更新＆レンダリング
    const updateAndRender = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.scale(dpr, dpr);

      const floorY = height - 40;
      gameStateRef.current.floorY = floorY;
      const p = playerRef.current;
      const gs = gameStateRef.current;

      // 1. シンプルで綺麗なパステル背景
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#E0F2FE"); // やさしい空色
      bgGrad.addColorStop(0.7, "#FCE7F3"); // スイートピンク
      bgGrad.addColorStop(1, "#FEF3C7"); // 下部はあたたかいクリーム
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. ぽわぽわ浮かぶ雲
      cloudsRef.current.forEach((c) => {
        drawSimpleCloud(ctx, c.x, c.y, c.size, c.opacity);
        if (isPlaying && !isPaused) {
          c.x -= c.speed;
          if (c.x < -c.size) c.x = width + c.size;
        }
      });

      // 3. 地面（やさしいパステルピンクの床）
      ctx.fillStyle = "#FBCFE8";
      ctx.fillRect(0, floorY, width, height - floorY);
      ctx.strokeStyle = "#F472B6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, floorY);
      ctx.lineTo(width, floorY);
      ctx.stroke();

      // ゲームプレイ中の更新処理
      if (isPlaying && !isPaused) {
        // --- 時間制限カウントダウン ---
        gs.timeLeft -= 1 / 60;
        const currentSec = Math.ceil(gs.timeLeft);

        // 残り5秒以下の秒針音
        if (gs.timeLeft <= 5 && gs.timeLeft > 0 && currentSec !== gs.lastTickSecond) {
          soundManager?.playTick();
          gs.lastTickSecond = currentSec;
        }

        onTimeUpdate(Math.max(0, gs.timeLeft));

        // タイムアップ判定
        if (gs.timeLeft <= 0) {
          soundManager?.playTimeUp();
          onGameOver({
            score: gs.score,
            stars: gs.starsCount,
            hearts: gs.heartsCount,
            candies: gs.candiesCount,
            reason: "timeup",
          });
          return;
        }

        // 操作判定
        const ctrlLeft = keys.left || activeControls.left;
        const ctrlRight = keys.right || activeControls.right;

        // 左右移動：キビキビして素直
        const moveSpeed = 6.2;
        if (ctrlLeft && !ctrlRight) {
          p.vx = -moveSpeed;
          p.facing = "left";
          p.walkCycle += 0.28;
        } else if (ctrlRight && !ctrlLeft) {
          p.vx = moveSpeed;
          p.facing = "right";
          p.walkCycle += 0.28;
        } else {
          p.vx = 0;
        }

        // スマホ用ジャンプボタン判定
        if (activeControls.jump && p.isGrounded) {
          p.vy = -12.5;
          p.isGrounded = false;
          p.squishY = 1.25;
          soundManager?.playJump();
        }

        // 重力適用
        if (!p.isGrounded) {
          p.vy += 0.62;
          p.squishY += (1 - p.squishY) * 0.12;
        } else {
          p.squishY += (1 - p.squishY) * 0.2;
        }

        // 位置の更新
        p.x += p.vx;
        p.y += p.vy;

        // 地面接地判定
        if (p.y >= floorY) {
          if (!p.isGrounded) {
            p.squishY = 0.8;
          }
          p.y = floorY;
          p.vy = 0;
          p.isGrounded = true;
        }

        // 左右の壁
        if (p.x < 24) p.x = 24;
        if (p.x > width - 24) p.x = width - 24;

        // 無敵時間タイマー
        if (p.invincibleTimer > 0) {
          p.invincibleTimer -= 1 / 60;
        }

        // --- アイテムの落下生成 ---
        gs.nextItemSpawn--;
        if (gs.nextItemSpawn <= 0) {
          gs.nextItemSpawn = Math.floor(Math.random() * 25 + 35);
          gs.idCounter++;

          const rand = Math.random();
          let itemType: ItemType = "star";
          let points = 100;
          if (rand < 0.25) {
            itemType = "heart";
            points = 200;
          } else if (rand < 0.55) {
            itemType = "candy";
            points = 150;
          }

          itemsRef.current.push({
            id: gs.idCounter,
            x: Math.random() * (width - 60) + 30,
            y: -20,
            type: itemType,
            speed: Math.random() * 1.4 + 2.2,
            size: 15,
            points,
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            wobbleOffset: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.03 + 0.02,
          });
        }

        // --- 障害物（雨雲）の落下生成 ---
        gs.nextObstacleSpawn--;
        if (gs.nextObstacleSpawn <= 0) {
          gs.nextObstacleSpawn = Math.floor(Math.random() * 60 + 80);
          gs.idCounter++;

          obstaclesRef.current.push({
            id: gs.idCounter,
            x: Math.random() * (width - 60) + 30,
            y: -25,
            speed: Math.random() * 1.2 + 2.4,
            size: 26,
            rotation: 0,
            rotSpeed: 0,
            wobbleOffset: Math.random() * Math.PI * 2,
          });
        }

        // --- アイテム更新 & キャッチ判定 ---
        for (let i = itemsRef.current.length - 1; i >= 0; i--) {
          const item = itemsRef.current[i];
          item.y += item.speed;
          item.wobbleOffset += item.wobbleSpeed;
          item.x += Math.sin(item.wobbleOffset) * 0.6;

          const dx = item.x - p.x;
          const dy = item.y - (p.y - 18);
          const dist = Math.hypot(dx, dy);

          if (dist < 32) {
            gs.score += item.points;
            onScoreUpdate(gs.score);

            if (item.type === "star") {
              soundManager?.playStar();
              gs.starsCount++;
              spawnCollectParticles(item.x, item.y, "#FBBF24");
              spawnFloatingText(item.x, item.y - 10, `+${item.points}`, "#F59E0B");
            } else if (item.type === "heart") {
              soundManager?.playHeart();
              gs.heartsCount++;
              if (gs.lives < gs.maxLives) {
                gs.lives++;
                onLivesUpdate(gs.lives);
              }
              spawnCollectParticles(item.x, item.y, "#FB7185");
              spawnFloatingText(item.x, item.y - 10, "LIFE +1", "#F43F5E");
            } else {
              soundManager?.playCandy();
              gs.candiesCount++;
              spawnCollectParticles(item.x, item.y, "#C084FC");
              spawnFloatingText(item.x, item.y - 10, `+${item.points}`, "#9333EA");
            }

            itemsRef.current.splice(i, 1);
            continue;
          }

          if (item.y > floorY + 20) {
            itemsRef.current.splice(i, 1);
          }
        }

        // --- 障害物更新 & 当たり判定 ---
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const ob = obstaclesRef.current[i];
          ob.y += ob.speed;

          const dx = ob.x - p.x;
          const dy = ob.y - (p.y - 18);
          const dist = Math.hypot(dx, dy);

          if (dist < 30) {
            if (p.invincibleTimer <= 0) {
              soundManager?.playHit();
              gs.lives--;
              onLivesUpdate(gs.lives);
              p.invincibleTimer = 1.6;
              spawnFloatingText(p.x, p.y - 35, "いたい！", "#EF4444");

              if (gs.lives <= 0) {
                onGameOver({
                  score: gs.score,
                  stars: gs.starsCount,
                  hearts: gs.heartsCount,
                  candies: gs.candiesCount,
                  reason: "lives",
                });
                return;
              }
            }
            obstaclesRef.current.splice(i, 1);
            continue;
          }

          if (ob.y > floorY + 20) {
            obstaclesRef.current.splice(i, 1);
          }
        }

        // --- パーティクル更新 ---
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const pt = particlesRef.current[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life++;
          pt.alpha = 1 - pt.life / pt.maxLife;
          if (pt.life >= pt.maxLife) {
            particlesRef.current.splice(i, 1);
          }
        }

        // --- フローティングテキスト更新 ---
        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.y -= 1.2;
          ft.alpha -= 0.03;
          if (ft.alpha <= 0) {
            floatingTextsRef.current.splice(i, 1);
          }
        }
      }

      // --- 描画 ---
      itemsRef.current.forEach((it) => {
        if (it.type === "star") drawStar(ctx, it.x, it.y, it.size);
        else if (it.type === "heart") drawHeart(ctx, it.x, it.y, it.size);
        else drawCandy(ctx, it.x, it.y, it.size);
      });

      obstaclesRef.current.forEach((ob) => {
        drawObstacle(ctx, ob.x, ob.y, ob.size);
      });

      drawBunny(ctx, p);

      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = "bold 16px 'Fredoka', 'Zen Maru Gothic', sans-serif";
        ctx.fillStyle = ft.color;
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(updateAndRender);
    };

    animationFrameId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    isPlaying,
    isPaused,
    activeControls,
    onGameOver,
    onScoreUpdate,
    onLivesUpdate,
    onTimeUpdate,
    spawnCollectParticles,
    spawnFloatingText,
  ]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden touch-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
