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
    playerTank.update(BULLET_CONFIG.cooldown + 0.05, { forward: 0, rotate: 0, fire: false });
    expect(playerTank.canFire()).toBe(true);

    const thirdBullet = combat.fireBullet(playerTank);
    expect(thirdBullet).not.toBeNull();
    expect(combat.bullets.length).toBe(2);
  });

  it('destroys bullet upon colliding with arena wall', () => {
    // Fire bullet towards right wall
    const bullet = combat.fireBullet(playerTank)!;
    expect(bullet).not.toBeNull();

    // Fast-forward updates until bullet hits the right wall (x >= 800 - radius)
    for (let i = 0; i < 120; i++) {
      combat.update(1 / 60, bounds, [playerTank]);
    }

    // Bullet should have hit wall and been removed
    expect(combat.bullets.length).toBe(0);
    expect(bullet.alive).toBe(false);
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
      const hits = combat.update(1 / 60, bounds, [playerTank, targetTank]);
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

    const hits = combat.update(0.01, bounds, [playerTank]);
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
