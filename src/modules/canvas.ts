export function setupCanvas(map: number[][]): {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  TILE_SIZE: number;
  GAME_WIDTH: number;
  GAME_HEIGHT: number;
} {
  const canvas: HTMLCanvasElement | null = document.getElementById(
    "gameCanvas"
  ) as HTMLCanvasElement | null;
  const ctx: CanvasRenderingContext2D | null = canvas
    ? canvas.getContext("2d")
    : null;

  const TILE_SIZE = 64;
  const MAP_WIDTH_TILES = map[0].length;
  const MAP_HEIGHT_TILES = map.length;
  const GAME_WIDTH = MAP_WIDTH_TILES * TILE_SIZE;
  const GAME_HEIGHT = MAP_HEIGHT_TILES * TILE_SIZE;

  return {
    canvas,
    ctx,
    TILE_SIZE,
    GAME_WIDTH,
    GAME_HEIGHT,
  };
}

export function scaleCanvasToWindow(canvas: HTMLCanvasElement): void {
  const scaleX = window.innerWidth / canvas.width;
  const scaleY = window.innerHeight / canvas.height;
  const scale = Math.min(scaleX, scaleY);

  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = "top left";

  canvas.style.position = "absolute";
  canvas.style.left = `${(window.innerWidth - canvas.width * scale) / 2}px`;
  canvas.style.top = `${(window.innerHeight - canvas.height * scale) / 2}px`;
}
