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

  it('tracks bounces and enforces maximum bounces', () => {
    expect(bullet.bounces).toBe(0);
    expect(bullet.maxBounces).toBe(1);
    expect(bullet.canBounce()).toBe(true);

    // Bounce against right wall (normal = -1, 0)
    const firstBounceSuccess = bullet.bounce(-1, 0);
    expect(firstBounceSuccess).toBe(true);
    expect(bullet.bounces).toBe(1);
    expect(bullet.canBounce()).toBe(false);
    expect(bullet.vx).toBeCloseTo(-BULLET_CONFIG.speed, 4);
    expect(bullet.alive).toBe(true);

    // Disallowed second bounce
    const secondBounceSuccess = bullet.bounce(1, 0);
    expect(secondBounceSuccess).toBe(false);
    expect(bullet.alive).toBe(false);
  });

  it('accurately reflects velocity on horizontal walls', () => {
    const angledBullet = new Bullet(100, 100, Math.PI / 4, 'player'); // 45 deg down-right
    const initialVx = angledBullet.vx;
    const initialVy = angledBullet.vy;

    // Bounce off bottom wall (normal = 0, -1)
    angledBullet.bounce(0, -1);
    expect(angledBullet.vx).toBeCloseTo(initialVx, 4);
    expect(angledBullet.vy).toBeCloseTo(-initialVy, 4);
  });
});
