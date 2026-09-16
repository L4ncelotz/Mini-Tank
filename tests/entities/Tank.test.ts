import { describe, it, expect, beforeEach } from 'vitest';
import { Tank } from '../../src/entities/Tank';
import { PLAYER_CONFIG } from '../../src/config/gameplay';

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
    tank.update(dt, { forward: 1, rotate: 0, fire: false });

    expect(tank.speed).toBeGreaterThan(0);
    expect(tank.speed).toBeLessThanOrEqual(PLAYER_CONFIG.forwardSpeed);
    // At rotation 0, tank moves along +X
    expect(tank.x).toBeGreaterThan(100);
    expect(tank.y).toBe(100);
  });

  it('caps speed at forwardSpeed after multiple updates', () => {
    for (let i = 0; i < 60; i++) {
      tank.update(1 / 60, { forward: 1, rotate: 0, fire: false });
    }
    expect(tank.speed).toBe(PLAYER_CONFIG.forwardSpeed);
  });

  it('accelerates in reverse when forward control is negative', () => {
    const dt = 0.1;
    tank.update(dt, { forward: -1, rotate: 0, fire: false });

    expect(tank.speed).toBeLessThan(0);
    expect(tank.speed).toBeGreaterThanOrEqual(-PLAYER_CONFIG.reverseSpeed);
    // At rotation 0, reverse moves along -X
    expect(tank.x).toBeLessThan(100);
    expect(tank.y).toBe(100);
  });

  it('caps reverse speed at reverseSpeed', () => {
    for (let i = 0; i < 60; i++) {
      tank.update(1 / 60, { forward: -1, rotate: 0, fire: false });
    }
    expect(tank.speed).toBe(-PLAYER_CONFIG.reverseSpeed);
  });

  it('rotates clockwise with positive rotate control', () => {
    const dt = 0.5;
    tank.update(dt, { forward: 0, rotate: 1, fire: false });
    expect(tank.rotation).toBeCloseTo(PLAYER_CONFIG.rotationSpeed * dt, 4);
  });

  it('rotates counter-clockwise with negative rotate control', () => {
    const dt = 0.5;
    tank.update(dt, { forward: 0, rotate: -1, fire: false });
    expect(tank.rotation).toBeCloseTo(-PLAYER_CONFIG.rotationSpeed * dt, 4);
  });

  it('normalizes rotation to [-PI, PI]', () => {
    // Rotate multiple full circles
    for (let i = 0; i < 200; i++) {
      tank.update(0.1, { forward: 0, rotate: 1, fire: false });
    }
    expect(tank.rotation).toBeGreaterThanOrEqual(-Math.PI);
    expect(tank.rotation).toBeLessThanOrEqual(Math.PI);
  });

  it('decelerates to stop when control is neutral', () => {
    // Accelerate first
    for (let i = 0; i < 30; i++) {
      tank.update(1 / 60, { forward: 1, rotate: 0, fire: false });
    }
    expect(tank.speed).toBeGreaterThan(0);

    // Release forward throttle
    for (let i = 0; i < 60; i++) {
      tank.update(1 / 60, { forward: 0, rotate: 0, fire: false });
    }
    expect(tank.speed).toBe(0);
  });
});
