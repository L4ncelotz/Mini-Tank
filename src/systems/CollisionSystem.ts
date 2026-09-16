import type { Tank } from '../entities/Tank';
import type { ArenaBounds } from '../types/game';

export class CollisionSystem {
  public static resolveTankBoundaryCollision(tank: Tank, bounds: ArenaBounds): boolean {
    const minX = bounds.x + tank.radius;
    const maxX = bounds.x + bounds.width - tank.radius;
    const minY = bounds.y + tank.radius;
    const maxY = bounds.y + bounds.height - tank.radius;

    let collided = false;

    if (tank.x < minX) {
      tank.x = minX;
      collided = true;
    } else if (tank.x > maxX) {
      tank.x = maxX;
      collided = true;
    }

    if (tank.y < minY) {
      tank.y = minY;
      collided = true;
    } else if (tank.y > maxY) {
      tank.y = maxY;
      collided = true;
    }

    return collided;
  }

  public static isWithinBounds(x: number, y: number, radius: number, bounds: ArenaBounds): boolean {
    return (
      x >= bounds.x + radius &&
      x <= bounds.x + bounds.width - radius &&
      y >= bounds.y + radius &&
      y <= bounds.y + bounds.height - radius
    );
  }
}
