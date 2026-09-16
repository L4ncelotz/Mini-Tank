export const ARENA_CONFIG = {
  width: 1440,
  height: 900,
  borderColor: '#38bdf8',
  backgroundColor: '#0f172a',
  gridColor: '#1e293b',
  gridSize: 48,
  wallThickness: 10,
} as const;

export const PLAYER_CONFIG = {
  forwardSpeed: 160,
  reverseSpeed: 100,
  rotationSpeed: 2.5,
  acceleration: 600,
  deceleration: 800,
  radius: 16,
  width: 34,
  length: 38,
  barrelLength: 28,
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
  lifetime: 3.5,
  radius: 4,
  damage: 1,
  maxBounces: 1,
  color: '#38bdf8',
  bouncedColor: '#f59e0b',
} as const;
