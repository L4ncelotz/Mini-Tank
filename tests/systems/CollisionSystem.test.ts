import { describe, it, expect } from 'vitest';
import { CollisionSystem } from '../../src/systems/CollisionSystem';
import { Tank } from '../../src/entities/Tank';
import { Bullet } from '../../src/entities/Bullet';
import type { ArenaBounds, Wall } from '../../src/types/game';


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

  it('resolves tank collisions against internal rectangular walls by sliding', () => {
    const walls: Wall[] = [
      { id: 'pillar', x: 300, y: 200, width: 100, height: 100 },
    ];

    // Tank penetrates left face of wall (tank.x = 295, wall starts at 300, radius = 16)
    const tank = new Tank(295, 250, 0);
    const collided = CollisionSystem.resolveTankWallCollisions(tank, walls, bounds);

    expect(collided).toBe(true);
    // Tank should be pushed out to x <= 300 - 16 = 284
    expect(tank.x).toBeLessThanOrEqual(284.01);
    expect(tank.y).toBe(250);
  });

  it('reflects bullet off internal obstacle wall', () => {
    const walls: Wall[] = [
      { id: 'center-block', x: 400, y: 200, width: 100, height: 100 },
    ];

    // Bullet moving right (+X) enters left face of wall at (398, 250)
    const bullet = new Bullet(398, 250, 0, 'player', 420);
    expect(bullet.vx).toBeGreaterThan(0);

    const result = CollisionSystem.resolveBulletWallCollisions(bullet, walls, bounds);
    expect(result).not.toBeNull();
    expect(result!.hit).toBe(true);
    expect(result!.bounced).toBe(true);
    expect(bullet.bounces).toBe(1);
    expect(bullet.vx).toBeLessThan(0); // Reversed velocity heading away from wall
    expect(bullet.alive).toBe(true);
  });

  it('destroys bullet on second obstacle wall collision', () => {
    const walls: Wall[] = [
      { id: 'wall1', x: 400, y: 200, width: 100, height: 100 },
      { id: 'wall2', x: 200, y: 200, width: 100, height: 100 },
    ];

    const bullet = new Bullet(398, 250, 0, 'player', 420);
    CollisionSystem.resolveBulletWallCollisions(bullet, walls, bounds);
    expect(bullet.bounces).toBe(1);

    // Move to second wall
    bullet.x = 302;
    bullet.vx = -420; // moving left into right face of wall2
    const secondResult = CollisionSystem.resolveBulletWallCollisions(bullet, walls, bounds);
    expect(secondResult).not.toBeNull();
    expect(secondResult!.bounced).toBe(false);
    expect(bullet.alive).toBe(false);
  });
});
