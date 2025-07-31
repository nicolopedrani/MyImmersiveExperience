// modules/player.js

import { MAP_WIDTH_TILES, MAP_HEIGHT_TILES } from "./map.js";

export const playerAnimations = {
  down_idle: [],
  down_walk: [],
  up_idle: [],
  up_walk: [],
  left_idle: [],
  left_walk: [],
  right_idle: [],
  right_walk: [],
};

export const player = {
  x: Math.floor(MAP_WIDTH_TILES / 2),
  y: MAP_HEIGHT_TILES - 2,
  direction: "down",
  animationState: "idle",
  currentAnimation: [],
  frameIndex: 0,
  animationTimer: 0,
  animationSpeed: 0.15,
};

player.currentAnimation = playerAnimations.down_idle;

export function updatePlayerAnimation(deltaTime) {
  player.animationTimer += deltaTime;
  if (player.animationTimer >= player.animationSpeed) {
    player.animationTimer = 0;
    player.frameIndex =
      (player.frameIndex + 1) % player.currentAnimation.length;
  }
}

export function drawPlayer(ctx, TILE_SIZE) {
  const frame = player.currentAnimation[player.frameIndex];
  if (!frame) return;

  const drawX = player.x * TILE_SIZE;
  const drawY = player.y * TILE_SIZE;

  ctx.save();
  if (player.direction === "left") {
    const frameWidth = frame.width;
    ctx.translate(drawX, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(frame, -frameWidth, 0);
  } else {
    ctx.drawImage(frame, drawX, drawY);
  }
  ctx.restore();
}
