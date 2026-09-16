import { ARENA_CONFIG } from '../config/gameplay';
import type { MapData, MapId } from '../types/game';

const bounds = {
  x: 0,
  y: 0,
  width: ARENA_CONFIG.width,
  height: ARENA_CONFIG.height,
};

export const ARENA_MAPS: Record<MapId, MapData> = {
  open_arena: {
    id: 'open_arena',
    name: 'Open Arena',
    description: 'Symmetrical open arena built for fast movement, direct aim, and long-range spacing.',
    bounds,
    walls: [
      // Symmetrical tactical corner cover blocks
      { id: 'corner-tl', x: 280, y: 180, width: 70, height: 70 },
      { id: 'corner-bl', x: 280, y: 650, width: 70, height: 70 },
      { id: 'corner-tr', x: 1090, y: 180, width: 70, height: 70 },
      { id: 'corner-br', x: 1090, y: 650, width: 70, height: 70 },
    ],
    spawns: {
      player: { x: 360, y: 450, rotation: 0 },
      opponent: { x: 1080, y: 450, rotation: Math.PI },
    },
  },

  crossfire: {
    id: 'crossfire',
    name: 'Crossfire',
    description: 'Dense central cover layout creating diagonal ricochet opportunities and pressure around angles.',
    bounds,
    walls: [
      // Center pillar
      { id: 'center-pillar', x: 670, y: 400, width: 100, height: 100 },
      // Upper and lower central flank pillars
      { id: 'flank-top', x: 670, y: 160, width: 100, height: 100 },
      { id: 'flank-bottom', x: 670, y: 640, width: 100, height: 100 },
      // Side tactical barriers
      { id: 'side-left', x: 440, y: 390, width: 60, height: 120 },
      { id: 'side-right', x: 940, y: 390, width: 60, height: 120 },
    ],
    spawns: {
      player: { x: 240, y: 450, rotation: 0 },
      opponent: { x: 1200, y: 450, rotation: Math.PI },
    },
  },

  corridor: {
    id: 'corridor',
    name: 'Corridor',
    description: 'Divided 3-lane battlefield focused on lane control, corner timing, and prediction ricochets.',
    bounds,
    walls: [
      // Upper lane dividing walls with central transit gap
      { id: 'upper-left-lane', x: 320, y: 280, width: 340, height: 40 },
      { id: 'upper-right-lane', x: 780, y: 280, width: 340, height: 40 },
      // Lower lane dividing walls with central transit gap
      { id: 'lower-left-lane', x: 320, y: 580, width: 340, height: 40 },
      { id: 'lower-right-lane', x: 780, y: 580, width: 340, height: 40 },
      // Mid lane choke block
      { id: 'mid-choke', x: 680, y: 410, width: 80, height: 80 },
    ],
    spawns: {
      player: { x: 200, y: 450, rotation: 0 },
      opponent: { x: 1240, y: 450, rotation: Math.PI },
    },
  },
};
