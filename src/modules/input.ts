import { player, playerAnimations, Direction, AnimationState } from "./player";
import { getCurrentRoom } from "./roomManager";
import { checkForDoorInteraction } from "./roomManager";

let isKeyPressed = false;

export function setupInputListeners(): void {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(e: KeyboardEvent): void {
  if (isKeyPressed) return; // Previeni ripetizioni rapide

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
    case " ": // Spacebar per azione
      console.log("Action button pressed!");
      // Controlla se il player è su una porta
      if (checkForDoorInteraction()) {
        console.log("Entered new room!");
      } else {
        console.log("No door here to interact with.");
      }
      return;
  }

  if (!dir) return;

  isKeyPressed = true;
  movePlayer(dir);
  e.preventDefault();
}

function handleKeyUp(e: KeyboardEvent): void {
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
    isKeyPressed = false;
    player.animationState = "idle";
    const base = player.direction === "left" ? "right" : player.direction;
    player.currentAnimation = playerAnimations[`${base}_idle`];
    player.frameIndex = 0;
    player.animationTimer = 0;
  }
}

function movePlayer(dir: Direction): void {
  const currentRoomData = getCurrentRoom();
  const MAP_WIDTH_TILES = currentRoomData.map[0].length;
  const MAP_HEIGHT_TILES = currentRoomData.map.length;

  // Cambia direzione se diversa
  if (dir !== player.direction) {
    player.direction = dir;
    player.animationState = "idle";

    const base = player.direction === "left" ? "right" : player.direction;
    player.currentAnimation = playerAnimations[`${base}_idle`];
    player.frameIndex = 0;
    player.animationTimer = 0;
  } else {
    // Muovi nella stessa direzione
    let newX = player.x;
    let newY = player.y;

    if (dir === "up") newY--;
    else if (dir === "down") newY++;
    else if (dir === "left") newX--;
    else if (dir === "right") newX++;

    // Controlla limiti della mappa
    if (
      newX >= 0 &&
      newX < MAP_WIDTH_TILES &&
      newY >= 0 &&
      newY < MAP_HEIGHT_TILES
    ) {
      const tile = currentRoomData.map[newY][newX];
      // Tile walkable: 0=grass, 2,3,4,5=path, 6=door
      if ([0, 2, 3, 4, 5, 6].includes(tile)) {
        player.x = newX;
        player.y = newY;
        player.animationState = "walk";
      } else {
        player.animationState = "idle";
      }
    } else {
      player.animationState = "idle";
    }
  }

  // Aggiorna animazione
  const base = player.direction === "left" ? "right" : player.direction;
  player.currentAnimation =
    playerAnimations[`${base}_${player.animationState}`];
  player.frameIndex = 0;
  player.animationTimer = 0;
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
      // Previeni comportamenti di default
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

      // Supporto mouse per debug
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        simulateKeyPress(key);
      });

      btn.addEventListener("mouseup", (e) => {
        e.preventDefault();
        simulateKeyRelease(key);
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
