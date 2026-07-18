import { describe, expect, it } from "vitest";
import { rooms } from "./rooms";
import {
  createInitialWorldState,
  findRoomForEntry,
  getFacingHotspot,
  getHotspotAt,
  isInsideRoom,
  isPointInProp,
  isWalkable,
  moveWorld,
} from "./world";

describe("portfolio world", () => {
  it("keeps movement inside room boundaries", () => {
    const state = { roomId: "hub" as const, player: { x: 1, y: 1, direction: "left" as const } };
    const first = moveWorld(state, "left");
    expect(first.blocked).toBe(true);
    expect(first.state.player.x).toBe(1);
    expect(isInsideRoom(rooms.hub, first.state.player)).toBe(true);
  });

  it("moves through configured doors to a valid target", () => {
    const state = { roomId: "hub" as const, player: { x: 1, y: 6, direction: "left" as const } };
    const result = moveWorld(state, "left");
    expect(result.changedRoom).toBe(true);
    expect(result.state.roomId).toBe("work");
    expect(result.state.player).toMatchObject({ x: 18, y: 6 });
    expect(isWalkable(rooms.work, result.state.player)).toBe(true);
  });

  it("never allows walking onto a hotspot", () => {
    const hotspot = rooms.work.hotspots[0];
    expect(hotspot).toBeDefined();
    expect(isWalkable(rooms.work, hotspot!)).toBe(false);
  });

  it("uses rendered prop footprints as collision geometry", () => {
    const sensor = rooms.work.props.find((prop) => prop.id === "sensor-console");
    expect(sensor).toBeDefined();
    expect(isPointInProp(sensor!, { x: 4, y: 5 })).toBe(true);
    expect(isWalkable(rooms.work, { x: 4, y: 5 })).toBe(false);
    expect(isPointInProp(sensor!, { x: 7, y: 5 })).toBe(false);
  });

  it("finds and faces an adjacent hotspot safely", () => {
    const state = { roomId: "work" as const, player: { x: 4, y: 6, direction: "up" as const } };
    expect(getFacingHotspot(state)?.action).toEqual({ type: "entry", entryId: "work-leonardo" });
    expect(getHotspotAt(rooms.work, { x: -1, y: -1 })).toBeUndefined();
  });

  it("maps every content station to a room", () => {
    expect(findRoomForEntry("work-eoc")?.roomId).toBe("work");
    expect(findRoomForEntry("publication-oxdna")?.roomId).toBe("research");
    expect(findRoomForEntry("personal-volunteering")?.roomId).toBe("beyond");
    expect(findRoomForEntry("missing")).toBeUndefined();
  });

  it("connects every hotspot to a visible blocking prop with a reachable adjacent tile", () => {
    for (const room of Object.values(rooms)) {
      for (const hotspot of room.hotspots) {
        const prop = room.props.find((candidate) => candidate.id === hotspot.propId);
        expect(prop, `${room.id}/${hotspot.id}`).toBeDefined();
        expect(prop?.blocking, `${room.id}/${hotspot.id}`).toBe(true);
        expect(isPointInProp(prop!, hotspot), `${room.id}/${hotspot.id}`).toBe(true);
        const neighbours = [
          { x: hotspot.x - 1, y: hotspot.y },
          { x: hotspot.x + 1, y: hotspot.y },
          { x: hotspot.x, y: hotspot.y - 1 },
          { x: hotspot.x, y: hotspot.y + 1 },
        ];
        expect(neighbours.some((point) => isWalkable(room, point)), `${room.id}/${hotspot.id}`).toBe(true);
      }
    }
  });

  it("creates independent initial state objects", () => {
    const first = createInitialWorldState();
    const second = createInitialWorldState();
    first.player.x = 3;
    expect(second.player.x).toBe(10);
  });
});
