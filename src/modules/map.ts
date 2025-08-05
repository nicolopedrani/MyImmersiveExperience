// modules/map.ts - Proper implementation using your tilesheets

// Tile types based on your actual assets:
// 0 = grass (NON-WALKABLE - as requested)
// 1 = oak_tree (non-walkable decoration)
// 2,3,4,5 = path (walkable)
// 6 = door (walkable and interactable)
// 7 = library_floor (walkable - from library tileset)
// 8 = bookshelf (non-walkable - from library tileset)
// 9 = football_field (walkable - from football tileset) - UNUSED, replaced with specific grid
// 10 = travel_flag (non-walkable - from travel flags tileset)
// 11 = library_table (non-walkable furniture)
// 12 = library_chair (non-walkable furniture)
// 13 = library_rug (walkable decoration)
// 14 = tree_from_assets (non-walkable - from assets.png)
// 15 = bush_from_assets (non-walkable - from assets.png)
// 16-27 = football_field_grid (walkable - complete 4x3 football ground from FootballGround.png)
//   16=football_0 (top-left), 17=football_1, 18=football_2, 19=football_3 (top-right)
//   20=football_4, 21=football_5, 22=football_6, 23=football_7
//   24=football_8 (bottom-left), 25=football_9, 26=football_10, 27=football_11 (bottom-right)
// 28 = world_map (non-walkable - from library.png, perfect for travel hobby)

export const MAP_WIDTH_TILES = 12;
export const MAP_HEIGHT_TILES = 9;

// Central Hub - Enhanced with trees (no bushes) from assets.png
export const room1Map: number[][] = [
  [0, 14, 0, 1, 1, 6, 1, 1, 0, 14, 0, 0], // Door NORTH with oak trees and asset trees
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0], // No bushes
  [0, 1, 0, 14, 0, 2, 0, 14, 0, 1, 0, 0], // Mix of oak trees and asset trees
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0], // Clean grass areas
  [6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6], // Main walkable cross path
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0], // Clean grass areas
  [0, 1, 0, 14, 0, 2, 0, 14, 0, 1, 0, 0], // More trees variety
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0], // Clean near player start
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Grass border (non-walkable)
];

// Boss Room - Keep existing
export const room2Map: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 1, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0],
];

// Work Room - Keep existing
export const room3Map: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 2, 0, 1, 0, 1, 0, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 1, 0, 0, 0, 1, 2, 2, 2, 6],
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 0, 1, 0, 1, 0, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Hobbies Room - Using your actual tilesheets with world map for travel!
export const room4Map: number[][] = [
  // Top row: Library area with bookshelves and travel flags
  [0, 8, 8, 8, 0, 10, 10, 10, 0, 8, 8, 0], // Bookshelves + flags on grass
  [0, 7, 7, 7, 0, 7, 7, 7, 0, 7, 7, 0], // Library walkable floor
  [0, 7, 11, 12, 2, 7, 28, 7, 2, 10, 10, 0], // Reading area with WORLD MAP for travel!
  [0, 13, 7, 7, 2, 2, 2, 2, 2, 7, 7, 0], // Library rug + central path
  [6, 2, 2, 16, 17, 18, 19, 2, 2, 2, 2, 0], // Entrance + football field row 1 (4x3 grid)
  [0, 2, 2, 20, 21, 22, 23, 2, 10, 10, 10, 0], // Football field row 2 + travel flags
  [0, 2, 2, 24, 25, 26, 27, 2, 7, 7, 7, 0], // Football field row 3 + library floor
  [0, 2, 2, 2, 2, 2, 2, 2, 7, 8, 7, 0], // Path + library area
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Grass border (non-walkable)
];

export interface Room {
  id: string;
  name: string;
  map: number[][];
  playerStartX: number;
  playerStartY: number;
  doors: Door[];
  description?: string;
}

export interface Door {
  x: number;
  y: number;
  targetRoom: string;
  targetX: number;
  targetY: number;
  description?: string;
}

export const rooms: { [key: string]: Room } = {
  room1: {
    id: "room1",
    name: "Central Hub",
    map: room1Map,
    playerStartX: 5,
    playerStartY: 7,
    description:
      "Welcome! Choose your path to explore different aspects of my profile.",
    doors: [
      {
        x: 5,
        y: 0,
        targetRoom: "room2",
        targetX: 5,
        targetY: 7,
        description: "Press SPACE to enter the Boss Room",
      },
      {
        x: 0,
        y: 4,
        targetRoom: "room3",
        targetX: 10,
        targetY: 4,
        description: "Press SPACE to enter the Work Experience Room",
      },
      {
        x: 11,
        y: 4,
        targetRoom: "room4",
        targetX: 1,
        targetY: 4,
        description: "Press SPACE to enter the Hobbies Room",
      },
    ],
  },
  room2: {
    id: "room2",
    name: "Boss Room",
    map: room2Map,
    playerStartX: 5,
    playerStartY: 7,
    description:
      "Face the final challenge - meet the person behind this experience!",
    doors: [
      {
        x: 5,
        y: 8,
        targetRoom: "room1",
        targetX: 5,
        targetY: 1,
        description: "Press SPACE to return to Central Hub",
      },
    ],
  },
  room3: {
    id: "room3",
    name: "Work Experience",
    map: room3Map,
    playerStartX: 10,
    playerStartY: 4,
    description: "Explore my professional journey and key accomplishments.",
    doors: [
      {
        x: 11,
        y: 4,
        targetRoom: "room1",
        targetX: 1,
        targetY: 4,
        description: "Press SPACE to return to Central Hub",
      },
    ],
  },
  room4: {
    id: "room4",
    name: "My Hobbies",
    map: room4Map,
    playerStartX: 1,
    playerStartY: 4,
    description:
      "Discover my passions: Reading, Football, and Traveling the world!",
    doors: [
      {
        x: 0,
        y: 4,
        targetRoom: "room1",
        targetX: 10,
        targetY: 4,
        description: "Press SPACE to return to Central Hub",
      },
    ],
  },
};

// IMPORTANT: Grass (tile 0) is NOT walkable as requested
export const WALKABLE_TILES = [
  2, 3, 4, 5, 6, 7, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
]; // paths, doors, library floor, rug, complete football field (removed bushes)

// Non-walkable tiles (including grass!)
export const NON_WALKABLE_TILES = [0, 1, 8, 10, 11, 12, 14, 28]; // grass, trees, bookshelves, flags, furniture, world map (removed bushes)

export let currentRoom: Room = rooms.room1;
