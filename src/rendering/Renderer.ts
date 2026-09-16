import { ARENA_CONFIG, BULLET_CONFIG, PLAYER_CONFIG } from '../config/gameplay';
import type { Bullet } from '../entities/Bullet';
import type { Tank } from '../entities/Tank';
import type { ArenaBounds } from '../types/game';

export class Renderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public scale = 1;
  public offsetX = 0;
  public offsetY = 0;

  private onResizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to obtain 2D rendering context');
    }
    this.ctx = context;

    this.onResizeHandler = () => this.resize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResizeHandler);
    }
    this.resize();
  }

  public resize(): void {
    if (typeof window === 'undefined') return;

    const dpr = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    this.canvas.width = Math.floor(viewportWidth * dpr);
    this.canvas.height = Math.floor(viewportHeight * dpr);
    this.canvas.style.width = `${viewportWidth}px`;
    this.canvas.style.height = `${viewportHeight}px`;

    const scaleX = viewportWidth / ARENA_CONFIG.width;
    const scaleY = viewportHeight / ARENA_CONFIG.height;
    this.scale = Math.min(scaleX, scaleY);

    this.offsetX = Math.floor((viewportWidth - ARENA_CONFIG.width * this.scale) / 2);
    this.offsetY = Math.floor((viewportHeight - ARENA_CONFIG.height * this.scale) / 2);
  }

  public render(tanks: readonly Tank[], bullets: readonly Bullet[], bounds: ArenaBounds): void {
    const ctx = this.ctx;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    // Reset transform & clear full canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply viewport scale and translation transform
    ctx.setTransform(
      this.scale * dpr,
      0,
      0,
      this.scale * dpr,
      this.offsetX * dpr,
      this.offsetY * dpr
    );

    // Arena background floor
    ctx.fillStyle = ARENA_CONFIG.backgroundColor;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Subtle arena grid
    ctx.strokeStyle = ARENA_CONFIG.gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = bounds.x; x <= bounds.x + bounds.width; x += ARENA_CONFIG.gridSize) {
      ctx.moveTo(x, bounds.y);
      ctx.lineTo(x, bounds.y + bounds.height);
    }
    for (let y = bounds.y; y <= bounds.y + bounds.height; y += ARENA_CONFIG.gridSize) {
      ctx.moveTo(bounds.x, y);
      ctx.lineTo(bounds.x + bounds.width, y);
    }
    ctx.stroke();

    // Arena boundary border walls
    ctx.strokeStyle = ARENA_CONFIG.borderColor;
    ctx.lineWidth = ARENA_CONFIG.wallThickness;
    ctx.strokeRect(
      bounds.x + ARENA_CONFIG.wallThickness / 2,
      bounds.y + ARENA_CONFIG.wallThickness / 2,
      bounds.width - ARENA_CONFIG.wallThickness,
      bounds.height - ARENA_CONFIG.wallThickness
    );

    // Render Bullets
    this.renderBullets(bullets);

    // Render Tanks
    for (const tank of tanks) {
      this.renderTank(tank);
    }

    // Minimal HUD Overlay
    const playerTank = tanks.find((t) => t.id === 'player') || tanks[0];
    const dummyTank = tanks.find((t) => t.id !== 'player');

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText('MINI TANK DUEL — PHASE 2: BASIC COMBAT', bounds.x + 20, bounds.y + 30);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px system-ui, sans-serif';
    ctx.fillText('CONTROLS: W/S (Drive)  A/D (Steer)  SPACE (Fire)', bounds.x + 20, bounds.y + 48);

    if (playerTank) {
      const isReady = playerTank.canFire();
      const cooldownRatio = playerTank.cooldownTimer / BULLET_CONFIG.cooldown;
      ctx.fillStyle = isReady ? '#38bdf8' : '#eab308';
      ctx.font = '600 12px system-ui, monospace';
      const reloadText = isReady ? 'CANNON: READY' : `RELOAD: ${(1 - cooldownRatio).toFixed(1)}s`;
      ctx.fillText(reloadText, bounds.x + 20, bounds.y + 68);
    }

    if (dummyTank) {
      ctx.fillStyle = dummyTank.isAlive() ? '#f43f5e' : '#64748b';
      ctx.font = '600 12px system-ui, monospace';
      const dummyText = dummyTank.isAlive()
        ? `TARGET DUMMY HP: ${dummyTank.hp}/${dummyTank.maxHp}`
        : 'TARGET DUMMY: DESTROYED';
      ctx.fillText(dummyText, bounds.x + bounds.width - 240, bounds.y + 30);
    }
  }

  private renderBullets(bullets: readonly Bullet[]): void {
    const ctx = this.ctx;
    for (const bullet of bullets) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);

      const speed = Math.hypot(bullet.vx, bullet.vy);
      const angle = Math.atan2(bullet.vy, bullet.vx);
      ctx.rotate(angle);

      // Tracer tail
      const tailLength = Math.min(16, speed * 0.03);
      const gradient = ctx.createLinearGradient(-tailLength, 0, bullet.radius, 0);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
      gradient.addColorStop(1, 'rgba(56, 189, 248, 0.9)');

      ctx.fillStyle = gradient;
      ctx.fillRect(-tailLength, -bullet.radius * 0.7, tailLength, bullet.radius * 1.4);

      // Bullet body
      ctx.fillStyle = BULLET_CONFIG.color;
      ctx.beginPath();
      ctx.arc(0, 0, bullet.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing center core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, bullet.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderTank(tank: Tank): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(tank.x, tank.y);

    // Draw HP pips above tank (in unrotated world orientation)
    const pipWidth = 8;
    const pipHeight = 3;
    const pipGap = 3;
    const totalPipsWidth = tank.maxHp * pipWidth + (tank.maxHp - 1) * pipGap;
    const startPipX = -totalPipsWidth / 2;
    const pipsY = -PLAYER_CONFIG.width / 2 - 12;

    for (let i = 0; i < tank.maxHp; i++) {
      const isFilled = i < tank.hp;
      ctx.fillStyle = isFilled
        ? tank.id === 'player'
          ? '#38bdf8'
          : '#f43f5e'
        : 'rgba(51, 65, 85, 0.6)';
      ctx.fillRect(startPipX + i * (pipWidth + pipGap), pipsY, pipWidth, pipHeight);
    }

    // Now rotate for tank chassis and turret
    ctx.rotate(tank.rotation);

    const length = PLAYER_CONFIG.length;
    const width = PLAYER_CONFIG.width;
    const halfLen = length / 2;
    const halfWid = width / 2;

    let treadColor: string = PLAYER_CONFIG.treadColor;
    let bodyColor: string = PLAYER_CONFIG.bodyColor;
    let accentColor: string = PLAYER_CONFIG.accentColor;

    if (!tank.isAlive()) {
      treadColor = '#1e293b';
      bodyColor = '#334155';
      accentColor = '#64748b';
    } else if (tank.id !== 'player') {
      treadColor = '#4c0519';
      bodyColor = '#be123c';
      accentColor = '#f43f5e';
    }

    // Treads (left and right dark tracks)
    const treadWidth = 6;
    ctx.fillStyle = treadColor;
    ctx.fillRect(-halfLen, -halfWid, length, treadWidth);
    ctx.fillRect(-halfLen, halfWid - treadWidth, length, treadWidth);

    // Chassis body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-halfLen + 2, -halfWid + treadWidth - 1, length - 4, width - treadWidth * 2 + 2);

    // Chassis outline
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfLen + 2, -halfWid + treadWidth - 1, length - 4, width - treadWidth * 2 + 2);

    // Barrel pointing along +X
    ctx.fillStyle = !tank.isAlive() ? '#64748b' : '#e2e8f0';
    ctx.fillRect(0, -PLAYER_CONFIG.barrelWidth / 2, PLAYER_CONFIG.barrelLength, PLAYER_CONFIG.barrelWidth);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, -PLAYER_CONFIG.barrelWidth / 2, PLAYER_CONFIG.barrelLength, PLAYER_CONFIG.barrelWidth);

    // Turret dome
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_CONFIG.turretRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction indicator chevron
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(halfLen - 4, 0);
    ctx.lineTo(halfLen - 10, -5);
    ctx.lineTo(halfLen - 8, 0);
    ctx.lineTo(halfLen - 10, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  public dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResizeHandler);
    }
  }
}
