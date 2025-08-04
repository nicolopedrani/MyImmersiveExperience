#!/usr/bin/env python3
"""
Tile Size Analyzer
Automatically detects tile size and grid layout from your tileset image.
"""

import os
from PIL import Image
import numpy as np
from typing import Tuple, List, Optional

class TileSizeAnalyzer:
    def __init__(self, image_path: str):
        self.image_path = image_path
        self.image = Image.open(image_path).convert('RGBA')
        self.width, self.height = self.image.size
        self.pixels = np.array(self.image)
        
    def analyze_image_info(self) -> dict:
        """Get basic image information."""
        return {
            'filename': os.path.basename(self.image_path),
            'dimensions': f"{self.width}x{self.height}",
            'width': self.width,
            'height': self.height,
            'mode': self.image.mode,
            'format': self.image.format
        }
    
    def detect_grid_lines(self, threshold: int = 10) -> Tuple[List[int], List[int]]:
        """
        Detect potential grid lines by looking for consistent color changes.
        Returns (vertical_lines, horizontal_lines)
        """
        # Convert to grayscale for easier analysis
        gray = self.image.convert('L')
        gray_array = np.array(gray)
        
        # Detect vertical lines (columns)
        vertical_lines = []
        for x in range(1, self.width - 1):
            # Check if this column has significant difference from neighbors
            left_col = gray_array[:, x-1]
            current_col = gray_array[:, x]
            right_col = gray_array[:, x+1]
            
            # Calculate variance in this column vs neighbors
            diff_left = np.mean(np.abs(current_col - left_col))
            diff_right = np.mean(np.abs(current_col - right_col))
            
            if diff_left > threshold or diff_right > threshold:
                vertical_lines.append(x)
        
        # Detect horizontal lines (rows)
        horizontal_lines = []
        for y in range(1, self.height - 1):
            top_row = gray_array[y-1, :]
            current_row = gray_array[y, :]
            bottom_row = gray_array[y+1, :]
            
            diff_top = np.mean(np.abs(current_row - top_row))
            diff_bottom = np.mean(np.abs(current_row - bottom_row))
            
            if diff_top > threshold or diff_bottom > threshold:
                horizontal_lines.append(y)
        
        return vertical_lines, horizontal_lines
    
    def find_repeating_patterns(self) -> List[int]:
        """Find likely tile sizes by looking for repeating patterns."""
        possible_sizes = []
        
        # Check common tile sizes
        common_sizes = [8, 16, 24, 32, 48, 64, 96, 128]
        
        for size in common_sizes:
            if self.width % size == 0 and self.height % size == 0:
                possible_sizes.append(size)
        
        return possible_sizes
    
    def analyze_tile_boundaries(self) -> dict:
        """Comprehensive analysis to determine tile size."""
        info = self.analyze_image_info()
        
        # Method 1: Look for common divisors
        possible_sizes = self.find_repeating_patterns()
        
        # Method 2: Detect grid lines
        v_lines, h_lines = self.detect_grid_lines()
        
        # Method 3: Analyze spacing between grid lines
        grid_analysis = {}
        if len(v_lines) > 1:
            v_spacing = []
            for i in range(1, len(v_lines)):
                spacing = v_lines[i] - v_lines[i-1]
                v_spacing.append(spacing)
            if v_spacing:
                grid_analysis['vertical_spacing'] = {
                    'spacings': v_spacing,
                    'most_common': max(set(v_spacing), key=v_spacing.count) if v_spacing else None
                }
        
        if len(h_lines) > 1:
            h_spacing = []
            for i in range(1, len(h_lines)):
                spacing = h_lines[i] - h_lines[i-1]
                h_spacing.append(spacing)
            if h_spacing:
                grid_analysis['horizontal_spacing'] = {
                    'spacings': h_spacing,
                    'most_common': max(set(h_spacing), key=h_spacing.count) if h_spacing else None
                }
        
        return {
            'image_info': info,
            'possible_tile_sizes': possible_sizes,
            'detected_grid_lines': {
                'vertical_count': len(v_lines),
                'horizontal_count': len(h_lines),
                'vertical_positions': v_lines[:10],  # Show first 10
                'horizontal_positions': h_lines[:10]
            },
            'grid_analysis': grid_analysis,
            'recommendations': self._make_recommendations(possible_sizes, grid_analysis)
        }
    
    def _make_recommendations(self, possible_sizes: List[int], grid_analysis: dict) -> dict:
        """Make educated guesses about tile size based on analysis."""
        recommendations = {
            'most_likely_tile_size': None,
            'confidence': 'low',
            'reasoning': []
        }
        
        # If we have grid spacing information
        if 'vertical_spacing' in grid_analysis and 'horizontal_spacing' in grid_analysis:
            v_spacing = grid_analysis['vertical_spacing']['most_common']
            h_spacing = grid_analysis['horizontal_spacing']['most_common']
            
            if v_spacing == h_spacing and v_spacing in possible_sizes:
                recommendations['most_likely_tile_size'] = v_spacing
                recommendations['confidence'] = 'high'
                recommendations['reasoning'].append(f"Grid analysis shows consistent {v_spacing}x{v_spacing} spacing")
        
        # If we have possible sizes but no clear grid
        elif possible_sizes:
            # Prefer common game tile sizes
            preferred_order = [32, 16, 64, 48, 24, 96, 128, 8]
            for size in preferred_order:
                if size in possible_sizes:
                    recommendations['most_likely_tile_size'] = size
                    recommendations['confidence'] = 'medium'
                    recommendations['reasoning'].append(f"{size}x{size} is a common tile size and divides evenly into image dimensions")
                    break
        
        # Fallback based on image size
        if not recommendations['most_likely_tile_size']:
            if self.width <= 512 and self.height <= 512:
                recommendations['most_likely_tile_size'] = 32
                recommendations['reasoning'].append("Default guess for medium-sized tilesets")
            else:
                recommendations['most_likely_tile_size'] = 64
                recommendations['reasoning'].append("Default guess for large tilesets")
        
        return recommendations
    
    def create_visual_grid_overlay(self, tile_size: int, output_path: str = None) -> str:
        """Create a version of the image with grid overlay to verify tile size."""
        if output_path is None:
            base_name = os.path.splitext(self.image_path)[0]
            output_path = f"{base_name}_grid_overlay_{tile_size}px.png"
        
        # Create a copy of the image
        overlay_image = self.image.copy()
        
        # Convert to RGBA if not already
        if overlay_image.mode != 'RGBA':
            overlay_image = overlay_image.convert('RGBA')
        
        # Create overlay with grid lines
        from PIL import ImageDraw
        draw = ImageDraw.Draw(overlay_image)
        
        # Draw vertical lines
        for x in range(0, self.width, tile_size):
            draw.line([(x, 0), (x, self.height)], fill=(255, 0, 0, 128), width=1)
        
        # Draw horizontal lines
        for y in range(0, self.height, tile_size):
            draw.line([(0, y), (self.width, y)], fill=(255, 0, 0, 128), width=1)
        
        overlay_image.save(output_path)
        return output_path
    
    def generate_tile_coordinates(self, tile_size: int) -> List[dict]:
        """Generate coordinate mappings for all tiles in the grid."""
        tiles = []
        tile_id = 0
        
        for y in range(0, self.height, tile_size):
            for x in range(0, self.width, tile_size):
                # Check if we have a complete tile (not cut off at edges)
                if x + tile_size <= self.width and y + tile_size <= self.height:
                    tiles.append({
                        'id': f'tile_{tile_id:03d}',
                        'grid_x': x // tile_size,
                        'grid_y': y // tile_size,
                        'pixel_x': x,
                        'pixel_y': y,
                        'width': tile_size,
                        'height': tile_size
                    })
                    tile_id += 1
        
        return tiles

