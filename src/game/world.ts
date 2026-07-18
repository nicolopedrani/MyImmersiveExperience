import { initialWorldState, rooms } from "./rooms";
import type { Direction, Door, Hotspot, Point, RoomDefinition, RoomId, RoomProp, WorldState } from "./types";

const directionOffset: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createInitialWorldState(): WorldState {
  return {
    roomId: initialWorldState.roomId,
    player: { ...initialWorldState.player },
  };
}

export function pointEquals(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function getRoom(state: WorldState): RoomDefinition {
  return rooms[state.roomId];
}

export function isInsideRoom(room: RoomDefinition, point: Point): boolean {
  return point.x >= 0 && point.y >= 0 && point.x < room.width && point.y < room.height;
}

export function getDoorAt(room: RoomDefinition, point: Point): Door | undefined {
  return room.doors.find((door) => pointEquals(door, point));
}

export function getHotspotAt(room: RoomDefinition, point: Point): Hotspot | undefined {
  return room.hotspots.find((hotspot) => pointEquals(hotspot, point));
}

export function isPointInProp(prop: RoomProp, point: Point): boolean {
  return point.x >= prop.x && point.y >= prop.y && point.x < prop.x + prop.width && point.y < prop.y + prop.height;
}

export function isWalkable(room: RoomDefinition, point: Point): boolean {
  if (!isInsideRoom(room, point)) return false;
  if (getDoorAt(room, point)) return true;
  if (point.x === 0 || point.y === 0 || point.x === room.width - 1 || point.y === room.height - 1) return false;
  if (getHotspotAt(room, point)) return false;
  return !room.props.some((prop) => prop.blocking && isPointInProp(prop, point));
}

export interface MoveResult {
  state: WorldState;
  changedRoom: boolean;
  blocked: boolean;
}

export function moveWorld(state: WorldState, direction: Direction): MoveResult {
  const room = getRoom(state);
  const offset = directionOffset[direction];
  const destination = {
    x: state.player.x + offset.x,
    y: state.player.y + offset.y,
  };
  const facingState: WorldState = {
    ...state,
    player: { ...state.player, direction },
  };

  const door = getDoorAt(room, destination);
  if (door) {
    return {
      state: {
        roomId: door.targetRoom,
        player: { ...door.targetPosition, direction },
      },
      changedRoom: true,
      blocked: false,
    };
  }

  if (!isWalkable(room, destination)) {
    return { state: facingState, changedRoom: false, blocked: true };
  }

  return {
    state: {
      ...facingState,
      player: { ...facingState.player, ...destination },
    },
    changedRoom: false,
    blocked: false,
  };
}

export function getFacingPoint(state: WorldState): Point {
  const offset = directionOffset[state.player.direction];
  return { x: state.player.x + offset.x, y: state.player.y + offset.y };
}

export function getFacingHotspot(state: WorldState): Hotspot | undefined {
  return getHotspotAt(getRoom(state), getFacingPoint(state));
}

export function findRoomForEntry(entryId: string): { roomId: RoomId; hotspot: Hotspot } | undefined {
  for (const room of Object.values(rooms)) {
    const hotspot = room.hotspots.find(
      (candidate) => candidate.action.type === "entry" && candidate.action.entryId === entryId,
    );
    if (hotspot) return { roomId: room.id, hotspot };
  }
  return undefined;
}
