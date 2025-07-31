import grassImg from "../../assets/Grass_Middle.png";
import pathImg from "../../assets/Path_Middle.png";
import oakTreeImg from "../../assets/Oak_Tree.png";
import playerImg from "../../assets/Player.png";

const assets: { [key: string]: HTMLImageElement } = {};
let loaded: number = 0;
const totalAssets: number = 6; // Aumentato per includere door
let callbackWhenDone: (() => void) | null = null;

export function loadAssets(callback: () => void): void {
  callbackWhenDone = callback;

  loadImage("grass", grassImg);
  loadImage("path", pathImg);
  loadImage("oak_tree", oakTreeImg);
  loadImage("player_sprite_sheet", playerImg);
  loadImage("temp_boss", oakTreeImg); // Placeholder

  // Crea una tile porta nera proceduralmente
  createDoorTile();
}

function loadImage(key: string, src: string): void {
  const img = new Image();
  img.onload = () => {
    assets[key] = img;
    loaded++;
    if (loaded === totalAssets && callbackWhenDone) callbackWhenDone();
  };
  img.onerror = () => {
    console.error(`Failed to load image: ${src}`);
    loaded++;
    if (loaded === totalAssets && callbackWhenDone) callbackWhenDone();
  };
  img.src = src;
}

function createDoorTile(): void {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Sfondo nero
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 64, 64);

    // Bordo grigio per definire meglio la porta
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 62, 62);

    // Piccolo simbolo porta (rettangolo più chiaro al centro)
    ctx.fillStyle = "#555555";
    ctx.fillRect(20, 15, 24, 34);

    // Maniglia porta
    ctx.fillStyle = "#888888";
    ctx.fillRect(38, 28, 3, 8);
  }

  // Converti canvas in immagine
  const img = new Image();
  img.onload = () => {
    assets["door"] = img;
    loaded++;
    if (loaded === totalAssets && callbackWhenDone) callbackWhenDone();
  };
  img.src = canvas.toDataURL();
}

export function getAssets(): { [key: string]: HTMLImageElement } {
  return assets;
}

// Aggiungi getAssets come proprietà di loadAssets per compatibilità
(loadAssets as any).getAssets = getAssets;
