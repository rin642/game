export type ItemType = 'star' | 'heart' | 'candy' | 'rainbow';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  walkCycle: number;
  squishY: number; // 着地やジャンプ時のぽよん伸縮
  invincibleTimer: number;
  isBlinking: boolean;
}

export interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: ItemType;
  speed: number;
  size: number;
  points: number;
  rotation: number;
  rotSpeed: number;
  wobbleOffset: number;
  wobbleSpeed: number;
}

export interface FallingObstacle {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  wobbleOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'star' | 'heart';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

export interface SimpleCloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}
