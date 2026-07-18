import "./styles.css";

import { getPortfolioEntry } from "./content/portfolio";
import type { ProfileEntry } from "./content/types";
import { PortfolioChat, getResumeUrl } from "./ui/chat";
import { WorldRenderer } from "./game/renderer";
import { rooms } from "./game/rooms";
import type { Direction, Hotspot, Point, RoomId, WorldState } from "./game/types";
import {
  createInitialWorldState,
  findRoomForEntry,
  getFacingHotspot,
  getHotspotAt,
  getRoom,
  isWalkable,
  moveWorld,
} from "./game/world";

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element as T;
}

const entryHashes: Record<string, string> = {
  about: "#about",
  "work-leonardo": "#work/leonardo",
  "work-eoc": "#work/eoc",
  "work-deloitte": "#work/deloitte",
  education: "#research/education",
  "research-phd": "#research/phd",
  "publication-neuromorphic": "#research/neuromorphic-paper",
  "publication-oxdna": "#research/oxdna-paper",
  "personal-football": "#beyond/football",
  "personal-volunteering": "#beyond/volunteering",
  "personal-curiosity": "#beyond/curiosity",
  "project-immersive": "#project/immersive",
};

const hashEntries = new Map(Object.entries(entryHashes).map(([id, hash]) => [hash, id]));

const defaultPositions: Record<RoomId, WorldState["player"]> = {
  hub: { x: 10, y: 9, direction: "up" },
  work: { x: 17, y: 6, direction: "left" },
  research: { x: 2, y: 6, direction: "right" },
  beyond: { x: 10, y: 10, direction: "up" },
};

const detailEyebrow = requiredElement<HTMLParagraphElement>("detail-eyebrow");
const detailTitle = requiredElement<HTMLHeadingElement>("detail-title");
const detailSummary = requiredElement<HTMLParagraphElement>("detail-summary");
const detailBody = requiredElement<HTMLDivElement>("detail-body");
const statusText = requiredElement<HTMLSpanElement>("status-text");
const canvas = requiredElement<HTMLCanvasElement>("portfolio-world");
const renderer = new WorldRenderer(canvas);
let worldState = createInitialWorldState();
let highlightedHotspotId: string | undefined;
let activeHotspotId: string | undefined;

function setStatus(message: string): void {
  statusText.textContent = message;
}

function updateRoomChrome(): void {
  const room = getRoom(worldState);
  requiredElement<HTMLHeadingElement>("room-title").textContent = room.title;
  requiredElement<HTMLParagraphElement>("room-subtitle").textContent = room.subtitle;
  document.querySelectorAll<HTMLButtonElement>("[data-room]").forEach((button) => {
    if (button.dataset.room === room.id) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  renderRoomStations();
}

function renderRoomStations(): void {
  const container = requiredElement<HTMLDivElement>("room-station-buttons");
  const room = getRoom(worldState);
  container.replaceChildren();
  room.hotspots.forEach((hotspot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.hotspot = hotspot.id;
    button.textContent = hotspot.label;
    if (hotspot.id === activeHotspotId) button.setAttribute("aria-current", "true");
    button.addEventListener("click", () => {
      stopTour();
      positionNearHotspot(room.id, hotspot);
      activateHotspot(hotspot);
    });
    container.append(button);
  });
}

function makeList(className: string, values: readonly string[]): HTMLUListElement {
  const list = document.createElement("ul");
  list.className = className;
  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    list.append(item);
  });
  return list;
}

function renderEntry(entry: ProfileEntry): void {
  detailEyebrow.textContent = entry.eyebrow;
  detailTitle.textContent = entry.title;
  detailSummary.textContent = entry.summary;
  detailBody.replaceChildren();

  if (entry.organization || entry.period) {
    const meta = document.createElement("p");
    meta.className = "detail-meta";
    meta.textContent = [entry.organization, entry.period].filter(Boolean).join(" · ");
    detailBody.append(meta);
  }

  detailBody.append(makeList("detail-list", entry.details));

  if (entry.skills.length > 0) detailBody.append(makeList("tag-list", entry.skills));

  if (entry.links.length > 0) {
    const links = document.createElement("div");
    links.className = "detail-links";
    entry.links.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.textContent = link.label;
      if (link.kind === "download") anchor.setAttribute("download", "");
      if (link.kind === "external") {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
      links.append(anchor);
    });
    detailBody.append(links);
  }

  const evidenceBlock = document.createElement("section");
  evidenceBlock.className = "evidence-block";
  const evidenceTitle = document.createElement("h3");
  evidenceTitle.textContent = "Verified sources";
  const evidenceList = document.createElement("ul");
  evidenceList.className = "evidence-list";
  entry.evidence.forEach((evidence) => {
    const item = document.createElement("li");
    if (evidence.publicUrl) {
      const anchor = document.createElement("a");
      anchor.href = evidence.publicUrl;
      anchor.textContent = evidence.label;
      if (!evidence.publicUrl.startsWith(import.meta.env.BASE_URL)) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
      item.append(anchor);
    } else {
      item.textContent = evidence.label;
    }
    const verification = document.createElement("span");
    verification.textContent = ` · checked ${evidence.verifiedAt}`;
    item.append(verification);
    evidenceList.append(item);
  });
  evidenceBlock.append(evidenceTitle, evidenceList);
  detailBody.append(evidenceBlock);
}

