// modules/sprites.js

import { loadAssets } from "./assets.js";
import { playerAnimations } from "./player.js";

const PLAYER_FRAME_WIDTH = 32;
const PLAYER_FRAME_HEIGHT = 32;
const PLAYER_RENDER_SIZE = 64;

export function preloadPlayerSprites() {
  const sheet = loadAssets.getAssets()["player_sprite_sheet"];

  function extract(row, col) {
    const canvas = document.createElement("canvas");
    canvas.width = PLAYER_RENDER_SIZE;
    canvas.height = PLAYER_RENDER_SIZE;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      sheet,
      col * PLAYER_FRAME_WIDTH,
      row * PLAYER_FRAME_HEIGHT,
      PLAYER_FRAME_WIDTH,
      PLAYER_FRAME_HEIGHT,
      0,
      0,
      PLAYER_RENDER_SIZE,
      PLAYER_RENDER_SIZE
    );

    return canvas;
  }

  playerAnimations.down_walk.push(extract(0, 0));
  playerAnimations.right_walk.push(extract(1, 1));
  playerAnimations.up_walk.push(extract(2, 1));

  playerAnimations.down_idle.push(playerAnimations.down_walk[0]);
  playerAnimations.right_idle.push(playerAnimations.right_walk[0]);
  playerAnimations.up_idle.push(playerAnimations.up_walk[0]);
}
