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
  fire: boolean;
}

export interface BulletState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  lifetime: number;
  ownerId: string;
  damage: number;
  bounces: number;
  maxBounces: number;
  alive: boolean;
}

export interface RicochetEvent {
  x: number;
  y: number;
  normalX: number;
  normalY: number;
  bulletId: string;
  bounces: number;
}

export type RoundState = 'ready' | 'fighting' | 'round_over' | 'match_over';

export interface MatchScore {
  playerScore: number;
  opponentScore: number;
  currentRound: number;
  roundsToWin: number;
  state: RoundState;
  stateTimer: number;
  roundWinner: string | null;
  matchWinner: string | null;
}
