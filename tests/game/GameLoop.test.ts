import { describe, it, expect, vi } from 'vitest';
import { GameLoop } from '../../src/game/GameLoop';

describe('GameLoop', () => {
  it('executes fixed updates when stepped', () => {
    const updateFn = vi.fn();
    const renderFn = vi.fn();
    const timestep = 1 / 60;

    const loop = new GameLoop(updateFn, renderFn, timestep, 0.1);

    // Step by exactly 1 timestep
    loop.step(timestep);
    expect(updateFn).toHaveBeenCalledTimes(1);
    expect(updateFn).toHaveBeenCalledWith(timestep);
    expect(renderFn).toHaveBeenCalledTimes(1);

    // Step by 2.5 timesteps
    loop.step(timestep * 2.5);
    // Total update calls should be 1 + 2 = 3
    expect(updateFn).toHaveBeenCalledTimes(3);
    expect(renderFn).toHaveBeenCalledTimes(2);
  });

  it('clamps excessive delta time to avoid spiral of death', () => {
    const updateFn = vi.fn();
    const renderFn = vi.fn();
    const timestep = 1 / 60;
    const maxAccumulator = 0.05; // ~3 frames max

    const loop = new GameLoop(updateFn, renderFn, timestep, maxAccumulator);

    // Step by a very large delta (e.g. 5 seconds of lag)
    loop.step(5.0);

    // Maximum calls should be capped by maxAccumulator: 0.05 / (1/60) = 3
    expect(updateFn).toHaveBeenCalledTimes(3);
    expect(renderFn).toHaveBeenCalledTimes(1);
  });
});
