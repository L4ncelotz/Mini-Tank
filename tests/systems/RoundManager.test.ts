import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { RoundManager } from '../../src/systems/RoundManager';
import { Tank } from '../../src/entities/Tank';
import { MATCH_CONFIG } from '../../src/config/gameplay';

describe('RoundManager', () => {
  let roundManager: RoundManager;
  let playerTank: Tank;
  let opponentTank: Tank;
  let onResetMock: Mock<() => void>;
  beforeEach(() => {
    onResetMock = vi.fn();
    roundManager = new RoundManager(3, MATCH_CONFIG.readyDuration, onResetMock);
    playerTank = new Tank(100, 100, 0, 'player');
    opponentTank = new Tank(300, 100, Math.PI, 'dummy');
  });

  it('initializes in ready state with score 0-0', () => {
    expect(roundManager.currentRound).toBe(1);
    expect(roundManager.playerScore).toBe(0);
    expect(roundManager.opponentScore).toBe(0);
    expect(roundManager.roundsToWin).toBe(3);
    expect(roundManager.state).toBe('ready');
    expect(roundManager.isFighting()).toBe(false);
    expect(roundManager.isMatchOver()).toBe(false);
  });

  it('transitions from ready to fighting when ready timer elapses', () => {
    roundManager.update(MATCH_CONFIG.readyDuration, [playerTank, opponentTank]);
    expect(roundManager.state).toBe('fighting');
    expect(roundManager.isFighting()).toBe(true);
  });

  it('awards round win to player when opponent tank dies', () => {
    // Transition to fighting
    roundManager.update(MATCH_CONFIG.readyDuration, [playerTank, opponentTank]);

    // Opponent takes fatal damage
    opponentTank.takeDamage(3);
    expect(opponentTank.isAlive()).toBe(false);

    roundManager.update(0.016, [playerTank, opponentTank]);

    expect(roundManager.playerScore).toBe(1);
    expect(roundManager.opponentScore).toBe(0);
    expect(roundManager.roundWinner).toBe('player');
    expect(roundManager.state).toBe('round_over');
    expect(roundManager.isFighting()).toBe(false);
  });

  it('advances to next round and calls reset callback after round_over timer elapses', () => {
    // Win round 1
    roundManager.update(MATCH_CONFIG.readyDuration, [playerTank, opponentTank]);
    opponentTank.takeDamage(3);
    roundManager.update(0.016, [playerTank, opponentTank]);
    expect(roundManager.state).toBe('round_over');

    // Wait for round_over timer to expire
    roundManager.update(MATCH_CONFIG.roundEndDuration, [playerTank, opponentTank]);

    expect(roundManager.currentRound).toBe(2);
    expect(roundManager.state).toBe('ready');
    expect(onResetMock).toHaveBeenCalledTimes(1);
  });

  it('ends match when player reaches 3 round wins (Best-of-5)', () => {
    // Round 1
    roundManager.update(MATCH_CONFIG.readyDuration, [playerTank, opponentTank]);
    opponentTank.takeDamage(3);
    roundManager.update(0.016, [playerTank, opponentTank]); // wins round 1
    roundManager.update(MATCH_CONFIG.roundEndDuration, [playerTank, opponentTank]); // to round 2
    opponentTank.reset(300, 100);

    // Round 2
    roundManager.update(MATCH_CONFIG.readyDuration, [playerTank, opponentTank]);
    opponentTank.takeDamage(3);
    roundManager.update(0.016, [playerTank, opponentTank]); // wins round 2
    roundManager.update(MATCH_CONFIG.roundEndDuration, [playerTank, opponentTank]); // to round 3
    opponentTank.reset(300, 100);

    // Round 3
    roundManager.update(MATCH_CONFIG.readyDuration, [playerTank, opponentTank]);
    opponentTank.takeDamage(3);
    roundManager.update(0.016, [playerTank, opponentTank]); // wins round 3

    expect(roundManager.playerScore).toBe(3);
    expect(roundManager.state).toBe('match_over');
    expect(roundManager.isMatchOver()).toBe(true);
    expect(roundManager.matchWinner).toBe('player');
  });

  it('resets entire match state when resetMatch is called', () => {
    // Player wins 1 round
    roundManager.update(MATCH_CONFIG.readyDuration, [playerTank, opponentTank]);
    opponentTank.takeDamage(3);
    roundManager.update(0.016, [playerTank, opponentTank]);
    expect(roundManager.playerScore).toBe(1);

    // Reset match
    roundManager.resetMatch();

    expect(roundManager.playerScore).toBe(0);
    expect(roundManager.opponentScore).toBe(0);
    expect(roundManager.currentRound).toBe(1);
    expect(roundManager.state).toBe('ready');
    expect(roundManager.matchWinner).toBeNull();
    expect(onResetMock).toHaveBeenCalled();
  });

  it('handles simultaneous death as a draw round without awarding points', () => {
    roundManager.update(MATCH_CONFIG.readyDuration, [playerTank, opponentTank]);

    playerTank.takeDamage(3);
    opponentTank.takeDamage(3);

    roundManager.update(0.016, [playerTank, opponentTank]);

    expect(roundManager.playerScore).toBe(0);
    expect(roundManager.opponentScore).toBe(0);
    expect(roundManager.roundWinner).toBe('draw');
    expect(roundManager.state).toBe('round_over');
  });
});
