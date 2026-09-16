import { ARENA_CONFIG } from '../config/gameplay';
import { Tank } from '../entities/Tank';
import { GameLoop } from './GameLoop';
import { InputManager } from '../input/InputManager';
import { Renderer } from '../rendering/Renderer';
import { CollisionSystem } from '../systems/CollisionSystem';
import type { ArenaBounds } from '../types/game';

export class Game {
  public arenaBounds: ArenaBounds;
  public playerTank: Tank;
  public input: InputManager;
  public renderer: Renderer;
  public loop: GameLoop;

  constructor(canvas: HTMLCanvasElement) {
    this.arenaBounds = {
      x: 0,
      y: 0,
      width: ARENA_CONFIG.width,
      height: ARENA_CONFIG.height,
    };

    const spawnX = this.arenaBounds.width / 2;
    const spawnY = this.arenaBounds.height / 2;
    this.playerTank = new Tank(spawnX, spawnY, 0);

    this.input = new InputManager();
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
  }

  public render(): void {
    this.renderer.render(this.playerTank, this.arenaBounds);
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
