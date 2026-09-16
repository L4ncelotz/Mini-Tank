import { BULLET_CONFIG } from '../config/gameplay';
import { DEFAULT_AI_CONFIG } from './AIConfig';
import type { AIConfig, TacticalState } from './AIConfig';
import type { Tank } from '../entities/Tank';
import type { Bullet } from '../entities/Bullet';
import type { ArenaBounds, TankControls, Wall } from '../types/game';

export class AIController {
  public config: AIConfig;
  public state: TacticalState = 'engage';
  public decisionTimer = 0;
  public currentControls: TankControls = { forward: 0, rotate: 0, fire: false };
  public targetAngle = 0;
  public distanceToTarget = 0;

  public estimatedPlayerCooldown = 0;
  public incomingBullet: Bullet | null = null;
  public evadeReactionTimer = 0;
  public evadePerpendicularDir = 1;

  constructor(config: AIConfig = DEFAULT_AI_CONFIG) {
    this.config = config;
  }

  public reset(): void {
    this.state = 'engage';
    this.decisionTimer = 0;
    this.currentControls = { forward: 0, rotate: 0, fire: false };
    this.targetAngle = 0;
    this.distanceToTarget = 0;
    this.estimatedPlayerCooldown = 0;
    this.incomingBullet = null;
    this.evadeReactionTimer = 0;
    this.evadePerpendicularDir = 1;
  }

  public update(
    dt: number,
    aiTank: Tank,
    playerTank: Tank,
    bounds: ArenaBounds,
    bullets: readonly Bullet[] = [],
    walls: Wall[] = []
  ): TankControls {
    if (!aiTank.isAlive() || !playerTank.isAlive()) {
      this.currentControls = { forward: 0, rotate: 0, fire: false };
      return this.currentControls;
    }
    // Update estimated player cooldown
    this.updatePlayerCooldownEstimate(dt, playerTank, bullets);

    // Scan for dangerous incoming bullets on collision trajectory
    const threat = this.findIncomingThreat(aiTank, bullets);

    if (threat) {
      if (!this.incomingBullet || this.incomingBullet !== threat) {
        // Newly observed threat: start human-like reaction timer (no instant dodge at fire time)
        this.incomingBullet = threat;
        this.evadeReactionTimer = this.config.evadeReactionDelay;
      }

      this.evadeReactionTimer -= dt;

      if (this.evadeReactionTimer <= 0) {
        // Reaction delay has elapsed: execute evasive maneuver
        this.state = 'evade';
        this.executeEvade(aiTank, threat, playerTank);
        this.steerTowardTarget(aiTank);
        return this.currentControls;
      }
    } else {
      this.incomingBullet = null;
      this.evadeReactionTimer = 0;
    }

    // Normal tactical state evaluation on reaction delay timer
    this.decisionTimer -= dt;
    if (this.decisionTimer <= 0) {
      this.evaluateTactics(aiTank, playerTank, bounds, walls);
      this.decisionTimer = this.config.reactionDelay;
    }

    this.steerTowardTarget(aiTank);
    return this.currentControls;
  }

  private updatePlayerCooldownEstimate(
    dt: number,
    playerTank: Tank,
    bullets: readonly Bullet[]
  ): void {
    this.estimatedPlayerCooldown = Math.max(0, this.estimatedPlayerCooldown - dt);

    // Detect if player recently fired by checking for new player bullets
    for (const bullet of bullets) {
      if (bullet.ownerId === playerTank.id && bullet.lifetime >= bullet.maxLifetime - 0.05) {
        this.estimatedPlayerCooldown = BULLET_CONFIG.cooldown;
        break;
      }
    }
  }

