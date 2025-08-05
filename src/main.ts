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

// Enhanced drawing function for main.ts - Using your actual tilesheets
// Replace the existing draw function with this enhanced version

function draw(ctx: CanvasRenderingContext2D, tileSize: number): void {
  // Clear canvas
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const assets = getAssets();
  const currentRoom = getCurrentRoom();
  const map = currentRoom.map;

  // Check if assets are loaded
  if (!assets.grass) {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Loading assets...", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    return;
  }

  // Draw map tiles using your tilesheets
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      const tile = map[y][x];
      let image: HTMLImageElement | null = null;

      // Map tiles to your actual tilesheet assets
      switch (tile) {
        case 0: // Grass (non-walkable)
          image = assets.grass;
          break;
        case 1: // Oak tree
          image = assets.oak_tree;
          break;
        case 2:
        case 3:
        case 4:
        case 5: // Path tiles
          image = assets.path;
          break;
        case 6: // Door tile
          image = assets.door;
          break;
        case 7: // Library floor (from library.png)
          image = assets.library_floor;
          break;
        case 8: // Bookshelf (from library.png)
          image =
            assets.library_bsA || assets.library_bsB || assets.library_bsC;
          break;
        case 9: // Football field (legacy - not used anymore)
          image = assets.football_center || assets.football_0;
          break;
        case 10: // Travel flag (from travel_flags_tilesheet.png)
          image =
            assets.flag_it ||
            assets.flag_fr ||
            assets.flag_de ||
            assets.flag_us;
          break;
        case 11: // Library table (from library.png)
          image = assets.library_table;
          break;
        case 12: // Library chair (from library.png)
          image = assets.library_chair;
          break;
        case 13: // Library rug (from library.png)
          image = assets.library_rug;
          break;
        case 14: // Tree from assets.png (using metadata) - now with green background
          image = assets.tree_t1 || assets.tree_t2 || assets.tree_t3;
          break;
        case 15: // Bush from assets.png - REMOVED (no longer used)
          // Bushes removed as requested
          break;
        // Complete football field grid (4x3 = 12 tiles from FootballGround.png)
        case 16:
          image = assets.football_0;
          break; // Top row
        case 17:
          image = assets.football_1;
          break;
        case 18:
          image = assets.football_2;
          break;
        case 19:
          image = assets.football_3;
          break;
        case 20:
          image = assets.football_4;
          break; // Middle row
        case 21:
          image = assets.football_5;
          break;
        case 22:
          image = assets.football_6;
          break;
        case 23:
          image = assets.football_7;
          break;
        case 24:
          image = assets.football_8;
          break; // Bottom row
        case 25:
          image = assets.football_9;
          break;
        case 26:
          image = assets.football_10;
          break;
        case 27:
          image = assets.football_11;
          break;
        case 28: // World map from library.png (perfect for travel hobby!)
          image = assets.world_map;
          break;
      }

      if (image) {
        ctx.drawImage(image, x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        // Fallback colors for missing tiles
        let fallbackColor = "#90EE90"; // Default light green

        switch (tile) {
          case 0:
            fallbackColor = "#228B22";
            break; // Green for grass
          case 1:
            fallbackColor = "#8B4513";
            break; // Brown for trees
          case 6:
            fallbackColor = "#2C2C2C";
            break; // Dark gray for doors
          case 7:
            fallbackColor = "#D2B48C";
            break; // Tan for library floor
          case 8:
            fallbackColor = "#8B4513";
            break; // Brown for bookshelves
          case 9:
            fallbackColor = "#32CD32";
            break; // Lime green for football field
          case 10:
            fallbackColor = "#FF6347";
            break; // Red for flags
          case 11:
            fallbackColor = "#A0522D";
            break; // Brown for table
          case 12:
            fallbackColor = "#CD853F";
            break; // Light brown for chair
          case 13:
            fallbackColor = "#DC143C";
            break; // Red for rug
          case 14:
            fallbackColor = "#654321";
            break; // Dark brown for asset trees
          // case 15: bushes removed
          // Football field grid fallbacks
          case 16:
          case 17:
          case 18:
          case 19:
          case 20:
          case 21:
          case 22:
          case 23:
          case 24:
          case 25:
          case 26:
          case 27:
            fallbackColor = "#32CD32";
            break; // Lime green for football field
          case 28:
            fallbackColor = "#87CEEB";
            break; // Sky blue for world map
        }

        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }

      // Special handling for tall objects from your assets
      if ((tile === 1 || tile === 14) && image) {
        // Oak trees and asset trees
        const objectHeight = image.naturalHeight || image.height;
        if (objectHeight > tileSize) {
          ctx.drawImage(
            image,
            x * tileSize,
            y * tileSize - (objectHeight - tileSize),
            tileSize,
            objectHeight
          );
        }
      }

      // Handle large objects from library tileset (bookshelves and world map)
      if ((tile === 8 || tile === 28) && image) {
        // Bookshelves and world map
        const objectHeight = image.naturalHeight || image.height;
        if (objectHeight > tileSize) {
          ctx.drawImage(
            image,
            x * tileSize,
            y * tileSize - (objectHeight - tileSize),
            tileSize,
            objectHeight
          );
        }
      }

      // Add visual indicators for interactive tiles
      if (tile === 6) {
        // Door tiles
        // Add a subtle glow effect for doors
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(
          x * tileSize + 2,
          y * tileSize + 2,
          tileSize - 4,
          tileSize - 4
        );
        ctx.restore();
      }

      // Add variety to flags in hobbies room
      if (tile === 10 && currentRoom.id === "room4") {
        // Cycle through different flags for variety
        const flagVariants = [
          assets.flag_it,
          assets.flag_fr,
          assets.flag_de,
          assets.flag_us,
          assets.flag_jp,
          assets.flag_au,
          assets.flag_es,
          assets.flag_gb,
        ].filter(Boolean);

        if (flagVariants.length > 0) {
          const flagIndex = (x + y) % flagVariants.length;
          const flagImage = flagVariants[flagIndex];
          if (flagImage) {
            ctx.drawImage(
              flagImage,
              x * tileSize,
              y * tileSize,
              tileSize,
              tileSize
            );
          }
        }
      }
    }
  }

  // Draw player
  drawPlayer(ctx, tileSize);

  // Draw room information
  drawRoomInfo(ctx, currentRoom);

  // No more hobby labels - removed as requested
}

