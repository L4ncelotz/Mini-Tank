import { DEFAULT_AI_CONFIG } from './AIConfig';
import type { AIConfig } from './AIConfig';
import type { Tank } from '../entities/Tank';
import type { ArenaBounds, TankControls } from '../types/game';

export class AIController {
  public config: AIConfig;
  public decisionTimer = 0;
  public currentControls: TankControls = { forward: 0, rotate: 0, fire: false };
  public targetAngle = 0;
  public distanceToTarget = 0;

  constructor(config: AIConfig = DEFAULT_AI_CONFIG) {
    this.config = config;
  }

  public reset(): void {
    this.decisionTimer = 0;
    this.currentControls = { forward: 0, rotate: 0, fire: false };
    this.targetAngle = 0;
    this.distanceToTarget = 0;
  }

  public update(
    dt: number,
    aiTank: Tank,
    playerTank: Tank,
    bounds: ArenaBounds
  ): TankControls {
    if (!aiTank.isAlive() || !playerTank.isAlive()) {
      this.currentControls = { forward: 0, rotate: 0, fire: false };
      return this.currentControls;
    }

    this.decisionTimer -= dt;

    // Periodically re-evaluate tactical intent according to reaction delay
    if (this.decisionTimer <= 0) {
      this.evaluateTactics(aiTank, playerTank, bounds);
      this.decisionTimer = this.config.reactionDelay;
    }

    // Steering is executed continuously toward the evaluated target angle
    this.steerTowardTarget(aiTank);

    return this.currentControls;
  }

  private evaluateTactics(aiTank: Tank, playerTank: Tank, bounds: ArenaBounds): void {
    const dx = playerTank.x - aiTank.x;
    const dy = playerTank.y - aiTank.y;
    this.distanceToTarget = Math.hypot(dx, dy);
    this.targetAngle = Math.atan2(dy, dx);

    // Calculate angle difference
    let angleDiff = this.targetAngle - aiTank.rotation;
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

    // Determine movement direction based on distance and boundaries
    let forward = 0;

    // Check if close to arena boundary and facing towards it
    const buffer = this.config.boundaryBuffer;
    const headingX = Math.cos(aiTank.rotation);
    const headingY = Math.sin(aiTank.rotation);

    const nearLeft = aiTank.x < bounds.x + buffer;
    const nearRight = aiTank.x > bounds.x + bounds.width - buffer;
    const nearTop = aiTank.y < bounds.y + buffer;
    const nearBottom = aiTank.y > bounds.y + bounds.height - buffer;

    const headingIntoWall =
      (nearLeft && headingX < 0) ||
      (nearRight && headingX > 0) ||
      (nearTop && headingY < 0) ||
      (nearBottom && headingY > 0);

    if (headingIntoWall) {
      // Back away from boundary wall
      forward = -1;
    } else if (this.distanceToTarget > this.config.maxDistance) {
      // Too far: advance forward
      forward = 1;
    } else if (this.distanceToTarget < this.config.minDistance) {
      // Too close: reverse away
      forward = -1;
    } else if (this.distanceToTarget > this.config.preferredDistance + 50) {
      // Approach towards preferred distance
      forward = 1;
    } else if (this.distanceToTarget < this.config.preferredDistance - 50) {
      // Back up towards preferred distance
      forward = -1;
    } else {
      // Inside preferred combat pocket
      forward = 0;
    }

    // Determine firing decision: direct line of sight within aim threshold
    const isAimedAtPlayer = Math.abs(angleDiff) <= this.config.aimThreshold;
    const fire = isAimedAtPlayer && aiTank.canFire();

    this.currentControls.forward = forward;
    this.currentControls.fire = fire;
  }

  private steerTowardTarget(aiTank: Tank): void {
    let angleDiff = this.targetAngle - aiTank.rotation;
    angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

    const deadZone = 0.05; // radians tolerance to prevent high-frequency chatter
    if (angleDiff > deadZone) {
      this.currentControls.rotate = 1; // Turn clockwise (right)
    } else if (angleDiff < -deadZone) {
      this.currentControls.rotate = -1; // Turn counter-clockwise (left)
    } else {
      this.currentControls.rotate = 0;
    }
  }
}
