// modules/guidedTour.ts - Guided tour system with automatic movement and interactions

import { player, playerAnimations, Direction } from './player';
import { changeRoom, getCurrentRoom, updateStatusBar, getDoorAtPosition } from './roomManager';
import { tileInteractionManager } from './tileInteraction';
import { WALKABLE_TILES } from './map';
import { getTileStory, isInteractiveTile } from './tileStories';
import { showTileModal, setTileModalCloseCallback } from './modalSystem';

export interface TourStep {
  id: string;
  roomId: string;
  targetX: number;
  targetY: number;
  tileId?: number;
  interaction: 'move' | 'interact' | 'room-transition' | 'final-message';
  narration: string;
  duration: number; // milliseconds
  autoAdvance?: boolean; // Auto-close modal after duration
}

class GuidedTourManager {
  private isActive = false;
  private currentStepIndex = 0;
  private steps: TourStep[] = [];
  private isMoving = false;
  private movementInterval: number | null = null;
  private autoAdvanceTimer: number | null = null;
  private tourStartTime = 0;

  // 3-minute tour route - Following the exact path provided by user
  private readonly TOUR_STEPS: TourStep[] = [
    // === CENTRAL HUB TO HOBBIES ROOM ===
    {
      id: 'move-to-hobbies-door',
      roomId: 'room1',
      targetX: 10, targetY: 4,
      interaction: 'move',
      narration: '🎮 Welcome! Let me show you my interactive portfolio. Let\'s start by exploring my hobbies...',
      duration: 3000
    },
    {
      id: 'enter-hobbies-room',
      roomId: 'room4',
      targetX: 1, targetY: 4,
      interaction: 'room-transition',
      narration: '🏠 Welcome to my hobbies room!',
      duration: 2000
    },
    {
      id: 'football-field-interaction',
      roomId: 'room4',
      targetX: 3, targetY: 4,
      tileId: 16, // Football field tile
      interaction: 'interact',
      narration: '⚽ The football field reminds me of my professional career at AC COMO and coaching experience.',
      duration: 8000,
      autoAdvance: false // Wait for user to click "Got it"
    },
    {
      id: 'move-to-world-map',
      roomId: 'room4',
      targetX: 5, targetY: 2,
      interaction: 'move',
      narration: '🚶 Moving to the world map...',
      duration: 2000
    },
    {
      id: 'world-map-interaction',
      roomId: 'room4',
      targetX: 5, targetY: 2,
      tileId: 28, // World map tile
      interaction: 'interact',
      narration: '🗺️ This world map represents my international travel experiences across multiple continents.',
      duration: 8000,
      autoAdvance: false // Wait for user to click "Got it"
    },
    {
      id: 'move-to-bookshelf',
      roomId: 'room4',
      targetX: 8, targetY: 2,
      interaction: 'move',
      narration: '🚶 Moving to the reading corner...',
      duration: 2000
    },
    {
      id: 'bookshelf-interaction',
      roomId: 'room4',
      targetX: 8, targetY: 2,
      tileId: 8, // Bookshelf tile
      interaction: 'interact',
      narration: '📚 Here\'s my reading corner - my love for books started with "The Lord of the Rings" at age 11.',
      duration: 8000,
      autoAdvance: false // Wait for user to click "Got it"
    },
    
    // === HOBBIES ROOM TO CENTRAL HUB ===
    {
      id: 'return-to-central-hub',
      roomId: 'room1',
      targetX: 9, targetY: 4,
      interaction: 'room-transition',
      narration: '🚶 Heading to the working experience room...',
      duration: 2000
    },
    
    // === CENTRAL HUB TO WORKING ROOM ===
    {
      id: 'enter-working-room',
      roomId: 'room3',
      targetX: 9, targetY: 4,
      interaction: 'room-transition',
      narration: '💼 Welcome to my professional experience room!',
      duration: 2000
    },
    {
      id: 'leonardo-interaction',
      roomId: 'room3',
      targetX: 9, targetY: 2,
      tileId: 48, // Leonardo tile
      interaction: 'interact',
      narration: '🛡️ My current role at Leonardo SpA - R&D engineering for infrared optical systems and defense tech.',
      duration: 9000,
      autoAdvance: false // Wait for user to click "Got it"
    },
    {
      id: 'move-to-deloitte',
      roomId: 'room3',
      targetX: 3, targetY: 4,
      interaction: 'move',
      narration: '🚶 Moving to the Deloitte consulting area...',
      duration: 2000
    },
    {
      id: 'deloitte-interaction',
      roomId: 'room3',
      targetX: 3, targetY: 4,
      tileId: 35, // Deloitte tile
      interaction: 'interact',
      narration: '🏢 This represents my data science consulting experience at Deloitte - NPS forecasting, ML projects.',
      duration: 9000,
      autoAdvance: false // Wait for user to click "Got it"
    },
    
    // === WORKING ROOM TO CENTRAL HUB TO BOSS ROOM ===
    {
      id: 'return-to-central-hub-2',
      roomId: 'room1',
      targetX: 1, targetY: 4,
      interaction: 'room-transition',
      narration: '🚶 Heading to the main conversation area...',
      duration: 2000
    },
    {
      id: 'enter-boss-room',
      roomId: 'room2',
      targetX: 5, targetY: 7,
      interaction: 'room-transition',
      narration: '👤 Welcome to the main conversation area!',
      duration: 3000
    },
    {
      id: 'tour-complete',
      roomId: 'room2',
      targetX: 5, targetY: 8,
      interaction: 'final-message',
      narration: '🎉 Tour complete! You can now talk directly with me using the AI chat system. Feel free to ask anything about my background, projects, or experiences.',
      duration: 10000
    }
  ];

