import argparse
import os
from PIL import Image

def resize_image(image_path, width, height):
    try:
        with Image.open(image_path) as img:
            resized = img.resize((width, height), Image.ANTIALIAS)

            base, ext = os.path.splitext(image_path)
            output_path = f"{base}_resized{ext}"
            resized.save(output_path)

            print(f"✅ Resized image saved as: {output_path}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Resize an image to the given width and height.")
    parser.add_argument("image_path", help="Path to the image file")
    parser.add_argument("width", type=int, help="Target width in pixels")
    parser.add_argument("height", type=int, help="Target height in pixels")

    args = parser.parse_args()
    resize_image(args.image_path, args.width, args.height)

# Usage:
# python resize_image.py path/to/image.png 800 600