// modules/tileInteraction.ts - Manages tile interactions and displays

import { getTileStory, isInteractiveTile, getInteractiveTilesForRoom } from './tileStories';
import { showTileModal, isTileModalOpen } from './modalSystem';
import { getCurrentRoom } from './roomManager';
import { updateStatusBar } from './roomManager';

class TileInteractionManager {
  private hoveredTile: { x: number, y: number, tileId: number } | null = null;
  private clickCooldown = false;
  private readonly CLICK_COOLDOWN_MS = 500;

  /**
   * Handle click on a specific tile position
   */
  public handleTileClick(x: number, y: number): boolean {
    if (this.clickCooldown || isTileModalOpen()) {
      return false;
    }

    const currentRoom = getCurrentRoom();
    const tileId = currentRoom.map[y][x];

    // Check if this tile has an interactive story
    if (isInteractiveTile(tileId, currentRoom.id)) {
      this.showTileInformation(tileId, currentRoom.id);
      this.setClickCooldown();
      return true;
    }

    return false;
  }

  /**
   * Handle mouse hover over a tile position
   */
  public handleTileHover(x: number, y: number): void {
    const currentRoom = getCurrentRoom();
    const tileId = currentRoom.map[y][x];

    // Update hovered tile
    const newHoveredTile = { x, y, tileId };
    
    // Only update if this is a different tile
    if (!this.hoveredTile || 
        this.hoveredTile.x !== newHoveredTile.x || 
        this.hoveredTile.y !== newHoveredTile.y) {
      
      this.hoveredTile = newHoveredTile;
      this.updateHoverStatus(tileId, currentRoom.id);
    }
  }

  /**
   * Clear hover state when mouse leaves game area
   */
  public clearHover(): void {
    this.hoveredTile = null;
    // Don't clear status bar immediately - let other systems use it
  }

  /**
   * Check if a tile position has an interactive element
   */
  public isPositionInteractive(x: number, y: number): boolean {
    const currentRoom = getCurrentRoom();
    const tileId = currentRoom.map[y][x];
    return isInteractiveTile(tileId, currentRoom.id);
  }

  /**
   * Get all interactive tile positions for current room
   */
  public getInteractivePositions(): Array<{ x: number, y: number, tileId: number }> {
    const currentRoom = getCurrentRoom();
    const interactiveTiles = getInteractiveTilesForRoom(currentRoom.id);
    const positions: Array<{ x: number, y: number, tileId: number }> = [];

    for (let y = 0; y < currentRoom.map.length; y++) {
      for (let x = 0; x < currentRoom.map[0].length; x++) {
        const tileId = currentRoom.map[y][x];
        if (interactiveTiles.includes(tileId)) {
          positions.push({ x, y, tileId });
        }
      }
    }

    return positions;
  }

  private showTileInformation(tileId: number, roomId: string): void {
    const story = getTileStory(tileId, roomId);
    if (story) {
      showTileModal(story.modalContent);
    }
  }

  private updateHoverStatus(tileId: number, roomId: string): void {
    if (isInteractiveTile(tileId, roomId)) {
      const story = getTileStory(tileId, roomId);
      if (story) {
        const hint = this.getInteractionHint(story.modalContent.category || '');
        updateStatusBar(`${story.modalContent.icon || '💡'} ${story.modalContent.title} - ${hint}`, 100);
      }
    }
  }

  private getInteractionHint(category: string): string {
    if (category.includes('Deloitte')) {
      return 'Click to learn about my consulting experience';
    } else if (category.includes('Leonardo')) {
      return 'Click to explore my current R&D work';
    } else if (category.includes('Travel')) {
      return 'Click to hear about this destination';
    } else if (category.includes('Sports')) {
      return 'Click to learn about my football career';
    } else if (category.includes('Literature') || category.includes('Reading')) {
      return 'Click to discover my reading journey';
    } else {
      return 'Click to learn more';
    }
  }

  private setClickCooldown(): void {
    this.clickCooldown = true;
    setTimeout(() => {
      this.clickCooldown = false;
    }, this.CLICK_COOLDOWN_MS);
  }

  /**
   * Get current hovered tile information
   */
  public getHoveredTile(): { x: number, y: number, tileId: number } | null {
    return this.hoveredTile;
  }

  /**
   * Check if system is ready for interactions
   */
  public isInteractionAvailable(): boolean {
    return !this.clickCooldown && !isTileModalOpen();
  }
}

// Create and export singleton instance
export const tileInteractionManager = new TileInteractionManager();

// Convenience functions
export function handleTileClick(x: number, y: number): boolean {
  return tileInteractionManager.handleTileClick(x, y);
}

export function handleTileHover(x: number, y: number): void {
  tileInteractionManager.handleTileHover(x, y);
}

export function clearTileHover(): void {
  tileInteractionManager.clearHover();
}

export function isPositionInteractive(x: number, y: number): boolean {
  return tileInteractionManager.isPositionInteractive(x, y);
}

export function getInteractivePositions(): Array<{ x: number, y: number, tileId: number }> {
  return tileInteractionManager.getInteractivePositions();
}

export function isInteractionReady(): boolean {
  return tileInteractionManager.isInteractionAvailable();
}