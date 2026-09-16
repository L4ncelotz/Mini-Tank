import { describe, it, expect } from 'vitest';
import { CollisionSystem } from '../../src/systems/CollisionSystem';
import { Tank } from '../../src/entities/Tank';
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
});
