// modules/roomManager.ts - Enhanced version with better door handling

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
  // Create a temporary room announcement
  const announcement = document.createElement("div");
  announcement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    z-index: 2000;
    border: 3px solid #fff;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.7);
    animation: fadeInOut 3s ease-in-out forwards;
  `;

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
  `;
  document.head.appendChild(style);

  announcement.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 10px;">${newRoom.name}</div>
    <div style="font-size: 16px; opacity: 0.8;">${
      newRoom.description || ""
    }</div>
  `;

  document.body.appendChild(announcement);

  // Remove announcement after animation (reduced from 3000ms to 2000ms)
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
    if (document.head.contains(style)) {
      document.head.removeChild(style);
    }
  }, 2000);
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
