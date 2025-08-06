// modules/bossInteraction.ts - Boss proximity detection and interaction system

import { player } from "./player";
import { getCurrentRoom, updateStatusBar } from "./roomManager";
import { gameBoyConversation } from "./gameboyConversation";

let isNearBoss = false;
let interactionPromptElement: HTMLDivElement | null = null;
let bossPromptTimeoutId: number | null = null;

// Boss character position in room2 (boss room)
const BOSS_POSITION = { x: 5, y: 1 };
const INTERACTION_DISTANCE = 1; // Adjacent tiles
const BOSS_PROMPT_TIMEOUT = 2000; // Auto-hide boss prompt after 2 seconds

export function initializeBossInteraction(): void {
  createInteractionPrompt();
  console.log("Boss interaction system initialized");
}

function createInteractionPrompt(): void {
  interactionPromptElement = document.createElement("div");
  interactionPromptElement.id = "boss-interaction-prompt";
  interactionPromptElement.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    font-size: 18px;
    font-weight: bold;
    display: none;
    z-index: 1500;
    border: 3px solid #FFD700;
    text-align: center;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.7);
    animation: pulse 2s infinite;
  `;
  
  // Add pulsing animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0% { border-color: #FFD700; }
      50% { border-color: #FFA500; }
      100% { border-color: #FFD700; }
    }
  `;
  document.head.appendChild(style);
  
  interactionPromptElement.innerHTML = `
    <div>💬 Press SPACE to talk to Nicolo</div>
    <div style="font-size: 14px; margin-top: 5px; opacity: 0.8;">Ask questions about my CV and experience!</div>
  `;
  
  document.body.appendChild(interactionPromptElement);
}

export function checkBossProximity(): boolean {
  const currentRoom = getCurrentRoom();
  
  // Only check in boss room (room2)
  if (currentRoom.id !== "room2") {
    if (isNearBoss) {
      hideInteractionPrompt();
    }
    return false;
  }
  
  // Calculate distance to boss
  const distance = Math.abs(player.x - BOSS_POSITION.x) + Math.abs(player.y - BOSS_POSITION.y);
  const nearBoss = distance <= INTERACTION_DISTANCE;
  
  if (nearBoss && !isNearBoss) {
    // Just entered boss proximity
    showInteractionPrompt();
    isNearBoss = true;
    console.log("Player is near boss - showing interaction prompt");
  } else if (!nearBoss && isNearBoss) {
    // Just left boss proximity
    hideInteractionPrompt();
    isNearBoss = false;
    console.log("Player left boss proximity - hiding prompt");
  }
  
  return nearBoss;
}

function showInteractionPrompt(): void {
  // Show message in status bar instead of popup
  updateStatusBar("💬 Press SPACE to talk to Nicolo - Ask about my CV!", 4000);
}

function hideInteractionPrompt(): void {
  // Clear status bar if it's showing boss interaction message
  const statusText = document.getElementById("status-text");
  if (statusText && statusText.textContent?.includes("talk to Nicolo")) {
    statusText.textContent = "";
  }
}

export function isBossInteractionAvailable(): boolean {
  return isNearBoss;
}

export function getBossPosition(): { x: number; y: number } {
  return BOSS_POSITION;
}

// Export for cleanup if needed
export function cleanupBossInteraction(): void {
  if (interactionPromptElement) {
    document.body.removeChild(interactionPromptElement);
    interactionPromptElement = null;
  }
  isNearBoss = false;
}