  constructor() {
    this.steps = [...this.TOUR_STEPS];
  }

  public startTour(): void {
    if (this.isActive) return;
    
    console.log('🎯 Starting guided tour...');
    this.isActive = true;
    this.currentStepIndex = 0;
    this.tourStartTime = Date.now();
    
    // Ensure we start in the central hub (room1) at position (5,7)
    if (getCurrentRoom().id !== 'room1') {
      changeRoom('room1');
    }
    
    // Set player to the correct starting position
    player.x = 5;
    player.y = 7;
    console.log(`🎮 Player positioned at starting location: (${player.x}, ${player.y}) in ${getCurrentRoom().id}`);
    
    // Start first step
    this.executeCurrentStep();
  }

  public stopTour(): void {
    if (!this.isActive) return;
    
    console.log('🛑 Stopping guided tour...');
    this.isActive = false;
    this.stopMovement();
    this.clearAutoAdvanceTimer();
    
    // Clear modal callback
    setTileModalCloseCallback(null);
    
    const tourDuration = (Date.now() - this.tourStartTime) / 1000;
    console.log(`📊 Tour duration: ${tourDuration.toFixed(1)} seconds`);
    
    updateStatusBar('Tour ended. You can now explore freely!', 3000);
  }

  public isRunning(): boolean {
    return this.isActive;
  }

  public getCurrentStep(): TourStep | null {
    if (!this.isActive || this.currentStepIndex >= this.steps.length) {
      return null;
    }
    return this.steps[this.currentStepIndex];
  }

  private executeCurrentStep(): void {
    if (!this.isActive || this.currentStepIndex >= this.steps.length) {
      this.completeTour();
      return;
    }

    const step = this.steps[this.currentStepIndex];
    console.log(`🎯 Executing tour step: ${step.id}`);
    
    // Update progress
    const progress = `Step ${this.currentStepIndex + 1}/${this.steps.length}`;
    
    switch (step.interaction) {
      case 'move':
        updateStatusBar(`${progress} • ${step.narration}`, step.duration);
        this.moveToPosition(step.targetX, step.targetY, () => {
          // Movement complete, wait for duration then continue
          setTimeout(() => this.nextStep(), Math.max(step.duration - 2000, 1000));
        });
        break;
        
      case 'room-transition':
        // For guided tour, first move to door, then automatically enter room
        updateStatusBar(`${progress} • ${step.narration}`, step.duration);
        
        // First find the door position in current room that leads to target room
        const currentRoom = getCurrentRoom();
        const doorToTarget = currentRoom.doors.find(door => door.targetRoom === step.roomId);
        
        if (doorToTarget) {
          // Move to door first
          this.moveToPosition(doorToTarget.x, doorToTarget.y, () => {
            // Reached door, now automatically enter
            console.log(`🚪 Auto-entering door to ${step.roomId}`);
            changeRoom(step.roomId);
            
            // Set player position to target immediately (no default spawn)
            player.x = step.targetX;
            player.y = step.targetY;
            console.log(`🎯 Player positioned at (${player.x}, ${player.y}) in ${step.roomId}`);
            
            // Continue tour immediately
            setTimeout(() => this.nextStep(), Math.max(step.duration - 1000, 500));
          });
        } else {
          // No door found, just change room directly
          console.log(`🚪 Direct room change to ${step.roomId}`);
          changeRoom(step.roomId);
          
          // Set player position to target immediately
          player.x = step.targetX;
          player.y = step.targetY;
          console.log(`🎯 Player positioned at (${player.x}, ${player.y}) in ${step.roomId}`);
          
          setTimeout(() => this.nextStep(), Math.max(step.duration - 1000, 500));
        }
        break;
        
      case 'interact':
        updateStatusBar(`${progress} • ${step.narration}`, step.duration);
        this.moveToPosition(step.targetX, step.targetY, () => {
          // Movement complete, now interact with tile
          if (step.tileId && this.isActive) {
            setTimeout(() => {
              if (this.isActive) {
                console.log(`🎯 Auto-interacting with tile ${step.tileId} at (${step.targetX}, ${step.targetY})`);
                this.autoInteractWithTile(step.targetX, step.targetY);
                
                // For guided tour, don't auto-advance interactions
                // Wait for user to click "Got it" which will call onModalClosed()
                console.log(`⏳ Waiting for user to click "Got it" to continue tour`);
              }
            }, 800); // Small delay after reaching position
          }
        });
        break;
        
      case 'final-message':
        this.moveToPosition(step.targetX, step.targetY, () => {
          // Movement complete, show final message as modal
          console.log(`🎉 Showing final tour message`);
          
          // Set up callback for when final modal is closed
          setTileModalCloseCallback(() => {
            console.log(`👍 Final message acknowledged - completing tour`);
            this.completeTour();
          });
          
          // Show final message as a modal
          showTileModal({
            title: "Tour Complete!",
            content: step.narration,
            icon: "🎉",
            category: "Welcome Message"
          });
        });
        break;
    }
  }

