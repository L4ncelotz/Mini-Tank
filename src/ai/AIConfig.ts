export type TacticalState = 'reposition' | 'engage' | 'evade' | 'pressure' | 'recover';

export interface AIConfig {
  reactionDelay: number;        // Seconds between normal tactical evaluations
  evadeReactionDelay: number;   // Human-like reaction delay before starting to evade an incoming bullet
  aimThreshold: number;         // Maximum angular offset (radians) to fire directly at player
  preferredDistance: number;    // Ideal engagement distance in engage state
  pressureDistance: number;     // Closer aggressive distance when pressuring opponent on reload
  minDistance: number;          // Distance below which AI backs away
  maxDistance: number;          // Distance above which AI approaches player
  boundaryBuffer: number;       // Distance to wall where AI begins repositioning inward
  evadeThreatDistance: number;  // Distance within which incoming bullets are evaluated as threats
  recoverHpThreshold: number;   // HP threshold to trigger recovery state
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  reactionDelay: 0.28,
  evadeReactionDelay: 0.18,
  aimThreshold: 0.15,
  preferredDistance: 420,
  pressureDistance: 260,
  minDistance: 240,
  maxDistance: 680,
  boundaryBuffer: 80,
  evadeThreatDistance: 400,
  recoverHpThreshold: 1,
};
