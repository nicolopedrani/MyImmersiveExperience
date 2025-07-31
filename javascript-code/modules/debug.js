import { player } from "./player.js";

let fps = 0;
let lastFpsUpdate = 0;
let frames = 0;

export function updateDebugPanel(currentTime) {
  frames++;
  if (currentTime - lastFpsUpdate > 1000) {
    fps = frames;
    frames = 0;
    lastFpsUpdate = currentTime;
  }

  const panel = document.getElementById("debug-panel");
  if (panel) {
    panel.innerHTML = `
      x: ${player.x}<br>
      y: ${player.y}<br>
      dir: ${player.direction}<br>
      state: ${player.animationState}<br>
      frame: ${player.frameIndex}<br>
      FPS: ${fps}
    `;
  }
}
