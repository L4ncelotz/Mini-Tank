import { describe, it, expect } from 'vitest';
import { CollisionSystem } from '../../src/systems/CollisionSystem';
import { Tank } from '../../src/entities/Tank';
import { Bullet } from '../../src/entities/Bullet';
import type { ArenaBounds } from '../../src/types/game';

describe('CollisionSystem', () => {
  const bounds: ArenaBounds = {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  };

  it('does not clamp a tank well inside bounds', () => {
    const tank = new Tank(400, 300, 0);
    const collided = CollisionSystem.resolveTankBoundaryCollision(tank, bounds);

    expect(collided).toBe(false);
    expect(tank.x).toBe(400);
    expect(tank.y).toBe(300);
  });

  it('clamps tank at left boundary', () => {
    const tank = new Tank(5, 300, 0);
    const collided = CollisionSystem.resolveTankBoundaryCollision(tank, bounds);

    expect(collided).toBe(true);
    expect(tank.x).toBe(tank.radius);
    expect(tank.y).toBe(300);
  });

  it('clamps tank at right boundary', () => {
    const tank = new Tank(810, 300, 0);
    const collided = CollisionSystem.resolveTankBoundaryCollision(tank, bounds);

    expect(collided).toBe(true);
    expect(tank.x).toBe(bounds.width - tank.radius);
    expect(tank.y).toBe(300);
  });

  it('clamps tank at top boundary', () => {
    const tank = new Tank(400, 2, 0);
    const collided = CollisionSystem.resolveTankBoundaryCollision(tank, bounds);

    expect(collided).toBe(true);
    expect(tank.x).toBe(400);
    expect(tank.y).toBe(tank.radius);
  });

  it('clamps tank at bottom boundary', () => {
    const tank = new Tank(400, 620, 0);
    const collided = CollisionSystem.resolveTankBoundaryCollision(tank, bounds);

    expect(collided).toBe(true);
    expect(tank.x).toBe(400);
    expect(tank.y).toBe(bounds.height - tank.radius);
  });

  it('clamps tank in corner', () => {
    const tank = new Tank(-10, -10, 0);
    const collided = CollisionSystem.resolveTankBoundaryCollision(tank, bounds);

    expect(collided).toBe(true);
    expect(tank.x).toBe(tank.radius);
    expect(tank.y).toBe(tank.radius);
  });

  it('validates isWithinBounds accurately', () => {
    expect(CollisionSystem.isWithinBounds(400, 300, 16, bounds)).toBe(true);
    expect(CollisionSystem.isWithinBounds(10, 300, 16, bounds)).toBe(false);
    expect(CollisionSystem.isWithinBounds(400, 595, 16, bounds)).toBe(false);
  });

  it('reflects bullet off right wall on first bounce', () => {
    const bullet = new Bullet(799, 300, 0, 'player'); // Moving +X towards right wall
    expect(bullet.vx).toBeGreaterThan(0);

    const result = CollisionSystem.resolveBulletWallCollision(bullet, bounds);
    expect(result).not.toBeNull();
    expect(result!.hit).toBe(true);
    expect(result!.bounced).toBe(true);
    expect(bullet.bounces).toBe(1);
    expect(bullet.vx).toBeLessThan(0); // Reversed velocity
    expect(bullet.alive).toBe(true);
  });

  it('destroys bullet on second wall collision when maxBounces is 1', () => {
    const bullet = new Bullet(799, 300, 0, 'player');
    CollisionSystem.resolveBulletWallCollision(bullet, bounds);
    expect(bullet.bounces).toBe(1);
    expect(bullet.alive).toBe(true);

    // Move to left wall
    bullet.x = 2;
    bullet.vx = -420;
    const secondResult = CollisionSystem.resolveBulletWallCollision(bullet, bounds);
    expect(secondResult).not.toBeNull();
    expect(secondResult!.bounced).toBe(false);
    expect(bullet.alive).toBe(false); // Destroyed after disallowed bounce
  });

  it('reflects bullet off top and bottom walls with proper normals', () => {
    // Moving towards top wall (-Y)
    const bulletTop = new Bullet(400, 2, -Math.PI / 2, 'player');
    const topResult = CollisionSystem.resolveBulletWallCollision(bulletTop, bounds);
    expect(topResult!.bounced).toBe(true);
    expect(bulletTop.vy).toBeGreaterThan(0); // Now moving down (+Y)

    // Moving towards bottom wall (+Y)
    const bulletBottom = new Bullet(400, 598, Math.PI / 2, 'player');
    const bottomResult = CollisionSystem.resolveBulletWallCollision(bulletBottom, bounds);
    expect(bottomResult!.bounced).toBe(true);
    expect(bulletBottom.vy).toBeLessThan(0); // Now moving up (-Y)
  });
});
