export const ARENA_CONFIG = {
  width: 960,
  height: 600,
  borderColor: '#38bdf8',
  backgroundColor: '#0f172a',
  gridColor: '#1e293b',
  gridSize: 40,
  wallThickness: 8,
} as const;

export const PLAYER_CONFIG = {
  forwardSpeed: 220,
  reverseSpeed: 130,
  rotationSpeed: 3.2,
  acceleration: 800,
  deceleration: 1000,
  radius: 16,
  width: 34,
  length: 38,
  barrelLength: 22,
  barrelWidth: 6,
  turretRadius: 9,
  bodyColor: '#0284c7',
  accentColor: '#38bdf8',
  treadColor: '#0c4a6e',
} as const;

export const LOOP_CONFIG = {
  fixedTimestep: 1 / 60,
  maxAccumulatedTime: 0.1,
} as const;

export const BULLET_CONFIG = {
  speed: 420,
  cooldown: 1.0,
  lifetime: 3.0,
  radius: 4,
  damage: 1,
  color: '#38bdf8',
} as const;
