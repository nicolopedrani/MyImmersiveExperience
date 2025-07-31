import { updateDebugPanel } from "./modules/debug";
import { loadAssets, getAssets } from "./modules/assets";
import { preloadPlayerSprites } from "./modules/sprites";
import { MAP_WIDTH_TILES, MAP_HEIGHT_TILES } from "./modules/map";
import { player, updatePlayerAnimation, drawPlayer } from "./modules/player";
import { setupInputListeners, setupTouchControls } from "./modules/input";
import { setupCanvas, scaleCanvasToWindow } from "./modules/canvas";
import { getCurrentRoom, initializeRoomSystem } from "./modules/roomManager";

// --- Setup canvas ---
const dummyMap = Array(MAP_HEIGHT_TILES)
  .fill(null)
  .map(() => Array(MAP_WIDTH_TILES).fill(0));
const { canvas, ctx, TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } =
  setupCanvas(dummyMap);

if (!canvas) {
  console.error(
    "Canvas element not found! Make sure there's a canvas with id='gameCanvas'"
  );
  throw new Error("Canvas not found");
}

if (!ctx) {
  console.error("Could not get 2D context from canvas");
  throw new Error("Canvas context not available");
}

// Imposta dimensioni della canvas
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

console.log(
  `Canvas initialized: ${GAME_WIDTH}x${GAME_HEIGHT} (${MAP_WIDTH_TILES}x${MAP_HEIGHT_TILES} tiles)`
);

// Setup responsive scaling
scaleCanvasToWindow(canvas);
window.addEventListener("resize", () => scaleCanvasToWindow(canvas));

// --- Game loop ---
let lastTime = 0;
let gameRunning = false;

function startGame(): void {
  if (gameRunning) return;
  gameRunning = true;
  console.log("Game started!");
  requestAnimationFrame(gameLoop);
}

function gameLoop(currentTime: number): void {
  if (!gameRunning) return;

  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Update
  updatePlayerAnimation(deltaTime);

  // Draw
  if (ctx) {
    draw(ctx, TILE_SIZE);
  }

  // Debug
  if (import.meta.env?.DEV) {
    updateDebugPanel(currentTime);
  }

  requestAnimationFrame(gameLoop);
}

function draw(ctx: CanvasRenderingContext2D, tileSize: number): void {
  // Clear canvas
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const assets = getAssets();
  const currentRoom = getCurrentRoom();
  const map = currentRoom.map;

  // Verifica che gli asset siano caricati
  if (!assets.grass) {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Loading assets...", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    return;
  }

  // Draw map
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      const tile = map[y][x];
      let image: HTMLImageElement | null = null;

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
        case 6: // Door tile
          image = assets.door;
          break;
      }

      if (image) {
        ctx.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        // Fallback per tile non trovate
        ctx.fillStyle = tile === 1 ? "#8B4513" : "#90EE90";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }

      // Disegna alberi con altezza extra
      if (tile === 1 && assets.oak_tree) {
        const treeHeight = assets.oak_tree.height;
        ctx.drawImage(
          assets.oak_tree,
          x * tileSize,
          y * tileSize - (treeHeight - tileSize),
          tileSize,
          treeHeight
        );
      }
    }
  }

  // Draw player
  drawPlayer(ctx, tileSize);

  // Draw room name
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.fillText(currentRoom.name, 10, 30);
}

// --- Start everything ---
console.log("Loading assets...");
loadAssets(() => {
  console.log("Assets loaded, initializing sprites...");
  preloadPlayerSprites();

  console.log("Initializing room system...");
  initializeRoomSystem();

  console.log("Setting up input listeners...");
  setupInputListeners();
  setupTouchControls();

  console.log("Starting game...");
  startGame();
});
