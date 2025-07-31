import { updateDebugPanel } from "./modules/debug";
import { loadAssets } from "./modules/assets";
import { preloadPlayerSprites } from "./modules/sprites";
import { room1Map, MAP_WIDTH_TILES, MAP_HEIGHT_TILES } from "./modules/map";
import { player, updatePlayerAnimation, drawPlayer } from "./modules/player";
import { setupInputListeners } from "./modules/input";
import { setupCanvas } from "./modules/canvas";

// --- Setup canvas ---
const { canvas, ctx, TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } =
  setupCanvas(room1Map);
if (canvas && ctx) {
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
} else {
  throw new Error("Canvas or context not initialized");
}

// --- Load assets and start game loop ---
let lastTime = 0;

function startGame(): void {
  requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime: number): void {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  updatePlayerAnimation(deltaTime);
  if (ctx) {
    draw(ctx, room1Map, TILE_SIZE);
  }
  requestAnimationFrame(gameLoop);

  updateDebugPanel(currentTime);
}

function draw(
  ctx: CanvasRenderingContext2D,
  map: number[][],
  tileSize: number
): void {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  const assets = loadAssets.getAssets();

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      const tile = map[y][x];
      let image: HTMLImageElement | null = null;

      switch (tile) {
        case 0:
          image = assets.grass ?? null;
          break;
        case 1:
          image = assets.oak_tree ?? null;
          break;
        case 2:
        case 3:
        case 4:
        case 5:
          image = assets.path ?? null;
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
