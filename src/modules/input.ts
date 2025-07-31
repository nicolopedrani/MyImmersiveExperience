import { player, playerAnimations, Direction, AnimationState } from "./player";
import { room1Map, MAP_WIDTH_TILES, MAP_HEIGHT_TILES } from "./map";

export function setupInputListeners(): void {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    let dir: Direction | null = null;

    switch (e.key) {
      case "ArrowUp":
        dir = "up";
        break;
      case "ArrowDown":
        dir = "down";
        break;
      case "ArrowLeft":
        dir = "left";
        break;
      case "ArrowRight":
        dir = "right";
        break;
    }

    if (!dir) return;

    if (dir !== player.direction) {
      player.direction = dir;
      player.animationState = "idle";

      const base = player.direction === "left" ? "right" : player.direction;
      player.currentAnimation = playerAnimations[`${base}_idle`];
      player.frameIndex = 0;
      player.animationTimer = 0;
    } else {
      let newX: number = player.x;
      let newY: number = player.y;

      if (dir === "up") newY--;
      else if (dir === "down") newY++;
      else if (dir === "left") newX--;
      else if (dir === "right") newX++;

      if (
        newX >= 0 &&
        newX < MAP_WIDTH_TILES &&
        newY >= 0 &&
        newY < MAP_HEIGHT_TILES
      ) {
        const tile: number = room1Map[newY][newX];
        if ([0, 2, 3, 4, 5].includes(tile)) {
          player.x = newX;
          player.y = newY;
          player.animationState = "walk";
        } else {
          player.animationState = "idle";
        }
      }
    }

    const base = player.direction === "left" ? "right" : player.direction;
    player.currentAnimation =
      playerAnimations[`${base}_${player.animationState}`];
    player.frameIndex = 0;
    player.animationTimer = 0;

    e.preventDefault();
  });

  document.addEventListener("keyup", (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      player.animationState = "idle";
      const base = player.direction === "left" ? "right" : player.direction;
      player.currentAnimation = playerAnimations[`${base}_idle`];
      player.frameIndex = 0;
      player.animationTimer = 0;
    }
  });
}

function simulateKeyPress(key: string) {
  const event = new KeyboardEvent("keydown", { key });
  document.dispatchEvent(event);
}

export function setupTouchControls(): void {
  const directions: { [id: string]: string } = {
    "btn-up": "ArrowUp",
    "btn-down": "ArrowDown",
    "btn-left": "ArrowLeft",
    "btn-right": "ArrowRight",
    "btn-action": " ", // tasto spazio
  };

  for (const [btnId, key] of Object.entries(directions)) {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener("touchstart", () => simulateKeyPress(key));
      btn.addEventListener("mousedown", () => simulateKeyPress(key)); // supporto mouse
    }
  }
}
