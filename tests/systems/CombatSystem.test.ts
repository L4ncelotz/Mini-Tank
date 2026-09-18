import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSystem } from '../../src/systems/CombatSystem';
import { Tank } from '../../src/entities/Tank';
import { BULLET_CONFIG } from '../../src/config/gameplay';
import type { ArenaBounds } from '../../src/types/game';

describe('CombatSystem', () => {
  let combat: CombatSystem;
  let playerTank: Tank;
  let targetTank: Tank;
  const bounds: ArenaBounds = {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
  };

  beforeEach(() => {
    combat = new CombatSystem();
    playerTank = new Tank(200, 300, 0, 'player');
    targetTank = new Tank(500, 300, Math.PI, 'dummy');
  });

  it('spawns bullet at barrel tip when firing', () => {
    const bullet = combat.fireBullet(playerTank);
    expect(bullet).not.toBeNull();
    expect(combat.bullets.length).toBe(1);

    const tip = playerTank.getBarrelTip();
    expect(bullet!.x).toBeCloseTo(tip.x, 4);
    expect(bullet!.y).toBeCloseTo(tip.y, 4);
    expect(bullet!.ownerId).toBe('player');
  });

  it('enforces fire cooldown', () => {
    const firstBullet = combat.fireBullet(playerTank);
    expect(firstBullet).not.toBeNull();
    expect(playerTank.canFire()).toBe(false);

    // Immediate second fire attempt fails
    const secondBullet = combat.fireBullet(playerTank);
    expect(secondBullet).toBeNull();
    expect(combat.bullets.length).toBe(1);

    // Update tank past cooldown
    playerTank.update(BULLET_CONFIG.cooldown + 0.05, { forward: 0, rotate: 0, fire: false, dash: false });
    expect(playerTank.canFire()).toBe(true);

    const thirdBullet = combat.fireBullet(playerTank);
    expect(thirdBullet).not.toBeNull();
    expect(combat.bullets.length).toBe(2);
  });

  it('ricochets bullet on first wall collision and destroys it on second wall collision', () => {
    // Fire bullet towards right wall
    const bullet = combat.fireBullet(playerTank)!;
    expect(bullet).not.toBeNull();
    expect(bullet.vx).toBeGreaterThan(0);

    // Advance until first wall collision (~85 frames to travel 600px at speed 420)
    for (let i = 0; i < 90; i++) {
      combat.update(1 / 60, bounds, [playerTank]);
      if (bullet.bounces === 1) break;
    }

    // First bounce: bullet reflected and alive
    expect(bullet.bounces).toBe(1);
    expect(bullet.alive).toBe(true);
    expect(bullet.vx).toBeLessThan(0); // Heading left
    expect(combat.bounceImpacts.length).toBeGreaterThan(0); // Recorded visual impact

    // Advance until bullet travels across the arena and hits opposite (left) wall
    for (let i = 0; i < 150; i++) {
      combat.update(1 / 60, bounds, [playerTank]);
    }

    // Second wall collision: bullet destroyed and removed
    expect(combat.bullets.length).toBe(0);
    expect(bullet.alive).toBe(false);
  });

  it('allows ricocheted bullet to hit an enemy tank and apply damage', () => {
    // Position player to shoot up at 45 degrees
    playerTank.x = 200;
    playerTank.y = 150;
    playerTank.rotation = -Math.PI / 4; // up-right
    // Position target along the reflected path
    targetTank.x = 490;
    targetTank.y = 150;
    expect(targetTank.hp).toBe(3);

    const bullet = combat.fireBullet(playerTank)!;
    expect(bullet).not.toBeNull();

    // Update until bullet bounces off top wall and hits target
    let hitRecorded = false;
    for (let i = 0; i < 60; i++) {
      const { hits } = combat.update(1 / 60, bounds, [playerTank, targetTank]);
      if (hits.length > 0) {
        hitRecorded = true;
        break;
      }
    }

    expect(hitRecorded).toBe(true);
    expect(targetTank.hp).toBe(2);
  });

  it('detects bullet hitting an enemy tank and applies damage', () => {
    // Position target directly ahead of player
    targetTank.x = 350;
    targetTank.y = 300;
    expect(targetTank.hp).toBe(3);

    combat.fireBullet(playerTank);

    // Update combat until bullet reaches targetTank
    let hitsRecorded = 0;
    for (let i = 0; i < 60; i++) {
      const { hits } = combat.update(1 / 60, bounds, [playerTank, targetTank]);
      if (hits.length > 0) {
        hitsRecorded += hits.length;
      }
    }

    expect(hitsRecorded).toBe(1);
    expect(targetTank.hp).toBe(2);
    expect(combat.bullets.length).toBe(0); // Bullet destroyed on impact
  });

  it('does not allow bullet to hit its own owner', () => {
    const bullet = combat.fireBullet(playerTank)!;

    // Put bullet right inside player tank
    bullet.x = playerTank.x;
    bullet.y = playerTank.y;

    const { hits } = combat.update(0.01, bounds, [playerTank]);
    expect(hits.length).toBe(0);
    expect(playerTank.hp).toBe(3);
    expect(bullet.alive).toBe(true);
  });

  it('destroys enemy tank when HP reaches 0', () => {
    targetTank.x = 300;
    targetTank.y = 300;

    // 3 shots to kill
    for (let shot = 0; shot < 3; shot++) {
      playerTank.cooldownTimer = 0;
      combat.fireBullet(playerTank);
      for (let step = 0; step < 30; step++) {
        combat.update(1 / 60, bounds, [playerTank, targetTank]);
      }
    }

    expect(targetTank.hp).toBe(0);
    expect(targetTank.isAlive()).toBe(false);
  });
});
