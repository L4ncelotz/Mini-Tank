import { Bullet } from '../entities/Bullet';
import type { Tank } from '../entities/Tank';
import type { ArenaBounds, Wall } from '../types/game';
import { CollisionSystem } from './CollisionSystem';

export interface CombatHitEvent {
  bullet: Bullet;
  target: Tank;
  damage: number;
}

export interface BounceImpact {
  x: number;
  y: number;
  normalX: number;
  normalY: number;
  timer: number;
  maxTime: number;
}

export class CombatSystem {
  public bullets: Bullet[] = [];
  public bounceImpacts: BounceImpact[] = [];

  public fireBullet(tank: Tank): Bullet | null {
    if (!tank.triggerFire()) {
      return null;
    }

    const tip = tank.getBarrelTip();
    const bullet = new Bullet(tip.x, tip.y, tank.rotation, tank.id);
    this.bullets.push(bullet);
    return bullet;
  }

  public update(
    dt: number,
    bounds: ArenaBounds,
    tanks: Tank[],
    walls: Wall[] = []
  ): CombatHitEvent[] {
    const hits: CombatHitEvent[] = [];

    // Update existing bounce impacts
    for (const impact of this.bounceImpacts) {
      impact.timer -= dt;
    }
    this.bounceImpacts = this.bounceImpacts.filter((i) => i.timer > 0);

    for (const bullet of this.bullets) {
      bullet.update(dt);
      if (!bullet.alive) continue;

      // Check internal and boundary wall collisions and ricochet
      const wallCol = CollisionSystem.resolveBulletWallCollisions(bullet, walls, bounds);
      if (wallCol?.bounced) {
        this.bounceImpacts.push({
          x: wallCol.impactX,
          y: wallCol.impactY,
          normalX: wallCol.normalX,
          normalY: wallCol.normalY,
          timer: 0.2,
          maxTime: 0.2,
        });
      }

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
    this.bounceImpacts = [];
  }
}
