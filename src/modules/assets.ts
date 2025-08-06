// modules/assets.ts - Simplified debugging approach

import grassImg from "../../assets/Grass_Middle.png";
import pathImg from "../../assets/Path_Middle.png";
import oakTreeImg from "../../assets/Oak_Tree.png";
import playerImg from "../../assets/Player.png";
import mainGuySpriteSheetImg from "../../assets/MainGuySpriteSheet.png";

// Import your tilesheets
import assetsImg from "../../assets/assets.png";
import footballGroundImg from "../../assets/FootballGround.png";
import libraryImg from "../../assets/library.png";
import travelFlagsImg from "../../assets/travel_flags_tilesheet.png";

const assets: { [key: string]: HTMLImageElement } = {};
const tileCache: { [key: string]: HTMLCanvasElement } = {};
let loaded: number = 0;
const totalAssets: number = 9;
let callbackWhenDone: (() => void) | null = null;

// Hardcoded metadata based on your JSON files to avoid loading issues
const hardcodedLibraryMetadata = {
  objects: [
    {
      name: "Bookshelf_A",
      code: "bsA",
      x: 120,
      y: 360,
      width: 96,
      height: 120,
    },
    {
      name: "Bookshelf_B",
      code: "bsB",
      x: 240,
      y: 360,
      width: 96,
      height: 120,
    },
    {
      name: "Bookshelf_C",
      code: "bsC",
      x: 360,
      y: 360,
      width: 96,
      height: 120,
    },
    {
      name: "table",
      code: "t",
      x: 336,
      y: 192,
      width: 168,
      height: 96,
    },
    {
      name: "world_map",
      code: "wm",
      x: 120,
      y: 192,
      width: 96,
      height: 120,
    },
    {
      name: "chair",
      code: "c",
      x: 648,
      y: 72,
      width: 48,
      height: 72,
    },
    {
      name: "rug",
      code: "r",
      x: 432,
      y: 0,
      width: 168,
      height: 72,
    },
  ],
  paths: [
    {
      name: "path_walk",
      code: "pw",
      x: 72,
      y: 192,
      width: 24,
      height: 24,
    },
  ],
};

const hardcodedFootballMetadata = {
  tilesheet: {
    width: 128,
    height: 96,
    columns: 4,
    rows: 3,
    tileWidth: 32,
    tileHeight: 32,
  },
};

const hardcodedFlagsMetadata = {
  flags: [
    { name: "Australia", code: "au", x: 0, y: 0, width: 15, height: 10 },
    { name: "United States", code: "us", x: 15, y: 0, width: 15, height: 10 },
    { name: "Japan", code: "jp", x: 30, y: 0, width: 15, height: 10 },
    { name: "Vietnam", code: "vn", x: 45, y: 0, width: 15, height: 10 },
    { name: "Italy", code: "it", x: 75, y: 0, width: 15, height: 10 },
    { name: "France", code: "fr", x: 90, y: 0, width: 15, height: 10 },
    { name: "Germany", code: "de", x: 105, y: 0, width: 15, height: 10 },
    { name: "Spain", code: "es", x: 0, y: 10, width: 15, height: 10 },
    { name: "United Kingdom", code: "gb", x: 15, y: 10, width: 15, height: 10 },
  ],
};

const hardcodedAssetsMetadata = {
  trees: [
    { name: "tree_1", code: "t1", x: 0, y: 0, width: 160, height: 208 },
    { name: "tree_2", code: "t2", x: 176, y: 32, width: 160, height: 176 },
    { name: "tree_3", code: "t3", x: 368, y: 32, width: 128, height: 176 },
  ],
};

export function loadAssets(callback: () => void): void {
  callbackWhenDone = callback;
  console.log("🚀 Starting asset loading...");

  // Load base assets
  loadImage("grass", grassImg);
  loadImage("path", pathImg);
  loadImage("oak_tree_original", oakTreeImg);
  loadImage("player_sprite_sheet", playerImg);
  loadImage("main_guy_sprite_sheet", mainGuySpriteSheetImg);

  // Load your tilesheets
  loadImage("assets_tilesheet", assetsImg);
  loadImage("football_tilesheet", footballGroundImg);
  loadImage("library_tilesheet", libraryImg);
  loadImage("travel_flags_tilesheet", travelFlagsImg);
}

function loadImage(key: string, src: string): void {
  const img = new Image();
  img.onload = () => {
    assets[key] = img;
    loaded++;
    console.log(`✅ Loaded: ${key} (${loaded}/${totalAssets})`);

    if (loaded === totalAssets) {
      console.log("🎯 All images loaded, starting tile extraction...");
      extractTiles();
      createBackgrounds();
      if (callbackWhenDone) callbackWhenDone();
    }
  };
  img.onerror = () => {
    console.error(`❌ Failed to load: ${key} from ${src}`);
    loaded++;
    if (loaded === totalAssets && callbackWhenDone) callbackWhenDone();
  };
  img.src = src;
}

function extractTiles(): void {
  console.log("🔧 Extracting tiles...");

  // Extract library tiles with hardcoded metadata
  extractLibraryTiles();

  // Extract football tiles
  extractFootballTiles();

  // Extract flags
  extractFlags();

  // Extract trees
  extractTrees();

  // Create door
  createDoorTile();

  // Create data science visualization tiles
  createDataScienceTiles();
}

function extractLibraryTiles(): void {
  const tilesheet = assets["library_tilesheet"];

  if (!tilesheet) {
    console.error("❌ Library tilesheet not found");
    return;
  }

  console.log("📚 Extracting library tiles...");
  console.log(
    "Library tilesheet size:",
    tilesheet.width,
    "x",
    tilesheet.height
  );

  // Extract each object manually with hardcoded coordinates
  hardcodedLibraryMetadata.objects.forEach((obj) => {
    console.log(
      `Extracting ${obj.name} at (${obj.x}, ${obj.y}) size ${obj.width}x${obj.height}`
    );

    const extractedTile = extractTileFromSheet(
      tilesheet,
      obj.x,
      obj.y,
      obj.width,
      obj.height
    );

    // Store with consistent naming
    if (obj.name === "world_map") {
      assets["world_map"] = extractedTile;
      console.log("✅ World map extracted");
    } else if (obj.name === "chair") {
      assets["library_chair"] = extractedTile;
      console.log("✅ Chair extracted");
    } else if (obj.name.includes("Bookshelf")) {
      assets[`library_${obj.code}`] = extractedTile;
      console.log(`✅ Bookshelf ${obj.code} extracted`);
    } else if (obj.name === "table") {
      assets["library_table"] = extractedTile;
      console.log("✅ Table extracted");
    } else if (obj.name === "rug") {
      assets["library_rug"] = extractedTile;
      console.log("✅ Rug extracted");
    }
  });

  // Extract library floor
  const floorData = hardcodedLibraryMetadata.paths[0];
  assets["library_floor"] = extractTileFromSheet(
    tilesheet,
    floorData.x,
    floorData.y,
    floorData.width,
    floorData.height
  );
  console.log("✅ Library floor extracted");
}

function extractFootballTiles(): void {
  const tilesheet = assets["football_tilesheet"];
  if (!tilesheet) return;

  console.log("⚽ Extracting football tiles...");

  const { tileWidth, tileHeight, columns, rows } =
    hardcodedFootballMetadata.tilesheet;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const tileIndex = row * columns + col;
      assets[`football_${tileIndex}`] = extractTileFromSheet(
        tilesheet,
        col * tileWidth,
        row * tileHeight,
        tileWidth,
        tileHeight
      );
    }
  }
  console.log(`✅ Extracted ${rows * columns} football tiles`);
}