  public findIncomingThreat(aiTank: Tank, bullets: readonly Bullet[]): Bullet | null {
    let closestThreat: Bullet | null = null;
    let minTimeToImpact = Infinity;

    for (const bullet of bullets) {
      if (!bullet.alive || bullet.ownerId === aiTank.id) continue;

      const dx = aiTank.x - bullet.x;
      const dy = aiTank.y - bullet.y;
      const dist = Math.hypot(dx, dy);

      if (dist > this.config.evadeThreatDistance) continue;

      const vSq = bullet.vx * bullet.vx + bullet.vy * bullet.vy;
      if (vSq === 0) continue;

      // Projection parameter t (time in seconds along velocity ray to closest approach)
      const t = (dx * bullet.vx + dy * bullet.vy) / vSq;

      // Only consider bullets traveling toward AI within the next 0.85 seconds
      if (t > 0 && t < 0.85) {
        const closestX = bullet.x + bullet.vx * t;
        const closestY = bullet.y + bullet.vy * t;
        const perpDist = Math.hypot(aiTank.x - closestX, aiTank.y - closestY);

        // Check if the bullet's path will hit AI tank hull
        const threatRadius = aiTank.radius + bullet.radius + 20;
        if (perpDist <= threatRadius && t < minTimeToImpact) {
          minTimeToImpact = t;
          closestThreat = bullet;
        }
      }
    }

    return closestThreat;
  }

  private executeEvade(aiTank: Tank, bullet: Bullet, playerTank: Tank): void {
    // Bullet velocity direction
    const bSpeed = Math.hypot(bullet.vx, bullet.vy);
    if (bSpeed === 0) return;

    const bDirX = bullet.vx / bSpeed;
    const bDirY = bullet.vy / bSpeed;

    // Perpendicular dodge vector (-bDirY, bDirX) or (bDirY, -bDirX)
    const perp1X = -bDirY;
    const perp1Y = bDirX;
    const perp2X = bDirY;
    const perp2Y = -bDirX;

    // Pick perpendicular direction that doesn't head directly into the player
    const toPlayerX = playerTank.x - aiTank.x;
    const toPlayerY = playerTank.y - aiTank.y;

    const dot1 = perp1X * toPlayerX + perp1Y * toPlayerY;
    const dot2 = perp2X * toPlayerX + perp2Y * toPlayerY;

    // Prefer side dodge with better positioning clearance
    const chosenX = dot1 <= dot2 ? perp1X : perp2X;
    const chosenY = dot1 <= dot2 ? perp1Y : perp2Y;

    this.targetAngle = Math.atan2(chosenY, chosenX);
    this.currentControls.forward = 1; // Move perpendicular to incoming line of fire

    // During evade, only fire if accidentally aligned with player
    const angleToPlayer = Math.atan2(toPlayerY, toPlayerX);
    let aimDiff = angleToPlayer - aiTank.rotation;
    aimDiff = Math.atan2(Math.sin(aimDiff), Math.cos(aimDiff));
    this.currentControls.fire = Math.abs(aimDiff) <= this.config.aimThreshold && aiTank.canFire();
  }

