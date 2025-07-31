export function setupCanvas(map: number[][]): {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  TILE_SIZE: number;
  GAME_WIDTH: number;
  GAME_HEIGHT: number;
} {
  const canvas = document.getElementById(
    "gameCanvas"
  ) as HTMLCanvasElement | null;
  const ctx = canvas ? canvas.getContext("2d") : null;

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
  // Rimuovi eventuali trasformazioni precedenti
  canvas.style.transform = "";
  canvas.style.position = "";
  canvas.style.left = "";
  canvas.style.top = "";

  // Imposta dimensioni fisse per la canvas interna
  // Il CSS si occuperà del responsive
  canvas.width = canvas.width; // Mantieni la larghezza interna
  canvas.height = canvas.height; // Mantieni l'altezza interna

  // Il CSS gestirà il ridimensionamento responsive
}
