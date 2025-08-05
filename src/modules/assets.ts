// modules/assets.ts - Simplified debugging approach

import grassImg from "../../assets/Grass_Middle.png";
import pathImg from "../../assets/Path_Middle.png";
import oakTreeImg from "../../assets/Oak_Tree.png";
import playerImg from "../../assets/Player.png";

// Import your tilesheets
import assetsImg from "../../assets/assets.png";
import footballGroundImg from "../../assets/FootballGround.png";
import libraryImg from "../../assets/library.png";
import travelFlagsImg from "../../assets/travel_flags_tilesheet.png";

const assets: { [key: string]: HTMLImageElement } = {};
const tileCache: { [key: string]: HTMLCanvasElement } = {};
let loaded: number = 0;
const totalAssets: number = 8;
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

  console.log("✅ Diverse Data Science visualization tiles created");
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
    
    // Green dot (Deloitte brand element)
    ctx.fillStyle = "#86bc25";
    ctx.beginPath();
    ctx.arc(32, 45, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Period after Deloitte (brand styling)
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

export function getAssets(): { [key: string]: HTMLImageElement } {
  return assets;
}

export function getTileCache(): { [key: string]: HTMLCanvasElement } {
  return tileCache;
}

// Add getAssets as property for compatibility
(loadAssets as any).getAssets = getAssets;
