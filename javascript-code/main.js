import { updateDebugPanel } from "./modules/debug.js";
import { loadAssets } from "./modules/assets.js";
import { preloadPlayerSprites } from "./modules/sprites.js";
import { room1Map, MAP_WIDTH_TILES, MAP_HEIGHT_TILES } from "./modules/map.js";
import { player, updatePlayerAnimation, drawPlayer } from "./modules/player.js";
import { setupInputListeners } from "./modules/input.js";
import { setupCanvas } from "./modules/canvas.js";

// --- Setup canvas ---
const { canvas, ctx, TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } =
  setupCanvas(room1Map);
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// --- Load assets and start game loop ---
let lastTime = 0;

function startGame() {
  requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  updatePlayerAnimation(deltaTime);
  draw(ctx, room1Map, TILE_SIZE);
  requestAnimationFrame(gameLoop);
  updateDebugPanel(currentTime);
}

function draw(ctx, map, tileSize) {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  const assets = loadAssets.getAssets();

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      const tile = map[y][x];
      let image = null;

      switch (tile) {
        case 0:
          image = assets.grass;
          break;
        case 1:
          image = assets.oak_tree;
          break;
        case 2:
        case 3:
        case 4:
        case 5:
          image = assets.path;
          break;
      }

      if (image) {
        ctx.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize);
      }

      if (tile === 1 && assets.oak_tree) {
        ctx.drawImage(
          assets.oak_tree,
          x * tileSize,
          y * tileSize - (assets.oak_tree.height - tileSize)
        );
      }
    }
  }

  drawPlayer(ctx, tileSize);
}

// Start everything
loadAssets(() => {
  preloadPlayerSprites();
  setupInputListeners();
  startGame();
});
