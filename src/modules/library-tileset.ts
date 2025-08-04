// Library Tileset Coordinate Mapper
// Analyzes your library tileset and creates coordinate mappings

export interface TileData {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category: string;
  description?: string;
}

export class LibraryTilesetMapper {
  private static readonly TILE_SIZE = 48; // Assuming 48x48 pixel tiles (adjust if different)

  // Define your library tileset mapping
  public static readonly TILES: TileData[] = [
    // Top row - Small items and decorative elements
    {
      id: "plant_1",
      name: "Small Plant",
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      category: "decoration",
    },
    {
      id: "plant_2",
      name: "Potted Plant",
      x: 32,
      y: 0,
      width: 32,
      height: 32,
      category: "decoration",
    },
    {
      id: "grandfather_clock",
      name: "Grandfather Clock",
      x: 64,
      y: 0,
      width: 32,
      height: 64,
      category: "furniture",
      description: "Tall antique clock",
    },
    {
      id: "box_closed",
      name: "Closed Box",
      x: 128,
      y: 0,
      width: 32,
      height: 32,
      category: "storage",
    },
    {
      id: "box_books",
      name: "Box with Books",
      x: 160,
      y: 0,
      width: 32,
      height: 32,
      category: "storage",
    },
    {
      id: "open_book",
      name: "Open Book",
      x: 192,
      y: 0,
      width: 32,
      height: 32,
      category: "books",
    },
    {
      id: "book_stack",
      name: "Stack of Books",
      x: 224,
      y: 0,
      width: 32,
      height: 32,
      category: "books",
    },
    {
      id: "misc_items",
      name: "Miscellaneous Items",
      x: 256,
      y: 0,
      width: 64,
      height: 32,
      category: "decoration",
    },

    // Second row
    {
      id: "wooden_chest",
      name: "Wooden Chest",
      x: 0,
      y: 32,
      width: 32,
      height: 32,
      category: "storage",
    },
    {
      id: "box_open",
      name: "Open Box",
      x: 128,
      y: 32,
      width: 32,
      height: 32,
      category: "storage",
    },
    {
      id: "color_books",
      name: "Colorful Books",
      x: 160,
      y: 32,
      width: 32,
      height: 32,
      category: "books",
    },
    {
      id: "book_collection",
      name: "Book Collection",
      x: 192,
      y: 32,
      width: 32,
      height: 32,
      category: "books",
    },
    {
      id: "bottles_potions",
      name: "Bottles/Potions",
      x: 224,
      y: 32,
      width: 32,
      height: 32,
      category: "decoration",
    },

    // Third row - Rugs and carpets
    {
      id: "red_rug_large",
      name: "Large Red Rug",
      x: 320,
      y: 0,
      width: 96,
      height: 64,
      category: "floor",
      description: "Decorative red carpet",
    },
    {
      id: "red_rug_medium",
      name: "Medium Red Rug",
      x: 320,
      y: 96,
      width: 96,
      height: 48,
      category: "floor",
    },

    // Chairs and seating
    {
      id: "blue_chair_1",
      name: "Blue Chair (View 1)",
      x: 480,
      y: 0,
      width: 32,
      height: 32,
      category: "furniture",
    },
    {
      id: "red_cabinet_tall",
      name: "Tall Red Cabinet",
      x: 512,
      y: 0,
      width: 32,
      height: 64,
      category: "storage",
    },
    {
      id: "blue_chair_2",
      name: "Blue Chair (View 2)",
      x: 480,
      y: 32,
      width: 32,
      height: 32,
      category: "furniture",
    },
    {
      id: "wooden_stool",
      name: "Wooden Stool",
      x: 448,
      y: 96,
      width: 32,
      height: 32,
      category: "furniture",
    },

    // Fourth row - Floor tiles and globe
    {
      id: "wood_floor_1",
      name: "Wood Floor Tile 1",
      x: 0,
      y: 160,
      width: 32,
      height: 32,
      category: "floor",
    },
    {
      id: "wood_floor_2",
      name: "Wood Floor Tile 2",
      x: 32,
      y: 160,
      width: 32,
      height: 32,
      category: "floor",
    },
    {
      id: "globe",
      name: "World Globe",
      x: 96,
      y: 160,
      width: 64,
      height: 64,
      category: "decoration",
      description: "Perfect for travel theme!",
    },
    {
      id: "red_pillar_base",
      name: "Red Pillar Base",
      x: 192,
      y: 160,
      width: 32,
      height: 32,
      category: "architecture",
    },
    {
      id: "red_pillar_mid",
      name: "Red Pillar Middle",
      x: 224,
      y: 160,
      width: 32,
      height: 32,
      category: "architecture",
    },

    // Fifth row - Large furniture pieces
    {
      id: "wooden_desk",
      name: "Wooden Desk",
      x: 256,
      y: 160,
      width: 96,
      height: 48,
      category: "furniture",
      description: "Perfect for reading/writing",
    },
    {
      id: "red_couch",
      name: "Red Couch",
      x: 384,
      y: 160,
      width: 64,
      height: 48,
      category: "furniture",
    },
    {
      id: "red_cabinet_short",
      name: "Short Red Cabinet",
      x: 512,
      y: 160,
      width: 32,
      height: 48,
      category: "storage",
    },

    // Bottom row - Bookshelves (the stars of your library!)
    {
      id: "bookshelf_empty",
      name: "Empty Bookshelf",
      x: 0,
      y: 256,
      width: 48,
      height: 64,
      category: "furniture",
      description: "Empty wooden bookshelf",
    },
    {
      id: "bookshelf_mixed",
      name: "Mixed Books Shelf",
      x: 48,
      y: 256,
      width: 48,
      height: 64,
      category: "furniture",
      description: "Bookshelf with various items",
    },
    {
      id: "bookshelf_full",
      name: "Full Bookshelf",
      x: 96,
      y: 256,
      width: 48,
      height: 64,
      category: "furniture",
      description: "Fully stocked bookshelf",
    },
    {
      id: "bookshelf_organized",
      name: "Organized Bookshelf",
      x: 144,
      y: 256,
      width: 48,
      height: 64,
      category: "furniture",
      description: "Neatly organized books",
    },

    // Large bookshelf section (right side)
    {
      id: "library_wall_left",
      name: "Library Wall Left",
      x: 640,
      y: 0,
      width: 96,
      height: 128,
      category: "furniture",
      description: "Large library wall section",
    },
    {
      id: "library_wall_center",
      name: "Library Wall Center",
      x: 736,
      y: 0,
      width: 128,
      height: 128,
      category: "furniture",
      description: "Central library wall with ladder",
    },
    {
      id: "library_wall_right",
      name: "Library Wall Right",
      x: 864,
      y: 0,
      width: 96,
      height: 128,
      category: "furniture",
      description: "Right library wall section",
    },
  ];

