import type { PortfolioEntryId } from "../content/portfolio";

export type RoomId = "hub" | "work" | "research" | "beyond";
export type Direction = "up" | "down" | "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface Door extends Point {
  targetRoom: RoomId;
  targetPosition: Point;
  label: string;
}

export type HotspotAction =
  | { type: "entry"; entryId: PortfolioEntryId }
  | { type: "chat" };

export interface Hotspot extends Point {
  id: string;
  propId: string;
  label: string;
  action: HotspotAction;
}

export type TerrainKind = "rug" | "lab-bay" | "wood" | "path" | "pitch" | "garden" | "reading-nook";

export interface TerrainPatch extends Point {
  kind: TerrainKind;
  width: number;
  height: number;
}

export type RoomPropKind =
  | "plant"
  | "lamp"
  | "profile-desk"
  | "project-terminal"
  | "chat-console"
  | "sensor-console"
  | "clinical-console"
  | "analytics-board"
  | "server-rack"
  | "whiteboard"
  | "bookshelf"
  | "simulation-bench"
  | "circuit-board"
  | "dna-table"
  | "tree"
  | "football-goal"
  | "community-table"
  | "travel-board"
  | "bench";

export interface RoomProp extends Point {
  id: string;
  kind: RoomPropKind;
  width: number;
  height: number;
  blocking: boolean;
  variant?: number;
}

export interface RoomDefinition {
  id: RoomId;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  floor: string;
  floorAccent: string;
  wall: string;
  doors: readonly Door[];
  hotspots: readonly Hotspot[];
  terrain: readonly TerrainPatch[];
  props: readonly RoomProp[];
}

export interface PlayerState extends Point {
  direction: Direction;
}

export interface WorldState {
  roomId: RoomId;
  player: PlayerState;
}
