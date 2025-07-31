// modules/roomManager.ts

import { rooms, currentRoom, Room, Door } from "./map";
import { player } from "./player";

let activeRoom: Room = rooms.room1;

export function getCurrentRoom(): Room {
  return activeRoom;
}

export function changeRoom(roomId: string): boolean {
  const newRoom = rooms[roomId];
  if (!newRoom) {
    console.error(`Room ${roomId} not found!`);
    return false;
  }

  console.log(`Changing from ${activeRoom.name} to ${newRoom.name}`);

  activeRoom = newRoom;

  // Posiziona il player nel punto di spawn della nuova stanza
  player.x = newRoom.playerStartX;
  player.y = newRoom.playerStartY;

  return true;
}

export function checkForDoorInteraction(): boolean {
  const playerX = player.x;
  const playerY = player.y;

  // Cerca una porta nella posizione del player
  const door = activeRoom.doors.find((d) => d.x === playerX && d.y === playerY);

  if (door) {
    console.log(
      `Found door at (${playerX}, ${playerY}) leading to ${door.targetRoom}`
    );

    // Cambia stanza
    if (changeRoom(door.targetRoom)) {
      // Posiziona il player nella posizione target della porta
      player.x = door.targetX;
      player.y = door.targetY;
      return true;
    }
  }

  return false;
}

export function isDoorTile(x: number, y: number): boolean {
  return activeRoom.doors.some((door) => door.x === x && door.y === y);
}

export function initializeRoomSystem(): void {
  // Inizializza il sistema delle stanze
  activeRoom = rooms.room1;
  player.x = activeRoom.playerStartX;
  player.y = activeRoom.playerStartY;

  console.log(`Room system initialized. Starting in ${activeRoom.name}`);
}