  // Helper methods
  public static getTileById(id: string): TileData | undefined {
    return this.TILES.find((tile) => tile.id === id);
  }

  public static getTilesByCategory(category: string): TileData[] {
    return this.TILES.filter((tile) => tile.category === category);
  }

  public static getBookshelfTiles(): TileData[] {
    return this.TILES.filter(
      (tile) =>
        tile.category === "furniture" &&
        (tile.name.toLowerCase().includes("bookshelf") ||
          tile.name.toLowerCase().includes("library"))
    );
  }

  public static getReadingFurniture(): TileData[] {
    return this.TILES.filter(
      (tile) =>
        tile.category === "furniture" &&
        (tile.name.toLowerCase().includes("chair") ||
          tile.name.toLowerCase().includes("desk") ||
          tile.name.toLowerCase().includes("couch"))
    );
  }

  public static getBookTiles(): TileData[] {
    return this.TILES.filter((tile) => tile.category === "books");
  }

  public static getTravelDecoration(): TileData[] {
    return this.TILES.filter(
      (tile) =>
        tile.description?.toLowerCase().includes("travel") ||
        tile.name.toLowerCase().includes("globe")
    );
  }

  // Generate tile sheet metadata
  public static generateMetadata() {
    const categories = [...new Set(this.TILES.map((tile) => tile.category))];
    const totalTiles = this.TILES.length;
    const maxX = Math.max(...this.TILES.map((tile) => tile.x + tile.width));
    const maxY = Math.max(...this.TILES.map((tile) => tile.y + tile.height));

    return {
      totalTiles,
      categories,
      dimensions: { width: maxX, height: maxY },
      tileSize: this.TILE_SIZE,
      categories_breakdown: categories.map((cat) => ({
        category: cat,
        count: this.TILES.filter((tile) => tile.category === cat).length,
      })),
    };
  }
}

