// modules/assets.ts

const assets: { [key: string]: HTMLImageElement } = {};
let loaded: number = 0;
const totalAssets: number = 5;
let callbackWhenDone: (() => void) | null = null;

export function loadAssets(callback: () => void): void {
  callbackWhenDone = callback;

  loadImage("grass", "assets/Grass_Middle.png");
  loadImage("path", "assets/Path_Middle.png");
  loadImage("oak_tree", "assets/Oak_Tree.png");
  loadImage("player_sprite_sheet", "assets/Player.png");
  loadImage("temp_boss", "assets/Oak_Tree.png"); // Placeholder
}

function loadImage(name: string, src: string): void {
  const img = new Image();
  img.onload = () => {
    assets[name] = img;
    loaded++;
    if (loaded === totalAssets && callbackWhenDone) callbackWhenDone();
  };
  img.onerror = () => {
    console.error(`Error loading image: ${src}`);
  };
  img.src = src;
}

loadAssets.getAssets = (): { [key: string]: HTMLImageElement } => assets;
