export interface Vector2D {
  x: number;
  y: number;
}

export interface ArenaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TankControls {
  forward: number; // 1 (forward), -1 (reverse), 0 (neutral)
  rotate: number;  // 1 (clockwise/right), -1 (counter-clockwise/left), 0 (neutral)
}