// Utility class for creating a library room layout
export class LibraryRoomBuilder {
  private tiles: Map<string, TileData> = new Map();

  constructor() {
    LibraryTilesetMapper.TILES.forEach((tile) => {
      this.tiles.set(tile.id, tile);
    });
  }

  // Suggested room layout for your reading hobby
  public createReadingRoom(): Array<{
    tile: TileData;
    gridX: number;
    gridY: number;
  }> {
    const layout = [
      // Back wall - Large library shelves
      { tileId: "library_wall_left", gridX: 0, gridY: 0 },
      { tileId: "library_wall_center", gridX: 3, gridY: 0 },
      { tileId: "library_wall_right", gridX: 7, gridY: 0 },

      // Floor area - Reading furniture
      { tileId: "wooden_desk", gridX: 1, gridY: 4 },
      { tileId: "blue_chair_1", gridX: 2, gridY: 5 },
      { tileId: "red_couch", gridX: 5, gridY: 4 },

      // Decorative elements
      { tileId: "globe", gridX: 0, gridY: 4 },
      { tileId: "red_rug_large", gridX: 3, gridY: 5 },
      { tileId: "grandfather_clock", gridX: 8, gridY: 3 },

      // Additional bookshelves
      { tileId: "bookshelf_full", gridX: 0, gridY: 6 },
      { tileId: "bookshelf_organized", gridX: 2, gridY: 6 },

      // Books and storage
      { tileId: "book_stack", gridX: 4, gridY: 4 },
      { tileId: "open_book", gridX: 1, gridY: 4 },
      { tileId: "wooden_chest", gridX: 7, gridY: 5 },
    ];

    return layout
      .map((item) => ({
        tile: this.tiles.get(item.tileId)!,
        gridX: item.gridX,
        gridY: item.gridY,
      }))
      .filter((item) => item.tile); // Remove any undefined tiles
  }
}

// Usage example and tile sheet analyzer
export function analyzeLibraryTileset(): void {
  console.log("=== Library Tileset Analysis ===");

  const metadata = LibraryTilesetMapper.generateMetadata();
  console.log("Total tiles:", metadata.totalTiles);
  console.log("Tileset dimensions:", metadata.dimensions);
  console.log("Categories:", metadata.categories);

  console.log("\n=== Perfect for Your Reading Hobby ===");
  const bookshelves = LibraryTilesetMapper.getBookshelfTiles();
  console.log(`Bookshelves available: ${bookshelves.length}`);
  bookshelves.forEach((shelf) =>
    console.log(`- ${shelf.name}: ${shelf.description || "N/A"}`)
  );

  const books = LibraryTilesetMapper.getBookTiles();
  console.log(`\nBook-related tiles: ${books.length}`);
  books.forEach((book) => console.log(`- ${book.name}`));

  const furniture = LibraryTilesetMapper.getReadingFurniture();
  console.log(`\nReading furniture: ${furniture.length}`);
  furniture.forEach((item) => console.log(`- ${item.name}`));

  const travel = LibraryTilesetMapper.getTravelDecoration();
  console.log(`\nTravel-themed items: ${travel.length}`);
  travel.forEach((item) =>
    console.log(`- ${item.name}: ${item.description || "N/A"}`)
  );
}

// Export everything for easy use
export { LibraryTilesetMapper as default };

// EXAMPLE USAGE
// Get specific tiles
// const bookshelf = LibraryTilesetMapper.getTileById('bookshelf_full');
// const globe = LibraryTilesetMapper.getTileById('globe');

// // Get tiles by category
// const allBooks = LibraryTilesetMapper.getBookTiles();
// const furniture = LibraryTilesetMapper.getReadingFurniture();

// // Create a pre-designed reading room
// const roomBuilder = new LibraryRoomBuilder();
// const readingRoom = roomBuilder.createReadingRoom();
