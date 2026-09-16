import { describe, it, expect, beforeEach } from 'vitest';
import { Bullet } from '../../src/entities/Bullet';
import { BULLET_CONFIG } from '../../src/config/gameplay';

describe('Bullet Entity', () => {
  let bullet: Bullet;

  beforeEach(() => {
    bullet = new Bullet(100, 200, 0, 'player');
  });

  it('initializes with correct properties', () => {
    expect(bullet.x).toBe(100);
    expect(bullet.y).toBe(200);
    expect(bullet.ownerId).toBe('player');
    expect(bullet.speed).toBe(BULLET_CONFIG.speed);
    expect(bullet.vx).toBeCloseTo(BULLET_CONFIG.speed, 4);
    expect(bullet.vy).toBeCloseTo(0, 4);
    expect(bullet.radius).toBe(BULLET_CONFIG.radius);
    expect(bullet.lifetime).toBe(BULLET_CONFIG.lifetime);
    expect(bullet.damage).toBe(BULLET_CONFIG.damage);
    expect(bullet.alive).toBe(true);
  });

  it('calculates velocity components from angle', () => {
    const angle = Math.PI / 2; // Pointing down (+Y)
    const b = new Bullet(50, 50, angle, 'player');
    expect(b.vx).toBeCloseTo(0, 4);
    expect(b.vy).toBeCloseTo(BULLET_CONFIG.speed, 4);
  });

  it('updates position along velocity vector', () => {
    const dt = 0.1;
    bullet.update(dt);
    expect(bullet.x).toBeCloseTo(100 + BULLET_CONFIG.speed * dt, 4);
    expect(bullet.y).toBe(200);
    expect(bullet.lifetime).toBeCloseTo(BULLET_CONFIG.lifetime - dt, 4);
    expect(bullet.alive).toBe(true);
  });

  it('expires and dies when lifetime reaches 0', () => {
    bullet.update(BULLET_CONFIG.lifetime + 0.1);
    expect(bullet.alive).toBe(false);
  });

  it('stops updating position once destroyed', () => {
    bullet.destroy();
    expect(bullet.alive).toBe(false);
    const xBefore = bullet.x;
    bullet.update(0.5);
    expect(bullet.x).toBe(xBefore);
  });
});
