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
};

export class InputManager {
  private activeKeys = new Set<string>();
  private onKeyDownHandler: (e: KeyboardEvent) => void;
  private onKeyUpHandler: (e: KeyboardEvent) => void;
  private onBlurHandler: () => void;
  private target: EventTarget | null = null;

  constructor(target?: EventTarget) {
    this.target = target ?? (typeof window !== 'undefined' ? window : null);

    this.onKeyDownHandler = (e: KeyboardEvent) => {
      this.activeKeys.add(e.code);
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

    const forward = (isForward ? 1 : 0) - (isReverse ? 1 : 0);
    const rotate = (isRight ? 1 : 0) - (isLeft ? 1 : 0);

    return { forward, rotate };
  }

  public clear(): void {
    this.activeKeys.clear();
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