  private moveToPosition(targetX: number, targetY: number, callback?: () => void): void {
    if (!this.isActive) return;
    
    console.log(`🚶 Starting movement from (${player.x}, ${player.y}) to (${targetX}, ${targetY})`);
    
    // Calculate complete step-by-step path
    const path = this.calculateTileByTilePath(player.x, player.y, targetX, targetY);
    
    if (path.length === 0) {
      console.log(`❌ No valid path found to (${targetX}, ${targetY}) - player already at target`);
      if (callback) callback();
      return;
    }
    
    console.log(`📍 Path calculated: ${path.map(p => `(${p.x},${p.y})`).join(' → ')}`);
    
    // Clear any existing movement interval
    this.stopMovement();
    
    // Set moving state AFTER clearing intervals
    this.isMoving = true;
    
    let currentStepIndex = 0;
    
    const executeNextStep = () => {
      console.log(`🔄 Executing step ${currentStepIndex + 1}, isActive: ${this.isActive}, isMoving: ${this.isMoving}`);
      
      if (!this.isActive) {
        console.log(`🛑 Tour stopped, aborting movement`);
        this.isMoving = false;
        return;
      }
      
      if (currentStepIndex >= path.length) {
        // Reached target - set to idle
        this.isMoving = false;
        player.animationState = "idle";
        const base = player.direction === "left" ? "right" : player.direction;
        player.currentAnimation = playerAnimations[`${base}_idle`];
        player.frameIndex = 0;
        player.animationTimer = 0;
        
        console.log(`✅ Movement complete! Player reached target (${targetX}, ${targetY})`);
        if (callback) callback();
        return;
      }
      
      // Get next position from path
      const nextPos = path[currentStepIndex];
      const previousX = player.x;
      const previousY = player.y;
      
      // Determine direction based on movement
      let newDirection: Direction = player.direction;
      if (nextPos.x > previousX) newDirection = "right";
      else if (nextPos.x < previousX) newDirection = "left";
      else if (nextPos.y > previousY) newDirection = "down";
      else if (nextPos.y < previousY) newDirection = "up";
      
      // Update player position and state directly
      player.x = nextPos.x;
      player.y = nextPos.y;
      player.direction = newDirection;
      player.animationState = "walk";
      
      // Update animation
      const base = player.direction === "left" ? "right" : player.direction;
      player.currentAnimation = playerAnimations[`${base}_walk`];
      player.frameIndex = 0;
      player.animationTimer = 0;
      
      console.log(`🚶 Step ${currentStepIndex + 1}/${path.length}: Player moved from (${previousX}, ${previousY}) to (${player.x}, ${player.y}) facing ${player.direction}`);
      
      currentStepIndex++;
      
      // Schedule next step with 0.5-second timing
      this.movementInterval = window.setTimeout(executeNextStep, 500);
    };
    
    // Start the movement sequence
    console.log(`🎬 Starting step-by-step movement with ${path.length} steps`);
    executeNextStep();
  }

