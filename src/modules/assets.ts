// modules/assets.ts

import grassImg from "../../assets/Grass_Middle.png";
import pathImg from "../../assets/Path_Middle.png";
import oakTreeImg from "../../assets/Oak_Tree.png";
import playerImg from "../../assets/Player.png";

const assets: { [key: string]: HTMLImageElement } = {};
let loaded: number = 0;
const totalAssets: number = 5;
let callbackWhenDone: (() => void) | null = null;

export function loadAssets(callback: () => void): void {
  callbackWhenDone = callback;

  loadImage("grass", grassImg);
  loadImage("path", pathImg);
  loadImage("oak_tree", oakTreeImg);
  loadImage("player_sprite_sheet", playerImg);
  loadImage("temp_boss", oakTreeImg); // Placeholder
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
