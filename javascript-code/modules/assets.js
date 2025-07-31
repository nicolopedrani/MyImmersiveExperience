// modules/assets.js

const assets = {};
let loaded = 0;
const totalAssets = 5;
let callbackWhenDone = null;

export function loadAssets(callback) {
  callbackWhenDone = callback;

  loadImage("grass", "assets/Grass_Middle.png");
  loadImage("path", "assets/Path_Middle.png");
  loadImage("oak_tree", "assets/Oak_Tree.png");
  loadImage("player_sprite_sheet", "assets/Player.png");
  loadImage("temp_boss", "assets/Oak_Tree.png"); // Placeholder
}

function loadImage(name, src) {
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

loadAssets.getAssets = () => assets;
