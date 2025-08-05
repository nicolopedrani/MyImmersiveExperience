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

export function getAssets(): { [key: string]: HTMLImageElement } {
  return assets;
}

export function getTileCache(): { [key: string]: HTMLCanvasElement } {
  return tileCache;
}

// Add getAssets as property for compatibility
(loadAssets as any).getAssets = getAssets;
