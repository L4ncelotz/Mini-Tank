import { describe, it, expect, beforeEach } from 'vitest';
import { Tank } from '../../src/entities/Tank';
import { DASH_CONFIG, PLAYER_CONFIG } from '../../src/config/gameplay';
describe('Tank Entity', () => {
  let tank: Tank;

  beforeEach(() => {
    tank = new Tank(100, 100, 0);
  });

  it('initializes with correct properties', () => {
    expect(tank.x).toBe(100);
    expect(tank.y).toBe(100);
    expect(tank.rotation).toBe(0);
    expect(tank.speed).toBe(0);
    expect(tank.radius).toBe(PLAYER_CONFIG.radius);
  });

  it('accelerates forward when forward control is positive', () => {
    const dt = 0.1;
    tank.update(dt, { forward: 1, rotate: 0, fire: false, dash: false });

    expect(tank.speed).toBeGreaterThan(0);
    expect(tank.speed).toBeLessThanOrEqual(PLAYER_CONFIG.forwardSpeed);
    // At rotation 0, tank moves along +X
    expect(tank.x).toBeGreaterThan(100);
    expect(tank.y).toBe(100);
  });

  it('caps speed at forwardSpeed after multiple updates', () => {
    for (let i = 0; i < 60; i++) {
      tank.update(1 / 60, { forward: 1, rotate: 0, fire: false, dash: false });
    }
    expect(tank.speed).toBe(PLAYER_CONFIG.forwardSpeed);
  });

  it('accelerates in reverse when forward control is negative', () => {
    const dt = 0.1;
    tank.update(dt, { forward: -1, rotate: 0, fire: false, dash: false });

    expect(tank.speed).toBeLessThan(0);
    expect(tank.speed).toBeGreaterThanOrEqual(-PLAYER_CONFIG.reverseSpeed);
    // At rotation 0, reverse moves along -X
    expect(tank.x).toBeLessThan(100);
    expect(tank.y).toBe(100);
  });

  it('caps reverse speed at reverseSpeed', () => {
    for (let i = 0; i < 60; i++) {
      tank.update(1 / 60, { forward: -1, rotate: 0, fire: false, dash: false });
    }
    expect(tank.speed).toBe(-PLAYER_CONFIG.reverseSpeed);
  });

  it('rotates clockwise with positive rotate control', () => {
    const dt = 0.5;
    tank.update(dt, { forward: 0, rotate: 1, fire: false, dash: false });
    expect(tank.rotation).toBeCloseTo(PLAYER_CONFIG.rotationSpeed * dt, 4);
  });

  it('rotates counter-clockwise with negative rotate control', () => {
    const dt = 0.5;
    tank.update(dt, { forward: 0, rotate: -1, fire: false, dash: false });
    expect(tank.rotation).toBeCloseTo(-PLAYER_CONFIG.rotationSpeed * dt, 4);
  });

  it('normalizes rotation to [-PI, PI]', () => {
    // Rotate multiple full circles
    for (let i = 0; i < 200; i++) {
      tank.update(0.1, { forward: 0, rotate: 1, fire: false, dash: false });
    }
    expect(tank.rotation).toBeGreaterThanOrEqual(-Math.PI);
    expect(tank.rotation).toBeLessThanOrEqual(Math.PI);
  });

  it('decelerates to stop when control is neutral', () => {
    // Accelerate first
    for (let i = 0; i < 30; i++) {
      tank.update(1 / 60, { forward: 1, rotate: 0, fire: false, dash: false });
    }
    expect(tank.speed).toBeGreaterThan(0);

    // Release forward throttle
    for (let i = 0; i < 60; i++) {
      tank.update(1 / 60, { forward: 0, rotate: 0, fire: false, dash: false });
    }
    expect(tank.speed).toBe(0);
  });

  it('computes barrel tip precisely at the muzzle of the barrel', () => {
    const tip0 = tank.getBarrelTip();
    expect(tip0.x).toBeCloseTo(100 + PLAYER_CONFIG.barrelLength, 4);
    expect(tip0.y).toBeCloseTo(100, 4);

    // Rotate 90 degrees (+Y)
    tank.rotation = Math.PI / 2;
    const tip90 = tank.getBarrelTip();
    expect(tip90.x).toBeCloseTo(100, 4);
    expect(tip90.y).toBeCloseTo(100 + PLAYER_CONFIG.barrelLength, 4);
  });

  it('triggers dash and moves at dash speed for the duration', () => {
    expect(tank.canDash()).toBe(true);
    expect(tank.isDashing()).toBe(false);

    // Trigger dash
    tank.update(0.016, { forward: 0, rotate: 0, fire: false, dash: true });
    expect(tank.isDashing()).toBe(true);
    expect(tank.speed).toBe(DASH_CONFIG.speed);
    expect(tank.dashCooldownTimer).toBeCloseTo(DASH_CONFIG.cooldown, 2);
    expect(tank.canDash()).toBe(false);

    // Advance past dash duration (0.16s)
    tank.update(DASH_CONFIG.duration + 0.05, { forward: 0, rotate: 0, fire: false, dash: false });
    expect(tank.isDashing()).toBe(false);
    expect(tank.dashCooldownTimer).toBeGreaterThan(0);
    expect(tank.canDash()).toBe(false); // Still on cooldown

    // Advance past remaining cooldown (2.5s)
    tank.update(DASH_CONFIG.cooldown, { forward: 0, rotate: 0, fire: false, dash: false });
    expect(tank.canDash()).toBe(true);
  });

  it('activates hit flash timer when damaged', () => {
    expect(tank.hitFlashTimer).toBe(0);
    tank.takeDamage(1);
    expect(tank.hitFlashTimer).toBeGreaterThan(0);

    tank.update(0.2, { forward: 0, rotate: 0, fire: false, dash: false });
    expect(tank.hitFlashTimer).toBe(0);
  });

  it('activates muzzle flash timer when firing', () => {
    expect(tank.muzzleFlashTimer).toBe(0);
    tank.triggerFire();
    expect(tank.muzzleFlashTimer).toBeGreaterThan(0);

    tank.update(0.1, { forward: 0, rotate: 0, fire: false, dash: false });
    expect(tank.muzzleFlashTimer).toBe(0);
  });
});