function extractFlags(): void {
  const tilesheet = assets["travel_flags_tilesheet"];
  if (!tilesheet) return;

  console.log("🏁 Extracting flags...");

  hardcodedFlagsMetadata.flags.forEach((flag) => {
    assets[`flag_${flag.code}`] = extractTileFromSheet(
      tilesheet,
      flag.x,
      flag.y,
      flag.width,
      flag.height
    );
  });
  console.log(`✅ Extracted ${hardcodedFlagsMetadata.flags.length} flags`);
}

function extractTrees(): void {
  const tilesheet = assets["assets_tilesheet"];
  if (!tilesheet) return;

  console.log("🌳 Extracting trees...");

  hardcodedAssetsMetadata.trees.forEach((tree) => {
    assets[`tree_${tree.code}`] = extractTileFromSheet(
      tilesheet,
      tree.x,
      tree.y,
      tree.width,
      tree.height
    );
    console.log(`✅ Extracted tree ${tree.code}`);
  });
}

function extractTileFromSheet(
  sheet: HTMLImageElement,
  tileX: number,
  tileY: number,
  tileWidth: number,
  tileHeight: number,
  scaledWidth: number = 64,
  scaledHeight: number = 64
): HTMLImageElement {
  const canvas = document.createElement("canvas");
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error("❌ Could not get canvas context");
    return new Image();
  }

  // Clear canvas and disable smoothing for pixel art
  ctx.clearRect(0, 0, scaledWidth, scaledHeight);
  ctx.imageSmoothingEnabled = false;

  // Draw the tile
  ctx.drawImage(
    sheet,
    tileX,
    tileY,
    tileWidth,
    tileHeight, // Source
    0,
    0,
    scaledWidth,
    scaledHeight // Destination
  );

  // Convert to image
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

function createBackgrounds(): void {
  console.log("🎨 Creating backgrounds for trees only...");

  const grassTile = assets["grass"];

  if (!grassTile) {
    console.error("❌ Grass tile not available for backgrounds");
    return;
  }

  // Create backgrounds ONLY for trees (use grass)
  createSimpleBackground("oak_tree_original", "oak_tree", grassTile);
  createSimpleBackground("tree_t1", "tree_t1", grassTile);
  createSimpleBackground("tree_t2", "tree_t2", grassTile);
  createSimpleBackground("tree_t3", "tree_t3", grassTile);

  // DO NOT create backgrounds for library items - use them as they are!
  // world_map, library_chair, library_bsA, library_bsB, library_bsC stay as extracted

  console.log("✅ Tree backgrounds created, library items left as-is");
}

function createSimpleBackground(
  sourceKey: string,
  targetKey: string,
  backgroundTile: HTMLImageElement
): void {
  const sourceTile = assets[sourceKey];

  if (!sourceTile) {
    console.warn(`⚠️ Source tile ${sourceKey} not found, skipping background`);
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.error(`❌ Could not get canvas context for ${targetKey}`);
    return;
  }

  // Draw background first
  ctx.drawImage(backgroundTile, 0, 0, 64, 64);

  // Draw source tile on top
  ctx.drawImage(sourceTile, 0, 0, 64, 64);

  // Replace the original asset
  const img = new Image();
  img.src = canvas.toDataURL();
  assets[targetKey] = img;

  console.log(`✅ Created background for ${targetKey}`);
}

function createDoorTile(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 56, 56);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 24, 24);
    ctx.strokeRect(32, 8, 24, 24);
    ctx.strokeRect(8, 32, 24, 24);
    ctx.strokeRect(32, 32, 24, 24);
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(48, 32, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["door"] = img;
  console.log("✅ Door tile created");
}

function createDataScienceTiles(): void {
  console.log("📊 Creating diverse Data Science visualization tiles...");

  // Row 1: Business Analytics
  createNPSChart(); // tile 29
  createEnergyCostChart(); // tile 30
  createFashionRetailTimeSeries(); // tile 31
  createDistributionNetworkMap(); // tile 32
  
  // Row 2: Statistical Analysis
  createForecastHistogram(); // tile 33
  createBoxPlot(); // tile 34
  
  // Row 3: BI Dashboard (2 tiles) + Tech Stacks
  createPowerBIDashboardLeft(); // tile 36
  createPowerBIDashboardRight(); // tile 37
  createPythonSklearn(); // tile 38
  createPyTorchLangChain(); // tile 39
  
  // Row 4: Advanced Systems
  createRecommendationTree(); // tile 40
  createAzureML(); // tile 41
  createAzureDataFactory(); // tile 42
  createChatbotTile(); // tile 43
  
  // Fill remaining spots
  createDeloitteTile(); // tile 35
  createGanttChart(); // tile 44

  // R&D System Engineer tiles
  createRDTiles();

  console.log("✅ Diverse Data Science and R&D visualization tiles created");
}

// === BUSINESS ANALYTICS TILES ===

