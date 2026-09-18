import type { TankControls } from '../types/game';

const PREVENT_DEFAULT_KEYS: Record<string, true> = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true,
  KeyW: true,
  KeyS: true,
  KeyA: true,
  KeyD: true,
  Space: true,
  KeyR: true,
  KeyM: true,
  ShiftLeft: true,
  ShiftRight: true,
};
export class InputManager {
  private activeKeys = new Set<string>();
  private fireRequested = false;
  private restartRequested = false;
  private mapSwitchRequested = false;
  private dashRequested = false;
  private onKeyDownHandler: (e: KeyboardEvent) => void;
  private onKeyUpHandler: (e: KeyboardEvent) => void;
  private onBlurHandler: () => void;
  private target: EventTarget | null = null;

  constructor(target?: EventTarget) {
    this.target = target ?? (typeof window !== 'undefined' ? window : null);

    this.onKeyDownHandler = (e: KeyboardEvent) => {
      this.activeKeys.add(e.code);
      if (e.code === 'Space') {
        this.fireRequested = true;
      }
      if (e.code === 'KeyR') {
        this.restartRequested = true;
      }
      if (e.code === 'KeyM') {
        this.mapSwitchRequested = true;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.dashRequested = true;
      }
      if (PREVENT_DEFAULT_KEYS[e.code]) {
        e.preventDefault();
      }
    };

    this.onKeyUpHandler = (e: KeyboardEvent) => {
      this.activeKeys.delete(e.code);
      if (PREVENT_DEFAULT_KEYS[e.code]) {
        e.preventDefault();
      }
    };

    this.onBlurHandler = () => {
      this.activeKeys.clear();
    };
    if (this.target) {
      this.target.addEventListener('keydown', this.onKeyDownHandler as EventListener);
      this.target.addEventListener('keyup', this.onKeyUpHandler as EventListener);
      this.target.addEventListener('blur', this.onBlurHandler as EventListener);
    }
  }

  public isDown(code: string): boolean {
    return this.activeKeys.has(code);
  }

  public getControls(): TankControls {
    const isForward = this.isDown('KeyW') || this.isDown('ArrowUp');
    const isReverse = this.isDown('KeyS') || this.isDown('ArrowDown');
    const isLeft = this.isDown('KeyA') || this.isDown('ArrowLeft');
    const isRight = this.isDown('KeyD') || this.isDown('ArrowRight');
    const fire = this.isDown('Space') || this.fireRequested;
    this.fireRequested = false;

    const dash =
      this.isDown('ShiftLeft') || this.isDown('ShiftRight') || this.dashRequested;
    this.dashRequested = false;

    const forward = (isForward ? 1 : 0) - (isReverse ? 1 : 0);
    const rotate = (isRight ? 1 : 0) - (isLeft ? 1 : 0);

    return { forward, rotate, fire, dash };
  }

  public isRestartRequested(): boolean {
    const req = this.restartRequested || this.isDown('KeyR');
    this.restartRequested = false;
    return req;
  }

  public isMapSwitchRequested(): boolean {
    const req = this.mapSwitchRequested || this.isDown('KeyM');
    this.mapSwitchRequested = false;
    return req;
  }

  public clear(): void {
    this.activeKeys.clear();
    this.fireRequested = false;
    this.restartRequested = false;
    this.mapSwitchRequested = false;
    this.dashRequested = false;
  }

  public dispose(): void {
    if (this.target) {
      this.target.removeEventListener('keydown', this.onKeyDownHandler as EventListener);
      this.target.removeEventListener('keyup', this.onKeyUpHandler as EventListener);
      this.target.removeEventListener('blur', this.onBlurHandler as EventListener);
      this.target = null;
    }
    this.activeKeys.clear();
  }
}
