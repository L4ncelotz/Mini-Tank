import { Bullet } from '../entities/Bullet';
import type { Tank } from '../entities/Tank';
import type { ArenaBounds } from '../types/game';
import { CollisionSystem } from './CollisionSystem';

export interface CombatHitEvent {
  bullet: Bullet;
  target: Tank;
  damage: number;
}

export class CombatSystem {
  public bullets: Bullet[] = [];

  public fireBullet(tank: Tank): Bullet | null {
    if (!tank.triggerFire()) {
      return null;
    }

    const tip = tank.getBarrelTip();
    const bullet = new Bullet(tip.x, tip.y, tank.rotation, tank.id);
    this.bullets.push(bullet);
    return bullet;
  }

  public update(dt: number, bounds: ArenaBounds, tanks: Tank[]): CombatHitEvent[] {
    const hits: CombatHitEvent[] = [];

    for (const bullet of this.bullets) {
      bullet.update(dt);
      if (!bullet.alive) continue;

      // Check wall collision
      CollisionSystem.resolveBulletWallCollision(bullet, bounds);
      if (!bullet.alive) continue;

      // Check tank collisions
      for (const tank of tanks) {
        if (CollisionSystem.checkBulletTankCollision(bullet, tank)) {
          tank.takeDamage(bullet.damage);
          bullet.destroy();
          hits.push({
            bullet,
            target: tank,
            damage: bullet.damage,
          });
          break;
        }
      }
    }

    // Filter out destroyed or expired bullets
    this.bullets = this.bullets.filter((b) => b.alive);

    return hits;
  }

  public clear(): void {
    this.bullets = [];
  }
}
