import { describe, it, expect } from 'vitest';
import { InputManager } from '../../src/input/InputManager';

class MockEventTarget implements EventTarget {
  private listeners: Record<string, EventListener[]> = {};

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (!listener) return;
    const fn = typeof listener === 'function' ? listener : (e: Event) => listener.handleEvent(e);
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(fn);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (!listener || !this.listeners[type]) return;
    const fn = typeof listener === 'function' ? listener : (e: Event) => listener.handleEvent(e);
    this.listeners[type] = this.listeners[type].filter((l) => l !== fn && l !== listener);
  }

  dispatchEvent(event: Event): boolean {
    const list = this.listeners[event.type] || [];
    for (const listener of list) {
      listener(event);
    }
    return true;
  }
}

function createKeyEvent(type: 'keydown' | 'keyup', code: string): KeyboardEvent {
  return {
    type,
    code,
    preventDefault: () => {},
  } as unknown as KeyboardEvent;
}

describe('InputManager', () => {
  it('detects forward and reverse movement from W and S', () => {
    const mockTarget = new MockEventTarget();
    const input = new InputManager(mockTarget);

    expect(input.getControls()).toEqual({ forward: 0, rotate: 0 });

    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyW'));
    expect(input.getControls()).toEqual({ forward: 1, rotate: 0 });

    mockTarget.dispatchEvent(createKeyEvent('keyup', 'KeyW'));
    expect(input.getControls()).toEqual({ forward: 0, rotate: 0 });

    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyS'));
    expect(input.getControls()).toEqual({ forward: -1, rotate: 0 });

    input.dispose();
  });

  it('detects rotation from A and D', () => {
    const mockTarget = new MockEventTarget();
    const input = new InputManager(mockTarget);

    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyA'));
    expect(input.getControls()).toEqual({ forward: 0, rotate: -1 });

    mockTarget.dispatchEvent(createKeyEvent('keyup', 'KeyA'));
    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyD'));
    expect(input.getControls()).toEqual({ forward: 0, rotate: 1 });

    input.dispose();
  });

  it('cancels out opposing key inputs', () => {
    const mockTarget = new MockEventTarget();
    const input = new InputManager(mockTarget);

    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyW'));
    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyS'));
    expect(input.getControls().forward).toBe(0);

    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyA'));
    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyD'));
    expect(input.getControls().rotate).toBe(0);

    input.dispose();
  });

  it('supports arrow keys', () => {
    const mockTarget = new MockEventTarget();
    const input = new InputManager(mockTarget);

    mockTarget.dispatchEvent(createKeyEvent('keydown', 'ArrowUp'));
    mockTarget.dispatchEvent(createKeyEvent('keydown', 'ArrowRight'));
    expect(input.getControls()).toEqual({ forward: 1, rotate: 1 });

    input.dispose();
  });

  it('clears all active keys on blur event', () => {
    const mockTarget = new MockEventTarget();
    const input = new InputManager(mockTarget);

    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyW'));
    mockTarget.dispatchEvent(createKeyEvent('keydown', 'KeyD'));
    expect(input.getControls()).toEqual({ forward: 1, rotate: 1 });

    mockTarget.dispatchEvent({ type: 'blur' } as Event);
    expect(input.getControls()).toEqual({ forward: 0, rotate: 0 });

    input.dispose();
  });
});
