import { describe, it, expect, beforeEach } from 'vitest';
import { Arena, MAP_ORDER } from '../../src/maps/Arena';
import { ARENA_MAPS } from '../../src/maps/arenaData';
import type { MapId } from '../../src/types/game';

describe('Arena and Map Data', () => {
  let arena: Arena;

  beforeEach(() => {
    arena = new Arena('open_arena');
  });

  it('contains all 3 handcrafted maps with complete geometry', () => {
    const mapKeys = Object.keys(ARENA_MAPS) as MapId[];
    expect(mapKeys).toContain('open_arena');
    expect(mapKeys).toContain('crossfire');
    expect(mapKeys).toContain('corridor');

    for (const key of mapKeys) {
      const map = ARENA_MAPS[key];
      expect(map.id).toBe(key);
      expect(map.name.length).toBeGreaterThan(0);
      expect(map.description.length).toBeGreaterThan(0);
      expect(map.bounds.width).toBe(1440);
      expect(map.bounds.height).toBe(900);
      expect(map.spawns.player).toBeDefined();
      expect(map.spawns.opponent).toBeDefined();
    }
  });

  it('validates that spawns are within bounds and not trapped inside walls', () => {
    const mapKeys = Object.keys(ARENA_MAPS) as MapId[];
    const tankRadius = 16;

    for (const key of mapKeys) {
      const map = ARENA_MAPS[key];
      const player = map.spawns.player;
      const opponent = map.spawns.opponent;

      // Check player spawn inside bounds
      expect(player.x - tankRadius).toBeGreaterThanOrEqual(map.bounds.x);
      expect(player.x + tankRadius).toBeLessThanOrEqual(map.bounds.x + map.bounds.width);
      expect(player.y - tankRadius).toBeGreaterThanOrEqual(map.bounds.y);
      expect(player.y + tankRadius).toBeLessThanOrEqual(map.bounds.y + map.bounds.height);

      // Check opponent spawn inside bounds
      expect(opponent.x - tankRadius).toBeGreaterThanOrEqual(map.bounds.x);
      expect(opponent.x + tankRadius).toBeLessThanOrEqual(map.bounds.x + map.bounds.width);
      expect(opponent.y - tankRadius).toBeGreaterThanOrEqual(map.bounds.y);
      expect(opponent.y + tankRadius).toBeLessThanOrEqual(map.bounds.y + map.bounds.height);

      // Check that spawns do not intersect any wall
      for (const wall of map.walls) {
        const playerClosestX = Math.max(wall.x, Math.min(player.x, wall.x + wall.width));
        const playerClosestY = Math.max(wall.y, Math.min(player.y, wall.y + wall.height));
        const playerDistSq = (player.x - playerClosestX) ** 2 + (player.y - playerClosestY) ** 2;
        expect(playerDistSq).toBeGreaterThanOrEqual(tankRadius * tankRadius);

        const oppClosestX = Math.max(wall.x, Math.min(opponent.x, wall.x + wall.width));
        const oppClosestY = Math.max(wall.y, Math.min(opponent.y, wall.y + wall.height));
        const oppDistSq = (opponent.x - oppClosestX) ** 2 + (opponent.y - oppClosestY) ** 2;
        expect(oppDistSq).toBeGreaterThanOrEqual(tankRadius * tankRadius);
      }
    }
  });

  it('switches and cycles maps correctly', () => {
    expect(arena.currentMap.id).toBe('open_arena');

    arena.setMap('crossfire');
    expect(arena.currentMap.id).toBe('crossfire');
    expect(arena.currentMap.name).toBe('Crossfire');

    arena.setMap('corridor');
    expect(arena.currentMap.id).toBe('corridor');
    expect(arena.currentMap.name).toBe('Corridor');

    // Cycling with nextMap
    expect(MAP_ORDER).toEqual(['open_arena', 'crossfire', 'corridor']);
    arena.setMap('corridor');
    const loopedMap = arena.nextMap();
    expect(loopedMap.id).toBe('open_arena');
  });
});
