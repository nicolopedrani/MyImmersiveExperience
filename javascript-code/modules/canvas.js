export function setupCanvas(map) {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

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
