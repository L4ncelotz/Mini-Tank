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
  dash: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'spark' | 'smoke' | 'trail' | 'debris';
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

export interface Wall {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface SpawnPoint {
  x: number;
  y: number;
  rotation: number;
}

export type MapId = 'open_arena' | 'crossfire' | 'corridor';

export interface MapData {
  id: MapId;
  name: string;
  description: string;
  bounds: ArenaBounds;
  walls: Wall[];
  spawns: {
    player: SpawnPoint;
    opponent: SpawnPoint;
  };
}
