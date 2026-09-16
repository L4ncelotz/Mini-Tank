import { PLAYER_CONFIG } from '../config/gameplay';
import type { TankControls } from '../types/game';

export class Tank {
  public x: number;
  public y: number;
  public rotation: number;
  public speed: number;
  public radius: number;
  public config: typeof PLAYER_CONFIG;

  constructor(
    x: number,
    y: number,
    rotation = 0,
    config: typeof PLAYER_CONFIG = PLAYER_CONFIG
  ) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.config = config;
    this.radius = config.radius;
    this.speed = 0;
  }

  public update(dt: number, controls: TankControls): void {
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
