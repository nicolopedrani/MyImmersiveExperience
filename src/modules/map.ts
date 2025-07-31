// modules/map.ts

// Tile types:
// 0 = grass
// 1 = oak_tree (non walkable)
// 2,3,4,5 = path (walkable)
// 6 = door (black tile - walkable and interactable)

export const MAP_WIDTH_TILES = 12;
export const MAP_HEIGHT_TILES = 9;

// Stanza principale (hub centrale)
export const room1Map: number[][] = [
  [0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0], // Porta NORD (room2)
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [6, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6], // Porta OVEST (room3) e EST (room4)
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0], // Player start point
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Stanza NORD - Boss Room
export const room2Map: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0], // Alberi decorativi
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 1, 0, 0, 2, 0, 0, 0], // Albero centrale (boss area)
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0], // Porta SUD (ritorno room1)
];

// Stanza OVEST - Work Room
export const room3Map: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 2, 0, 1, 0, 1, 0, 2, 0, 0, 0], // Alberi come "scrivanie"
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 1, 0, 0, 0, 1, 2, 2, 2, 6], // Porta EST (ritorno room1)
  [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 0, 1, 0, 1, 0, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Stanza EST - Hobbies Room
export const room4Map: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 2, 1, 0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 2, 0, 0, 1, 0, 0, 2, 0, 0, 0], // Area hobby centrale
  [6, 2, 2, 0, 1, 0, 1, 0, 2, 0, 0, 0], // Porta OVEST (ritorno room1)
  [0, 0, 2, 0, 0, 1, 0, 0, 2, 0, 0, 0],
  [0, 0, 2, 1, 0, 0, 0, 1, 2, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Sistema delle stanze
export interface Room {
  id: string;
  name: string;
  map: number[][];
  playerStartX: number;
  playerStartY: number;
  doors: Door[];
}

export interface Door {
  x: number;
  y: number;
  targetRoom: string;
  targetX: number;
  targetY: number;
}

export const rooms: { [key: string]: Room } = {
  room1: {
    id: "room1",
    name: "Hub Centrale",
    map: room1Map,
    playerStartX: 5,
    playerStartY: 7,
    doors: [
      { x: 5, y: 0, targetRoom: "room2", targetX: 5, targetY: 7 }, // Nord -> room2
      { x: 0, y: 4, targetRoom: "room3", targetX: 10, targetY: 4 }, // Ovest -> room3
      { x: 11, y: 4, targetRoom: "room4", targetX: 1, targetY: 4 }, // Est -> room4
    ],
  },
  room2: {
    id: "room2",
    name: "Boss Room",
    map: room2Map,
    playerStartX: 5,
    playerStartY: 7,
    doors: [
      { x: 5, y: 8, targetRoom: "room1", targetX: 5, targetY: 1 }, // Sud -> room1
    ],
  },
  room3: {
    id: "room3",
    name: "Work Room",
    map: room3Map,
    playerStartX: 10,
    playerStartY: 4,
    doors: [
      { x: 11, y: 4, targetRoom: "room1", targetX: 1, targetY: 4 }, // Est -> room1
    ],
  },
  room4: {
    id: "room4",
    name: "Hobbies Room",
    map: room4Map,
    playerStartX: 1,
    playerStartY: 4,
    doors: [
      { x: 0, y: 4, targetRoom: "room1", targetX: 10, targetY: 4 }, // Ovest -> room1
    ],
  },
};

// Stanza corrente
export let currentRoom: Room = rooms.room1;