function drawRoomInfo(ctx: CanvasRenderingContext2D, room: any): void {
  // Room name
  ctx.fillStyle = "#fff";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "left";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;

  // Text with outline for better visibility
  ctx.strokeText(room.name, 15, 35);
  ctx.fillText(room.name, 15, 35);

  // Room description (if available and room is not the central hub)
  if (room.description && room.id !== "room1") {
    ctx.font = "12px Arial";
    ctx.fillStyle = "#E0E0E0";

    // Word wrap the description
    const maxWidth = GAME_WIDTH - 30;
    const words = room.description.split(" ");
    let line = "";
    let y = 55;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.strokeText(line, 15, y);
        ctx.fillText(line, 15, y);
        line = words[n] + " ";
        y += 16;
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.strokeText(line, 15, y);
      ctx.fillText(line, 15, y);
    }
  }
}

// Additional helper function to get random flag for variety
function getRandomFlag(assets: any): HTMLImageElement | null {
  const flags = [
    assets.flag_it,
    assets.flag_fr,
    assets.flag_de,
    assets.flag_us,
    assets.flag_jp,
    assets.flag_au,
    assets.flag_es,
    assets.flag_gb,
    assets.flag_nl,
    assets.flag_ch,
    assets.flag_ma,
    assets.flag_eg,
  ].filter(Boolean);

  if (flags.length === 0) return null;

  return flags[Math.floor(Math.random() * flags.length)];
}

// Usage instructions to replace in main.ts:
// 1. Import the enhanced modules
// 2. Replace the existing draw function with this enhanced version
// 3. Update the asset loading to use the proper tilesheets

// Note: Also update the imports in main.ts to include:
// import { WALKABLE_TILES, NON_WALKABLE_TILES } from "./modules/map";
// import { getRoomDescription } from "./modules/roomManager";

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
