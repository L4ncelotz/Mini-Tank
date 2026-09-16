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
  public alive: boolean;

  constructor(
    x: number,
    y: number,
    angle: number,
    ownerId: string,
    speed: number = BULLET_CONFIG.speed,
    radius: number = BULLET_CONFIG.radius,
    lifetime: number = BULLET_CONFIG.lifetime,
    damage: number = BULLET_CONFIG.damage
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
    this.alive = true;
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