  private calculateTileByTilePath(startX: number, startY: number, endX: number, endY: number): Array<{x: number, y: number}> {
    const currentRoom = getCurrentRoom();
    
    console.log(`🗺️ Using pre-defined path from (${startX}, ${startY}) to (${endX}, ${endY}) in room ${currentRoom.id}`);
    
    // Pre-defined efficient paths for each room to avoid pathfinding issues
    const predefinedPaths = this.getPredefinedPath(currentRoom.id, startX, startY, endX, endY);
    
    if (predefinedPaths.length > 0) {
      console.log(`✅ Found pre-defined path with ${predefinedPaths.length} steps`);
      return predefinedPaths;
    }
    
    // Fallback to simple direct path if no pre-defined path exists
    console.log(`📍 Using simple direct path as fallback`);
    return this.getSimpleDirectPath(startX, startY, endX, endY);
  }

  private getPredefinedPath(roomId: string, startX: number, startY: number, endX: number, endY: number): Array<{x: number, y: number}> {
    const key = `${roomId}_${startX}_${startY}_${endX}_${endY}`;
    
    // Pre-defined paths following the exact user-specified route
    const paths: Record<string, Array<{x: number, y: number}>> = {
      // Central Hub (room1) paths - (5,7) to (10,4)
      'room1_5_7_10_4': [
        {x: 5, y: 6}, {x: 5, y: 5}, {x: 5, y: 4}, 
        {x: 6, y: 4}, {x: 7, y: 4}, {x: 8, y: 4}, {x: 9, y: 4}, {x: 10, y: 4}
      ],
      
      // Hobbies room (room4) paths
      'room4_1_4_3_4': [{x: 2, y: 4}, {x: 3, y: 4}], // (1,4)->(2,4)->(3,4)
      'room4_3_4_5_2': [
        {x: 4, y: 4}, {x: 5, y: 4}, {x: 5, y: 3}, {x: 5, y: 2}
      ], // (3,4)->(4,4)->(5,4)->(5,3)->(5,2)
      'room4_5_2_8_2': [
        {x: 6, y: 2}, {x: 7, y: 2}, {x: 8, y: 2}
      ], // (5,2)->(6,2)->(7,2)->(8,2)
      'room4_8_2_0_4': [
        {x: 8, y: 3}, {x: 8, y: 4}, {x: 7, y: 4}, {x: 6, y: 4}, {x: 5, y: 4}, 
        {x: 4, y: 4}, {x: 3, y: 4}, {x: 2, y: 4}, {x: 1, y: 4}, {x: 0, y: 4}
      ], // (8,2)->(8,3)->(8,4)->(7,4)->(6,4)->(5,4)->(4,4)->(3,4)->(2,4)->(1,4)->(0,4)
      
      // Central hub to working room
      'room1_9_4_0_4': [
        {x: 8, y: 4}, {x: 7, y: 4}, {x: 6, y: 4}, {x: 5, y: 4}, 
        {x: 4, y: 4}, {x: 3, y: 4}, {x: 2, y: 4}, {x: 1, y: 4}, {x: 0, y: 4}
      ], // (9,4)->(8,4)->(7,4)->(6,4)->(5,4)->(4,4)->(3,4)->(2,4)->(1,4)->(0,4)
      
      // Working room (room3) paths
      'room3_9_4_9_2': [
        {x: 9, y: 3}, {x: 9, y: 2}
      ], // (9,4)->(9,3)->(9,2)
      'room3_9_2_3_4': [
        {x: 9, y: 3}, {x: 9, y: 4}, {x: 8, y: 4}, {x: 7, y: 4}, {x: 6, y: 4}, 
        {x: 5, y: 4}, {x: 4, y: 4}, {x: 3, y: 4}
      ], // (9,2)->(9,3)->(9,4)->(8,4)->(7,4)->(6,4)->(5,4)->(4,4)->(3,4)
      'room3_3_4_10_4': [
        {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4}, 
        {x: 8, y: 4}, {x: 9, y: 4}, {x: 10, y: 4}
      ], // (3,4)->(4,4)->(5,4)->(6,4)->(7,4)->(8,4)->(9,4)->(10,4)
      
      // Central hub to boss room
      'room1_1_4_5_0': [
        {x: 2, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}, 
        {x: 5, y: 3}, {x: 5, y: 2}, {x: 5, y: 1}, {x: 5, y: 0}
      ], // (1,4)->(2,4)->(3,4)->(4,4)->(5,4)->(5,3)->(5,2)->(5,1)->(5,0)
      
      // Boss room
      'room2_5_7_5_8': [{x: 5, y: 8}], // (5,7)->(5,8)
    };
    
    return paths[key] || [];
  }

