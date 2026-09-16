export interface AIConfig {
  reactionDelay: number;     // Seconds between tactical decision evaluations (human-like delay)
  aimThreshold: number;      // Maximum angular offset (radians) to fire directly at player
  preferredDistance: number; // Ideal engagement distance
  minDistance: number;       // Distance below which AI backs away
  maxDistance: number;       // Distance above which AI approaches player
  boundaryBuffer: number;    // Distance to wall where AI begins repositioning inward
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  reactionDelay: 0.28,
  aimThreshold: 0.15,
  preferredDistance: 420,
  minDistance: 240,
  maxDistance: 680,
  boundaryBuffer: 80,
};