def analyze_tileset(image_path: str, create_overlay: bool = True) -> dict:
    """Main function to analyze a tileset image."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    
    print(f"Analyzing tileset: {image_path}")
    analyzer = TileSizeAnalyzer(image_path)
    
    # Perform analysis
    analysis = analyzer.analyze_tile_boundaries()
    
    # Print results
    print("\n=== TILESET ANALYSIS RESULTS ===")
    print(f"Image: {analysis['image_info']['filename']}")
    print(f"Dimensions: {analysis['image_info']['dimensions']}")
    
    print(f"\nPossible tile sizes: {analysis['possible_tile_sizes']}")
    
    rec = analysis['recommendations']
    print(f"\nRECOMMENDED TILE SIZE: {rec['most_likely_tile_size']}px")
    print(f"Confidence: {rec['confidence']}")
    print("Reasoning:")
    for reason in rec['reasoning']:
        print(f"  - {reason}")
    
    # Create visual overlay if requested
    if create_overlay and rec['most_likely_tile_size']:
        overlay_path = analyzer.create_visual_grid_overlay(rec['most_likely_tile_size'])
        print(f"\nGrid overlay created: {overlay_path}")
        analysis['overlay_path'] = overlay_path
    
    # Generate tile coordinates
    if rec['most_likely_tile_size']:
        tiles = analyzer.generate_tile_coordinates(rec['most_likely_tile_size'])
        print(f"Total tiles detected: {len(tiles)}")
        analysis['tile_coordinates'] = tiles
    
    return analysis

# Command line usage
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python tile_size_analyzer.py <image_path>")
        print("Example: python tile_size_analyzer.py library_tileset.png")
        sys.exit(1)

    image_path = sys.argv[1]
    try:
        # Analyze tileset and print results
        print(f"Analyzing tileset: {image_path}")
        analyzer = TileSizeAnalyzer(image_path)
        analysis = analyzer.analyze_tile_boundaries()

        print("\n=== TILESET ANALYSIS RESULTS ===")
        print(f"Image: {analysis['image_info']['filename']}")
        print(f"Dimensions: {analysis['image_info']['dimensions']}")
        print(f"\nPossible tile sizes: {analysis['possible_tile_sizes']}")

        # Generate overlays for all suggested tile sizes
        print("\nGenerating overlays for suggested tile sizes...")
        for tile_size in analysis['possible_tile_sizes']:
            overlay_path = analyzer.create_visual_grid_overlay(tile_size)
            print(f"Overlay saved: {overlay_path}")

        rec = analysis['recommendations']
        print(f"\nRECOMMENDED TILE SIZE: {rec['most_likely_tile_size']}px")
        print(f"Confidence: {rec['confidence']}")
        print("Reasoning:")
        for reason in rec['reasoning']:
            print(f"  - {reason}")

        # Create visual overlay for recommended tile size, if present
        if rec['most_likely_tile_size']:
            overlay_path = analyzer.create_visual_grid_overlay(rec['most_likely_tile_size'])
            print(f"\nGrid overlay created: {overlay_path}")
            analysis['overlay_path'] = overlay_path

        # Generate tile coordinates for recommended tile size
        if rec['most_likely_tile_size']:
            tiles = analyzer.generate_tile_coordinates(rec['most_likely_tile_size'])
            print(f"Total tiles detected: {len(tiles)}")
            analysis['tile_coordinates'] = tiles

        # Optionally save results to JSON
        import json
        output_file = f"{os.path.splitext(image_path)[0]}_analysis.json"
        with open(output_file, 'w') as f:
            # Remove non-serializable items for JSON
            json_result = {k: v for k, v in analysis.items() if k != 'overlay_path'}
            json.dump(json_result, f, indent=2)
        print(f"\nAnalysis saved to: {output_file}")

    except Exception as e:
        print(f"Error analyzing tileset: {e}")
        import traceback
        traceback.print_exc()

# usage example:
# python tile_size_analyzer.py path/to/your/tileset.png