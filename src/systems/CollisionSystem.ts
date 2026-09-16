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

  public static resolveBulletWallCollision(
    bullet: Bullet,
    bounds: ArenaBounds
  ): {
    hit: boolean;
    bounced: boolean;
    normalX: number;
    normalY: number;
    impactX: number;
    impactY: number;
  } | null {
    if (!bullet.alive) return null;

    const minX = bounds.x + bullet.radius;
    const maxX = bounds.x + bounds.width - bullet.radius;
    const minY = bounds.y + bullet.radius;
    const maxY = bounds.y + bounds.height - bullet.radius;

    let hit = false;
    let normalX = 0;
    let normalY = 0;

    if (bullet.x <= minX && bullet.vx < 0) {
      bullet.x = minX;
      normalX = 1;
      hit = true;
    } else if (bullet.x >= maxX && bullet.vx > 0) {
      bullet.x = maxX;
      normalX = -1;
      hit = true;
    }

    if (bullet.y <= minY && bullet.vy < 0) {
      bullet.y = minY;
      normalY = 1;
      hit = true;
    } else if (bullet.y >= maxY && bullet.vy > 0) {
      bullet.y = maxY;
      normalY = -1;
      hit = true;
    }

    if (!hit) return null;

    const impactX = bullet.x;
    const impactY = bullet.y;

    if (bullet.canBounce()) {
      bullet.bounce(normalX, normalY);
      return {
        hit: true,
        bounced: true,
        normalX,
        normalY,
        impactX,
        impactY,
      };
    } else {
      bullet.destroy();
      return {
        hit: true,
        bounced: false,
        normalX,
        normalY,
        impactX,
        impactY,
      };
    }
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
