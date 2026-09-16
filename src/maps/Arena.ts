import { ARENA_MAPS } from './arenaData';
import type { ArenaBounds, MapData, MapId, SpawnPoint, Wall } from '../types/game';

export const MAP_ORDER: MapId[] = ['open_arena', 'crossfire', 'corridor'];

export class Arena {
  public currentMap: MapData;

  constructor(initialMapId: MapId = 'open_arena') {
    this.currentMap = ARENA_MAPS[initialMapId] || ARENA_MAPS.open_arena;
  }

  public get bounds(): ArenaBounds {
    return this.currentMap.bounds;
  }

  public get walls(): Wall[] {
    return this.currentMap.walls;
  }

  public get spawns(): { player: SpawnPoint; opponent: SpawnPoint } {
    return this.currentMap.spawns;
  }

  public setMap(mapId: MapId): MapData {
    if (ARENA_MAPS[mapId]) {
      this.currentMap = ARENA_MAPS[mapId];
    }
    return this.currentMap;
  }

  public nextMap(): MapData {
    const currentIndex = MAP_ORDER.indexOf(this.currentMap.id);
    const nextIndex = (currentIndex + 1) % MAP_ORDER.length;
    return this.setMap(MAP_ORDER[nextIndex]);
  }
}
