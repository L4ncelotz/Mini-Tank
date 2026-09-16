import { ARENA_CONFIG } from '../config/gameplay';
import { Tank } from '../entities/Tank';
import { GameLoop } from './GameLoop';
import { InputManager } from '../input/InputManager';
import { Renderer } from '../rendering/Renderer';
import { CollisionSystem } from '../systems/CollisionSystem';
import { CombatSystem } from '../systems/CombatSystem';
import type { ArenaBounds } from '../types/game';

export class Game {
  public arenaBounds: ArenaBounds;
  public playerTank: Tank;
  public dummyTank: Tank | null;
  public input: InputManager;
  public combat: CombatSystem;
  public renderer: Renderer;
  public loop: GameLoop;

  constructor(canvas: HTMLCanvasElement, spawnDummy = true) {
    this.arenaBounds = {
      x: 0,
      y: 0,
      width: ARENA_CONFIG.width,
      height: ARENA_CONFIG.height,
    };

    const spawnX = this.arenaBounds.width * 0.3;
    const spawnY = this.arenaBounds.height / 2;
    this.playerTank = new Tank(spawnX, spawnY, 0, 'player');

    if (spawnDummy) {
      const dummyX = this.arenaBounds.width * 0.75;
      const dummyY = this.arenaBounds.height / 2;
      this.dummyTank = new Tank(dummyX, dummyY, Math.PI, 'dummy');
    } else {
      this.dummyTank = null;
    }

    this.input = new InputManager();
    this.combat = new CombatSystem();
    this.renderer = new Renderer(canvas);

    this.loop = new GameLoop(
      (dt: number) => this.fixedUpdate(dt),
      () => this.render()
    );
  }

  public fixedUpdate(dt: number): void {
    const controls = this.input.getControls();
    this.playerTank.update(dt, controls);
    CollisionSystem.resolveTankBoundaryCollision(this.playerTank, this.arenaBounds);

    if (controls.fire) {
      this.combat.fireBullet(this.playerTank);
    }

    const tanks = this.getTanks();
    this.combat.update(dt, this.arenaBounds, tanks);
  }

  public getTanks(): Tank[] {
    return this.dummyTank ? [this.playerTank, this.dummyTank] : [this.playerTank];
  }

  public render(): void {
    this.renderer.render(this.getTanks(), this.combat.bullets, this.arenaBounds);
  }
  public start(): void {
    this.loop.start();
  }

  public stop(): void {
    this.loop.stop();
  }

  public destroy(): void {
    this.stop();
    this.input.dispose();
    this.renderer.dispose();
  }
}
