import type { Bullet } from '../entities/Bullet';
import type { Tank } from '../entities/Tank';
import type { ArenaBounds, Wall } from '../types/game';

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

  public static resolveTankWallCollisions(
    tank: Tank,
    walls: Wall[],
    bounds: ArenaBounds
  ): boolean {
    let collided = false;

    // 1. Resolve internal obstacle walls
    for (const wall of walls) {
      const closestX = Math.max(wall.x, Math.min(tank.x, wall.x + wall.width));
      const closestY = Math.max(wall.y, Math.min(tank.y, wall.y + wall.height));

      const dx = tank.x - closestX;
      const dy = tank.y - closestY;
      const distSq = dx * dx + dy * dy;

      if (distSq < tank.radius * tank.radius) {
        collided = true;
        if (distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = tank.radius - dist;
          tank.x += (dx / dist) * overlap;
          tank.y += (dy / dist) * overlap;
        } else {
          // Tank center inside wall: push out along shortest axis
          const dLeft = tank.x - wall.x;
          const dRight = wall.x + wall.width - tank.x;
          const dTop = tank.y - wall.y;
          const dBottom = wall.y + wall.height - tank.y;

          const minD = Math.min(dLeft, dRight, dTop, dBottom);
          if (minD === dLeft) tank.x = wall.x - tank.radius;
          else if (minD === dRight) tank.x = wall.x + wall.width + tank.radius;
          else if (minD === dTop) tank.y = wall.y - tank.radius;
          else tank.y = wall.y + wall.height + tank.radius;
        }
      }
    }

    // 2. Resolve boundary limits
    if (this.resolveTankBoundaryCollision(tank, bounds)) {
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

  public static resolveBulletWallCollisions(
    bullet: Bullet,
    walls: Wall[],
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

    // 1. Check internal obstacle walls first
    for (const wall of walls) {
      const minX = wall.x - bullet.radius;
      const maxX = wall.x + wall.width + bullet.radius;
      const minY = wall.y - bullet.radius;
      const maxY = wall.y + wall.height + bullet.radius;

      if (bullet.x >= minX && bullet.x <= maxX && bullet.y >= minY && bullet.y <= maxY) {
        const depthLeft = bullet.x - minX;
        const depthRight = maxX - bullet.x;
        const depthTop = bullet.y - minY;
        const depthBottom = maxY - bullet.y;

        let bestDepth = Infinity;
        let normalX = 0;
        let normalY = 0;

        if (bullet.vx > 0 && depthLeft < bestDepth) {
          bestDepth = depthLeft;
          normalX = -1;
          normalY = 0;
        }
        if (bullet.vx < 0 && depthRight < bestDepth) {
          bestDepth = depthRight;
          normalX = 1;
          normalY = 0;
        }
        if (bullet.vy > 0 && depthTop < bestDepth) {
          bestDepth = depthTop;
          normalX = 0;
          normalY = -1;
        }
        if (bullet.vy < 0 && depthBottom < bestDepth) {
          bestDepth = depthBottom;
          normalX = 0;
          normalY = 1;
        }

        if (normalX !== 0 || normalY !== 0) {
          if (normalX === -1) bullet.x = minX;
          else if (normalX === 1) bullet.x = maxX;
          if (normalY === -1) bullet.y = minY;
          else if (normalY === 1) bullet.y = maxY;

          const impactX = bullet.x;
          const impactY = bullet.y;

          if (bullet.canBounce()) {
            bullet.bounce(normalX, normalY);
            return { hit: true, bounced: true, normalX, normalY, impactX, impactY };
          } else {
            bullet.destroy();
            return { hit: true, bounced: false, normalX, normalY, impactX, impactY };
          }
        }
      }
    }

    // 2. Check outer arena boundaries
    return this.resolveBulletWallCollision(bullet, bounds);
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