  private getSimpleDirectPath(startX: number, startY: number, endX: number, endY: number): Array<{x: number, y: number}> {
    const path: Array<{x: number, y: number}> = [];
    
    // Simple direct path - move vertically first, then horizontally
    let currentX = startX;
    let currentY = startY;
    
    // Move vertically first
    while (currentY !== endY) {
      if (endY > currentY) currentY++;
      else currentY--;
      path.push({x: currentX, y: currentY});
    }
    
    // Then move horizontally
    while (currentX !== endX) {
      if (endX > currentX) currentX++;
      else currentX--;
      path.push({x: currentX, y: currentY});
    }
    
    console.log(`🎯 Simple direct path calculated with ${path.length} steps`);
    return path;
  }

  private stopMovement(): void {
    this.isMoving = false;
    if (this.movementInterval) {
      clearTimeout(this.movementInterval);
      this.movementInterval = null;
    }
  }

  private autoInteractWithTile(x: number, y: number): void {
    console.log(`🎯 Auto-interacting from position (${x}, ${y})`);
    
    const currentRoom = getCurrentRoom();
    
    // Check all adjacent tiles for interactive content (same as free exploration)
    const adjacentOffsets = [
      {x: -1, y: 0}, {x: 1, y: 0},   // Left, Right
      {x: 0, y: -1}, {x: 0, y: 1},   // Up, Down
      {x: 0, y: 0}                   // Current position
    ];
    
    let foundInteraction = false;
    
    for (const offset of adjacentOffsets) {
      const checkX = x + offset.x;
      const checkY = y + offset.y;
      
      // Check bounds
      if (checkX >= 0 && checkX < currentRoom.map[0].length && 
          checkY >= 0 && checkY < currentRoom.map.length) {
        
        const tileId = currentRoom.map[checkY][checkX];
        console.log(`🔍 Checking tile at (${checkX}, ${checkY}): tile ID ${tileId}`);
        
        // Check if this tile has an interactive story
        if (isInteractiveTile(tileId, currentRoom.id)) {
          console.log(`✅ Found interactive tile ${tileId} at (${checkX}, ${checkY})`);
          
          // Set up callback for when modal is closed during guided tour
          setTileModalCloseCallback(() => {
            console.log(`👍 Modal closed - continuing guided tour`);
            this.onModalClosed();
          });
          
          // Show the interaction modal
          this.forceShowTileModal(tileId, currentRoom.id);
          foundInteraction = true;
          break;
        }
      }
    }
    
    if (!foundInteraction) {
      console.log(`❌ No interactive tiles found adjacent to position (${x}, ${y})`);
      // Continue tour anyway
      setTimeout(() => this.onModalClosed(), 1000);
    }
  }

  private forceShowTileModal(tileId: number, roomId: string): void {
    // Direct approach to show modal
    const story = getTileStory(tileId, roomId);
    if (story) {
      console.log(`📖 Showing modal for tile ${tileId}: ${story.modalContent.title}`);
      showTileModal(story.modalContent);
    } else {
      console.log(`❌ No story found for tile ${tileId} in room ${roomId}`);
    }
  }

  private closeCurrentModal(): void {
    // Close any open tile modal
    const modal = document.getElementById('tile-modal-overlay');
    if (modal) {
      const closeButton = modal.querySelector('#modal-close-btn') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  private clearAutoAdvanceTimer(): void {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  private nextStep(): void {
    if (!this.isActive) return;
    
    this.clearAutoAdvanceTimer();
    this.currentStepIndex++;
    this.executeCurrentStep();
  }

  private completeTour(): void {
    console.log('🎉 Guided tour completed!');
    const tourDuration = (Date.now() - this.tourStartTime) / 1000;
    console.log(`📊 Total tour time: ${tourDuration.toFixed(1)} seconds`);
    
    this.stopTour();
    updateStatusBar('🎉 Welcome to my interactive portfolio! Feel free to explore or chat with me directly.', 5000);
  }

  // Allow manual tour control
  public skipToNext(): void {
    if (this.isActive) {
      this.closeCurrentModal();
      this.nextStep();
    }
  }

  // Called when user clicks "Got it" on interaction modals during guided tour
  public onModalClosed(): void {
    if (this.isActive) {
      console.log('👍 User clicked "Got it" - continuing guided tour');
      this.clearAutoAdvanceTimer();
      this.nextStep();
    }
  }

  public getProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentStepIndex + 1,
      total: this.steps.length,
      percentage: Math.round(((this.currentStepIndex + 1) / this.steps.length) * 100)
    };
  }
}

// Export singleton instance
export const guidedTourManager = new GuidedTourManager();