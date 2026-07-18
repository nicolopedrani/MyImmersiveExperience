import { drawAvatar, drawRoomProp, drawTerrainPatch } from "./art";
import { rooms } from "./rooms";
import type { Hotspot, Point, RoomDefinition, RoomId, WorldState } from "./types";

export const TILE_SIZE = 32;
export const WORLD_WIDTH = 20 * TILE_SIZE;
export const WORLD_HEIGHT = 13 * TILE_SIZE;

function drawHotspot(context: CanvasRenderingContext2D, hotspot: Hotspot): void {
  const x = hotspot.x * TILE_SIZE;
  const y = hotspot.y * TILE_SIZE;
  const labelWidth = Math.min(126, Math.max(58, hotspot.label.length * 6 + 10));

  context.fillStyle = "#102438";
  context.fillRect(x + 11, y + 22, 10, 8);
  context.fillStyle = "#f2c14e";
  context.fillRect(x + 13, y + 23, 6, 5);

  context.fillStyle = "rgba(10, 25, 39, 0.92)";
  context.fillRect(x + 16 - labelWidth / 2, y - 12, labelWidth, 12);
  context.fillStyle = "#fff8e7";
  context.font = "8px ui-monospace, monospace";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(hotspot.label, x + 16, y - 6);
}

function drawDoor(context: CanvasRenderingContext2D, point: Point, label: string): void {
  const x = point.x * TILE_SIZE;
  const y = point.y * TILE_SIZE;
  context.fillStyle = "#f2c14e";
  context.fillRect(x + 5, y + 2, 22, 30);
  context.fillStyle = "#102438";
  context.fillRect(x + 9, y + 6, 14, 26);
  context.fillStyle = "#fff8e7";
  context.font = "7px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText(label, x + 16, point.y === 0 ? y + 41 : y - 5);
}

function createRoomLayer(room: RoomDefinition): HTMLCanvasElement {
  const layer = document.createElement("canvas");
  layer.width = room.width * TILE_SIZE;
  layer.height = room.height * TILE_SIZE;
  const context = layer.getContext("2d");
  if (!context) throw new Error("Canvas 2D is required to render the portfolio world.");
  context.imageSmoothingEnabled = false;

  context.fillStyle = room.floor;
  context.fillRect(0, 0, layer.width, layer.height);
  context.fillStyle = room.floorAccent;
  for (let y = 1; y < room.height - 1; y += 1) {
    for (let x = 1; x < room.width - 1; x += 1) {
      if ((x + y) % 2 === 0) context.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  room.terrain.forEach((patch) => drawTerrainPatch(context, patch, TILE_SIZE));

  context.strokeStyle = "rgba(16, 36, 56, 0.08)";
  context.lineWidth = 1;
  for (let x = TILE_SIZE; x < layer.width; x += TILE_SIZE) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, layer.height);
    context.stroke();
  }
  for (let y = TILE_SIZE; y < layer.height; y += TILE_SIZE) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(layer.width, y);
    context.stroke();
  }

  context.fillStyle = room.wall;
  context.fillRect(0, 0, layer.width, TILE_SIZE);
  context.fillRect(0, layer.height - TILE_SIZE, layer.width, TILE_SIZE);
  context.fillRect(0, 0, TILE_SIZE, layer.height);
  context.fillRect(layer.width - TILE_SIZE, 0, TILE_SIZE, layer.height);
  context.fillStyle = "rgba(255, 255, 255, 0.13)";
  for (let x = 0; x < layer.width; x += 16) context.fillRect(x, 4, 8, 3);

  [...room.props]
    .sort((left, right) => left.y + left.height - (right.y + right.height))
    .forEach((prop) => drawRoomProp(context, prop, TILE_SIZE));
  room.doors.forEach((door) => drawDoor(context, door, door.label));
  room.hotspots.forEach((hotspot) => drawHotspot(context, hotspot));

  return layer;
}

export class WorldRenderer {
  readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly roomLayers = new Map<RoomId, HTMLCanvasElement>();
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D is not available in this browser.");
    this.context = context;
    Object.values(rooms).forEach((room) => this.roomLayers.set(room.id, createRoomLayer(room)));
    this.resize();
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
      this.reducedMotion = event.matches;
    });
  }

  resize(): void {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(WORLD_WIDTH * pixelRatio);
    this.canvas.height = Math.round(WORLD_HEIGHT * pixelRatio);
    this.canvas.style.aspectRatio = `${WORLD_WIDTH} / ${WORLD_HEIGHT}`;
    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    this.context.imageSmoothingEnabled = false;
  }

  render(state: WorldState, time = 0, highlightedHotspotId?: string): void {
    const layer = this.roomLayers.get(state.roomId);
    if (!layer) return;
    this.context.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.context.drawImage(layer, 0, 0);

    if (highlightedHotspotId) {
      const room = rooms[state.roomId];
      const hotspot = room.hotspots.find((candidate) => candidate.id === highlightedHotspotId);
      const prop = hotspot ? room.props.find((candidate) => candidate.id === hotspot.propId) : undefined;
      if (hotspot && prop) {
        const pulse = this.reducedMotion ? 0 : Math.round((Math.sin(time / 220) + 1) * 2);
        this.context.strokeStyle = "#fff8e7";
        this.context.lineWidth = 2;
        this.context.strokeRect(
          prop.x * TILE_SIZE + 1 - pulse,
          prop.y * TILE_SIZE + 1 - pulse,
          prop.width * TILE_SIZE - 2 + pulse * 2,
          prop.height * TILE_SIZE - 2 + pulse * 2,
        );
      }
    }

    const bob = this.reducedMotion ? 0 : Math.round(Math.sin(time / 180) * 1.5);
    drawAvatar(
      this.context,
      state.player.x * TILE_SIZE,
      state.player.y * TILE_SIZE,
      state.player.direction,
      bob,
    );
  }

  eventToTile(event: PointerEvent): Point {
    const bounds = this.canvas.getBoundingClientRect();
    return {
      x: Math.floor(((event.clientX - bounds.left) / bounds.width) * (WORLD_WIDTH / TILE_SIZE)),
      y: Math.floor(((event.clientY - bounds.top) / bounds.height) * (WORLD_HEIGHT / TILE_SIZE)),
    };
  }
}
