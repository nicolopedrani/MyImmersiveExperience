import type { Direction, RoomProp, TerrainPatch } from "./types";

const INK = "#102438";
const PAPER = "#fff8e7";
const GOLD = "#f2c14e";
const CORAL = "#e07a5f";
const TEAL = "#2a6f6b";

function rect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
): void {
  context.fillStyle = fill;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function outline(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  border = INK,
): void {
  rect(context, x, y, width, height, border);
  rect(context, x + 3, y + 3, width - 6, height - 6, fill);
}

export function drawTerrainPatch(
  context: CanvasRenderingContext2D,
  patch: TerrainPatch,
  tileSize: number,
): void {
  const x = patch.x * tileSize;
  const y = patch.y * tileSize;
  const width = patch.width * tileSize;
  const height = patch.height * tileSize;

  if (patch.kind === "rug") {
    rect(context, x + 4, y + 4, width - 8, height - 8, "#8f3f45");
    rect(context, x + 9, y + 9, width - 18, height - 18, "#d88b5d");
    for (let offset = 14; offset < width - 14; offset += 18) rect(context, x + offset, y + height / 2 - 2, 6, 6, GOLD);
  }
  if (patch.kind === "lab-bay") {
    rect(context, x + 3, y + 3, width - 6, height - 6, "#dce8e5");
    rect(context, x + 3, y + 3, width - 6, 6, TEAL);
    for (let offset = 12; offset < width - 8; offset += 16) rect(context, x + offset, y + height - 10, 8, 3, "#9dbab4");
  }
  if (patch.kind === "wood") {
    rect(context, x, y, width, height, "#c49a73");
    for (let row = 0; row < patch.height; row += 1) {
      rect(context, x, y + row * tileSize, width, 2, "#9b6f55");
      for (let column = row % 2; column < patch.width; column += 2) {
        rect(context, x + column * tileSize + 8, y + row * tileSize + 14, 10, 2, "#ad7e5f");
      }
    }
  }
  if (patch.kind === "path") {
    rect(context, x, y, width, height, "#d8c7a5");
    for (let row = 0; row < patch.height; row += 1) {
      for (let column = 0; column < patch.width; column += 1) {
        if ((row + column) % 2 === 0) rect(context, x + column * tileSize + 3, y + row * tileSize + 4, 8, 5, "#eadbbd");
      }
    }
  }
  if (patch.kind === "pitch") {
    rect(context, x + 3, y + 3, width - 6, height - 6, "#4d9b4a");
    context.strokeStyle = "rgba(255, 248, 231, 0.9)";
    context.lineWidth = 2;
    context.strokeRect(x + 8, y + 8, width - 16, height - 16);
    context.beginPath();
    context.moveTo(x + width / 2, y + 8);
    context.lineTo(x + width / 2, y + height - 8);
    context.stroke();
    context.beginPath();
    context.arc(x + width / 2, y + height / 2, 12, 0, Math.PI * 2);
    context.stroke();
  }
  if (patch.kind === "garden") {
    rect(context, x + 4, y + 4, width - 8, height - 8, "#82a861");
    for (let row = 14; row < height - 8; row += 22) {
      for (let column = 13; column < width - 8; column += 25) {
        rect(context, x + column, y + row, 3, 7, "#356447");
        rect(context, x + column - 2, y + row - 2, 7, 4, (row + column) % 2 === 0 ? GOLD : CORAL);
      }
    }
  }
  if (patch.kind === "reading-nook") {
    rect(context, x + 3, y + 3, width - 6, height - 6, "#dec69a");
    for (let offset = 10; offset < width - 6; offset += 16) rect(context, x + offset, y + 8, 7, 4, "#bd9e6f");
  }
}

function drawPlant(context: CanvasRenderingContext2D, x: number, y: number, height: number, variant = 0): void {
  rect(context, x + 7, y + height - 14, 18, 11, "#9b5c43");
  rect(context, x + 10, y + height - 17, 12, 4, "#c87a56");
  rect(context, x + 15, y + 14, 3, height - 30, "#356447");
  const leaf = variant % 2 === 0 ? "#4f8f55" : "#2f7b64";
  rect(context, x + 5, y + 10, 12, 9, leaf);
  rect(context, x + 16, y + 4, 11, 10, leaf);
  rect(context, x + 12, y + 21, 13, 8, "#6aa85f");
}

function drawMonitor(context: CanvasRenderingContext2D, x: number, y: number, width: number, color: string): void {
  outline(context, x, y, width, 27, INK);
  rect(context, x + 5, y + 5, width - 10, 17, color);
  rect(context, x + width / 2 - 2, y + 27, 4, 7, INK);
  rect(context, x + width / 2 - 9, y + 33, 18, 3, INK);
}

function drawDesk(context: CanvasRenderingContext2D, x: number, y: number, width: number): void {
  rect(context, x, y, width, 11, "#754e42");
  rect(context, x + 4, y + 10, 5, 18, "#4d3540");
  rect(context, x + width - 9, y + 10, 5, 18, "#4d3540");
}

function drawTree(context: CanvasRenderingContext2D, x: number, y: number, variant = 0): void {
  const leafDark = variant % 2 === 0 ? "#2d6746" : "#376b3e";
  const leaf = variant % 2 === 0 ? "#4f8f55" : "#5d9952";
  rect(context, x + 27, y + 30, 10, 30, "#704a32");
  rect(context, x + 16, y + 18, 35, 26, leafDark);
  rect(context, x + 6, y + 25, 26, 23, leaf);
  rect(context, x + 31, y + 9, 27, 27, leaf);
  rect(context, x + 20, y + 5, 24, 23, "#74aa58");
  rect(context, x + 20, y + 58, 25, 4, "#30533d");
}

export function drawRoomProp(context: CanvasRenderingContext2D, prop: RoomProp, tileSize: number): void {
  const x = prop.x * tileSize;
  const y = prop.y * tileSize;
  const width = prop.width * tileSize;
  const height = prop.height * tileSize;
  rect(context, x + 4, y + height - 6, width - 8, 5, "rgba(16, 36, 56, 0.18)");

  if (prop.kind === "plant") drawPlant(context, x, y, height, prop.variant);
  if (prop.kind === "lamp") {
    rect(context, x + 14, y + 12, 4, height - 18, INK);
    rect(context, x + 8, y + 8, 16, 8, GOLD);
    rect(context, x + 6, y + height - 7, 20, 4, INK);
  }
  if (prop.kind === "profile-desk") {
    drawDesk(context, x + 4, y + 18, width - 8);
    outline(context, x + width / 2 - 16, y - 5, 32, 24, PAPER);
    context.fillStyle = TEAL;
    context.font = "bold 10px ui-monospace, monospace";
    context.textAlign = "center";
    context.fillText("NP", x + width / 2, y + 11);
    rect(context, x + 10, y + 12, 19, 5, GOLD);
    rect(context, x + width - 28, y + 12, 16, 5, CORAL);
  }
  if (prop.kind === "project-terminal" || prop.kind === "chat-console") {
    drawDesk(context, x + 5, y + 41, width - 10);
    drawMonitor(context, x + 18, y + 7, width - 36, prop.kind === "chat-console" ? "#725d8f" : "#2a6f97");
    context.fillStyle = PAPER;
    context.font = "bold 9px ui-monospace, monospace";
    context.textAlign = "center";
    context.fillText(prop.kind === "chat-console" ? "QWEN" : ">_", x + width / 2, y + 24);
    rect(context, x + 28, y + 52, width - 56, 4, prop.kind === "chat-console" ? GOLD : "#81b29a");
  }
  if (prop.kind === "sensor-console") {
    drawDesk(context, x + 4, y + 43, width - 8);
    drawMonitor(context, x + 42, y + 8, 45, "#462f4d");
    rect(context, x + 13, y + 19, 18, 18, INK);
    rect(context, x + 17, y + 23, 10, 10, CORAL);
    context.strokeStyle = GOLD;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x + 22, y + 28, 17, -0.8, 0.8);
    context.stroke();
    rect(context, x + 50, y + 17, 25, 2, "#f4a261");
    rect(context, x + 50, y + 23, 18, 2, "#e76f51");
  }
  if (prop.kind === "clinical-console") {
    drawDesk(context, x + 4, y + 43, width - 8);
    drawMonitor(context, x + 14, y + 8, width - 28, "#e8f1ed");
    rect(context, x + 25, y + 17, 4, 12, CORAL);
    rect(context, x + 21, y + 21, 12, 4, CORAL);
    for (let offset = 42; offset < width - 18; offset += 10) rect(context, x + offset, y + 17, 7, 2, TEAL);
    for (let offset = 42; offset < width - 24; offset += 10) rect(context, x + offset, y + 24, 7, 2, "#81b29a");
  }
  if (prop.kind === "analytics-board") {
    outline(context, x + 8, y + 5, width - 16, 40, PAPER);
    const bars = [13, 23, 17, 30];
    bars.forEach((bar, index) => rect(context, x + 18 + index * 14, y + 39 - bar, 8, bar, index % 2 ? GOLD : TEAL));
    drawDesk(context, x + 5, y + 47, width - 10);
  }
  if (prop.kind === "server-rack") {
    outline(context, x + 5, y + 2, width - 10, height - 6, "#2c4657");
    for (let row = 10; row < height - 8; row += 12) {
      rect(context, x + 9, y + row, width - 18, 7, INK);
      rect(context, x + width - 15, y + row + 2, 3, 3, row % 3 ? GOLD : "#81b29a");
    }
  }
  if (prop.kind === "whiteboard") {
    outline(context, x + 4, y + 1, width - 8, height - 5, PAPER);
    rect(context, x + 16, y + 9, 24, 3, TEAL);
    rect(context, x + 47, y + 9, 31, 3, CORAL);
    rect(context, x + 86, y + 9, 20, 3, GOLD);
    rect(context, x + 22, y + 17, width - 44, 2, "#8296a1");
  }
  if (prop.kind === "bookshelf") {
    outline(context, x + 2, y + 2, width - 4, height - 6, "#6e3f43");
    for (let shelf = 17; shelf < height - 8; shelf += 20) {
      rect(context, x + 7, y + shelf, width - 14, 4, "#3f2b35");
      for (let book = 10; book < width - 10; book += 10) {
        rect(context, x + book, y + shelf - 11, 6, 11, [GOLD, CORAL, "#77a6a2"][book % 3]!);
      }
    }
  }
  if (prop.kind === "simulation-bench") {
    drawDesk(context, x + 4, y + 44, width - 8);
    drawMonitor(context, x + 18, y + 6, width - 36, "#253d5b");
    const nodes: Array<readonly [number, number]> = [[34, 20], [48, 13], [61, 24], [48, 31]];
    context.strokeStyle = "#81b29a";
    context.lineWidth = 2;
    context.beginPath();
    nodes.forEach(([nx, ny], index) => {
      const next = nodes[(index + 1) % nodes.length]!;
      context.moveTo(x + nx!, y + ny!);
      context.lineTo(x + next[0], y + next[1]);
    });
    context.stroke();
    nodes.forEach(([nx, ny], index) => rect(context, x + nx! - 3, y + ny! - 3, 6, 6, index % 2 ? GOLD : CORAL));
  }
  if (prop.kind === "circuit-board") {
    outline(context, x + 5, y + 5, width - 10, height - 10, "#295b4d");
    context.strokeStyle = GOLD;
    context.lineWidth = 2;
    const nodes: Array<readonly [number, number]> = [[17, 18], [45, 11], [70, 25], [26, 43], [59, 47]];
    context.beginPath();
    nodes.forEach(([nx, ny], index) => {
      const next = nodes[(index + 2) % nodes.length]!;
      context.moveTo(x + nx!, y + ny!);
      context.lineTo(x + next[0], y + next[1]);
    });
    context.stroke();
    nodes.forEach(([nx, ny]) => rect(context, x + nx! - 4, y + ny! - 4, 8, 8, CORAL));
  }
  if (prop.kind === "dna-table") {
    drawDesk(context, x + 4, y + 47, width - 8);
    outline(context, x + 13, y + 4, width - 26, 41, "#233f58");
    for (let row = 8; row < 35; row += 6) {
      const offset = row % 12 === 0 ? 10 : 17;
      rect(context, x + 22 + offset, y + row, 29, 2, row % 12 === 0 ? GOLD : CORAL);
      rect(context, x + 20 + offset, y + row - 2, 4, 6, "#81b29a");
      rect(context, x + 49 + offset, y + row - 2, 4, 6, "#81b29a");
    }
  }
  if (prop.kind === "tree") drawTree(context, x, y, prop.variant);
  if (prop.kind === "football-goal") {
    rect(context, x + 7, y + 12, width - 14, 4, PAPER);
    rect(context, x + 7, y + 12, 4, height - 20, PAPER);
    rect(context, x + width - 11, y + 12, 4, height - 20, PAPER);
    for (let offset = 18; offset < width - 14; offset += 13) rect(context, x + offset, y + 17, 2, height - 28, "rgba(255,248,231,.7)");
    for (let offset = 22; offset < height - 10; offset += 10) rect(context, x + 9, y + offset, width - 18, 2, "rgba(255,248,231,.55)");
    rect(context, x + width / 2 - 5, y + height - 15, 10, 10, PAPER);
    rect(context, x + width / 2 - 2, y + height - 12, 4, 4, INK);
  }
  if (prop.kind === "community-table") {
    rect(context, x + 7, y + 22, width - 14, 20, "#a86f4b");
    rect(context, x + 16, y + 42, 6, 18, "#6f4938");
    rect(context, x + width - 22, y + 42, 6, 18, "#6f4938");
    rect(context, x + width / 2 - 6, y + 10, 12, 11, CORAL);
    rect(context, x + width / 2 - 9, y + 13, 18, 5, CORAL);
    rect(context, x + 15, y + 14, 15, 7, "#72a35a");
    rect(context, x + width - 30, y + 14, 15, 7, GOLD);
  }
  if (prop.kind === "travel-board") {
    outline(context, x + 5, y + 3, width - 10, height - 9, "#d9c49b");
    rect(context, x + 12, y + 11, width - 24, 3, TEAL);
    rect(context, x + 14, y + 19, 13, 18, "#7aa8a3");
    rect(context, x + 31, y + 19, width - 45, 4, CORAL);
    rect(context, x + 31, y + 27, width - 49, 4, GOLD);
    context.strokeStyle = INK;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(x + width - 18, y + height - 17, 8, 0, Math.PI * 2);
    context.stroke();
    rect(context, x + width - 19, y + height - 23, 2, 12, INK);
    rect(context, x + width - 24, y + height - 18, 12, 2, INK);
  }
  if (prop.kind === "bench") {
    rect(context, x + 4, y + 8, width - 8, 7, "#8b5a3c");
    rect(context, x + 4, y + 18, width - 8, 6, "#a66d45");
    rect(context, x + 10, y + 24, 5, 6, INK);
    rect(context, x + width - 15, y + 24, 5, 6, INK);
  }
}

