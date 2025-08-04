#!/usr/bin/env python3

import os
import sys
import argparse
from PIL import Image, ImageDraw

def draw_grid_overlay(image_path: str, tile_size: int, output_path: str = None) -> str:
    # Load and convert image
    image = Image.open(image_path).convert('RGBA')
    width, height = image.size

    # Create overlay
    overlay = image.copy()
    draw = ImageDraw.Draw(overlay)

    # Draw vertical lines
    for x in range(0, width, tile_size):
        draw.line([(x, 0), (x, height)], fill=(255, 0, 0, 128), width=1)

    # Draw horizontal lines
    for y in range(0, height, tile_size):
        draw.line([(0, y), (width, y)], fill=(255, 0, 0, 128), width=1)

    # Output filename
    if output_path is None:
        base, ext = os.path.splitext(image_path)
        output_path = f"{base}_grid_{tile_size}px.png"

    overlay.save(output_path)
    print(f"✅ Overlay saved: {output_path}")
    return output_path

def main():
    parser = argparse.ArgumentParser(description="Add grid overlay to an image using a specified tile size.")
    parser.add_argument("image", help="Path to the image file (e.g. tileset.png)")
    parser.add_argument("tile_size", type=int, help="Size of each tile in pixels (e.g. 32)")
    parser.add_argument("--output", "-o", help="Optional path to save the output image")
    
    args = parser.parse_args()

    if not os.path.exists(args.image):
        print(f"❌ File not found: {args.image}")
        sys.exit(1)

    draw_grid_overlay(args.image, args.tile_size, args.output)

if __name__ == "__main__":
    main()