#!/usr/bin/env python3
"""
Flag Tile Sheet Generator
Creates a single PNG tile sheet from individual flag images for your travel hobby room.
"""

import os
import json
from PIL import Image
from typing import List, Dict, Tuple

class FlagTileSheetGenerator:
    def __init__(self, base_path: str = "All_Assets"):
        self.base_path = base_path
        self.flag_width = 15
        self.flag_height = 10
        self.columns = 8  # Number of flags per row
        
        # Your travel destinations
        self.travel_flags = [
            # Your main destinations
            {'name': 'Australia', 'code': 'au'},
            {'name': 'United States', 'code': 'us'},
            {'name': 'Japan', 'code': 'jp'},
            {'name': 'Vietnam', 'code': 'vn'},
            {'name': 'Maldives', 'code': 'mv'},
            
            # Europe
            {'name': 'Italy', 'code': 'it'},
            {'name': 'France', 'code': 'fr'},
            {'name': 'Germany', 'code': 'de'},
            {'name': 'Spain', 'code': 'es'},
            {'name': 'United Kingdom', 'code': 'gb'},
            {'name': 'Netherlands', 'code': 'nl'},
            {'name': 'Switzerland', 'code': 'ch'},
            
            # North Africa
            {'name': 'Morocco', 'code': 'ma'},
            {'name': 'Egypt', 'code': 'eg'},
        ]
    
    def calculate_dimensions(self) -> Tuple[int, int]:
        """Calculate the total dimensions of the tile sheet."""
        total_flags = len(self.travel_flags)
        rows = (total_flags + self.columns - 1) // self.columns  # Ceiling division
        width = self.columns * self.flag_width
        height = rows * self.flag_height
        return width, height
    
    def generate_flag_data(self) -> List[Dict]:
        """Generate flag data with positions in the tile sheet."""
        flag_data = []
        
        for i, flag in enumerate(self.travel_flags):
            row = i // self.columns
            col = i % self.columns
            x = col * self.flag_width
            y = row * self.flag_height
            
            flag_data.append({
                'name': flag['name'],
                'code': flag['code'],
                'x': x,
                'y': y,
                'width': self.flag_width,
                'height': self.flag_height
            })
        
        return flag_data
    
    def load_flag_image(self, flag_code: str) -> Image.Image:
        """Load a single flag image."""
        flag_path = os.path.join(self.base_path, 'flags', f'{flag_code}.png')
        
        if not os.path.exists(flag_path):
            print(f"Warning: Flag {flag_code} not found at {flag_path}")
            # Create a placeholder image
            placeholder = Image.new('RGBA', (self.flag_width, self.flag_height), (255, 0, 0, 255))
            return placeholder
        
        try:
            img = Image.open(flag_path)
            # Ensure the image is the correct size
            if img.size != (self.flag_width, self.flag_height):
                print(f"Resizing {flag_code} from {img.size} to ({self.flag_width}, {self.flag_height})")
                img = img.resize((self.flag_width, self.flag_height), Image.Resampling.NEAREST)
            return img.convert('RGBA')
        except Exception as e:
            print(f"Error loading {flag_code}: {e}")
            # Create a placeholder image
            placeholder = Image.new('RGBA', (self.flag_width, self.flag_height), (255, 0, 0, 255))
            return placeholder
    
    def create_tile_sheet(self, output_path: str = 'travel_flags_tilesheet.png') -> str:
        """Create the flag tile sheet."""
        width, height = self.calculate_dimensions()
        print(f"Creating tile sheet: {width}x{height} pixels")
        
        # Create the tile sheet image
        tile_sheet = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        
        flag_data = self.generate_flag_data()
        loaded_flags = 0
        
        for flag in flag_data:
            flag_img = self.load_flag_image(flag['code'])
            tile_sheet.paste(flag_img, (flag['x'], flag['y']))
            loaded_flags += 1
            print(f"Added {flag['name']} ({flag['code']}) at ({flag['x']}, {flag['y']})")
        
        # Save the tile sheet
        tile_sheet.save(output_path, 'PNG')
        print(f"Tile sheet saved as: {output_path}")
        print(f"Successfully processed {loaded_flags} flags")
        
        return output_path
    
    def create_metadata(self, output_path: str = 'travel_flags_metadata.json') -> str:
        """Create metadata JSON file for use in TypeScript."""
        flag_data = self.generate_flag_data()
        width, height = self.calculate_dimensions()
        
        metadata = {
            'tilesheet': {
                'width': width,
                'height': height,
                'flag_width': self.flag_width,
                'flag_height': self.flag_height,
                'columns': self.columns
            },
            'flags': flag_data
        }
        
        with open(output_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Metadata saved as: {output_path}")
        return output_path
    
    def create_typescript_interface(self, output_path: str = 'travel_flags.ts') -> str:
        """Create TypeScript interface file."""
        flag_data = self.generate_flag_data()
        width, height = self.calculate_dimensions()
        
        ts_content = f"""// Generated Flag Tile Sheet Interface
// Auto-generated by flag_tilesheet_generator.py

export interface FlagData {{
  name: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
}}

export class TravelFlags {{
  public static readonly TILESHEET_WIDTH = {width};
  public static readonly TILESHEET_HEIGHT = {height};
  public static readonly FLAG_WIDTH = {self.flag_width};
  public static readonly FLAG_HEIGHT = {self.flag_height};
  
  public static readonly FLAGS: FlagData[] = [
"""
        
        for flag in flag_data:
            ts_content += f"    {{ name: '{flag['name']}', code: '{flag['code']}', x: {flag['x']}, y: {flag['y']}, width: {flag['width']}, height: {flag['height']} }},\n"
        
        ts_content += """  ];

  public static getFlagByCode(code: string): FlagData | undefined {
    return this.FLAGS.find(flag => flag.code === code);
  }

  public static getFlagByName(name: string): FlagData | undefined {
    return this.FLAGS.find(flag => flag.name.toLowerCase() === name.toLowerCase());
  }
}
"""
        
        with open(output_path, 'w') as f:
            f.write(ts_content)
        
        print(f"TypeScript interface saved as: {output_path}")
        return output_path

def main():
    """Main function to generate the flag tile sheet."""
    print("=== Travel Flags Tile Sheet Generator ===")
    
    # Initialize the generator
    generator = FlagTileSheetGenerator()
    
    try:
        # Create the tile sheet
        tilesheet_path = generator.create_tile_sheet()
        
        # Create metadata
        metadata_path = generator.create_metadata()
        
        # Create TypeScript interface
        ts_path = generator.create_typescript_interface()
        
        print("\n=== Generation Complete! ===")
        print(f"Tile Sheet: {tilesheet_path}")
        print(f"Metadata: {metadata_path}")
        print(f"TypeScript: {ts_path}")
        
        width, height = generator.calculate_dimensions()
        print(f"\nTile Sheet Dimensions: {width}x{height}")
        print(f"Total Flags: {len(generator.travel_flags)}")
        
    except Exception as e:
        print(f"Error generating tile sheet: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()