import { player } from "./player";

let fps: number = 0;
let lastFpsUpdate: number = 0;
let frames: number = 0;

export function updateDebugPanel(currentTime: number): void {
  frames++;
  if (currentTime - lastFpsUpdate > 1000) {
    fps = frames;
    frames = 0;
    lastFpsUpdate = currentTime;
  }

  const panel = document.getElementById("debug-panel");
  if (panel) {
    // const currentRoom = getCurrentimport { player } from "./player";
    // import { getCurrentRoom } from "./roomManager";
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
