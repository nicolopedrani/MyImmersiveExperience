// modules/map.js

// 9 x 12 tiles
// 1 tile = 64px
export const room1Map: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0], // Porta UP (Boss)
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 3, 2, 2, 2, 2, 2, 2, 2, 4, 0, 0], // LEFT (Work) e RIGHT (Hobbies)
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0], // Start point
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const MAP_WIDTH_TILES: number = room1Map[0].length;
export const MAP_HEIGHT_TILES: number = room1Map.length;
