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

    // Internal Obstacle Walls
    this.renderWalls(walls);

    // Arena boundary border walls
    ctx.strokeStyle = ARENA_CONFIG.borderColor;
    ctx.lineWidth = ARENA_CONFIG.wallThickness;
    ctx.strokeRect(
      bounds.x + ARENA_CONFIG.wallThickness / 2,
      bounds.y + ARENA_CONFIG.wallThickness / 2,
      bounds.width - ARENA_CONFIG.wallThickness,
      bounds.height - ARENA_CONFIG.wallThickness
    );

    // Render Ricochet Bounce Impacts
    this.renderBounceImpacts(bounceImpacts);

    // Render Bullets
    this.renderBullets(bullets);

    // Render Tanks
    for (const tank of tanks) {
      this.renderTank(tank);
    }

    // Minimal HUD Overlay (Top-Left)
    const playerTank = tanks.find((t) => t.id === 'player') || tanks[0];
    const opponentTank = tanks.find((t) => t.id !== 'player');

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText('MINI TANK DUEL — PHASE 7: ARENA MAPS', bounds.x + 20, bounds.y + 30);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px system-ui, sans-serif';
    ctx.fillText('CONTROLS: W/S (Drive)  A/D (Steer)  SPACE (Fire)  M (Next Map)  F (Fullscreen)  R (Restart)', bounds.x + 20, bounds.y + 48);

    // Map Badge
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 12px system-ui, sans-serif';
    ctx.fillText(`MAP: ${(mapName || 'OPEN ARENA').toUpperCase()}`, bounds.x + 20, bounds.y + 68);

    if (playerTank) {
      const isReady = playerTank.canFire();
      const cooldownRatio = playerTank.cooldownTimer / BULLET_CONFIG.cooldown;
      ctx.fillStyle = isReady ? '#38bdf8' : '#eab308';
      ctx.font = '600 12px system-ui, monospace';
      const reloadText = isReady ? 'CANNON: READY' : `RELOAD: ${(1 - cooldownRatio).toFixed(1)}s`;
      ctx.fillText(reloadText, bounds.x + 190, bounds.y + 68);
    }

    // AI Opponent Status (Top-Right)
    if (opponentTank) {
      ctx.fillStyle = opponentTank.isAlive() ? '#f43f5e' : '#64748b';
      ctx.font = '600 12px system-ui, monospace';
      const stateSuffix = opponentTank.isAlive() && aiState ? ` [${aiState.toUpperCase()}]` : '';
      const aiText = opponentTank.isAlive()
        ? `AI OPPONENT HP: ${opponentTank.hp}/${opponentTank.maxHp}${stateSuffix}`
        : 'AI OPPONENT: DESTROYED';
      ctx.fillText(aiText, bounds.x + bounds.width - 320, bounds.y + 30);
    }
    // Best-of-5 Scoreboard (Top Center)
    if (score) {
      this.renderScoreboard(score, bounds);
      this.renderStateBanner(score, bounds);
    }
  }

  private renderWalls(walls: readonly Wall[]): void {
    const ctx = this.ctx;
    for (const wall of walls) {
      // Wall fill
      ctx.fillStyle = wall.color || '#1e293b';
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

      // Wall border
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

      // Inner tactical bevel accent lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(wall.x + 3, wall.y + 3, wall.width - 6, wall.height - 6);
    }
  }

  private renderScoreboard(score: MatchScore, bounds: ArenaBounds): void {
    const ctx = this.ctx;
    const centerX = bounds.x + bounds.width / 2;

    // Match format title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ROUND ${score.currentRound}  •  BEST OF 5 (FIRST TO 3)`, centerX, bounds.y + 26);

    // Score numbers
    ctx.font = '800 22px system-ui, monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${score.playerScore}`, centerX - 40, bounds.y + 54);

    ctx.fillStyle = '#64748b';
    ctx.fillText('-', centerX, bounds.y + 54);

    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`${score.opponentScore}`, centerX + 40, bounds.y + 54);

    // Round win dots/pips for player and opponent
    const pipRadius = 4;
    const pipGap = 12;
    for (let i = 0; i < score.roundsToWin; i++) {
      // Player pips (left of center)
      ctx.fillStyle = i < score.playerScore ? '#38bdf8' : '#1e293b';
      ctx.beginPath();
      ctx.arc(centerX - 60 - i * pipGap, bounds.y + 48, pipRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = i < score.playerScore ? '#0284c7' : '#334155';
      ctx.stroke();

      // Opponent pips (right of center)
      ctx.fillStyle = i < score.opponentScore ? '#f43f5e' : '#1e293b';
      ctx.beginPath();
      ctx.arc(centerX + 60 + i * pipGap, bounds.y + 48, pipRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = i < score.opponentScore ? '#be123c' : '#334155';
      ctx.stroke();
    }

    ctx.textAlign = 'left';
  }

  private renderStateBanner(score: MatchScore, bounds: ArenaBounds): void {
    const ctx = this.ctx;
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height * 0.35;

    if (score.state === 'ready') {
      ctx.save();
      ctx.textAlign = 'center';

      // Backdrop card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(centerX - 160, centerY - 45, 320, 90);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 160, centerY - 45, 320, 90);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px system-ui, sans-serif';
      ctx.fillText('READY', centerX, centerY + 2);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '600 14px system-ui, sans-serif';
      ctx.fillText(`ROUND ${score.currentRound} BEGINS IN ${score.stateTimer.toFixed(1)}s`, centerX, centerY + 28);

      ctx.restore();
    } else if (score.state === 'round_over') {
      ctx.save();
      ctx.textAlign = 'center';

      const isPlayerWinner = score.roundWinner === 'player';
      const bannerColor = isPlayerWinner ? '#38bdf8' : '#f43f5e';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(centerX - 200, centerY - 45, 400, 90);
      ctx.strokeStyle = bannerColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 200, centerY - 45, 400, 90);

      ctx.fillStyle = bannerColor;
      ctx.font = '900 26px system-ui, sans-serif';
      const winnerTitle = score.roundWinner === 'draw'
        ? 'ROUND DRAW!'
        : isPlayerWinner
          ? 'ROUND WON!'
          : 'ROUND LOST!';
      ctx.fillText(winnerTitle, centerX, centerY + 2);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px system-ui, sans-serif';
      ctx.fillText(`NEXT ROUND IN ${score.stateTimer.toFixed(1)}s`, centerX, centerY + 28);

      ctx.restore();
    } else if (score.state === 'match_over') {
      ctx.save();
      ctx.textAlign = 'center';

      const isPlayerWinner = score.matchWinner === 'player';
      const bannerColor = isPlayerWinner ? '#38bdf8' : '#f43f5e';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(centerX - 240, centerY - 65, 480, 130);
      ctx.strokeStyle = bannerColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(centerX - 240, centerY - 65, 480, 130);

      ctx.fillStyle = bannerColor;
      ctx.font = '900 32px system-ui, sans-serif';
      ctx.fillText(isPlayerWinner ? 'VICTORY!' : 'DEFEAT!', centerX, centerY - 15);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 18px system-ui, sans-serif';
      ctx.fillText(
        isPlayerWinner ? 'PLAYER WINS THE MATCH' : 'AI OPPONENT WINS THE MATCH',
        centerX,
        centerY + 16
      );

      ctx.fillStyle = '#fbbf24';
      ctx.font = '600 14px system-ui, monospace';
      ctx.fillText('PRESS [R] TO PLAY AGAIN', centerX, centerY + 46);

      ctx.restore();
    }
  }

  private renderBounceImpacts(impacts: readonly BounceImpact[]): void {
    const ctx = this.ctx;
    for (const impact of impacts) {
      const progress = 1 - impact.timer / impact.maxTime;
      const alpha = Math.max(0, 1 - progress);
      const radius = 6 + progress * 22;

      ctx.save();
      ctx.translate(impact.x, impact.y);

      // Expanding flash ring
      ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
      ctx.lineWidth = 2.5 * alpha;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner flash spark
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(0, 0, 4 * (1 - progress), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
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

      const isBounced = bullet.bounces > 0;
      const bulletColor = isBounced ? BULLET_CONFIG.bouncedColor : BULLET_CONFIG.color;

      // Tracer tail
      const tailLength = Math.min(isBounced ? 24 : 16, speed * 0.04);
      const gradient = ctx.createLinearGradient(-tailLength, 0, bullet.radius, 0);
      if (isBounced) {
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.9)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(-tailLength, -bullet.radius * 0.7, tailLength, bullet.radius * 1.4);

      // Outer glow for bounced bullet
      if (isBounced) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.beginPath();
        ctx.arc(0, 0, bullet.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bullet body
      ctx.fillStyle = bulletColor;
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

    // Muzzle brake ring at the tip of the barrel
    ctx.fillStyle = accentColor;
    ctx.fillRect(
      PLAYER_CONFIG.barrelLength - 3,
      -PLAYER_CONFIG.barrelWidth / 2 - 1,
      3,
      PLAYER_CONFIG.barrelWidth + 2
    );
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
      window.removeEventListener('keydown', this.onKeyHandler);
    }
    this.canvas.removeEventListener('dblclick', this.onDblClickHandler);
  }
}
