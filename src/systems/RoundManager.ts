import { MATCH_CONFIG } from '../config/gameplay';
import type { Tank } from '../entities/Tank';
import type { MatchScore, RoundState } from '../types/game';

export class RoundManager {
  public currentRound = 1;
  public playerScore = 0;
  public opponentScore = 0;
  public roundsToWin: number;
  public state: RoundState = 'ready';
  public stateTimer: number;
  public roundWinner: string | null = null;
  public matchWinner: string | null = null;

  public onRoundResetCallback?: () => void;

  constructor(
    roundsToWin: number = MATCH_CONFIG.roundsToWin,
    readyDuration: number = MATCH_CONFIG.readyDuration,
    onRoundReset?: () => void
  ) {
    this.roundsToWin = roundsToWin;
    this.stateTimer = readyDuration;
    this.onRoundResetCallback = onRoundReset;
  }

  public isFighting(): boolean {
    return this.state === 'fighting';
  }

  public isMatchOver(): boolean {
    return this.state === 'match_over';
  }

  public startRound(): void {
    this.state = 'ready';
    this.stateTimer = MATCH_CONFIG.readyDuration;
    this.roundWinner = null;
  }

  public update(dt: number, tanks: Tank[]): void {
    if (this.state === 'ready') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'fighting';
        this.stateTimer = 0;
      }
      return;
    }

    if (this.state === 'fighting') {
      const playerTank = tanks.find((t) => t.id === 'player');
      const opponentTank = tanks.find((t) => t.id !== 'player');

      const playerDead = playerTank ? !playerTank.isAlive() : false;
      const opponentDead = opponentTank ? !opponentTank.isAlive() : false;

      if (playerDead && opponentDead) {
        this.roundWinner = 'draw';
        this.state = 'round_over';
        this.stateTimer = MATCH_CONFIG.roundEndDuration;
      } else if (opponentDead) {
        this.playerScore++;
        this.roundWinner = 'player';
        if (this.playerScore >= this.roundsToWin) {
          this.state = 'match_over';
          this.matchWinner = 'player';
          this.stateTimer = 0;
        } else {
          this.state = 'round_over';
          this.stateTimer = MATCH_CONFIG.roundEndDuration;
        }
      } else if (playerDead) {
        this.opponentScore++;
        this.roundWinner = opponentTank ? opponentTank.id : 'opponent';
        if (this.opponentScore >= this.roundsToWin) {
          this.state = 'match_over';
          this.matchWinner = this.roundWinner;
          this.stateTimer = 0;
        } else {
          this.state = 'round_over';
          this.stateTimer = MATCH_CONFIG.roundEndDuration;
        }
      }
      return;
    }

    if (this.state === 'round_over') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.currentRound++;
        if (this.onRoundResetCallback) {
          this.onRoundResetCallback();
        }
        this.startRound();
      }
      return;
    }
  }

  public resetMatch(): void {
    this.currentRound = 1;
    this.playerScore = 0;
    this.opponentScore = 0;
    this.roundWinner = null;
    this.matchWinner = null;
    if (this.onRoundResetCallback) {
      this.onRoundResetCallback();
    }
    this.startRound();
  }

  public getScore(): MatchScore {
    return {
      playerScore: this.playerScore,
      opponentScore: this.opponentScore,
      currentRound: this.currentRound,
      roundsToWin: this.roundsToWin,
      state: this.state,
      stateTimer: this.stateTimer,
      roundWinner: this.roundWinner,
      matchWinner: this.matchWinner,
    };
  }
}