function directionToward(from: Point, to: Point): Direction {
  if (to.x < from.x) return "left";
  if (to.x > from.x) return "right";
  if (to.y < from.y) return "up";
  return "down";
}

function positionNearHotspot(roomId: RoomId, hotspot: Hotspot): void {
  const room = rooms[roomId];
  const candidates: Point[] = [
    { x: hotspot.x, y: hotspot.y + 1 },
    { x: hotspot.x, y: hotspot.y - 1 },
    { x: hotspot.x - 1, y: hotspot.y },
    { x: hotspot.x + 1, y: hotspot.y },
  ];
  const position = candidates.find((candidate) => isWalkable(room, candidate)) ?? defaultPositions[roomId];
  worldState = {
    roomId,
    player: { ...position, direction: directionToward(position, hotspot) },
  };
  highlightedHotspotId = hotspot.id;
  activeHotspotId = hotspot.id;
  updateRoomChrome();
}

function setHash(hash: string): void {
  if (window.location.hash === hash) return;
  history.pushState(null, "", hash);
}

function openEntry(entryId: string, updateHash = true): void {
  const entry = getPortfolioEntry(entryId);
  if (!entry) return;
  const location = findRoomForEntry(entry.id);
  if (location) positionNearHotspot(location.roomId, location.hotspot);
  renderEntry(entry);
  if (updateHash) setHash(entryHashes[entry.id] ?? `#${entry.id}`);
  setStatus(`${entry.title} opened in the detail panel.`);
}

const chat = new PortfolioChat((entryId) => openEntry(entryId));

function activateHotspot(hotspot: Hotspot): void {
  highlightedHotspotId = hotspot.id;
  activeHotspotId = hotspot.id;
  renderRoomStations();
  if (hotspot.action.type === "chat") {
    setHash("#chat");
    chat.open();
    setStatus("Portfolio guide opened. Local Qwen is available with consent; curated fallback works immediately.");
  } else {
    openEntry(hotspot.action.entryId);
  }
}

function move(direction: Direction): void {
  if (tourRunning) {
    setStatus("The guided route controls movement. Choose Next stop or End tour.");
    return;
  }
  const result = moveWorld(worldState, direction);
  worldState = result.state;
  highlightedHotspotId = getFacingHotspot(worldState)?.id;
  if (result.changedRoom) {
    updateRoomChrome();
    const room = getRoom(worldState);
    setHash(`#room/${room.id}`);
    setStatus(`${room.title}. ${room.subtitle}`);
  } else if (result.blocked) {
    const hotspot = getFacingHotspot(worldState);
    setStatus(hotspot ? `${hotspot.label}: press Space or Enter to open.` : "That tile is not walkable.");
  } else {
    const hotspot = getFacingHotspot(worldState);
    setStatus(hotspot ? `${hotspot.label}: press Space or Enter to open.` : "Explore the labelled stations or choose another room above.");
  }
}

function interact(): void {
  const hotspot = getFacingHotspot(worldState);
  if (hotspot) activateHotspot(hotspot);
  else setStatus("Face a labelled station, then press Space or Enter.");
}

const tourSteps = [
  { type: "entry", entryId: "about", label: "Profile" },
  { type: "entry", entryId: "work-leonardo", label: "Leonardo" },
  { type: "entry", entryId: "work-eoc", label: "EOC · IOSI" },
  { type: "entry", entryId: "work-deloitte", label: "Deloitte" },
  { type: "entry", entryId: "research-phd", label: "PhD research" },
  { type: "entry", entryId: "publication-neuromorphic", label: "Neuromorphic paper" },
  { type: "entry", entryId: "publication-oxdna", label: "oxDNA paper" },
  { type: "entry", entryId: "personal-football", label: "Beyond engineering" },
  { type: "chat", label: "Portfolio guide" },
] as const;

let tourRunning = false;
let tourIndex = -1;

function startTour(): void {
  tourRunning = true;
  tourIndex = -1;
  requiredElement<HTMLDivElement>("tour-controls").hidden = false;
  nextTourStep();
}

function nextTourStep(): void {
  if (!tourRunning) return;
  const nextIndex = tourIndex + 1;
  if (nextIndex >= tourSteps.length) {
    stopTour("Guided route complete. Continue exploring freely or ask another question.");
    return;
  }
  tourIndex = nextIndex;
  const step = tourSteps[tourIndex];
  if (!step) return;
  requiredElement<HTMLElement>("tour-progress").textContent = `Stop ${tourIndex + 1} of ${tourSteps.length}`;
  requiredElement<HTMLElement>("tour-label").textContent = step.label;
  if (step.type === "entry") openEntry(step.entryId);
  else {
    setHash("#chat");
    chat.open();
  }
  setStatus(`Guided route: ${step.label}. Choose Next stop when ready.`);
}

