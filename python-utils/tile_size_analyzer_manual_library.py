#!/usr/bin/env python3
"""
Manual Tile Size Calculator for Library Tileset
Based on visual inspection and mathematical analysis
"""

def analyze_library_tileset_dimensions():
    """
    Analyze the 1488x528 library tileset to determine actual tile size
    """
    width = 1488
    height = 528
    
    print("=== MANUAL ANALYSIS: Library Tileset (1488x528) ===")
    print(f"Image dimensions: {width}x{height}")
    
    # Test the detected possible sizes
    possible_sizes = [8, 16, 24, 48]
    
    print("\n=== Testing Detected Possible Sizes ===")
    for size in possible_sizes:
        cols = width // size
        rows = height // size
        total_tiles = cols * rows
        remainder_x = width % size
        remainder_y = height % size
        
        print(f"\nTile size {size}x{size}:")
        print(f"  Grid: {cols}x{rows} = {total_tiles} tiles")
        print(f"  Remainder: {remainder_x}x{remainder_y} pixels")
        print(f"  Perfect fit: {'YES' if remainder_x == 0 and remainder_y == 0 else 'NO'}")
        
        # Calculate what this would mean for furniture pieces
        if size == 16:
            print(f"  → Each furniture piece would be very small (16px)")
        elif size == 24:
            print(f"  → Medium-small furniture pieces (24px)")
        elif size == 48:
            print(f"  → Large furniture pieces (48px)")
    
    print("\n=== VISUAL ANALYSIS GUIDE ===")
    print("Based on your library image, look for:")
    print("1. Individual books on shelves")
    print("2. Single chair/desk pieces")
    print("3. Small decorative items")
    print("4. Repeating patterns in bookshelves")
    
    print("\n=== RECOMMENDED APPROACH ===")
    print("1. Check the grid overlay image: libassetpack-tiled_grid_overlay_64px.png")
    print("2. If 64px lines don't align with furniture edges, try smaller sizes")
    print("3. Look at the grandfather clock - it appears to be 1-2 tiles wide")
    print("4. Bookshelves at the bottom appear to be 3-4 tiles wide")
    
    # Let's make educated guesses based on typical furniture proportions
    print("\n=== EDUCATED GUESS ANALYSIS ===")
    
    # If we assume large bookshelves are about 96-128px wide (3-4 tiles of 32px)
    # Or 96px wide (2 tiles of 48px)
    
    # Looking at your original description, items seem detailed
    # 48px would make sense for detailed furniture
    
    print("Based on furniture complexity and detail level:")
    print("• 48x48px tiles would give you 31x11 grid (341 tiles)")
    print("• This fits well with detailed furniture pieces")
    print("• Large bookshelves would be ~2-3 tiles wide")
    print("• Small items (books, bottles) would be 1 tile")
    
    return {
        'recommended_size': 48,
        'grid_dimensions': (31, 11),
        'total_tiles': 341,
        'reasoning': 'Best fit for detailed furniture sprites'
    }

def create_test_overlays():
    """Create overlay images for different tile sizes to test"""
    from PIL import Image, ImageDraw
    import os
    
    image_path = "assets/libassetpack-tiled.png"
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return
    
    image = Image.open(image_path)
    
    test_sizes = [16, 24, 48]
    
    for size in test_sizes:
        # Create overlay
        overlay = image.copy()
        draw = ImageDraw.Draw(overlay)
        
        # Draw grid
        width, height = image.size
        
        # Vertical lines
        for x in range(0, width, size):
            draw.line([(x, 0), (x, height)], fill=(255, 0, 0, 128), width=1)
        
        # Horizontal lines  
        for y in range(0, height, size):
            draw.line([(0, y), (width, y)], fill=(255, 0, 0, 128), width=1)
        
        output_path = f"assets/libassetpack-tiled_test_grid_{size}px.png"
        overlay.save(output_path)
        print(f"Test grid created: {output_path}")

def generate_tile_mapping_template(tile_size: int = 48):
    """Generate a template for manual tile mapping"""
    width = 1488
    height = 528
    
    cols = width // tile_size
    rows = height // tile_size
    
    print(f"\n=== TILE MAPPING TEMPLATE ({tile_size}x{tile_size}) ===")
    print(f"Grid: {cols}x{rows}")
    print("\nTypeScript template:")
    
    template = f'''// Library Tileset Mapping ({tile_size}x{tile_size} tiles)
export const LIBRARY_TILES = [
  // Row 0 (Top row with small items)'''
    
    tile_id = 0
    for row in range(min(3, rows)):  # Show first 3 rows as example
        template += f"\n  // Row {row}"
        for col in range(min(10, cols)):  # Show first 10 columns
            x = col * tile_size
            y = row * tile_size
            template += f"\n  {{ id: 'tile_{tile_id:03d}', x: {x}, y: {y}, w: {tile_size}, h: {tile_size} }},"
            tile_id += 1
        template += "\n"
    
    template += "\n  // ... continue for all tiles\n];"
    
    print(template)
    
    return template

if __name__ == "__main__":
    # Run analysis
    result = analyze_library_tileset_dimensions()
    
    # Create test overlays
    print("\n=== CREATING TEST GRID OVERLAYS ===")
    create_test_overlays()
    
    # Generate mapping template
    generate_tile_mapping_template(result['recommended_size'])
    
    print(f"\n=== FINAL RECOMMENDATION ===")
    print(f"Recommended tile size: {result['recommended_size']}x{result['recommended_size']}px")
    print(f"Grid dimensions: {result['grid_dimensions'][0]}x{result['grid_dimensions'][1]}")
    print(f"Total tiles: {result['total_tiles']}")
    print(f"Reasoning: {result['reasoning']}")
    
    print(f"\n=== NEXT STEPS ===")
    print("1. Check the test grid overlay files:")
    print("   - assets/libassetpack-tiled_test_grid_16px.png")
    print("   - assets/libassetpack-tiled_test_grid_24px.png") 
    print("   - assets/libassetpack-tiled_test_grid_48px.png")
    print("2. See which grid aligns best with the furniture edges")
    print("3. Update your TypeScript TILE_SIZE constant accordingly")