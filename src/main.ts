import { updateDebugPanel } from "./modules/debug";
import { loadAssets, getAssets } from "./modules/assets";
import { preloadPlayerSprites } from "./modules/sprites";
import { MAP_WIDTH_TILES, MAP_HEIGHT_TILES } from "./modules/map";
import { player, updatePlayerAnimation, drawPlayer } from "./modules/player";
import { setupInputListeners, setupTouchControls } from "./modules/input";
import { setupCanvas, scaleCanvasToWindow } from "./modules/canvas";
import { getCurrentRoom, initializeRoomSystem, updateStatusBar } from "./modules/roomManager";
import { initializeBossInteraction, checkBossProximity } from "./modules/bossInteraction";
import { answerQuestion, getFallbackResponse, isAIReady, switchModel, getCurrentModelKey, setProgressUpdateCallback, startBackgroundLoading, setBackgroundProgressCallback } from "./modules/aiProcessor";
import { gameBoyConversation } from "./modules/gameboyConversation";
import { initializeDesktopControls } from "./modules/desktopControls";
import { directionalSignalManager } from "./modules/directionalSignals";

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

// --- Initialize GameBoy conversation system ---
// The gameBoyConversation is automatically initialized when imported

// Setup real-time progress callback for download progress (currently unused in GameBoy style)
// setProgressUpdateCallback((modelKey: string, percentage: number, loaded: string, total: string, remaining: string, rate?: number) => {
//   // Progress updates can be added to GameBoy conversation later if needed
// });

