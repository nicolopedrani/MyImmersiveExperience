// modules/roomManager.ts - Enhanced version with better door handling

import { rooms, currentRoom, Room, Door } from "./map";
import { player } from "./player";

// Status bar management
let statusBarTimeoutId: number | null = null;

function updateStatusBar(message: string, duration?: number): void {
  const statusText = document.getElementById("status-text");
  if (statusText) {
    statusText.textContent = message;
    
    // Clear any existing timeout
    if (statusBarTimeoutId) {
      clearTimeout(statusBarTimeoutId);
    }
    
    // Auto-clear after duration (default 3 seconds)
    const hideDelay = duration || 3000;
    statusBarTimeoutId = window.setTimeout(() => {
      if (statusText) {
        statusText.textContent = "";
      }
    }, hideDelay);
  }
}

export { updateStatusBar };

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

  const previousRoom = activeRoom;
  activeRoom = newRoom;

  // Position the player at the spawn point of the new room
  player.x = newRoom.playerStartX;
  player.y = newRoom.playerStartY;

  // Log room transition for debugging
  console.log(
    `Player positioned at (${player.x}, ${player.y}) in ${newRoom.name}`
  );

  // Reset player animation to idle
  player.animationState = "idle";

  // Announce room entry
  announceRoomEntry(newRoom, previousRoom);

  return true;
}

function announceRoomEntry(newRoom: Room, previousRoom: Room): void {
  // Only show room name briefly in status bar
  if (newRoom.id !== previousRoom.id) {
    updateStatusBar(newRoom.name, 2000);
  }
}

export function checkForDoorInteraction(): boolean {
  const playerX = player.x;
  const playerY = player.y;

  // Find a door at the player's position
  const door = activeRoom.doors.find((d) => d.x === playerX && d.y === playerY);

  if (door) {
    console.log(
      `Found door at (${playerX}, ${playerY}) leading to ${door.targetRoom}`
    );

    // Change room
    if (changeRoom(door.targetRoom)) {
      // Position the player at the target location of the door
      player.x = door.targetX;
      player.y = door.targetY;
      console.log(
        `Player moved to target position (${door.targetX}, ${door.targetY})`
      );
      return true;
    }
  }

  return false;
}

export function getDoorAtPosition(x: number, y: number): Door | null {
  return activeRoom.doors.find((door) => door.x === x && door.y === y) || null;
}

export function isDoorTile(x: number, y: number): boolean {
  return activeRoom.doors.some((door) => door.x === x && door.y === y);
}

export function getRoomDescription(): string {
  return activeRoom.description || `Welcome to ${activeRoom.name}`;
}

export function getAllRooms(): { [key: string]: Room } {
  return rooms;
}

export function getRoomCount(): number {
  return Object.keys(rooms).length;
}

export function initializeRoomSystem(): void {
  // Initialize the room system
  activeRoom = rooms.room1;
  player.x = activeRoom.playerStartX;
  player.y = activeRoom.playerStartY;

  console.log(`Room system initialized. Starting in ${activeRoom.name}`);
  console.log(`Player starting position: (${player.x}, ${player.y})`);

  // Show initial room welcome message
  setTimeout(() => {
    announceRoomEntry(activeRoom, activeRoom); // Self-reference for initial welcome
  }, 1000);
}