function createNPSChart(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, 64, 64);
    
    // Chart title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("NPS Analysis", 5, 12);
    
    // Draw line chart with trend
    ctx.strokeStyle = "#00d084";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const points = [45, 42, 47, 38, 50, 32, 55];
    for (let i = 0; i < points.length; i++) {
      const x = 8 + (i * 8);
      const y = points[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Add data points
    ctx.fillStyle = "#00d084";
    for (let i = 0; i < points.length; i++) {
      ctx.beginPath();
      ctx.arc(8 + (i * 8), points[i], 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Score display
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 10px Arial";
    ctx.fillText("73", 45, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["nps_chart"] = img;
}

function createEnergyCostChart(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, 64, 64);
    
    // Chart title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Energy Cost", 5, 12);
    
    // Draw area chart
    ctx.fillStyle = "rgba(255, 165, 0, 0.3)";
    ctx.beginPath();
    ctx.moveTo(8, 55);
    const energyPoints = [45, 38, 42, 35, 40, 30, 35];
    for (let i = 0; i < energyPoints.length; i++) {
      ctx.lineTo(8 + (i * 8), energyPoints[i]);
    }
    ctx.lineTo(56, 55);
    ctx.closePath();
    ctx.fill();
    
    // Draw line
    ctx.strokeStyle = "#ffa500";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < energyPoints.length; i++) {
      const x = 8 + (i * 8);
      const y = energyPoints[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Savings indicator
    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 8px Arial";
    ctx.fillText("-23%", 45, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["energy_cost_chart"] = img;
}

function createFashionRetailTimeSeries(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Fashion Sales", 5, 12);
    
    // Draw seasonal time series
    ctx.strokeStyle = "#e91e63";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Seasonal pattern for fashion retail
    const seasons = [35, 45, 40, 25, 20, 18, 22, 38, 42, 50, 55, 48];
    for (let i = 0; i < seasons.length; i++) {
      const x = 8 + (i * 4.5);
      const y = seasons[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Highlight peak season
    ctx.fillStyle = "#ffc107";
    ctx.beginPath();
    ctx.arc(8 + (10 * 4.5), 55, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Season label
    ctx.fillStyle = "#ffc107";
    ctx.font = "bold 7px Arial";
    ctx.fillText("Peak", 38, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["fashion_retail_timeseries"] = img;
}

function createDistributionNetworkMap(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Supply Chain", 5, 12);
    
    // Draw network nodes
    const nodes = [
      { x: 15, y: 25, color: "#00d084" }, // Warehouse
      { x: 35, y: 20, color: "#ffc107" }, // Distribution center
      { x: 50, y: 30, color: "#e91e63" }, // Retail
      { x: 25, y: 45, color: "#9c27b0" }, // Store
      { x: 45, y: 50, color: "#2196f3" }, // Customer
    ];
    
    // Draw connections
    ctx.strokeStyle = "#4a5568";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, 25); ctx.lineTo(35, 20);
    ctx.moveTo(35, 20); ctx.lineTo(50, 30);
    ctx.moveTo(35, 20); ctx.lineTo(25, 45);
    ctx.moveTo(50, 30); ctx.lineTo(45, 50);
    ctx.moveTo(25, 45); ctx.lineTo(45, 50);
    ctx.stroke();
    
    // Draw nodes
    nodes.forEach(node => {
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["distribution_network_map"] = img;
}

// === STATISTICAL ANALYSIS TILES ===

function createForecastHistogram(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Forecast Dist", 5, 12);
    
    // Draw histogram bars
    ctx.fillStyle = "#3b82f6";
    const heights = [15, 25, 35, 40, 35, 25, 20, 15];
    for (let i = 0; i < heights.length; i++) {
      const x = 8 + (i * 6);
      const height = heights[i];
      ctx.fillRect(x, 55 - height, 5, height);
    }
    
    // Normal curve overlay
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 50; i++) {
      const x = 8 + i;
      const y = 55 - (20 + 15 * Math.exp(-Math.pow((i - 25) / 8, 2)));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["forecast_histogram"] = img;
}

function createBoxPlot(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Box Plot", 5, 12);
    
    // Draw box plot
    ctx.strokeStyle = "#06b6d4";
    ctx.fillStyle = "rgba(6, 182, 212, 0.3)";
    ctx.lineWidth = 2;
    
    // Box (Q1 to Q3)
    ctx.fillRect(20, 25, 24, 15);
    ctx.strokeRect(20, 25, 24, 15);
    
    // Median line
    ctx.beginPath();
    ctx.moveTo(30, 25);
    ctx.lineTo(30, 40);
    ctx.stroke();
    
    // Whiskers
    ctx.beginPath();
    ctx.moveTo(15, 32.5); ctx.lineTo(20, 32.5); // Lower whisker
    ctx.moveTo(44, 32.5); ctx.lineTo(50, 32.5); // Upper whisker
    ctx.moveTo(15, 30); ctx.lineTo(15, 35); // Lower cap
    ctx.moveTo(50, 30); ctx.lineTo(50, 35); // Upper cap
    ctx.stroke();
    
    // Outliers
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(12, 20, 2, 0, Math.PI * 2);
    ctx.arc(55, 45, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["box_plot"] = img;
}

// === POWER BI DASHBOARD (2 TILES) ===

function createPowerBIDashboardLeft(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Power BI yellow background
    ctx.fillStyle = "#f2c811";
    ctx.fillRect(0, 0, 64, 64);
    
    // Dashboard title
    ctx.fillStyle = "#323130";
    ctx.font = "bold 10px Arial";
    ctx.fillText("Dashboard", 8, 15);
    
    // Pie chart
    const centerX = 32, centerY = 35, radius = 15;
    const segments = [
      { angle: 0, size: Math.PI * 0.6, color: "#0078d4" },
      { angle: Math.PI * 0.6, size: Math.PI * 0.8, color: "#00bcf2" },
      { angle: Math.PI * 1.4, size: Math.PI * 0.6, color: "#40e0d0" },
    ];
    
    segments.forEach(segment => {
      ctx.fillStyle = segment.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, segment.angle, segment.angle + segment.size);
      ctx.closePath();
      ctx.fill();
    });
    
    // KPI box
    ctx.fillStyle = "#fff";
    ctx.fillRect(8, 52, 20, 8);
    ctx.fillStyle = "#323130";
    ctx.font = "bold 8px Arial";
    ctx.fillText("87%", 12, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["powerbi_dashboard_left"] = img;
}

function createPowerBIDashboardRight(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Power BI yellow background
    ctx.fillStyle = "#f2c811";
    ctx.fillRect(0, 0, 64, 64);
    
    // Trend line
    ctx.strokeStyle = "#323130";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const trendPoints = [40, 35, 38, 32, 28, 25, 22];
    for (let i = 0; i < trendPoints.length; i++) {
      const x = 8 + (i * 8);
      const y = trendPoints[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Data points
    ctx.fillStyle = "#0078d4";
    for (let i = 0; i < trendPoints.length; i++) {
      ctx.beginPath();
      ctx.arc(8 + (i * 8), trendPoints[i], 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // KPI values
    ctx.fillStyle = "#323130";
    ctx.font = "bold 8px Arial";
    ctx.fillText("↑23%", 8, 55);
    ctx.fillText("$2.1M", 38, 55);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["powerbi_dashboard_right"] = img;
}

// === TECH STACK TILES ===

function createPythonSklearn(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Python colors
    ctx.fillStyle = "#3776ab";
    ctx.fillRect(0, 0, 64, 32);
    ctx.fillStyle = "#ffd343";
    ctx.fillRect(0, 32, 64, 32);
    
    // Python logo
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("Python", 12, 20);
    
    // Libraries
    ctx.fillStyle = "#000";
    ctx.font = "bold 8px Arial";
    ctx.fillText("scikit", 8, 45);
    ctx.fillText("learn", 8, 55);
    
    // ML icon
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.arc(50, 45, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText("ML", 46, 49);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["python_sklearn"] = img;
}

function createPyTorchLangChain(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // PyTorch orange/red
    ctx.fillStyle = "#ee4c2c";
    ctx.fillRect(0, 0, 64, 32);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 32, 64, 32);
    
    // PyTorch logo
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("PyTorch", 10, 20);
    
    // LangChain
    ctx.fillStyle = "#00d084";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Lang", 8, 45);
    ctx.fillText("Chain", 8, 55);
    
    // Chain link icon
    ctx.strokeStyle = "#00d084";
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Draw chain links
    ctx.arc(45, 45, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(52, 45, 4, 0, Math.PI * 2);
    ctx.stroke();
    // Connect the links
    ctx.beginPath();
    ctx.moveTo(49, 45);
    ctx.lineTo(48, 45);
    ctx.stroke();
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["pytorch_langchain"] = img;
}

// === RECOMMENDATION SYSTEM ===

function createRecommendationTree(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Rec Tree", 5, 12);
    
    // Draw hierarchical tree
    ctx.strokeStyle = "#4a5568";
    ctx.lineWidth = 1;
    
    // Root node
    ctx.fillStyle = "#e53e3e";
    ctx.fillRect(28, 18, 8, 6);
    
    // Level 1
    ctx.fillStyle = "#3182ce";
    ctx.fillRect(18, 30, 8, 6);
    ctx.fillRect(38, 30, 8, 6);
    
    // Level 2
    ctx.fillStyle = "#38a169";
    ctx.fillRect(10, 42, 6, 5);
    ctx.fillRect(20, 42, 6, 5);
    ctx.fillRect(38, 42, 6, 5);
    ctx.fillRect(48, 42, 6, 5);
    
    // Connections
    ctx.beginPath();
    ctx.moveTo(32, 24); ctx.lineTo(22, 30); // Root to left
    ctx.moveTo(32, 24); ctx.lineTo(42, 30); // Root to right
    ctx.moveTo(22, 36); ctx.lineTo(13, 42); // Left to children
    ctx.moveTo(22, 36); ctx.lineTo(23, 42);
    ctx.moveTo(42, 36); ctx.lineTo(41, 42); // Right to children
    ctx.moveTo(42, 36); ctx.lineTo(51, 42);
    ctx.stroke();
    
    // Recommendation scores
    ctx.fillStyle = "#ffd700";
    ctx.font = "6px Arial";
    ctx.fillText("0.89", 10, 58);
    ctx.fillText("0.76", 20, 58);
    ctx.fillText("0.91", 38, 58);
    ctx.fillText("0.82", 48, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["recommendation_tree"] = img;
}

// === AZURE SERVICES ===

function createAzureML(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Azure blue
    ctx.fillStyle = "#0078d4";
    ctx.fillRect(0, 0, 64, 64);
    
    // Azure logo approximation
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Azure", 18, 15);
    ctx.font = "bold 7px Arial";
    ctx.fillText("Machine", 12, 28);
    ctx.fillText("Learning", 12, 38);
    
    // ML pipeline visualization
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 50);
    ctx.lineTo(25, 50);
    ctx.lineTo(40, 50);
    ctx.lineTo(55, 50);
    ctx.stroke();
    
    // Pipeline stages
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(10, 50, 3, 0, Math.PI * 2);
    ctx.arc(25, 50, 3, 0, Math.PI * 2);
    ctx.arc(40, 50, 3, 0, Math.PI * 2);
    ctx.arc(55, 50, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["azure_ml"] = img;
}

function createAzureDataFactory(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Azure blue
    ctx.fillStyle = "#0078d4";
    ctx.fillRect(0, 0, 64, 64);
    
    // Azure logo
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Azure", 18, 15);
    ctx.font = "bold 7px Arial";
    ctx.fillText("Data", 20, 28);
    ctx.fillText("Factory", 16, 38);
    
    // Data flow visualization
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    
    // Source
    ctx.fillStyle = "#fff";
    ctx.fillRect(8, 45, 8, 6);
    
    // Transformation
    ctx.beginPath();
    ctx.moveTo(20, 48);
    ctx.lineTo(35, 48);
    ctx.stroke();
    
    // Processing node
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(35, 48, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Output
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(39, 48);
    ctx.lineTo(50, 48);
    ctx.stroke();
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(50, 45, 8, 6);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["azure_data_factory"] = img;
}

// === CHATBOT SYSTEM ===

function createChatbotTile(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, "#1a202c");
    gradient.addColorStop(1, "#2d3748");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Chatbot AI", 5, 12);
    
    // Chat bubbles
    // User message (right)
    ctx.fillStyle = "#3182ce";
    ctx.fillRect(35, 20, 24, 8);
    ctx.fillStyle = "#fff";
    ctx.font = "6px Arial";
    ctx.fillText("Hello!", 38, 26);
    
    // Bot response (left)
    ctx.fillStyle = "#00d084";
    ctx.fillRect(5, 32, 30, 8);
    ctx.fillStyle = "#fff";
    ctx.fillText("How can I help?", 7, 38);
    
    // User follow-up (right)
    ctx.fillStyle = "#3182ce";
    ctx.fillRect(28, 44, 31, 8);
    ctx.fillStyle = "#fff";
    ctx.fillText("Recommend...", 30, 50);
    
    // Bot icon/avatar
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(12, 58, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Robot face
    ctx.fillStyle = "#1a202c";
    ctx.beginPath();
    ctx.arc(10, 56, 1, 0, Math.PI * 2);
    ctx.arc(14, 56, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Robot smile
    ctx.strokeStyle = "#1a202c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(12, 58, 3, 0, Math.PI);
    ctx.stroke();
    
    // Processing indicator
    ctx.fillStyle = "#9ca3af";
    ctx.font = "6px Arial";
    ctx.fillText("●●●", 45, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["chatbot_ai"] = img;
}

// === COMPANY BRANDING ===

function createDeloitteTile(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 64, 64);
    
    // Deloitte green brand color
    ctx.fillStyle = "#86bc25";
    ctx.font = "bold 9px Arial";
    ctx.fillText("Deloitte", 12, 20);
    
    ctx.font = "bold 8px Arial";
    ctx.fillText("Consulting", 8, 32);
    
    // Period after Deloitte (brand styling)
    ctx.fillStyle = "#86bc25";
    ctx.beginPath();
    ctx.arc(56, 16, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Additional brand elements
    ctx.font = "6px Arial";
    ctx.fillText("2022-2023", 15, 55);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["deloitte_consulting"] = img;
}

// === PROJECT MANAGEMENT ===

function createGanttChart(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a202c";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Gantt Chart", 5, 12);
    
    // Timeline header
    ctx.fillStyle = "#4a5568";
    ctx.fillRect(0, 16, 64, 8);
    
    // Month labels
    ctx.fillStyle = "#fff";
    ctx.font = "6px Arial";
    ctx.fillText("Q1", 8, 22);
    ctx.fillText("Q2", 24, 22);
    ctx.fillText("Q3", 40, 22);
    ctx.fillText("Q4", 56, 22);
    
    // Gantt bars (different project phases)
    // Project 1 - Data Collection
    ctx.fillStyle = "#3182ce";
    ctx.fillRect(6, 28, 18, 4);
    
    // Project 2 - Model Development  
    ctx.fillStyle = "#10b981";
    ctx.fillRect(14, 36, 24, 4);
    
    // Project 3 - Deployment
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(32, 44, 20, 4);
    
    // Project 4 - Maintenance
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(48, 52, 12, 4);
    
    // Progress indicators (filled portions)
    ctx.fillStyle = "#86bc25";
    ctx.fillRect(6, 28, 12, 4); // 70% complete
    ctx.fillRect(14, 36, 16, 4); // 65% complete
    ctx.fillRect(32, 44, 8, 4); // 40% complete
    
    // Current date line
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(28, 25);
    ctx.lineTo(28, 58);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["gantt_chart"] = img;
}

// === R&D SYSTEM ENGINEER TILES ===

function createRDTiles(): void {
  console.log("🔴 Creating R&D System Engineer visualization tiles...");

  // Row 1: Infrared Systems
  createIRSpectrum(); // tile 45
  createAtmosphericTransmission(); // tile 46
  createMultiCameraArray(); // tile 47
  createLeonardoSpa(); // tile 48
  
  // Row 2: Detection & Tracking Algorithms
  createObjectDetection(); // tile 49
  createKalmanFilter(); // tile 50
  createOpticalFlow(); // tile 51
  
  // Row 3: Missile Warning Systems
  createCoverage360(); // tile 52
  createThreatInterface(); // tile 53
  createMultiTargetTracking(); // tile 54
  
  // Row 4: Tools & Architecture
  createMatlabSimulink(); // tile 55
  createSystemArchitecture(); // tile 56
  createRequirementsSpecs(); // tile 57
  
  // Additional hardware tile
  createIRDetector(); // tile 58
  
  // Room infrastructure
  createBrickWall(); // tile 59
  
  // Individual travel flags
  createIndividualFlags(); // tiles 60-73
  
  // Boss room elements
  createBossRoomTiles(); // tiles 74-76

  console.log("✅ R&D System Engineer visualization tiles created");
}

// === INFRARED SYSTEMS ===

function createIRSpectrum(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("IR Spectrum", 5, 12);
    
    // Temperature scale
    ctx.fillStyle = "#ff4444";
    ctx.font = "6px Arial";
    ctx.fillText("Hot", 5, 22);
    ctx.fillStyle = "#4444ff";
    ctx.fillText("Cold", 45, 22);
    
    // IR heat signature visualization
    const gradient = ctx.createLinearGradient(0, 25, 64, 25);
    gradient.addColorStop(0, "#000080"); // Cold (deep blue)
    gradient.addColorStop(0.3, "#0080ff"); // Cool (blue)
    gradient.addColorStop(0.5, "#00ff00"); // Medium (green)
    gradient.addColorStop(0.7, "#ffff00"); // Warm (yellow)
    gradient.addColorStop(0.9, "#ff8000"); // Hot (orange)
    gradient.addColorStop(1, "#ff0000"); // Very hot (red)
    
    ctx.fillStyle = gradient;
    ctx.fillRect(5, 25, 54, 20);
    
    // Wavelength indicators
    ctx.fillStyle = "#fff";
    ctx.font = "5px Arial";
    ctx.fillText("3-5μm", 8, 52);
    ctx.fillText("8-12μm", 35, 52);
    
    // MWIR/LWIR bands
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 25, 20, 20); // MWIR
    ctx.strokeRect(35, 25, 24, 20); // LWIR
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["ir_spectrum"] = img;
}

function createAtmosphericTransmission(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 7px Arial";
    ctx.fillText("Atmos Trans", 5, 12);
    
    // Axes
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 55); ctx.lineTo(58, 55); // X-axis
    ctx.moveTo(10, 55); ctx.lineTo(10, 20); // Y-axis
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = "#aaa";
    ctx.font = "5px Arial";
    ctx.fillText("λ(μm)", 45, 60);
    ctx.fillText("T%", 2, 25);
    
    // Atmospheric transmission curve
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Realistic atmospheric transmission with windows and absorption bands
    const points = [
      {x: 12, y: 45}, // 1μm - poor transmission
      {x: 16, y: 35}, // 2μm - H2O absorption
      {x: 20, y: 25}, // 3μm - MWIR window start
      {x: 24, y: 25}, // 4μm - good MWIR
      {x: 28, y: 25}, // 5μm - MWIR window end
      {x: 32, y: 45}, // 6μm - CO2 absorption
      {x: 36, y: 45}, // 7μm - poor transmission
      {x: 40, y: 25}, // 8μm - LWIR window start
      {x: 44, y: 25}, // 10μm - good LWIR
      {x: 48, y: 25}, // 12μm - LWIR window end
      {x: 52, y: 45}, // 14μm - poor transmission
      {x: 56, y: 50}, // 16μm - very poor
    ];
    
    for (let i = 0; i < points.length; i++) {
      if (i === 0) ctx.moveTo(points[i].x, points[i].y);
      else ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    
    // Mark IR windows
    ctx.fillStyle = "rgba(0, 255, 136, 0.2)";
    ctx.fillRect(20, 20, 8, 35); // MWIR window
    ctx.fillRect(40, 20, 8, 35); // LWIR window
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["atmospheric_transmission"] = img;
}

function createMultiCameraArray(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Multi-Cam", 12, 12);
    
    // Central platform
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(32, 32, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Camera positions around 360°
    const cameras = [
      {angle: 0, color: "#ff4444"},      // 0°
      {angle: Math.PI/2, color: "#44ff44"},   // 90°
      {angle: Math.PI, color: "#4444ff"},     // 180°
      {angle: 3*Math.PI/2, color: "#ffff44"}, // 270°
      {angle: Math.PI/4, color: "#ff44ff"},   // 45°
      {angle: 3*Math.PI/4, color: "#44ffff"}, // 135°
    ];
    
    cameras.forEach(cam => {
      const x = 32 + Math.cos(cam.angle) * 18;
      const y = 32 + Math.sin(cam.angle) * 18;
      
      // Camera housing
      ctx.fillStyle = cam.color;
      ctx.fillRect(x-3, y-3, 6, 6);
      
      // Field of view
      ctx.strokeStyle = cam.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, 12, cam.angle - Math.PI/6, cam.angle + Math.PI/6);
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
    
    // Coverage indicator
    ctx.fillStyle = "#fff";
    ctx.font = "6px Arial";
    ctx.fillText("360°", 26, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["multi_camera_array"] = img;
}

function createLeonardoSpa(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Leonardo red background
    ctx.fillStyle = "#C8102E";
    ctx.fillRect(0, 0, 64, 64);
    
    // Leonardo white text - centered
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Leonardo", 32, 26);
    
    ctx.font = "bold 10px Arial";
    ctx.fillText("SpA", 32, 42);
    
    // Employment period
    ctx.font = "8px Arial";
    ctx.fillText("2024 - present", 32, 56);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["leonardo_spa"] = img;
}

// === DETECTION & TRACKING ALGORITHMS ===

function createObjectDetection(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Detection", 8, 12);
    
    // Simulated IR image background
    ctx.fillStyle = "#333";
    ctx.fillRect(5, 18, 54, 40);
    
    // Detected objects with bounding boxes
    const detections = [
      {x: 15, y: 25, w: 12, h: 8, conf: "0.92", color: "#00ff88"},
      {x: 35, y: 30, w: 10, h: 10, conf: "0.87", color: "#ffaa00"},
      {x: 45, y: 40, w: 8, h: 6, conf: "0.76", color: "#ff4444"},
    ];
    
    detections.forEach(det => {
      // Object (simulated heat signature)
      ctx.fillStyle = det.color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(det.x + 2, det.y + 2, det.w - 4, det.h - 4);
      ctx.globalAlpha = 1;
      
      // Bounding box
      ctx.strokeStyle = det.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(det.x, det.y, det.w, det.h);
      
      // Confidence score
      ctx.fillStyle = det.color;
      ctx.font = "5px Arial";
      ctx.fillText(det.conf, det.x, det.y - 1);
    });
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["object_detection"] = img;
}

function createKalmanFilter(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Kalman", 15, 12);
    
    // State estimation visualization
    // Predicted path
    ctx.strokeStyle = "#4444ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(10, 50);
    ctx.quadraticCurveTo(25, 30, 50, 25);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Actual measurements
    ctx.fillStyle = "#ff4444";
    const measurements = [{x: 12, y: 48}, {x: 20, y: 38}, {x: 30, y: 32}, {x: 42, y: 28}, {x: 48, y: 26}];
    measurements.forEach(m => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Uncertainty ellipses
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 1;
    measurements.forEach((m, i) => {
      const size = 4 + i * 1.5; // Growing uncertainty
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, size, size * 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    // Legend
    ctx.font = "5px Arial";
    ctx.fillStyle = "#4444ff";
    ctx.fillText("Pred", 5, 20);
    ctx.fillStyle = "#ff4444";
    ctx.fillText("Meas", 5, 28);
    ctx.fillStyle = "#00ff88";
    ctx.fillText("Uncert", 5, 36);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["kalman_filter"] = img;
}

function createOpticalFlow(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Opt Flow", 12, 12);
    
    // Grid of motion vectors
    ctx.strokeStyle = "#00ffaa";
    ctx.lineWidth = 1;
    
    for (let x = 15; x < 55; x += 12) {
      for (let y = 20; y < 55; y += 12) {
        // Vector direction based on position (simulating object motion)
        const dx = (x - 32) * 0.1 + Math.sin(x * 0.1) * 3;
        const dy = (y - 35) * 0.1 + Math.cos(y * 0.1) * 2;
        
        // Draw vector arrow
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.lineTo(x + dx - 3 * Math.cos(angle - Math.PI/6), y + dy - 3 * Math.sin(angle - Math.PI/6));
        ctx.moveTo(x + dx, y + dy);
        ctx.lineTo(x + dx - 3 * Math.cos(angle + Math.PI/6), y + dy - 3 * Math.sin(angle + Math.PI/6));
        ctx.stroke();
      }
    }
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["optical_flow"] = img;
}

// === MISSILE WARNING SYSTEMS ===

function createCoverage360(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("360° Warn", 8, 12);
    
    // Central missile warning system
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(32, 32, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 360° coverage sectors
    const sectors = [
      {start: 0, end: Math.PI/2, color: "#00ff88"},
      {start: Math.PI/2, end: Math.PI, color: "#ffaa00"},
      {start: Math.PI, end: 3*Math.PI/2, color: "#ff4444"},
      {start: 3*Math.PI/2, end: 2*Math.PI, color: "#4488ff"},
    ];
    
    sectors.forEach(sector => {
      ctx.fillStyle = sector.color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(32, 32);
      ctx.arc(32, 32, 25, sector.start, sector.end);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Sector boundaries
      ctx.strokeStyle = sector.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(32, 32);
      ctx.lineTo(32 + Math.cos(sector.start) * 25, 32 + Math.sin(sector.start) * 25);
      ctx.stroke();
    });
    
    // Range rings
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(32, 32, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(32, 32, 25, 0, Math.PI * 2);
    ctx.stroke();
    
    // Range labels
    ctx.fillStyle = "#aaa";
    ctx.font = "5px Arial";
    ctx.fillText("20km", 5, 58);
    ctx.fillText("40km", 45, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["coverage_360"] = img;
}

function createThreatInterface(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Threats", 15, 12);
    
    // Threat display interface
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 16, 54, 42);
    
    // Threat indicators
    const threats = [
      {x: 15, y: 25, level: "HIGH", color: "#ff4444"},
      {x: 35, y: 30, level: "MED", color: "#ffaa00"},
      {x: 45, y: 40, level: "LOW", color: "#44ff44"},
    ];
    
    threats.forEach((threat, i) => {
      // Threat icon
      ctx.fillStyle = threat.color;
      ctx.beginPath();
      ctx.moveTo(threat.x, threat.y - 3);
      ctx.lineTo(threat.x - 3, threat.y + 3);
      ctx.lineTo(threat.x + 3, threat.y + 3);
      ctx.closePath();
      ctx.fill();
      
      // Threat level
      ctx.font = "5px Arial";
      ctx.fillText(threat.level, threat.x - 6, threat.y + 8);
      
      // Range/bearing info
      ctx.fillStyle = "#aaa";
      ctx.font = "4px Arial";
      ctx.fillText(`${15 + i * 5}km`, threat.x - 8, threat.y + 12);
      ctx.fillText(`${45 + i * 30}°`, threat.x - 6, threat.y + 16);
    });
    
    // Status indicators
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(8, 52, 6, 4);
    ctx.fillStyle = "#fff";
    ctx.font = "5px Arial";
    ctx.fillText("ACTIVE", 16, 55);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["threat_interface"] = img;
}

function createMultiTargetTracking(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title  
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("MTT", 25, 12);
    
    // Multiple target tracks
    const tracks = [
      {x: 15, y: 25, id: "T1", color: "#ff4444", history: [{x: 10, y: 30}, {x: 12, y: 28}, {x: 15, y: 25}]},
      {x: 40, y: 35, id: "T2", color: "#44ff44", history: [{x: 35, y: 30}, {x: 38, y: 32}, {x: 40, y: 35}]},
      {x: 25, y: 45, id: "T3", color: "#4444ff", history: [{x: 20, y: 50}, {x: 22, y: 48}, {x: 25, y: 45}]},
    ];
    
    tracks.forEach(track => {
      // Track history
      ctx.strokeStyle = track.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      track.history.forEach((pos, i) => {
        if (i === 0) ctx.moveTo(pos.x, pos.y);
        else ctx.lineTo(pos.x, pos.y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      // Current position
      ctx.fillStyle = track.color;
      ctx.beginPath();
      ctx.arc(track.x, track.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Target ID and info
      ctx.font = "6px Arial";
      ctx.fillText(track.id, track.x + 5, track.y - 2);
      
      // Velocity vector
      ctx.strokeStyle = track.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(track.x, track.y);
      ctx.lineTo(track.x + 8, track.y - 3);
      ctx.stroke();
    });
    
    // Status
    ctx.fillStyle = "#fff";
    ctx.font = "5px Arial";
    ctx.fillText("3 TRACKS", 5, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["multi_target_tracking"] = img;
}

// === TOOLS & ARCHITECTURE ===

function createMatlabSimulink(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // MATLAB orange background
    ctx.fillStyle = "#e97627";
    ctx.fillRect(0, 0, 64, 64);
    
    // MATLAB logo representation
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("MATLAB", 8, 18);
    
    ctx.font = "bold 8px Arial";
    ctx.fillText("Simulink", 10, 30);
    
    // Simulink block diagram elements
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    
    // Input block
    ctx.fillRect(8, 38, 12, 8);
    ctx.strokeRect(8, 38, 12, 8);
    ctx.fillStyle = "#fff";
    ctx.font = "5px Arial";
    ctx.fillText("In", 12, 44);
    
    // Processing block
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(25, 36, 14, 12);
    ctx.strokeRect(25, 36, 14, 12);
    ctx.fillStyle = "#fff";
    ctx.fillText("Filter", 27, 43);
    
    // Output block
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(44, 38, 12, 8);
    ctx.strokeRect(44, 38, 12, 8);
    ctx.fillStyle = "#fff";
    ctx.fillText("Out", 47, 44);
    
    // Connection lines
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(20, 42);
    ctx.lineTo(25, 42);
    ctx.moveTo(39, 42);
    ctx.lineTo(44, 42);
    ctx.stroke();
    
    // Version/year
    ctx.font = "6px Arial";
    ctx.fillText("R2023b", 18, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["matlab_simulink"] = img;
}

function createSystemArchitecture(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("IR System", 8, 12);
    
    // System architecture blocks
    const blocks = [
      {x: 8, y: 18, w: 16, h: 8, label: "IR Sensor", color: "#ff4444"},
      {x: 40, y: 18, w: 16, h: 8, label: "ADC", color: "#44ff44"},
      {x: 8, y: 32, w: 16, h: 8, label: "DSP", color: "#4444ff"},
      {x: 40, y: 32, w: 16, h: 8, label: "CPU", color: "#ffaa00"},
      {x: 24, y: 46, w: 16, h: 8, label: "Display", color: "#aa44ff"},
    ];
    
    blocks.forEach(block => {
      // Block
      ctx.fillStyle = block.color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(block.x, block.y, block.w, block.h);
      ctx.globalAlpha = 1;
      
      ctx.strokeStyle = block.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(block.x, block.y, block.w, block.h);
      
      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "5px Arial";
      ctx.fillText(block.label, block.x + 2, block.y + 6);
    });
    
    // Connections
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // IR Sensor -> ADC
    ctx.moveTo(24, 22);
    ctx.lineTo(40, 22);
    // IR Sensor -> DSP
    ctx.moveTo(16, 26);
    ctx.lineTo(16, 32);
    // ADC -> CPU
    ctx.moveTo(48, 26);
    ctx.lineTo(48, 32);
    // DSP -> Display
    ctx.moveTo(24, 36);
    ctx.lineTo(32, 46);
    // CPU -> Display
    ctx.moveTo(40, 36);
    ctx.lineTo(32, 46);
    ctx.stroke();
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["system_architecture"] = img;
}

function createRequirementsSpecs(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("Specs", 18, 12);
    
    // Requirements table/matrix
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    
    // Table grid
    const rows = 5;
    const cols = 3;
    const cellW = 16;
    const cellH = 7;
    const startX = 6;
    const startY = 18;
    
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(startX, startY + r * cellH);
      ctx.lineTo(startX + cols * cellW, startY + r * cellH);
      ctx.stroke();
    }
    
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(startX + c * cellW, startY);
      ctx.lineTo(startX + c * cellW, startY + rows * cellH);
      ctx.stroke();
    }
    
    // Header
    ctx.fillStyle = "#4a5568";
    ctx.fillRect(startX + 1, startY + 1, cols * cellW - 2, cellH - 2);
    
    // Some filled cells (requirements status)
    const filledCells = [
      {r: 1, c: 0, color: "#00ff88"}, // Verified
      {r: 1, c: 1, color: "#ffaa00"}, // In progress
      {r: 2, c: 0, color: "#00ff88"}, // Verified
      {r: 2, c: 2, color: "#ff4444"}, // Failed
      {r: 3, c: 1, color: "#00ff88"}, // Verified
    ];
    
    filledCells.forEach(cell => {
      ctx.fillStyle = cell.color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(
        startX + cell.c * cellW + 1,
        startY + cell.r * cellH + 1,
        cellW - 2,
        cellH - 2
      );
      ctx.globalAlpha = 1;
    });
    
    // Status legend
    ctx.font = "4px Arial";
    ctx.fillStyle = "#00ff88";
    ctx.fillText("✓ PASS", 6, 58);
    ctx.fillStyle = "#ff4444";
    ctx.fillText("✗ FAIL", 30, 58);
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["requirements_specs"] = img;
}

function createIRDetector(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 64, 64);
    
    // Title
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Arial";
    ctx.fillText("IR Detector", 8, 12);
    
    // Detector housing (rectangular)
    ctx.fillStyle = "#444";
    ctx.fillRect(18, 20, 28, 20);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 20, 28, 20);
    
    // Detector window (circular)
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.arc(32, 30, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#888";
    ctx.stroke();
    
    // Lens elements (concentric circles)
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(32, 30, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(32, 30, 4, 0, Math.PI * 2);
    ctx.stroke();
    
    // Cooling fins (heat dissipation)
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const x = 20 + i * 5;
      ctx.beginPath();
      ctx.moveTo(x, 42);
      ctx.lineTo(x, 48);
      ctx.stroke();
    }
    
    // Detector specifications
    ctx.fillStyle = "#aaa";
    ctx.font = "5px Arial";
    ctx.fillText("MWIR/LWIR", 15, 52);
    ctx.fillText("InSb/MCT", 18, 58);
    
    // Connection pins
    ctx.fillStyle = "#d4af37"; // Gold color for pins
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(46 + i * 2, 35, 1, 4);
    }
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["ir_detector"] = img;
}

function createBrickWall(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Base grey wall color
    ctx.fillStyle = "#6e6e6e";
    ctx.fillRect(0, 0, 64, 64);
    
    // Brick pattern variables
    const brickWidth = 16;
    const brickHeight = 8;
    const mortarWidth = 1;
    
    // Mortar color (slightly darker)
    ctx.fillStyle = "#5a5a5a";
    
    // Draw horizontal mortar lines
    for (let y = 0; y < 64; y += brickHeight + mortarWidth) {
      ctx.fillRect(0, y, 64, mortarWidth);
    }
    
    // Draw vertical mortar lines with staggered pattern
    for (let row = 0; row < Math.ceil(64 / (brickHeight + mortarWidth)); row++) {
      const y = row * (brickHeight + mortarWidth);
      const offset = (row % 2) * (brickWidth / 2); // Stagger every other row
      
      for (let x = offset; x < 64 + brickWidth; x += brickWidth + mortarWidth) {
        ctx.fillRect(x, y, mortarWidth, brickHeight + mortarWidth);
      }
    }
    
    // Add some texture variation to bricks
    ctx.globalAlpha = 0.1;
    for (let row = 0; row < Math.ceil(64 / (brickHeight + mortarWidth)); row++) {
      for (let col = 0; col < Math.ceil(64 / (brickWidth + mortarWidth)); col++) {
        const x = col * (brickWidth + mortarWidth) + (row % 2) * (brickWidth / 2);
        const y = row * (brickHeight + mortarWidth);
        
        // Random brightness variation
        const brightness = Math.random() * 0.3 - 0.15;
        ctx.fillStyle = brightness > 0 ? "#ffffff" : "#000000";
        ctx.fillRect(x + mortarWidth, y + mortarWidth, brickWidth - mortarWidth, brickHeight - mortarWidth);
      }
    }
    ctx.globalAlpha = 1;
    
    // Add subtle shadow effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(62, 0, 2, 64); // Right shadow
    ctx.fillRect(0, 62, 64, 2); // Bottom shadow
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["brick_wall"] = img;
}

function createIndividualFlags(): void {
  const flagData = [
    { name: "flag_au", code: "AU", colors: ["#012169", "#ffffff", "#ff0000"] },
    { name: "flag_us", code: "US", colors: ["#b22234", "#ffffff", "#3c3b6e"] },
    { name: "flag_jp", code: "JP", colors: ["#ffffff", "#bc002d"] },
    { name: "flag_vn", code: "VN", colors: ["#da251d", "#ffff00"] },
    { name: "flag_mv", code: "MV", colors: ["#d21034", "#007e3a", "#ffffff"] },
    { name: "flag_it", code: "IT", colors: ["#009246", "#ffffff", "#ce2b37"] },
    { name: "flag_fr", code: "FR", colors: ["#0055a4", "#ffffff", "#ef4135"] },
    { name: "flag_de", code: "DE", colors: ["#000000", "#dd0000", "#ffce00"] },
    { name: "flag_es", code: "ES", colors: ["#aa151b", "#f1bf00", "#aa151b"] },
    { name: "flag_gb", code: "GB", colors: ["#012169", "#ffffff", "#c8102e"] },
    { name: "flag_nl", code: "NL", colors: ["#21468b", "#ffffff", "#ae1c28"] },
    { name: "flag_ch", code: "CH", colors: ["#ff0000", "#ffffff"] },
    { name: "flag_ma", code: "MA", colors: ["#c1272d", "#006233"] },
    { name: "flag_eg", code: "EG", colors: ["#ce1126", "#ffffff", "#000000"] }
  ];

  flagData.forEach((flag) => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Create a simple flag representation
      ctx.fillStyle = flag.colors[0];
      ctx.fillRect(0, 0, 64, 64);
      
      // Add stripes or patterns based on flag
      if (flag.colors.length >= 2) {
        if (flag.code === "IT" || flag.code === "FR" || flag.code === "NL") {
          // Vertical stripes
          ctx.fillStyle = flag.colors[1];
          ctx.fillRect(21, 0, 22, 64);
          if (flag.colors[2]) {
            ctx.fillStyle = flag.colors[2];
            ctx.fillRect(43, 0, 21, 64);
          }
        } else if (flag.code === "DE" || flag.code === "EG") {
          // Horizontal stripes
          ctx.fillStyle = flag.colors[1];
          ctx.fillRect(0, 21, 64, 22);
          if (flag.colors[2]) {
            ctx.fillStyle = flag.colors[2];
            ctx.fillRect(0, 43, 64, 21);
          }
        } else if (flag.code === "US") {
          // USA flag - white background first
          ctx.fillStyle = flag.colors[1]; // White
          ctx.fillRect(0, 0, 64, 64);
          
          // Red stripes
          ctx.fillStyle = flag.colors[0]; // Red
          for (let i = 0; i < 7; i++) {
            ctx.fillRect(0, i * 10 + 2, 64, 5);
          }
          
          // Blue canton (top-left rectangle)
          ctx.fillStyle = flag.colors[2]; // Blue
          ctx.fillRect(0, 0, 28, 36);
          
          // White stars on blue canton
          ctx.fillStyle = flag.colors[1]; // White
          ctx.font = "4px Arial";
          for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
              if ((row + col) % 2 === 0) {
                ctx.fillText("★", 3 + col * 4, 6 + row * 6);
              }
            }
          }
        } else if (flag.code === "AU") {
          // Australian flag - blue background
          ctx.fillStyle = flag.colors[0]; // Blue
          ctx.fillRect(0, 0, 64, 64);
          
          // Union Jack in top-left corner (32x32 pixels)
          const ujWidth = 32;
          const ujHeight = 32;
          
          // White background for Union Jack
          ctx.fillStyle = flag.colors[1]; // White
          ctx.fillRect(0, 0, ujWidth, ujHeight);
          
          // Blue background
          ctx.fillStyle = flag.colors[0]; // Blue
          ctx.fillRect(0, 0, ujWidth, ujHeight);
          
          // White diagonal crosses (St. Andrew's Cross)
          ctx.fillStyle = flag.colors[1]; // White
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(ujWidth, ujHeight);
          ctx.moveTo(0, ujHeight); ctx.lineTo(ujWidth, 0);
          ctx.stroke();
          
          // White vertical and horizontal crosses (St. George's Cross)
          ctx.fillStyle = flag.colors[1]; // White
          ctx.fillRect(0, ujHeight/2 - 2, ujWidth, 4); // Horizontal white
          ctx.fillRect(ujWidth/2 - 2, 0, 4, ujHeight); // Vertical white
          
          // Red crosses (St. George's Cross)
          ctx.fillStyle = flag.colors[2]; // Red
          ctx.fillRect(0, ujHeight/2 - 1, ujWidth, 2); // Horizontal red
          ctx.fillRect(ujWidth/2 - 1, 0, 2, ujHeight); // Vertical red
          
          // Red diagonal lines (thinner, offset)
          ctx.strokeStyle = flag.colors[2]; // Red
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Top-left to bottom-right diagonal
          ctx.moveTo(2, 0); ctx.lineTo(ujWidth, ujHeight - 2);
          ctx.moveTo(0, 2); ctx.lineTo(ujWidth - 2, ujHeight);
          // Top-right to bottom-left diagonal  
          ctx.moveTo(ujWidth - 2, 0); ctx.lineTo(0, ujHeight - 2);
          ctx.moveTo(ujWidth, 2); ctx.lineTo(2, ujHeight);
          ctx.stroke();
          
          // Southern Cross stars
          ctx.fillStyle = flag.colors[1]; // White
          ctx.font = "6px Arial";
          ctx.fillText("★", 40, 20);
          ctx.fillText("★", 50, 30);
          ctx.fillText("★", 45, 40);
          ctx.fillText("★", 55, 50);
          ctx.fillText("★", 35, 55);
        } else if (flag.code === "GB") {
          // Union Jack pattern
          ctx.fillStyle = flag.colors[0];
          ctx.fillRect(0, 0, 64, 64);
          ctx.fillStyle = flag.colors[1];
          ctx.fillRect(0, 28, 64, 8);
          ctx.fillRect(28, 0, 8, 64);
          ctx.fillStyle = flag.colors[2];
          ctx.fillRect(0, 30, 64, 4);
          ctx.fillRect(30, 0, 4, 64);
        } else if (flag.code === "JP") {
          // Red circle on white
          ctx.fillStyle = flag.colors[0];
          ctx.fillRect(0, 0, 64, 64);
          ctx.fillStyle = flag.colors[1];
          ctx.beginPath();
          ctx.arc(32, 32, 16, 0, Math.PI * 2);
          ctx.fill();
        } else if (flag.code === "ES") {
          // Spanish flag - red-yellow-red horizontal stripes
          // Top red stripe (1/4 of height)
          ctx.fillStyle = flag.colors[0]; // Red
          ctx.fillRect(0, 0, 64, 16);
          
          // Middle yellow stripe (1/2 of height - thicker)
          ctx.fillStyle = flag.colors[1]; // Yellow
          ctx.fillRect(0, 16, 64, 32);
          
          // Bottom red stripe (1/4 of height)
          ctx.fillStyle = flag.colors[2]; // Red
          ctx.fillRect(0, 48, 64, 16);
        } else if (flag.code === "CH") {
          // White cross on red
          ctx.fillStyle = flag.colors[0];
          ctx.fillRect(0, 0, 64, 64);
          ctx.fillStyle = flag.colors[1];
          ctx.fillRect(0, 24, 64, 16);
          ctx.fillRect(24, 0, 16, 64);
        } else {
          // Default horizontal split
          ctx.fillStyle = flag.colors[1];
          ctx.fillRect(0, 32, 64, 32);
        }
      }
      
      // Add country code text
      ctx.fillStyle = "#000000";
      ctx.font = "bold 8px Arial";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeText(flag.code, 32, 58);
      ctx.fillText(flag.code, 32, 58);
    }

    const img = new Image();
    img.src = canvas.toDataURL();
    assets[flag.name] = img;
  });
}

function createBossRoomTiles(): void {
  console.log("🎯 Creating Boss Room tiles...");
  
  createMainGuyCharacter(); // tile 74
  createFlowerDecoration(); // tile 75  
  
  console.log("✅ Boss Room tiles created");
}

function createMainGuyCharacter(): void {
  // Create MainGuy character sprite from MainGuySpriteSheet.png (row 0, col 0, 36x36 pixels)
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Green grass background to match surrounding grass
    ctx.fillStyle = "#228B22";
    ctx.fillRect(0, 0, 64, 64);
    
    // Use the loaded MainGuy sprite sheet
    const spriteSheet = assets["main_guy_sprite_sheet"];
    if (spriteSheet) {
      // Extract sprite from row 0, col 0 (36x36 pixels)
      const spriteSize = 36;
      const sourceX = 0;
      const sourceY = 0;
      
      // Scale and center the sprite
      const scale = 1.5; // Make character slightly larger
      const spriteWidth = spriteSize * scale;
      const spriteHeight = spriteSize * scale;
      const centerX = (64 - spriteWidth) / 2;
      const centerY = (64 - spriteHeight) / 2;
      
      // Draw the character sprite centered on grass background
      ctx.drawImage(
        spriteSheet,
        sourceX, sourceY, spriteSize, spriteSize,
        centerX, centerY, spriteWidth, spriteHeight
      );
    } else {
      // Fallback: simple character representation on grass
      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("BOSS", 32, 35);
    }
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["main_guy"] = img;
}

function createFlowerDecoration(): void {
  // Create decorative flower sprites for natural environment
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Green grass background to match surrounding grass
    ctx.fillStyle = "#228B22";
    ctx.fillRect(0, 0, 64, 64);
    
    // Create multiple small flowers scattered across the tile
    const flowers = [
      {x: 15, y: 20, color: "#ff69b4", size: 4},
      {x: 35, y: 15, color: "#ffd700", size: 3},
      {x: 45, y: 35, color: "#ff6347", size: 4},
      {x: 20, y: 45, color: "#9370db", size: 3},
      {x: 50, y: 50, color: "#00ced1", size: 3}
    ];
    
    flowers.forEach(flower => {
      // Flower petals
      ctx.fillStyle = flower.color;
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const petalX = flower.x + Math.cos(angle) * flower.size;
        const petalY = flower.y + Math.sin(angle) * flower.size;
        
        ctx.beginPath();
        ctx.arc(petalX, petalY, flower.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Flower center
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(flower.x, flower.y, flower.size / 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Small stem
      ctx.strokeStyle = "#228b22";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(flower.x, flower.y + flower.size / 3);
      ctx.lineTo(flower.x, flower.y + flower.size + 2);
      ctx.stroke();
    });
  }

  const img = new Image();
  img.src = canvas.toDataURL();
  assets["flower"] = img;
}


export function getAssets(): { [key: string]: HTMLImageElement } {
  return assets;
}

export function getTileCache(): { [key: string]: HTMLCanvasElement } {
  return tileCache;
}

// Add getAssets as property for compatibility
(loadAssets as any).getAssets = getAssets;