// Setup background loading progress callback
setBackgroundProgressCallback((modelKey: string, status: string, progress?: number) => {
  console.log(`🔄 Background loading ${modelKey}: ${status} ${progress ? `(${progress}MB)` : ''}`);
  
  // You could add a subtle UI indicator here in the future
  // For now, just log the background progress
  if (status === 'completed') {
    console.log(`⚡ ${modelKey} model ready for instant switching!`);
  }
});

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
  
  // Update directional signals
  const currentRoom = getCurrentRoom();
  directionalSignalManager.update(deltaTime, player.x, player.y, currentRoom.id);
  
  // Update status bar with directional signal information
  const nearestSignal = directionalSignalManager.getNearestSignal(player.x, player.y, currentRoom.id);
  if (nearestSignal) {
    updateStatusBar(`${nearestSignal.icon} ${nearestSignal.roomName} - ${nearestSignal.description}`, 100); // Short duration for frequent updates
  }
  
  // Check boss proximity (only if conversation is not active)
  if (!gameBoyConversation.isConversationActive()) {
    checkBossProximity();
  }

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
        // Data Science Experience tiles - Business Analytics
        case 29: // NPS analysis chart
          image = assets.nps_chart;
          break;
        case 30: // Energy cost optimization
          image = assets.energy_cost_chart;
          break;
        case 31: // Fashion retail time series
          image = assets.fashion_retail_timeseries;
          break;
        case 32: // Supply chain network map
          image = assets.distribution_network_map;
          break;
        // Statistical Analysis
        case 33: // Forecast histogram
          image = assets.forecast_histogram;
          break;
        case 34: // Box plot analysis
          image = assets.box_plot;
          break;
        case 35: // Deloitte Consulting branding
          image = assets.deloitte_consulting;
          break;
        // BI Dashboard (2 tiles)
        case 36: // Power BI dashboard left
          image = assets.powerbi_dashboard_left;
          break;
        case 37: // Power BI dashboard right
          image = assets.powerbi_dashboard_right;
          break;
        // Tech Stacks
        case 38: // Python/scikit-learn
          image = assets.python_sklearn;
          break;
        case 39: // PyTorch/LangChain
          image = assets.pytorch_langchain;
          break;
        // Advanced Systems
        case 40: // Recommendation tree
          image = assets.recommendation_tree;
          break;
        case 41: // Azure Machine Learning
          image = assets.azure_ml;
          break;
        case 42: // Azure Data Factory
          image = assets.azure_data_factory;
          break;
        case 43: // Chatbot AI
          image = assets.chatbot_ai;
          break;
        case 44: // Gantt chart project management
          image = assets.gantt_chart;
          break;
        // R&D System Engineer Experience tiles - Infrared & Defense Systems
        case 45: // IR spectrum visualization
          image = assets.ir_spectrum;
          break;
        case 46: // Atmospheric transmission plot
          image = assets.atmospheric_transmission;
          break;
        case 47: // Multi-camera array positioning
          image = assets.multi_camera_array;
          break;
        case 48: // Leonardo SpA company branding
          image = assets.leonardo_spa;
          break;
        case 49: // Object detection with bounding boxes
          image = assets.object_detection;
          break;
        case 50: // Kalman filter state estimation
          image = assets.kalman_filter;
          break;
        case 51: // Optical flow motion vectors
          image = assets.optical_flow;
          break;
        case 52: // 360° missile warning coverage
          image = assets.coverage_360;
          break;
        case 53: // Threat detection interface
          image = assets.threat_interface;
          break;
        case 54: // Multiple target tracking display
          image = assets.multi_target_tracking;
          break;
        case 55: // MATLAB/Simulink tech stack
          image = assets.matlab_simulink;
          break;
        case 56: // IR system block diagram
          image = assets.system_architecture;
          break;
        case 57: // System requirements matrix
          image = assets.requirements_specs;
          break;
        case 58: // IR detector hardware
          image = assets.ir_detector;
          break;
        case 59: // Brick wall
          image = assets.brick_wall;
          break;
        // Individual travel flags
        case 60: // Australia flag
          image = assets.flag_au;
          break;
        case 61: // United States flag
          image = assets.flag_us;
          break;
        case 62: // Japan flag
          image = assets.flag_jp;
          break;
        case 63: // Vietnam flag
          image = assets.flag_vn;
          break;
        case 64: // Maldives flag
          image = assets.flag_mv;
          break;
        case 65: // Italy flag
          image = assets.flag_it;
          break;
        case 66: // France flag
          image = assets.flag_fr;
          break;
        case 67: // Germany flag
          image = assets.flag_de;
          break;
        case 68: // Spain flag
          image = assets.flag_es;
          break;
        case 69: // United Kingdom flag
          image = assets.flag_gb;
          break;
        case 70: // Netherlands flag
          image = assets.flag_nl;
          break;
        case 71: // Switzerland flag
          image = assets.flag_ch;
          break;
        case 72: // Morocco flag
          image = assets.flag_ma;
          break;
        case 73: // Egypt flag
          image = assets.flag_eg;
          break;
        // Boss room tiles
        case 74: // MainGuy character
          image = assets.main_guy;
          break;
        case 75: // Flower decoration
          image = assets.flower;
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
          // Data Science Experience fallbacks
          case 29: // NPS chart
            fallbackColor = "#1a202c";
            break;
          case 30: // Energy cost
            fallbackColor = "#ffa500";
            break;
          case 31: // Fashion retail
            fallbackColor = "#e91e63";
            break;
          case 32: // Distribution network
            fallbackColor = "#1a202c";
            break;
          case 33: // Forecast histogram
            fallbackColor = "#3b82f6";
            break;
          case 34: // Box plot
            fallbackColor = "#06b6d4";
            break;
          case 35: // Deloitte Consulting
            fallbackColor = "#86bc25";
            break;
          case 36: // Power BI left
          case 37: // Power BI right
            fallbackColor = "#f2c811";
            break;
          case 38: // Python sklearn
            fallbackColor = "#3776ab";
            break;
          case 39: // PyTorch LangChain
            fallbackColor = "#ee4c2c";
            break;
          case 40: // Recommendation tree
            fallbackColor = "#1a202c";
            break;
          case 41: // Azure ML
          case 42: // Azure Data Factory
            fallbackColor = "#0078d4";
            break;
          case 43: // Chatbot AI
            fallbackColor = "#2d3748";
            break;
          case 44: // Gantt chart
            fallbackColor = "#1a202c";
            break;
          // R&D System Engineer Experience fallbacks
          case 45: // IR spectrum
            fallbackColor = "#1a1a1a";
            break;
          case 46: // Atmospheric transmission
            fallbackColor = "#1a1a1a";
            break;
          case 47: // Multi-camera array
            fallbackColor = "#1a1a1a";
            break;
          case 48: // Leonardo SpA
            fallbackColor = "#C8102E";
            break;
          case 49: // Object detection
            fallbackColor = "#1a1a1a";
            break;
          case 50: // Kalman filter
            fallbackColor = "#1a1a1a";
            break;
          case 51: // Optical flow
            fallbackColor = "#1a1a1a";
            break;
          case 52: // 360° coverage
            fallbackColor = "#1a1a1a";
            break;
          case 53: // Threat interface
            fallbackColor = "#1a1a1a";
            break;
          case 54: // Multi-target tracking
            fallbackColor = "#1a1a1a";
            break;
          case 55: // MATLAB/Simulink
            fallbackColor = "#e97627";
            break;
          case 56: // System architecture
            fallbackColor = "#1a1a1a";
            break;
          case 57: // Requirements specs
            fallbackColor = "#1a1a1a";
            break;
          case 58: // IR detector
            fallbackColor = "#1a1a1a";
            break;
          case 59: // Brick wall
            fallbackColor = "#6e6e6e";
            break;
          // Individual travel flags fallbacks
          case 60: // Australia
            fallbackColor = "#012169";
            break;
          case 61: // United States
            fallbackColor = "#b22234";
            break;
          case 62: // Japan
            fallbackColor = "#bc002d";
            break;
          case 63: // Vietnam
            fallbackColor = "#da251d";
            break;
          case 64: // Maldives
            fallbackColor = "#d21034";
            break;
          case 65: // Italy
            fallbackColor = "#009246";
            break;
          case 66: // France
            fallbackColor = "#0055a4";
            break;
          case 67: // Germany
            fallbackColor = "#000000";
            break;
          case 68: // Spain
            fallbackColor = "#aa151b";
            break;
          case 69: // United Kingdom
            fallbackColor = "#012169";
            break;
          case 70: // Netherlands
            fallbackColor = "#21468b";
            break;
          case 71: // Switzerland
            fallbackColor = "#ff0000";
            break;
          case 72: // Morocco
            fallbackColor = "#c1272d";
            break;
          case 73: // Egypt
            fallbackColor = "#ce1126";
            break;
          // Boss room tiles fallbacks
          case 74: // MainGuy character
            fallbackColor = "#4169e1";
            break;
          case 75: // Flower decoration
            fallbackColor = "#ff69b4";
            break;
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

  // Draw directional signals (before player so player appears on top)
  directionalSignalManager.render(ctx, tileSize, currentRoom.id);

  // Draw player
  drawPlayer(ctx, tileSize);

  // Room titles/subtitles removed as requested - using status bar instead

  // No more hobby labels - removed as requested
}

// drawRoomInfo function removed - room information now shown in status bar


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

  console.log("Initializing boss interaction system...");
  initializeBossInteraction();

  console.log("Setting up input listeners...");
  setupInputListeners();
  setupTouchControls();

  console.log("Initializing desktop controls...");
  initializeDesktopControls();

  console.log("🚀 Starting background AI model preloading...");
  console.log("🎮 Game will start immediately while models load in background!");
  
  // Start background loading - this happens in parallel with game play
  startBackgroundLoading();

  console.log("Starting game...");
  startGame();
});