function stopTour(message = "Guided route ended. You can now explore freely."): void {
  tourRunning = false;
  tourIndex = -1;
  requiredElement<HTMLDivElement>("tour-controls").hidden = true;
  setStatus(message);
}

function goToRoom(roomId: RoomId, updateHash = true): void {
  worldState = { roomId, player: { ...defaultPositions[roomId] } };
  highlightedHotspotId = undefined;
  activeHotspotId = undefined;
  updateRoomChrome();
  if (updateHash) setHash(`#room/${roomId}`);
  setStatus(`${rooms[roomId].title}. ${rooms[roomId].subtitle}`);
}

function handleHash(): void {
  const hash = window.location.hash;
  if (hash === "#chat") {
    chat.open();
    return;
  }
  const entryId = hashEntries.get(hash);
  if (entryId) {
    openEntry(entryId, false);
    return;
  }
  const roomMatch = /^#room\/(hub|work|research|beyond)$/.exec(hash);
  const roomId = roomMatch?.[1] as RoomId | undefined;
  if (roomId) goToRoom(roomId, false);
}

document.querySelectorAll<HTMLButtonElement>("[data-room]").forEach((button) => {
  button.addEventListener("click", () => {
    stopTour();
    goToRoom(button.dataset.room as RoomId);
    canvas.focus();
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-open-chat]").forEach((button) => {
  button.addEventListener("click", () => {
    setHash("#chat");
    chat.open();
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-direction]").forEach((button) => {
  let delayTimer: number | undefined;
  let repeatTimer: number | undefined;
  const stopRepeating = (): void => {
    window.clearTimeout(delayTimer);
    window.clearInterval(repeatTimer);
    delayTimer = undefined;
    repeatTimer = undefined;
  };
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    const direction = button.dataset.direction as Direction;
    move(direction);
    delayTimer = window.setTimeout(() => {
      repeatTimer = window.setInterval(() => move(direction), 150);
    }, 340);
  });
  button.addEventListener("pointerup", stopRepeating);
  button.addEventListener("pointercancel", stopRepeating);
  button.addEventListener("click", (event) => {
    if (event.detail === 0) move(button.dataset.direction as Direction);
  });
});

requiredElement<HTMLButtonElement>("touch-interact").addEventListener("click", interact);
requiredElement<HTMLButtonElement>("start-tour").addEventListener("click", startTour);
requiredElement<HTMLButtonElement>("tour-next").addEventListener("click", nextTourStep);
requiredElement<HTMLButtonElement>("tour-stop").addEventListener("click", () => stopTour());
requiredElement<HTMLButtonElement>("start-exploring").addEventListener("click", () => {
  stopTour("Free exploration active. Use the map, room buttons or station navigator.");
  canvas.focus();
  canvas.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector<HTMLAnchorElement>('a[href="#chat"]')?.addEventListener("click", (event) => {
  event.preventDefault();
  setHash("#chat");
  chat.open();
});

document.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement | null;
  if (target?.matches("input, textarea, select") || requiredElement<HTMLDialogElement>("chat-dialog").open) return;
  const directions: Record<string, Direction | undefined> = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
  };
  const direction = directions[event.key];
  if (direction) {
    event.preventDefault();
    move(direction);
    return;
  }
  if (event.key === " " || event.key === "Enter") {
    if (target?.tagName === "BUTTON" || target?.tagName === "A") return;
    event.preventDefault();
    if (tourRunning) nextTourStep();
    else interact();
  }
  if (event.key === "Escape" && tourRunning) {
    event.preventDefault();
    stopTour();
  }
});

canvas.addEventListener("pointermove", (event) => {
  const tile = renderer.eventToTile(event);
  const hotspot = getHotspotAt(getRoom(worldState), tile);
  highlightedHotspotId = hotspot?.id;
  if (hotspot) setStatus(`${hotspot.label}: select it or walk next to it and press Space.`);
});
canvas.addEventListener("pointerleave", () => {
  highlightedHotspotId = getFacingHotspot(worldState)?.id;
});
canvas.addEventListener("pointerup", (event) => {
  const hotspot = getHotspotAt(getRoom(worldState), renderer.eventToTile(event));
  if (hotspot) activateHotspot(hotspot);
});

window.addEventListener("hashchange", handleHash);
window.addEventListener("resize", () => renderer.resize());

requiredElement<HTMLAnchorElement>("resume-link").href = getResumeUrl();
updateRoomChrome();
handleHash();
if (!window.location.hash) openEntry("about", false);

function animationFrame(time: number): void {
  renderer.render(worldState, time, highlightedHotspotId);
  window.requestAnimationFrame(animationFrame);
}
window.requestAnimationFrame(animationFrame);
