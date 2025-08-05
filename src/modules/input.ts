// modules/input.ts - Enhanced version with continuous movement

import { player, playerAnimations, Direction, AnimationState } from "./player";
import { getCurrentRoom } from "./roomManager";
import { checkForDoorInteraction, getDoorAtPosition } from "./roomManager";
import { WALKABLE_TILES } from "./map";

let keysPressed: { [key: string]: boolean } = {};
let currentDoorMessage: string | null = null;
let messageDisplayElement: HTMLDivElement | null = null;
let movementInterval: number | null = null;
const MOVEMENT_SPEED = 200; // milliseconds between moves when key is held

export function setupInputListeners(): void {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Create message display element
  createMessageDisplay();
}

function createMessageDisplay(): void {
  messageDisplayElement = document.createElement("div");
  messageDisplayElement.id = "door-message";
  messageDisplayElement.style.cssText = `
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 16px;
    display: none;
    z-index: 1000;
    border: 2px solid #fff;
    text-align: center;
    max-width: 300px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  `;
  document.body.appendChild(messageDisplayElement);
}

function showDoorMessage(message: string): void {
  if (messageDisplayElement) {
    messageDisplayElement.textContent = message;
    messageDisplayElement.style.display = "block";
    currentDoorMessage = message;
  }
}

function hideDoorMessage(): void {
  if (messageDisplayElement) {
    messageDisplayElement.style.display = "none";
    currentDoorMessage = null;
  }
}

function handleKeyDown(e: KeyboardEvent): void {
  let dir: Direction | null = null;

  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      dir = "up";
      break;
    case "ArrowDown":
    case "s":
    case "S":
      dir = "down";
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      dir = "left";
      break;
    case "ArrowRight":
    case "d":
    case "D":
      dir = "right";
      break;
    case " ": // Spacebar for action
      if (!keysPressed[" "]) {
        // Only trigger once per press
        console.log("Action button pressed!");

        // Check if the player is on a door
        const door = getDoorAtPosition(player.x, player.y);
        if (door) {
          console.log(`Attempting to enter door to ${door.targetRoom}`);
          if (checkForDoorInteraction()) {
            console.log("Successfully entered new room!");
            hideDoorMessage(); // Hide message when transitioning
          }
        } else {
          console.log("No door here to interact with.");
        }

        keysPressed[e.key] = true;
      }
      e.preventDefault();
      return;
  }

  if (dir && !keysPressed[e.key]) {
    // Mark key as pressed
    keysPressed[e.key] = true;

    // Start continuous movement
    startContinuousMovement(dir);
  }

  e.preventDefault();
}

function handleKeyUp(e: KeyboardEvent): void {
  // Mark key as released
  keysPressed[e.key] = false;

  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
    ].includes(e.key)
  ) {
    // Check if any movement key is still pressed
    const movementKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
    ];

    const anyMovementKeyPressed = movementKeys.some((key) => keysPressed[key]);

    if (!anyMovementKeyPressed) {
      // Stop continuous movement
      stopContinuousMovement();

      // Set player to idle
      player.animationState = "idle";
      const base = player.direction === "left" ? "right" : player.direction;
      player.currentAnimation = playerAnimations[`${base}_idle`];
      player.frameIndex = 0;
      player.animationTimer = 0;

      // Check for door after movement stops
      checkForNearbyDoor();
    }
  }
}

function startContinuousMovement(dir: Direction): void {
  // Stop any existing movement interval
  stopContinuousMovement();

  // Move immediately
  movePlayer(dir);

  // Start interval for continuous movement
  movementInterval = window.setInterval(() => {
    // Check if the direction key is still pressed
    const directionKeys = {
      up: ["ArrowUp", "w", "W"],
      down: ["ArrowDown", "s", "S"],
      left: ["ArrowLeft", "a", "A"],
      right: ["ArrowRight", "d", "D"],
    };

    const keysForDirection = directionKeys[dir];
    const stillPressed = keysForDirection.some((key) => keysPressed[key]);

    if (stillPressed) {
      movePlayer(dir);
    } else {
      stopContinuousMovement();
    }
  }, MOVEMENT_SPEED);
}

function stopContinuousMovement(): void {
  if (movementInterval) {
    clearInterval(movementInterval);
    movementInterval = null;
  }
}

function movePlayer(dir: Direction): void {
  const currentRoomData = getCurrentRoom();
  const MAP_WIDTH_TILES = currentRoomData.map[0].length;
  const MAP_HEIGHT_TILES = currentRoomData.map.length;

  // Change direction if different
  if (dir !== player.direction) {
    player.direction = dir;
    player.animationState = "idle";

    const base = player.direction === "left" ? "right" : player.direction;
    player.currentAnimation = playerAnimations[`${base}_idle`];
    player.frameIndex = 0;
    player.animationTimer = 0;
  } else {
    // Move in the same direction
    let newX = player.x;
    let newY = player.y;

    if (dir === "up") newY--;
    else if (dir === "down") newY++;
    else if (dir === "left") newX--;
    else if (dir === "right") newX++;

    // Check map boundaries
    if (
      newX >= 0 &&
      newX < MAP_WIDTH_TILES &&
      newY >= 0 &&
      newY < MAP_HEIGHT_TILES
    ) {
      const tile = currentRoomData.map[newY][newX];

      // Check if tile is walkable using our enhanced tile system
      if (WALKABLE_TILES.includes(tile)) {
        player.x = newX;
        player.y = newY;
        player.animationState = "walk";

        // Check for door immediately after moving
        setTimeout(() => checkForNearbyDoor(), 100);
      } else {
        player.animationState = "idle";
        console.log(`Cannot walk on tile type ${tile} at (${newX}, ${newY})`);
      }
    } else {
      player.animationState = "idle";
      console.log("Cannot move outside map boundaries");
    }
  }

  // Update animation
  const base = player.direction === "left" ? "right" : player.direction;
  player.currentAnimation =
    playerAnimations[`${base}_${player.animationState}`];
  player.frameIndex = 0;
  player.animationTimer = 0;
}

function checkForNearbyDoor(): void {
  const door = getDoorAtPosition(player.x, player.y);

  if (door && door.description) {
    showDoorMessage(door.description);
  } else {
    hideDoorMessage();
  }
}

export function setupTouchControls(): void {
  const directions: { [id: string]: string } = {
    "btn-up": "ArrowUp",
    "btn-down": "ArrowDown",
    "btn-left": "ArrowLeft",
    "btn-right": "ArrowRight",
    "btn-action": " ",
  };

  for (const [btnId, key] of Object.entries(directions)) {
    const btn = document.getElementById(btnId);
    if (btn) {
      // Touch events for mobile
      btn.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          simulateKeyPress(key);
        },
        { passive: false }
      );

      btn.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();
          simulateKeyRelease(key);
        },
        { passive: false }
      );

      // Mouse events for desktop testing
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        simulateKeyPress(key);
      });

      btn.addEventListener("mouseup", (e) => {
        e.preventDefault();
        simulateKeyRelease(key);
      });

      // Handle mouse leave (when dragging off button)
      btn.addEventListener("mouseleave", (e) => {
        e.preventDefault();
        simulateKeyRelease(key);
      });

      // Prevent context menu on long press
      btn.addEventListener("contextmenu", (e) => {
        e.preventDefault();
      });
    }
  }
}

function simulateKeyPress(key: string): void {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}

function simulateKeyRelease(key: string): void {
  const event = new KeyboardEvent("keyup", {
    key,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}

// Export the message functions for external use
export { showDoorMessage, hideDoorMessage, currentDoorMessage };
