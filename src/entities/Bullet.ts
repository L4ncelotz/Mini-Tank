import { BULLET_CONFIG } from '../config/gameplay';

export class Bullet {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public speed: number;
  public radius: number;
  public lifetime: number;
  public maxLifetime: number;
  public ownerId: string;
  public damage: number;
  public bounces: number;
  public maxBounces: number;
  public alive: boolean;

  constructor(
    x: number,
    y: number,
    angle: number,
    ownerId: string,
    speed: number = BULLET_CONFIG.speed,
    radius: number = BULLET_CONFIG.radius,
    lifetime: number = BULLET_CONFIG.lifetime,
    damage: number = BULLET_CONFIG.damage,
    maxBounces: number = BULLET_CONFIG.maxBounces
  ) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = radius;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.ownerId = ownerId;
    this.damage = damage;
    this.bounces = 0;
    this.maxBounces = maxBounces;
    this.alive = true;
  }

  public canBounce(): boolean {
    return this.bounces < this.maxBounces;
  }

  public bounce(normalX: number, normalY: number): boolean {
    if (!this.canBounce()) {
      this.destroy();
      return false;
    }

    const dot = this.vx * normalX + this.vy * normalY;
    this.vx = this.vx - 2 * dot * normalX;
    this.vy = this.vy - 2 * dot * normalY;
    this.bounces++;
    return true;
  }

  public update(dt: number): void {
    if (!this.alive) return;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.lifetime -= dt;

    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }

  public destroy(): void {
    this.alive = false;
  }
}
