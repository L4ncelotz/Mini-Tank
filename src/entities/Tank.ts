import { BULLET_CONFIG, DASH_CONFIG, PLAYER_CONFIG } from '../config/gameplay';
import type { TankControls, Vector2D } from '../types/game';

export class Tank {
  public id: string;
  public x: number;
  public y: number;
  public rotation: number;
  public speed: number;
  public radius: number;
  public hp: number;
  public maxHp: number;
  public cooldownTimer: number;
  public dashCooldownTimer = 0;
  public dashDurationTimer = 0;
  public hitFlashTimer = 0;
  public muzzleFlashTimer = 0;
  public config: typeof PLAYER_CONFIG;

  constructor(
    x: number,
    y: number,
    rotation = 0,
    id = 'player',
    maxHp = 3,
    config: typeof PLAYER_CONFIG = PLAYER_CONFIG
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.config = config;
    this.radius = config.radius;
    this.speed = 0;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.cooldownTimer = 0;
  }

  public isAlive(): boolean {
    return this.hp > 0;
  }

  public canFire(): boolean {
    return this.isAlive() && this.cooldownTimer <= 0;
  }

  public triggerFire(cooldown: number = BULLET_CONFIG.cooldown): boolean {
    if (!this.canFire()) return false;
    this.cooldownTimer = cooldown;
    this.muzzleFlashTimer = 0.08;
    return true;
  }

  public canDash(): boolean {
    return this.isAlive() && this.dashCooldownTimer <= 0 && !this.isDashing();
  }

  public isDashing(): boolean {
    return this.dashDurationTimer > 0;
  }

  public triggerDash(
    cooldown: number = DASH_CONFIG.cooldown,
    duration: number = DASH_CONFIG.duration
  ): boolean {
    if (!this.canDash()) return false;
    this.dashCooldownTimer = cooldown;
    this.dashDurationTimer = duration;
    return true;
  }

  public takeDamage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    this.hitFlashTimer = 0.12;
    return this.hp <= 0;
  }

  public reset(x: number, y: number, rotation = 0): void {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.speed = 0;
    this.hp = this.maxHp;
    this.cooldownTimer = 0;
    this.dashCooldownTimer = 0;
    this.dashDurationTimer = 0;
    this.hitFlashTimer = 0;
    this.muzzleFlashTimer = 0;
  }

  public getBarrelTip(): Vector2D {
    return {
      x: this.x + Math.cos(this.rotation) * this.config.barrelLength,
      y: this.y + Math.sin(this.rotation) * this.config.barrelLength,
    };
  }
  public update(dt: number, controls: TankControls): void {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer = Math.max(0, this.cooldownTimer - dt);
    }
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - dt);
    }
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    }
    if (this.muzzleFlashTimer > 0) {
      this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt);
    }

    if (!this.isAlive()) {
      this.speed = 0;
      return;
    }

    if (controls.dash && this.canDash()) {
      this.triggerDash();
    }

    if (this.isDashing()) {
      this.dashDurationTimer = Math.max(0, this.dashDurationTimer - dt);
      this.speed = DASH_CONFIG.speed;
      this.rotation += controls.rotate * (this.config.rotationSpeed * 0.4) * dt;
      this.rotation = Math.atan2(Math.sin(this.rotation), Math.cos(this.rotation));
      this.x += Math.cos(this.rotation) * this.speed * dt;
      this.y += Math.sin(this.rotation) * this.speed * dt;
      return;
    }
    this.rotation += controls.rotate * this.config.rotationSpeed * dt;
    this.rotation = Math.atan2(Math.sin(this.rotation), Math.cos(this.rotation));
    let targetSpeed = 0;
    if (controls.forward > 0) {
      targetSpeed = this.config.forwardSpeed;
    } else if (controls.forward < 0) {
      targetSpeed = -this.config.reverseSpeed;
    }

    if (targetSpeed !== 0 && Math.sign(targetSpeed) === Math.sign(this.speed)) {
      if (this.speed < targetSpeed) {
        this.speed = Math.min(this.speed + this.config.acceleration * dt, targetSpeed);
      } else if (this.speed > targetSpeed) {
        this.speed = Math.max(this.speed - this.config.acceleration * dt, targetSpeed);
      }
    } else if (targetSpeed !== 0) {
      if (this.speed > 0) {
        this.speed = Math.max(this.speed - this.config.deceleration * dt, 0);
      } else if (this.speed < 0) {
        this.speed = Math.min(this.speed + this.config.deceleration * dt, 0);
      } else {
        const step = this.config.acceleration * dt;
        this.speed = targetSpeed > 0 ? Math.min(step, targetSpeed) : Math.max(-step, targetSpeed);
      }
    } else {
      if (this.speed > 0) {
        this.speed = Math.max(this.speed - this.config.deceleration * dt, 0);
      } else if (this.speed < 0) {
        this.speed = Math.min(this.speed + this.config.deceleration * dt, 0);
      }
    }

    this.x += Math.cos(this.rotation) * this.speed * dt;
    this.y += Math.sin(this.rotation) * this.speed * dt;
  }
}
