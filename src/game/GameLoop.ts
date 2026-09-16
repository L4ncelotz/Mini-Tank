import { LOOP_CONFIG } from '../config/gameplay';

export class GameLoop {
  private updateFn: (dt: number) => void;
  private renderFn: (interpolation: number) => void;
  private timestep: number;
  private maxAccumulatedTime: number;
  private running = false;
  private lastTime = 0;
  private accumulator = 0;
  private animFrameId: number | null = null;

  constructor(
    update: (dt: number) => void,
    render: (interpolation: number) => void,
    timestep: number = LOOP_CONFIG.fixedTimestep,
    maxAccumulatedTime: number = LOOP_CONFIG.maxAccumulatedTime
  ) {
    this.updateFn = update;
    this.renderFn = render;
    this.timestep = timestep;
    this.maxAccumulatedTime = maxAccumulatedTime;
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.accumulator = 0;

    const frame = (time: number) => {
      if (!this.running) return;

      const delta = Math.min((time - this.lastTime) / 1000, this.maxAccumulatedTime);
      this.lastTime = time;
      this.accumulator += delta;

      while (this.accumulator >= this.timestep) {
        this.updateFn(this.timestep);
        this.accumulator -= this.timestep;
      }

      const interpolation = this.accumulator / this.timestep;
      this.renderFn(interpolation);

      this.animFrameId = requestAnimationFrame(frame);
    };

    this.animFrameId = requestAnimationFrame(frame);
  }

  public step(deltaSeconds: number): void {
    const delta = Math.min(deltaSeconds, this.maxAccumulatedTime);
    this.accumulator += delta;

    while (this.accumulator >= this.timestep) {
      this.updateFn(this.timestep);
      this.accumulator -= this.timestep;
    }

    const interpolation = this.accumulator / this.timestep;
    this.renderFn(interpolation);
  }

  public stop(): void {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public isRunning(): boolean {
    return this.running;
  }
}
