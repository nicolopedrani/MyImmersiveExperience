import type { RoomDefinition, RoomId } from "./types";

const WIDTH = 20;
const HEIGHT = 13;

export const rooms = {
  hub: {
    id: "hub",
    title: "The Atrium Studio",
    subtitle: "A personal starting point for the work, research and conversation.",
    width: WIDTH,
    height: HEIGHT,
    floor: "#d9cfb7",
    floorAccent: "#cbbf9f",
    wall: "#17324d",
    doors: [
      { x: 0, y: 6, targetRoom: "work", targetPosition: { x: 18, y: 6 }, label: "Work" },
      { x: 19, y: 6, targetRoom: "research", targetPosition: { x: 1, y: 6 }, label: "Research" },
      { x: 10, y: 0, targetRoom: "beyond", targetPosition: { x: 10, y: 11 }, label: "Beyond" },
    ],
    hotspots: [
      { x: 10, y: 4, id: "profile-desk", propId: "profile-desk", label: "Profile", action: { type: "entry", entryId: "about" } },
      { x: 6, y: 7, id: "project-screen", propId: "project-terminal", label: "This project", action: { type: "entry", entryId: "project-immersive" } },
      { x: 14, y: 7, id: "chat-terminal", propId: "chat-console", label: "Local conversation", action: { type: "chat" } },
    ],
    terrain: [
      { kind: "rug", x: 7, y: 6, width: 7, height: 4 },
      { kind: "path", x: 9, y: 1, width: 3, height: 5 },
    ],
    props: [
      { id: "plant-left", kind: "plant", x: 2, y: 2, width: 1, height: 2, blocking: true, variant: 0 },
      { id: "plant-right", kind: "plant", x: 17, y: 2, width: 1, height: 2, blocking: true, variant: 1 },
      { id: "profile-desk", kind: "profile-desk", x: 9, y: 4, width: 3, height: 1, blocking: true },
      { id: "project-terminal", kind: "project-terminal", x: 5, y: 7, width: 3, height: 2, blocking: true },
      { id: "chat-console", kind: "chat-console", x: 13, y: 7, width: 3, height: 2, blocking: true },
      { id: "studio-lamp", kind: "lamp", x: 3, y: 5, width: 1, height: 2, blocking: true },
      { id: "studio-bench", kind: "bench", x: 16, y: 9, width: 2, height: 1, blocking: true },
    ],
  },
  work: {
    id: "work",
    title: "Professional Systems Lab",
    subtitle: "Three distinct workstations for engineering, clinical data and consulting.",
    width: WIDTH,
    height: HEIGHT,
    floor: "#c9d8d4",
    floorAccent: "#b5c9c4",
    wall: "#244c5a",
    doors: [{ x: 19, y: 6, targetRoom: "hub", targetPosition: { x: 1, y: 6 }, label: "Atrium" }],
    hotspots: [
      { x: 4, y: 5, id: "leonardo-station", propId: "sensor-console", label: "Leonardo · sensors", action: { type: "entry", entryId: "work-leonardo" } },
      { x: 10, y: 5, id: "eoc-station", propId: "clinical-console", label: "EOC · clinical data", action: { type: "entry", entryId: "work-eoc" } },
      { x: 15, y: 5, id: "deloitte-station", propId: "analytics-board", label: "Deloitte · analytics", action: { type: "entry", entryId: "work-deloitte" } },
    ],
    terrain: [
      { kind: "lab-bay", x: 2, y: 3, width: 5, height: 4 },
      { kind: "lab-bay", x: 8, y: 3, width: 5, height: 4 },
      { kind: "lab-bay", x: 14, y: 3, width: 4, height: 4 },
      { kind: "path", x: 1, y: 6, width: 18, height: 2 },
    ],
    props: [
      { id: "sensor-console", kind: "sensor-console", x: 3, y: 4, width: 3, height: 2, blocking: true },
      { id: "clinical-console", kind: "clinical-console", x: 9, y: 4, width: 3, height: 2, blocking: true },
      { id: "analytics-board", kind: "analytics-board", x: 14, y: 4, width: 3, height: 2, blocking: true },
      { id: "work-server", kind: "server-rack", x: 2, y: 9, width: 1, height: 2, blocking: true },
      { id: "work-board", kind: "whiteboard", x: 8, y: 9, width: 4, height: 1, blocking: true },
      { id: "work-plant", kind: "plant", x: 17, y: 9, width: 1, height: 2, blocking: true, variant: 2 },
    ],
  },
  research: {
    id: "research",
    title: "Research Library Lab",
    subtitle: "Physics, atomistic simulation and two authored publications.",
    width: WIDTH,
    height: HEIGHT,
    floor: "#d8c7bc",
    floorAccent: "#c9b3a4",
    wall: "#533c52",
    doors: [{ x: 0, y: 6, targetRoom: "hub", targetPosition: { x: 18, y: 6 }, label: "Atrium" }],
    hotspots: [
      { x: 5, y: 4, id: "education-shelf", propId: "education-books", label: "Physics education", action: { type: "entry", entryId: "education" } },
      { x: 14, y: 4, id: "phd-lab", propId: "simulation-bench", label: "PhD research", action: { type: "entry", entryId: "research-phd" } },
      { x: 5, y: 8, id: "network-paper", propId: "circuit-board", label: "Neuromorphic model", action: { type: "entry", entryId: "publication-neuromorphic" } },
      { x: 14, y: 8, id: "oxdna-paper", propId: "dna-table", label: "oxDNA study", action: { type: "entry", entryId: "publication-oxdna" } },
    ],
    terrain: [
      { kind: "wood", x: 2, y: 2, width: 16, height: 9 },
      { kind: "path", x: 1, y: 6, width: 18, height: 2 },
    ],
    props: [
      { id: "education-books", kind: "bookshelf", x: 3, y: 3, width: 4, height: 2, blocking: true },
      { id: "simulation-bench", kind: "simulation-bench", x: 13, y: 3, width: 3, height: 2, blocking: true },
      { id: "circuit-board", kind: "circuit-board", x: 4, y: 8, width: 3, height: 2, blocking: true },
      { id: "dna-table", kind: "dna-table", x: 13, y: 8, width: 3, height: 2, blocking: true },
      { id: "research-lamp", kind: "lamp", x: 9, y: 3, width: 1, height: 2, blocking: true },
      { id: "research-plant", kind: "plant", x: 17, y: 2, width: 1, height: 2, blocking: true, variant: 1 },
    ],
  },
  beyond: {
    id: "beyond",
    title: "The Common Ground",
    subtitle: "A park for coaching, volunteering and curiosity outside engineering.",
    width: WIDTH,
    height: HEIGHT,
    floor: "#b9cf91",
    floorAccent: "#a9bf80",
    wall: "#294735",
    doors: [{ x: 10, y: 12, targetRoom: "hub", targetPosition: { x: 10, y: 1 }, label: "Atrium" }],
    hotspots: [
      { x: 4, y: 6, id: "football-board", propId: "football-goal", label: "Football coaching", action: { type: "entry", entryId: "personal-football" } },
      { x: 10, y: 6, id: "volunteer-board", propId: "community-table", label: "Volunteering", action: { type: "entry", entryId: "personal-volunteering" } },
      { x: 16, y: 6, id: "curiosity-board", propId: "travel-board", label: "Reading & travel", action: { type: "entry", entryId: "personal-curiosity" } },
    ],
    terrain: [
      { kind: "pitch", x: 2, y: 3, width: 5, height: 6 },
      { kind: "garden", x: 8, y: 4, width: 5, height: 5 },
      { kind: "reading-nook", x: 14, y: 3, width: 4, height: 6 },
      { kind: "path", x: 9, y: 1, width: 3, height: 11 },
    ],
    props: [
      { id: "football-goal", kind: "football-goal", x: 3, y: 5, width: 3, height: 2, blocking: true },
      { id: "community-table", kind: "community-table", x: 9, y: 5, width: 3, height: 2, blocking: true },
      { id: "travel-board", kind: "travel-board", x: 15, y: 5, width: 2, height: 2, blocking: true },
      { id: "park-tree-nw", kind: "tree", x: 1, y: 1, width: 2, height: 2, blocking: true, variant: 0 },
      { id: "park-tree-ne", kind: "tree", x: 17, y: 1, width: 2, height: 2, blocking: true, variant: 1 },
      { id: "park-tree-sw", kind: "tree", x: 1, y: 9, width: 2, height: 2, blocking: true, variant: 1 },
      { id: "park-tree-se", kind: "tree", x: 17, y: 9, width: 2, height: 2, blocking: true, variant: 0 },
      { id: "reading-bench", kind: "bench", x: 14, y: 9, width: 2, height: 1, blocking: true },
    ],
  },
} as const satisfies Record<RoomId, RoomDefinition>;

export const initialWorldState = {
  roomId: "hub",
  player: { x: 10, y: 9, direction: "up" },
} as const;
