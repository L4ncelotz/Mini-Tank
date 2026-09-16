import { MATCH_CONFIG } from '../config/gameplay';
import { Tank } from '../entities/Tank';
import { GameLoop } from './GameLoop';
import { InputManager } from '../input/InputManager';
import { Renderer } from '../rendering/Renderer';
import { CollisionSystem } from '../systems/CollisionSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { RoundManager } from '../systems/RoundManager';
import { AIController } from '../ai/AIController';
import { Arena } from '../maps/Arena';
import type { ArenaBounds, MapId } from '../types/game';

export class Game {
  public arena: Arena;
  public arenaBounds: ArenaBounds;
  public playerTank: Tank;
  public opponentTank: Tank | null;
  public aiController: AIController;
  public input: InputManager;
  public combat: CombatSystem;
  public renderer: Renderer;
  public loop: GameLoop;
  public roundManager: RoundManager;

  public spawnX: number;
  public spawnY: number;
  public opponentSpawnX: number;
  public opponentSpawnY: number;

  // Compatibility getter for tests referencing dummyTank
  public get dummyTank(): Tank | null {
    return this.opponentTank;
  }

  public set dummyTank(tank: Tank | null) {
    this.opponentTank = tank;
  }

  constructor(canvas: HTMLCanvasElement, spawnOpponent = true, initialMapId: MapId = 'open_arena') {
    this.arena = new Arena(initialMapId);
    this.arenaBounds = this.arena.bounds;

    this.spawnX = this.arena.spawns.player.x;
    this.spawnY = this.arena.spawns.player.y;
    this.playerTank = new Tank(
      this.spawnX,
      this.spawnY,
      this.arena.spawns.player.rotation,
      'player'
    );

    this.opponentSpawnX = this.arena.spawns.opponent.x;
    this.opponentSpawnY = this.arena.spawns.opponent.y;
    if (spawnOpponent) {
      this.opponentTank = new Tank(
        this.opponentSpawnX,
        this.opponentSpawnY,
        this.arena.spawns.opponent.rotation,
        'ai'
      );
    } else {
      this.opponentTank = null;
    }

    this.aiController = new AIController();
    this.input = new InputManager();
    this.combat = new CombatSystem();
    this.renderer = new Renderer(canvas);

    this.roundManager = new RoundManager(
      MATCH_CONFIG.roundsToWin,
      MATCH_CONFIG.readyDuration,
      () => this.resetRound()
    );

    this.loop = new GameLoop(
      (dt: number) => this.fixedUpdate(dt),
      () => this.render()
    );
  }

  public switchMap(mapId?: MapId): void {
    if (mapId) {
      this.arena.setMap(mapId);
    } else {
      this.arena.nextMap();
    }
    this.arenaBounds = this.arena.bounds;
    this.spawnX = this.arena.spawns.player.x;
    this.spawnY = this.arena.spawns.player.y;
    this.opponentSpawnX = this.arena.spawns.opponent.x;
    this.opponentSpawnY = this.arena.spawns.opponent.y;
    this.resetRound();
    this.roundManager.resetMatch();
  }

  public resetRound(): void {
    this.playerTank.reset(this.spawnX, this.spawnY, this.arena.spawns.player.rotation);
    if (this.opponentTank) {
      this.opponentTank.reset(
        this.opponentSpawnX,
        this.opponentSpawnY,
        this.arena.spawns.opponent.rotation
      );
    }
    this.aiController.reset();
    this.combat.clear();
    this.input.clear();
  }

  public fixedUpdate(dt: number): void {
    if (this.input.isMapSwitchRequested()) {
      this.switchMap();
      return;
    }

    if (this.roundManager.isMatchOver()) {
      if (this.input.isRestartRequested()) {
        this.roundManager.resetMatch();
      }
      return;
    }

    this.roundManager.update(dt, this.getTanks());

    if (this.roundManager.isFighting()) {
      // Player update
      const controls = this.input.getControls();
      this.playerTank.update(dt, controls);
      CollisionSystem.resolveTankWallCollisions(
        this.playerTank,
        this.arena.walls,
        this.arenaBounds
      );

      if (controls.fire) {
        this.combat.fireBullet(this.playerTank);
      }

      // AI opponent update
      if (this.opponentTank && this.opponentTank.isAlive()) {
        const aiControls = this.aiController.update(
          dt,
          this.opponentTank,
          this.playerTank,
          this.arenaBounds,
          this.combat.bullets,
          this.arena.walls
        );
        this.opponentTank.update(dt, aiControls);
        CollisionSystem.resolveTankWallCollisions(
          this.opponentTank,
          this.arena.walls,
          this.arenaBounds
        );

        if (aiControls.fire) {
          this.combat.fireBullet(this.opponentTank);
        }
      }
    } else {
      this.playerTank.update(dt, { forward: 0, rotate: 0, fire: false });
      if (this.opponentTank) {
        this.opponentTank.update(dt, { forward: 0, rotate: 0, fire: false });
      }
    }

    const tanks = this.getTanks();
    this.combat.update(dt, this.arenaBounds, tanks, this.arena.walls);
  }

  public getTanks(): Tank[] {
    return this.opponentTank ? [this.playerTank, this.opponentTank] : [this.playerTank];
  }

  public render(): void {
    this.renderer.render(
      this.getTanks(),
      this.combat.bullets,
      this.arenaBounds,
      this.arena.walls,
      this.combat.bounceImpacts,
      this.roundManager.getScore(),
      this.aiController.state,
      this.arena.currentMap.name
    );
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
