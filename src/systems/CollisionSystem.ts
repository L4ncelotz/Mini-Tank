import type { Bullet } from '../entities/Bullet';
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

  public static resolveBulletWallCollision(bullet: Bullet, bounds: ArenaBounds): boolean {
    if (!bullet.alive) return false;

    const minX = bounds.x + bullet.radius;
    const maxX = bounds.x + bounds.width - bullet.radius;
    const minY = bounds.y + bullet.radius;
    const maxY = bounds.y + bounds.height - bullet.radius;

    if (bullet.x <= minX || bullet.x >= maxX || bullet.y <= minY || bullet.y >= maxY) {
      bullet.destroy();
      return true;
    }

    return false;
  }

  public static checkBulletTankCollision(bullet: Bullet, tank: Tank): boolean {
    if (!bullet.alive || !tank.isAlive()) return false;
    if (bullet.ownerId === tank.id) return false;

    const dx = bullet.x - tank.x;
    const dy = bullet.y - tank.y;
    const radiusSum = bullet.radius + tank.radius;

    return dx * dx + dy * dy <= radiusSum * radiusSum;
  }
}
