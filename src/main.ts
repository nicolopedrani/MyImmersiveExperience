import { updateDebugPanel } from "./modules/debug";
import { loadAssets } from "./modules/assets";
import { preloadPlayerSprites } from "./modules/sprites";
import { room1Map } from "./modules/map";
import { player, updatePlayerAnimation, drawPlayer } from "./modules/player";
import { setupInputListeners, setupTouchControls } from "./modules/input";
import { setupCanvas, scaleCanvasToWindow } from "./modules/canvas";

// --- Setup canvas ---
const { canvas, ctx, TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } =
  setupCanvas(room1Map);

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
  `Canvas initialized: ${GAME_WIDTH}x${GAME_HEIGHT} (${room1Map[0].length}x${room1Map.length} tiles)`
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
    draw(ctx, room1Map, TILE_SIZE);
  }

  // Debug
  if (import.meta.env?.DEV) {
    updateDebugPanel(currentTime);
  }

  requestAnimationFrame(gameLoop);
}

function draw(
  ctx: CanvasRenderingContext2D,
  map: number[][],
  tileSize: number
): void {
  // Clear canvas
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const assets = loadAssets.getAssets();

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
}

// --- Start everything ---
console.log("Loading assets...");
loadAssets(() => {
  console.log("Assets loaded, initializing sprites...");
  preloadPlayerSprites();

  console.log("Setting up input listeners...");
  setupInputListeners();
  setupTouchControls();

  console.log("Starting game...");
  startGame();
});
