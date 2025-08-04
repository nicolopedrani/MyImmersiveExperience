import argparse
from PIL import Image
import os

def crop_image(input_path, output_path, crop_left, crop_top, crop_right, crop_bottom):
    with Image.open(input_path) as img:
        width, height = img.size
        left = crop_left
        top = crop_top
        right = width - crop_right
        bottom = height - crop_bottom

        if left >= right or top >= bottom:
            raise ValueError("I parametri di crop sono troppo grandi per l'immagine.")

        cropped_img = img.crop((left, top, right, bottom))
        cropped_img.save(output_path)
        print(f"✔️ Immagine salvata come: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Ritaglia i bordi di un'immagine e salva la copia modificata.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("input", help="Percorso dell'immagine originale")
    parser.add_argument("output", nargs="?", help="Percorso dell'immagine ritagliata (default: copia_con_crop.png)")
    parser.add_argument("--crop-left", type=int, default=0, help="Pixel da rimuovere a sinistra")
    parser.add_argument("--crop-top", type=int, default=0, help="Pixel da rimuovere sopra")
    parser.add_argument("--crop-right", type=int, default=0, help="Pixel da rimuovere a destra")
    parser.add_argument("--crop-bottom", type=int, default=0, help="Pixel da rimuovere sotto")

    args = parser.parse_args()

    output_path = args.output or f"{os.path.splitext(args.input)[0]}_copia_cropped.png"

    crop_image(args.input, output_path, args.crop_left, args.crop_top, args.crop_right, args.crop_bottom)