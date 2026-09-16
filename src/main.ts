import { Game } from './game/Game';

declare global {
  interface Window {
    __game?: Game;
  }
}

function bootstrap(): void {
  const canvas = document.getElementById('game-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element #game-canvas not found in document');
  }

  const game = new Game(canvas);
  game.start();
  window.__game = game;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
