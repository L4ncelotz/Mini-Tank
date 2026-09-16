import { ARENA_CONFIG, BULLET_CONFIG, PLAYER_CONFIG } from '../config/gameplay';
import type { TacticalState } from '../ai/AIConfig';
import type { Bullet } from '../entities/Bullet';
import type { Tank } from '../entities/Tank';
import type { BounceImpact } from '../systems/CombatSystem';
import type { ArenaBounds, MatchScore, Wall } from '../types/game';

export class Renderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public scale = 1;
  public offsetX = 0;
  public offsetY = 0;
  private onResizeHandler: () => void;
  private onKeyHandler: (e: KeyboardEvent) => void;
  private onDblClickHandler: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to obtain 2D rendering context');
    }
    this.ctx = context;

    this.onResizeHandler = () => this.resize();
    this.onKeyHandler = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        this.toggleFullscreen();
      }
    };
    this.onDblClickHandler = () => this.toggleFullscreen();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResizeHandler);
      window.addEventListener('keydown', this.onKeyHandler);
      this.canvas.addEventListener('dblclick', this.onDblClickHandler);
    }
    this.resize();
  }

  public toggleFullscreen(): void {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
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

  public render(
    tanks: readonly Tank[],
    bullets: readonly Bullet[],
    bounds: ArenaBounds,
    walls: readonly Wall[] = [],
    bounceImpacts: readonly BounceImpact[] = [],
    score?: MatchScore,
    aiState?: TacticalState,
    mapName?: string
  ): void {
    const ctx = this.ctx;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    // Reset transform & clear full canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#03060c';
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

    // 1. High-Tech Cyber Battlefield Floor & Boundaries
    this.renderFloor(bounds);

    // 2. Heavy Armored Obstacle Bastions
    this.renderWalls(walls);

    // 3. Ricochet Bounce Shockwaves & Sparks
    this.renderBounceImpacts(bounceImpacts);

    // 4. Glowing Plasma Projectiles
    this.renderBullets(bullets);

    // 5. Heavy Armored Combat Tanks
    for (const tank of tanks) {
      this.renderTank(tank);
    }

    // 6. Tournament Broadcast HUD Overlay
    this.renderHUD(tanks, bounds, mapName, aiState);

    // 7. Best-of-5 Scoreboard & Match State Banners
    if (score) {
      this.renderScoreboard(score, bounds);
      this.renderStateBanner(score, bounds);
    }
  }

  private renderFloor(bounds: ArenaBounds): void {
    const ctx = this.ctx;
    const cx = bounds.x + bounds.width / 2;
    const cy = bounds.y + bounds.height / 2;

    // Ambient radial lighting gradient from center outward
    const ambientGradient = ctx.createRadialGradient(
      cx, cy, 100,
      cx, cy, Math.max(bounds.width, bounds.height) * 0.75
    );
    ambientGradient.addColorStop(0, '#0d1629');
    ambientGradient.addColorStop(0.65, '#070b16');
    ambientGradient.addColorStop(1, '#04070e');

    ctx.fillStyle = ambientGradient;
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Cyber Combat Grid
    ctx.strokeStyle = 'rgba(23, 37, 68, 0.45)';
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

    // Grid Intersection Crosshairs
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    for (let x = bounds.x; x <= bounds.x + bounds.width; x += ARENA_CONFIG.gridSize * 2) {
      for (let y = bounds.y; y <= bounds.y + bounds.height; y += ARENA_CONFIG.gridSize * 2) {
        ctx.fillRect(x - 2, y - 0.5, 5, 1);
        ctx.fillRect(x - 0.5, y - 2, 1, 5);
      }
    }

    // Central Duel Combat Rings
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.arc(cx, cy, 280, 0, Math.PI * 2);
    ctx.stroke();

    // Center Crosshair
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);
    ctx.lineTo(cx + 20, cy);
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx, cy + 20);
    ctx.stroke();
    ctx.restore();

    // Glowing Neon Perimeter Wall
    ctx.save();
    ctx.shadowColor = 'rgba(0, 240, 255, 0.45)';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      bounds.x + 3,
      bounds.y + 3,
      bounds.width - 6,
      bounds.height - 6
    );

    // Inner Energy Rail
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      bounds.x + 10,
      bounds.y + 10,
      bounds.width - 20,
      bounds.height - 20
    );

    // L-Shaped Corner Reinforcement Brackets
    const bracketSize = 28;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(bounds.x + bracketSize, bounds.y + 3);
    ctx.lineTo(bounds.x + 3, bounds.y + 3);
    ctx.lineTo(bounds.x + 3, bounds.y + bracketSize);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(bounds.x + bounds.width - bracketSize, bounds.y + 3);
    ctx.lineTo(bounds.x + bounds.width - 3, bounds.y + 3);
    ctx.lineTo(bounds.x + bounds.width - 3, bounds.y + bracketSize);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(bounds.x + 3, bounds.y + bounds.height - bracketSize);
    ctx.lineTo(bounds.x + 3, bounds.y + bounds.height - 3);
    ctx.lineTo(bounds.x + bracketSize, bounds.y + bounds.height - 3);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(bounds.x + bounds.width - bracketSize, bounds.y + bounds.height - 3);
    ctx.lineTo(bounds.x + bounds.width - 3, bounds.y + bounds.height - 3);
    ctx.lineTo(bounds.x + bounds.width - 3, bounds.y + bounds.height - bracketSize);
    ctx.stroke();
    ctx.restore();
  }

  private renderWalls(walls: readonly Wall[]): void {
    const ctx = this.ctx;
    for (const wall of walls) {
      ctx.save();

      // Drop Shadow for 3D Wall Elevation
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(wall.x + 4, wall.y + 6, wall.width, wall.height);

      // Heavy Armored Bastion Base
      ctx.fillStyle = '#0a101f';
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

      // Inner Beveled Armor Plate
      ctx.fillStyle = '#101c33';
      ctx.fillRect(wall.x + 3, wall.y + 3, wall.width - 6, wall.height - 6);

      // Center High-Tech Inset Panel
      ctx.fillStyle = '#152442';
      ctx.fillRect(wall.x + 7, wall.y + 7, wall.width - 14, wall.height - 14);

      // Central Energy Conduit
      if (wall.width >= wall.height) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.fillRect(wall.x + 12, wall.y + wall.height / 2 - 1.5, wall.width - 24, 3);
      } else {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.fillRect(wall.x + wall.width / 2 - 1.5, wall.y + 12, 3, wall.height - 24);
      }

      // Glowing Neon Perimeter Border
      ctx.shadowColor = 'rgba(0, 240, 255, 0.45)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

      // Reinforced Corner Armor Studs (individual rects)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(wall.x + 4, wall.y + 4, 3, 3);
      ctx.fillRect(wall.x + wall.width - 7, wall.y + 4, 3, 3);
      ctx.fillRect(wall.x + 4, wall.y + wall.height - 7, 3, 3);
      ctx.fillRect(wall.x + wall.width - 7, wall.y + wall.height - 7, 3, 3);

      ctx.restore();
    }
  }

  private renderTank(tank: Tank): void {
    const ctx = this.ctx;
    ctx.save();

    const isPlayer = tank.id === 'player';
    const isAlive = tank.isAlive();

    // Futuristic Theme Colors
    const primaryColor = isAlive ? (isPlayer ? '#0284c7' : '#be123c') : '#334155';
    const darkPlateColor = isAlive ? (isPlayer ? '#034e7b' : '#700c24') : '#1e293b';
    const neonGlowColor = isAlive ? (isPlayer ? '#00f0ff' : '#ff0055') : '#64748b';
    const treadFrameColor = isAlive ? (isPlayer ? '#081220' : '#1c050c') : '#0f172a';
    const treadTrackColor = isAlive ? '#222f46' : '#1e293b';

    const length = PLAYER_CONFIG.length;
    const width = PLAYER_CONFIG.width;
    const halfLen = length / 2;
    const halfWid = width / 2;

    // 1. Tank Drop Shadow for Grounding Mass
    ctx.save();
    ctx.translate(tank.x + 3, tank.y + 5);
    ctx.rotate(tank.rotation);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.ellipse(0, 0, halfLen + 4, halfWid + 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Health Battery Bar Above Tank (World-Space unrotated)
    ctx.save();
    ctx.translate(tank.x, tank.y);
    const barWidth = 44;
    const barHeight = 5;
    const barY = -halfWid - 16;

    // Battery Container
    ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
    ctx.fillRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

    // Segmented Cells
    const segmentGap = 2;
    const segmentWidth = (barWidth - (tank.maxHp - 1) * segmentGap) / tank.maxHp;

    for (let i = 0; i < tank.maxHp; i++) {
      const segX = -barWidth / 2 + i * (segmentWidth + segmentGap);
      if (i < tank.hp) {
        ctx.fillStyle = isPlayer ? '#00f0ff' : '#ff0055';
        ctx.shadowColor = isPlayer ? '#00f0ff' : '#ff0055';
        ctx.shadowBlur = 4;
      } else {
        ctx.fillStyle = 'rgba(51, 65, 85, 0.5)';
        ctx.shadowBlur = 0;
      }
      ctx.fillRect(segX, barY, segmentWidth, barHeight);
    }
    ctx.restore();

    // 3. Tank Local Space (Transformed & Rotated)
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.rotation);

    // Treads (Left & Right Track Units)
    const treadWidth = 7;
    const treadY1 = -halfWid;
    const treadY2 = halfWid - treadWidth;

    // Track Frames
    ctx.fillStyle = treadFrameColor;
    ctx.fillRect(-halfLen, treadY1, length, treadWidth);
    ctx.fillRect(-halfLen, treadY2, length, treadWidth);

    // Individual Segmented Tread Pads
    ctx.fillStyle = treadTrackColor;
    const numPads = 6;
    const padStep = length / numPads;
    for (let i = 0; i < numPads; i++) {
      const px = -halfLen + i * padStep + 1;
      ctx.fillRect(px, treadY1 + 1, padStep - 2, treadWidth - 2);
      ctx.fillRect(px, treadY2 + 1, padStep - 2, treadWidth - 2);
    }

    // Outer Tread Frame Bevel
    ctx.strokeStyle = neonGlowColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(-halfLen, treadY1, length, treadWidth);
    ctx.strokeRect(-halfLen, treadY2, length, treadWidth);

    // 4. Main Armored Chassis Hull
    ctx.fillStyle = primaryColor;
    const hullX = -halfLen + 2;
    const hullY = -halfWid + treadWidth - 1;
    const hullW = length - 4;
    const hullH = width - treadWidth * 2 + 2;

    // Chamfered / Sloped Hull Shape
    ctx.beginPath();
    ctx.moveTo(hullX + 6, hullY);
    ctx.lineTo(hullX + hullW - 4, hullY + 2);
    ctx.lineTo(hullX + hullW, hullY + hullH / 2);
    ctx.lineTo(hullX + hullW - 4, hullY + hullH - 2);
    ctx.lineTo(hullX + 6, hullY + hullH);
    ctx.lineTo(hullX, hullY + hullH - 4);
    ctx.lineTo(hullX, hullY + 4);
    ctx.closePath();
    ctx.fill();

    // Dual-Tone Dark Armor Insets
    ctx.fillStyle = darkPlateColor;
    ctx.fillRect(hullX + 4, hullY + 3, hullW - 10, hullH - 6);

    // Rear Engine Exhaust / Reactor Vents
    if (isAlive) {
      ctx.save();
      ctx.shadowColor = neonGlowColor;
      ctx.shadowBlur = 6;
      ctx.fillStyle = neonGlowColor;
      ctx.fillRect(hullX - 1, hullY + 3, 2, 4);
      ctx.fillRect(hullX - 1, hullY + hullH - 7, 2, 4);
      ctx.restore();
    }

    // Hull Edge Accent Stroke
    ctx.strokeStyle = neonGlowColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Front Illuminated Glacis Plate Chevron
    ctx.fillStyle = neonGlowColor;
    ctx.beginPath();
    ctx.moveTo(halfLen - 6, 0);
    ctx.lineTo(halfLen - 12, -4);
    ctx.lineTo(halfLen - 10, 0);
    ctx.lineTo(halfLen - 12, 4);
    ctx.closePath();
    ctx.fill();

    // 5. Dual-Channel Railgun Cannon Barrel
    const barrelLen = PLAYER_CONFIG.barrelLength;
    const barrelWid = PLAYER_CONFIG.barrelWidth;
    const halfBW = barrelWid / 2;

    // Main Barrel Housing
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, -halfBW, barrelLen, barrelWid);
    ctx.strokeStyle = neonGlowColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, -halfBW, barrelLen, barrelWid);

    // Glowing Rail Energy Conduits
    if (isAlive) {
      ctx.fillStyle = neonGlowColor;
      ctx.fillRect(4, -halfBW + 1, barrelLen - 8, 1);
      ctx.fillRect(4, halfBW - 2, barrelLen - 8, 1);
    }

    // Heavy Reinforced Muzzle Brake
    ctx.fillStyle = isAlive ? neonGlowColor : '#64748b';
    ctx.fillRect(barrelLen - 3, -halfBW - 1, 3, barrelWid + 2);

    // Muzzle Emitter Port Glow
    if (isAlive) {
      ctx.save();
      ctx.shadowColor = neonGlowColor;
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(barrelLen - 1, -1, 1.5, 2);
      ctx.restore();
    }

    // 6. Faceted Armored Turret Housing
    const tRadius = PLAYER_CONFIG.turretRadius;
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, tRadius + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = neonGlowColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner Turret Cupola
    ctx.fillStyle = darkPlateColor;
    ctx.beginPath();
    ctx.arc(0, 0, tRadius - 2, 0, Math.PI * 2);
    ctx.fill();

    // Commander Sensor Optic Eye
    if (isAlive) {
      ctx.save();
      ctx.shadowColor = neonGlowColor;
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(1, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }

  private renderBullets(bullets: readonly Bullet[]): void {
    const ctx = this.ctx;
    for (const bullet of bullets) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);

      const speed = Math.hypot(bullet.vx, bullet.vy);
      const angle = Math.atan2(bullet.vy, bullet.vx);
      ctx.rotate(angle);

      const isBounced = bullet.bounces > 0;
      const plasmaColor = isBounced ? '#ffaa00' : '#00f0ff';
      const tailColor = isBounced ? 'rgba(255, 170, 0, 0.85)' : 'rgba(0, 240, 255, 0.85)';

      // Canvas Bloom Glow
      ctx.shadowColor = plasmaColor;
      ctx.shadowBlur = 12;

      // Dynamic Laser Streak Tail
      const tailLength = Math.min(isBounced ? 32 : 22, speed * 0.05);
      const gradient = ctx.createLinearGradient(-tailLength, 0, bullet.radius, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, tailColor);
      gradient.addColorStop(1, '#ffffff');

      ctx.fillStyle = gradient;
      ctx.fillRect(-tailLength, -bullet.radius * 0.65, tailLength, bullet.radius * 1.3);

      // Outer Plasma Envelope
      ctx.fillStyle = plasmaColor;
      ctx.beginPath();
      ctx.arc(0, 0, bullet.radius + 1.5, 0, Math.PI * 2);
      ctx.fill();

      // White Kinetic Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, bullet.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderBounceImpacts(impacts: readonly BounceImpact[]): void {
    const ctx = this.ctx;
    for (const impact of impacts) {
      const progress = 1 - impact.timer / impact.maxTime;
      const alpha = Math.max(0, 1 - progress);
      const radius = 8 + progress * 26;

      ctx.save();
      ctx.translate(impact.x, impact.y);

      // Expanding Shockwave Flash Ring
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(255, 170, 0, ${alpha * 0.9})`;
      ctx.lineWidth = 3 * alpha;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Second Inner Shock Ring
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.5 * alpha;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // White Center Flash Dot
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 5 * (1 - progress), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderHUD(
    tanks: readonly Tank[],
    bounds: ArenaBounds,
    mapName?: string,
    aiState?: TacticalState
  ): void {
    const ctx = this.ctx;
    const playerTank = tanks.find((t) => t.id === 'player') || tanks[0];
    const opponentTank = tanks.find((t) => t.id !== 'player');

    // 1. Top Glass Broadcast Bar
    ctx.save();
    const barH = 58;
    ctx.fillStyle = 'rgba(7, 12, 24, 0.85)';
    ctx.fillRect(bounds.x + 14, bounds.y + 14, bounds.width - 28, barH);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bounds.x + 14, bounds.y + 14, bounds.width - 28, barH);

    // Left: Player Profile & Reload Energy Meter
    ctx.font = '700 13px "Rajdhani", system-ui, sans-serif';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('OPERATOR // P1', bounds.x + 30, bounds.y + 36);

    if (playerTank) {
      const isReady = playerTank.canFire();
      const cooldownRatio = Math.min(1, Math.max(0, 1 - playerTank.cooldownTimer / BULLET_CONFIG.cooldown));
      const meterW = 120;
      const meterH = 6;
      const meterY = bounds.y + 46;

      ctx.fillStyle = 'rgba(11, 25, 44, 0.9)';
      ctx.fillRect(bounds.x + 30, meterY, meterW, meterH);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(bounds.x + 30, meterY, meterW, meterH);

      // Filled Energy Meter
      ctx.fillStyle = isReady ? '#00f0ff' : '#eab308';
      ctx.shadowColor = isReady ? '#00f0ff' : '#eab308';
      ctx.shadowBlur = isReady ? 6 : 0;
      ctx.fillRect(bounds.x + 30, meterY, meterW * cooldownRatio, meterH);

      ctx.shadowBlur = 0;
      ctx.font = '700 11px "Rajdhani", monospace';
      ctx.fillStyle = isReady ? '#00f0ff' : '#94a3b8';
      ctx.fillText(isReady ? 'CANNON ARMED' : 'RELOADING...', bounds.x + 160, meterY + 6);
    }

    // Right: Opponent Profile & Tactical State Badge
    if (opponentTank) {
      const rightX = bounds.x + bounds.width - 280;
      ctx.font = '700 13px "Rajdhani", system-ui, sans-serif';
      ctx.fillStyle = '#ff0055';
      ctx.fillText('TACTICAL AI // CPU', rightX, bounds.y + 36);

      // Tactical State Badge
      if (opponentTank.isAlive() && aiState) {
        const stateColors: Record<TacticalState, string> = {
          engage: '#38bdf8',
          evade: '#fbbf24',
          pressure: '#ff0055',
          recover: '#a855f7',
          reposition: '#38bdf8',
        };
        const badgeColor = stateColors[aiState] || '#38bdf8';
        ctx.font = '700 11px "Rajdhani", monospace';
        ctx.fillStyle = badgeColor;
        ctx.fillText(`[${aiState.toUpperCase()}]`, rightX + 130, bounds.y + 36);
      } else if (!opponentTank.isAlive()) {
        ctx.font = '700 11px "Rajdhani", monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('[DESTROYED]', rightX + 130, bounds.y + 36);
      }

      // Opponent Health Indicator
      ctx.font = '600 11px "Rajdhani", monospace';
      ctx.fillStyle = opponentTank.isAlive() ? '#ff0055' : '#64748b';
      ctx.fillText(`HP: ${opponentTank.hp} / ${opponentTank.maxHp}`, rightX, bounds.y + 52);
    }
    ctx.restore();

    // 2. Bottom Controls Strip & Map Badge
    ctx.save();
    const bottomY = bounds.y + bounds.height - 24;
    ctx.font = '600 12px "Rajdhani", system-ui, sans-serif';

    // Controls Badges
    const pills = [
      { key: 'W/S', label: 'DRIVE' },
      { key: 'A/D', label: 'STEER' },
      { key: 'SPACE', label: 'FIRE' },
      { key: 'M', label: 'MAP' },
      { key: 'F', label: 'FULLSCREEN' },
      { key: 'R', label: 'RESTART' },
    ];

    let px = bounds.x + 24;
    for (const pill of pills) {
      // Key pill box
      const keyW = ctx.measureText(pill.key).width + 10;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(px, bottomY - 14, keyW, 18);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px, bottomY - 14, keyW, 18);

      ctx.fillStyle = '#00f0ff';
      ctx.fillText(pill.key, px + 5, bottomY);

      px += keyW + 6;
      ctx.fillStyle = '#64748b';
      ctx.fillText(pill.label, px, bottomY);
      px += ctx.measureText(pill.label).width + 14;
    }

    // Map Indicator Badge (Bottom-Right)
    const mapText = `ARENA // ${(mapName || 'OPEN ARENA').toUpperCase()}`;
    const mapW = ctx.measureText(mapText).width + 18;
    const mapX = bounds.x + bounds.width - mapW - 24;

    ctx.fillStyle = 'rgba(7, 12, 24, 0.85)';
    ctx.fillRect(mapX, bottomY - 16, mapW, 20);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, bottomY - 16, mapW, 20);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '700 12px "Rajdhani", sans-serif';
    ctx.fillText(mapText, mapX + 9, bottomY - 1);
    ctx.restore();
  }

  private renderScoreboard(score: MatchScore, bounds: ArenaBounds): void {
    const ctx = this.ctx;
    const centerX = bounds.x + bounds.width / 2;

    ctx.save();
    ctx.textAlign = 'center';

    // Best-of-5 Title
    ctx.font = '700 12px "Rajdhani", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText(`ROUND ${score.currentRound} // FIRST TO ${score.roundsToWin}`, centerX, bounds.y + 32);

    // Scoreboard Numbers
    ctx.font = '800 24px "Rajdhani", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`${score.playerScore}`, centerX - 32, bounds.y + 56);

    ctx.fillStyle = '#475569';
    ctx.fillText(':', centerX, bounds.y + 55);

    ctx.fillStyle = '#ff0055';
    ctx.fillText(`${score.opponentScore}`, centerX + 32, bounds.y + 56);

    // Glowing Diamond Win Badges
    const drawDiamond = (x: number, y: number, size: number, filled: boolean, color: string) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();

      if (filled) {
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    };

    const diamondSize = 4;
    const gap = 12;
    for (let i = 0; i < score.roundsToWin; i++) {
      // Player diamonds (left of center)
      drawDiamond(centerX - 54 - i * gap, bounds.y + 50, diamondSize, i < score.playerScore, '#00f0ff');
      // Opponent diamonds (right of center)
      drawDiamond(centerX + 54 + i * gap, bounds.y + 50, diamondSize, i < score.opponentScore, '#ff0055');
    }

    ctx.restore();
  }

  private renderStateBanner(score: MatchScore, bounds: ArenaBounds): void {
    const ctx = this.ctx;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height * 0.4;

    if (score.state === 'ready') {
      ctx.save();
      ctx.textAlign = 'center';

      // Frosted Glass Cyber Card
      const cardW = 340;
      const cardH = 96;
      ctx.fillStyle = 'rgba(7, 12, 24, 0.92)';
      ctx.fillRect(centerX - cardW / 2, centerY - cardH / 2, cardW, cardH);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      ctx.shadowBlur = 12;
      ctx.strokeRect(centerX - cardW / 2, centerY - cardH / 2, cardW, cardH);

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 36px "Chakra Petch", "Rajdhani", sans-serif';
      ctx.fillText('READY', centerX, centerY + 4);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '700 13px "Rajdhani", monospace';
      ctx.fillText(`ENGAGING IN ${score.stateTimer.toFixed(1)}S`, centerX, centerY + 30);

      ctx.restore();
    } else if (score.state === 'round_over') {
      ctx.save();
      ctx.textAlign = 'center';

      const isPlayerWinner = score.roundWinner === 'player';
      const isDraw = score.roundWinner === 'draw';
      const bannerColor = isDraw ? '#94a3b8' : (isPlayerWinner ? '#00f0ff' : '#ff0055');

      const cardW = 380;
      const cardH = 96;
      ctx.fillStyle = 'rgba(7, 12, 24, 0.94)';
      ctx.fillRect(centerX - cardW / 2, centerY - cardH / 2, cardW, cardH);
      ctx.strokeStyle = bannerColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = bannerColor;
      ctx.shadowBlur = 12;
      ctx.strokeRect(centerX - cardW / 2, centerY - cardH / 2, cardW, cardH);

      ctx.shadowBlur = 0;
      ctx.fillStyle = bannerColor;
      ctx.font = '800 30px "Chakra Petch", "Rajdhani", sans-serif';
      const winnerTitle = isDraw
        ? 'STALEMATE // DRAW'
        : (isPlayerWinner ? 'ROUND WON' : 'ROUND LOST');
      ctx.fillText(winnerTitle, centerX, centerY + 4);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px "Rajdhani", monospace';
      ctx.fillText(`NEXT ROUND IN ${score.stateTimer.toFixed(1)}S`, centerX, centerY + 30);

      ctx.restore();
    } else if (score.state === 'match_over') {
      ctx.save();
      ctx.textAlign = 'center';

      const isPlayerWinner = score.matchWinner === 'player';
      const bannerColor = isPlayerWinner ? '#00f0ff' : '#ff0055';

      const cardW = 460;
      const cardH = 130;
      ctx.fillStyle = 'rgba(7, 12, 24, 0.96)';
      ctx.fillRect(centerX - cardW / 2, centerY - cardH / 2, cardW, cardH);
      ctx.strokeStyle = bannerColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = bannerColor;
      ctx.shadowBlur = 16;
      ctx.strokeRect(centerX - cardW / 2, centerY - cardH / 2, cardW, cardH);

      ctx.shadowBlur = 0;
      ctx.fillStyle = bannerColor;
      ctx.font = '900 36px "Chakra Petch", "Rajdhani", sans-serif';
      ctx.fillText(isPlayerWinner ? 'VICTORY' : 'DEFEAT', centerX, centerY - 14);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 16px "Rajdhani", sans-serif';
      ctx.fillText(
        isPlayerWinner ? 'PLAYER WINS THE MATCH' : 'TACTICAL AI WINS THE MATCH',
        centerX,
        centerY + 16
      );

      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 13px "Rajdhani", monospace';
      ctx.fillText('PRESS [R] TO PLAY AGAIN', centerX, centerY + 44);

      ctx.restore();
    }
  }

  public dispose(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResizeHandler);
      window.removeEventListener('keydown', this.onKeyHandler);
    }
    this.canvas.removeEventListener('dblclick', this.onDblClickHandler);
  }
}
