import { ARENA_CONFIG, PLAYER_CONFIG } from '../config/gameplay';
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

  public render(tank: Tank, bounds: ArenaBounds): void {
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

    // Render Tank
    this.renderTank(tank);

    // Minimal HUD Overlay (drawn in world coordinates at top of arena)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText('MINI TANK DUEL — PHASE 1: FOUNDATION', bounds.x + 20, bounds.y + 32);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px system-ui, sans-serif';
    ctx.fillText('CONTROLS: W/S (Drive)  A/D (Steer)', bounds.x + 20, bounds.y + 52);
  }

  private renderTank(tank: Tank): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.rotation);

    const length = PLAYER_CONFIG.length;
    const width = PLAYER_CONFIG.width;
    const halfLen = length / 2;
    const halfWid = width / 2;

    // Treads (left and right dark tracks)
    const treadWidth = 6;
    ctx.fillStyle = PLAYER_CONFIG.treadColor;
    ctx.fillRect(-halfLen, -halfWid, length, treadWidth);
    ctx.fillRect(-halfLen, halfWid - treadWidth, length, treadWidth);

    // Chassis body
    ctx.fillStyle = PLAYER_CONFIG.bodyColor;
    ctx.fillRect(-halfLen + 2, -halfWid + treadWidth - 1, length - 4, width - treadWidth * 2 + 2);

    // Chassis outline
    ctx.strokeStyle = PLAYER_CONFIG.accentColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfLen + 2, -halfWid + treadWidth - 1, length - 4, width - treadWidth * 2 + 2);

    // Barrel pointing along +X
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, -PLAYER_CONFIG.barrelWidth / 2, PLAYER_CONFIG.barrelLength, PLAYER_CONFIG.barrelWidth);
    ctx.strokeStyle = PLAYER_CONFIG.accentColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, -PLAYER_CONFIG.barrelWidth / 2, PLAYER_CONFIG.barrelLength, PLAYER_CONFIG.barrelWidth);

    // Turret dome
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_CONFIG.turretRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PLAYER_CONFIG.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction indicator chevron
    ctx.fillStyle = '#38bdf8';
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
