// modules/input.js

import { player, playerAnimations } from "./player.js";
import { room1Map, MAP_WIDTH_TILES, MAP_HEIGHT_TILES } from "./map.js";

export function setupInputListeners() {
  document.addEventListener("keydown", (e) => {
    let dir = null;

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
      let newX = player.x;
      let newY = player.y;

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
        const tile = room1Map[newY][newX];
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

  document.addEventListener("keyup", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      player.animationState = "idle";
      const base = player.direction === "left" ? "right" : player.direction;
      player.currentAnimation = playerAnimations[`${base}_idle`];
      player.frameIndex = 0;
      player.animationTimer = 0;
    }
  });
}