export function drawAvatar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: Direction,
  bob: number,
): void {
  const left = x + 7;
  const top = y + 2 + bob;
  rect(context, left + 2, top + 26, 18, 4, "rgba(16, 36, 56, 0.25)");
  rect(context, left + 4, top, 14, 6, "#382f35");
  rect(context, left + 3, top + 4, 16, 9, "#c98965");
  rect(context, left + 5, top + 5, 12, 8, "#e5aa82");
  rect(context, left + 3, top + 13, 16, 11, TEAL);
  rect(context, left + 8, top + 15, 6, 5, GOLD);
  rect(context, left + 4, top + 24, 6, 5, INK);
  rect(context, left + 13, top + 24, 6, 5, INK);
  if (direction === "down") {
    rect(context, left + 6, top + 8, 3, 2, INK);
    rect(context, left + 14, top + 8, 3, 2, INK);
    rect(context, left + 9, top + 7, 5, 1, "#557184");
  }
  if (direction === "left") rect(context, left + 4, top + 8, 3, 2, INK);
  if (direction === "right") rect(context, left + 16, top + 8, 3, 2, INK);
  if (direction === "up") {
    rect(context, left + 5, top + 2, 12, 4, "#382f35");
    rect(context, left + 5, top + 14, 12, 8, "#244c5a");
  }
}