  private evaluateTactics(
    aiTank: Tank,
    playerTank: Tank,
    bounds: ArenaBounds,
    walls: Wall[] = []
  ): void {
    const dx = playerTank.x - aiTank.x;
    const dy = playerTank.y - aiTank.y;
    this.distanceToTarget = Math.hypot(dx, dy);
    this.targetAngle = Math.atan2(dy, dx);

    const buffer = this.config.boundaryBuffer;
    const headingX = Math.cos(aiTank.rotation);
    const headingY = Math.sin(aiTank.rotation);

    const nearLeft = aiTank.x < bounds.x + buffer;
    const nearRight = aiTank.x > bounds.x + bounds.width - buffer;
    const nearTop = aiTank.y < bounds.y + buffer;
    const nearBottom = aiTank.y > bounds.y + bounds.height - buffer;

    let nearObstacleWall = false;
    for (const wall of walls) {
      const closestX = Math.max(wall.x, Math.min(aiTank.x, wall.x + wall.width));
      const closestY = Math.max(wall.y, Math.min(aiTank.y, wall.y + wall.height));
      const dist = Math.hypot(aiTank.x - closestX, aiTank.y - closestY);
      if (dist < buffer) {
        const toWallX = closestX - aiTank.x;
        const toWallY = closestY - aiTank.y;
        if (headingX * toWallX + headingY * toWallY > 0) {
          nearObstacleWall = true;
          break;
        }
      }
    }

    const isNearWall = nearLeft || nearRight || nearTop || nearBottom || nearObstacleWall;
    const headingIntoWall =
      (nearLeft && headingX < 0) ||
      (nearRight && headingX > 0) ||
      (nearTop && headingY < 0) ||
      (nearBottom && headingY > 0) ||
      nearObstacleWall;

    // 1. Reposition State: boundary avoidance / corner escape
    if (headingIntoWall) {
      this.state = 'reposition';
      this.currentControls.forward = -1;
      // Turn towards arena center
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      this.targetAngle = Math.atan2(centerY - aiTank.y, centerX - aiTank.x);
      this.currentControls.fire = false;
      return;
    }
    // 2. Pressure State: Player is reloading and AI is ready to punish
    const playerIsReloading = this.estimatedPlayerCooldown > 0.35;
    const aiIsArmed = aiTank.canFire();

    if (playerIsReloading && aiIsArmed && !isNearWall) {
      this.state = 'pressure';
      // Aggressively close the distance to pressure distance
      if (this.distanceToTarget > this.config.pressureDistance) {
        this.currentControls.forward = 1;
      } else if (this.distanceToTarget < this.config.minDistance) {
        this.currentControls.forward = -1;
      } else {
        this.currentControls.forward = 0;
      }

      let angleDiff = this.targetAngle - aiTank.rotation;
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      this.currentControls.fire = Math.abs(angleDiff) <= this.config.aimThreshold && aiTank.canFire();
      return;
    }

    // 3. Recover State: AI is at low HP (1 HP) while player has health advantage
    const isLowHp = aiTank.hp <= this.config.recoverHpThreshold;
    const playerHealthAdvantage = playerTank.hp > aiTank.hp;

    if (isLowHp && playerHealthAdvantage) {
      this.state = 'recover';
      // Maintain safer distance (preferred + 120)
      const safeDistance = this.config.preferredDistance + 120;
      if (this.distanceToTarget < safeDistance) {
        this.currentControls.forward = -1; // back away safely
      } else if (this.distanceToTarget > this.config.maxDistance + 50) {
        this.currentControls.forward = 1;
      } else {
        this.currentControls.forward = 0;
      }

      let angleDiff = this.targetAngle - aiTank.rotation;
      angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
      this.currentControls.fire = Math.abs(angleDiff) <= this.config.aimThreshold && aiTank.canFire();
      return;
    }

    // 4. Engage State: Standard balanced tactical spacing
    this.state = 'engage';
    if (this.distanceToTarget > this.config.maxDistance) {
      this.currentControls.forward = 1;
    } else if (this.distanceToTarget < this.config.minDistance) {
      this.currentControls.forward = -1;
    } else if (this.distanceToTarget > this.config.preferredDistance + 50) {
      this.currentControls.forward = 1;
    } else if (this.distanceToTarget < this.config.preferredDistance - 50) {
      this.currentControls.forward = -1;
    } else {
      this.currentControls.forward = 0;
    }

    let angleDiff = this.targetAngle - aiTank.rotation;
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    this.currentControls.fire = Math.abs(angleDiff) <= this.config.aimThreshold && aiTank.canFire();
  }

  private steerTowardTarget(aiTank: Tank): void {
    let angleDiff = this.targetAngle - aiTank.rotation;
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

    const deadZone = 0.05;
    if (angleDiff > deadZone) {
      this.currentControls.rotate = 1;
    } else if (angleDiff < -deadZone) {
      this.currentControls.rotate = -1;
    } else {
      this.currentControls.rotate = 0;
    }
  }
}
