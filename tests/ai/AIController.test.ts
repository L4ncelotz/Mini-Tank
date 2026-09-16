import { describe, it, expect, beforeEach } from 'vitest';
import { AIController } from '../../src/ai/AIController';
import { DEFAULT_AI_CONFIG } from '../../src/ai/AIConfig';
import { Tank } from '../../src/entities/Tank';
import type { ArenaBounds } from '../../src/types/game';

describe('AIController', () => {
  let ai: AIController;
  let aiTank: Tank;
  let playerTank: Tank;
  const bounds: ArenaBounds = {
    x: 0,
    y: 0,
    width: 1440,
    height: 900,
  };

  beforeEach(() => {
    ai = new AIController(DEFAULT_AI_CONFIG);
    aiTank = new Tank(1000, 450, Math.PI, 'ai');
    playerTank = new Tank(400, 450, 0, 'player');
  });

  it('steers toward the player position', () => {
    // Player is to the left of AI (angle is PI, AI rotation is 0)
    aiTank.x = 800;
    aiTank.y = 450;
    aiTank.rotation = 0; // facing right (+X)
    playerTank.x = 400;
    playerTank.y = 450; // to the left

    // Target angle is PI; difference is PI (> 0), so rotate clockwise
    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.rotate).toBe(1);
    // Reset AI decision timer to test different relative angle
    ai.reset();

    // Player is directly above AI (angle is -PI/2, AI rotation is 0)
    playerTank.x = 800;
    playerTank.y = 200;
    const controlsUp = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controlsUp.rotate).toBe(-1); // counter-clockwise
  });

  it('stops rotating when aligned within aim deadzone', () => {
    // AI is facing left (PI), player is directly to the left (angle PI)
    aiTank.x = 800;
    aiTank.y = 450;
    aiTank.rotation = Math.PI;
    playerTank.x = 400;
    playerTank.y = 450;

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.rotate).toBe(0);
  });

  it('advances forward when distance exceeds maxDistance', () => {
    // Distance 800 is greater than maxDistance (680)
    aiTank.x = 1200;
    aiTank.y = 450;
    aiTank.rotation = Math.PI;
    playerTank.x = 400;
    playerTank.y = 450;

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.forward).toBe(1);
  });

  it('reverses backward when distance is closer than minDistance', () => {
    // Distance 150 is less than minDistance (240)
    aiTank.x = 550;
    aiTank.y = 450;
    aiTank.rotation = Math.PI;
    playerTank.x = 400;
    playerTank.y = 450;

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.forward).toBe(-1);
  });

  it('holds position when in preferred engagement distance', () => {
    // Preferred distance is 420; set distance to 420
    aiTank.x = 820;
    aiTank.y = 450;
    aiTank.rotation = Math.PI;
    playerTank.x = 400;
    playerTank.y = 450;

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.forward).toBe(0);
  });

  it('fires directly when aimed at player and off cooldown', () => {
    aiTank.x = 800;
    aiTank.y = 450;
    aiTank.rotation = Math.PI; // directly facing player
    playerTank.x = 400;
    playerTank.y = 450;

    expect(aiTank.canFire()).toBe(true);

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.fire).toBe(true);
  });

  it('does not fire when facing away from player (no impossible aim)', () => {
    aiTank.x = 800;
    aiTank.y = 450;
    aiTank.rotation = 0; // facing right (+X), away from player on the left
    playerTank.x = 400;
    playerTank.y = 450;

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.fire).toBe(false);
  });

  it('does not fire when on cooldown', () => {
    aiTank.x = 800;
    aiTank.y = 450;
    aiTank.rotation = Math.PI;
    playerTank.x = 400;
    playerTank.y = 450;

    aiTank.cooldownTimer = 0.8;
    expect(aiTank.canFire()).toBe(false);

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.fire).toBe(false);
  });

  it('repositions away when backing into or heading into arena wall', () => {
    // Near right wall (x: 1400 out of 1440) and facing right towards it
    aiTank.x = 1400;
    aiTank.y = 450;
    aiTank.rotation = 0; // heading into right wall

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls.forward).toBe(-1); // backs away from wall
  });

  it('outputs neutral controls when dead', () => {
    aiTank.hp = 0;
    expect(aiTank.isAlive()).toBe(false);

    const controls = ai.update(0.016, aiTank, playerTank, bounds);
    expect(controls).toEqual({ forward: 0, rotate: 0, fire: false });
  });

  it('respects reaction delay timing before re-evaluating tactics', () => {
    ai.decisionTimer = 0.2; // in middle of reaction delay
    ai.currentControls = { forward: 1, rotate: 0, fire: false };

    // Move player suddenly
    playerTank.x = 100;
    playerTank.y = 100;

    // Small step dt = 0.05s (still within reaction delay)
    const controls = ai.update(0.05, aiTank, playerTank, bounds);
    expect(controls.forward).toBe(1); // retained prior tactical intent
  });
});
