// modules/directionalSignals.ts - Visual navigation indicators for the Central Hub

export interface DirectionalSignal {
  x: number;           // Tile position X
  y: number;           // Tile position Y  
  direction: 'north' | 'west' | 'east' | 'south';
  targetRoom: string;  // Room ID this signal points to
  roomName: string;    // Display name
  description: string; // Tooltip description
  icon: string;        // Emoji or symbol
  arrowSprite?: string; // Optional arrow sprite
}

// Define directional signals for Central Hub
export const centralHubSignals: DirectionalSignal[] = [
  {
    x: 5,
    y: 1,  // Just below the north door
    direction: 'north',
    targetRoom: 'room2',
    roomName: 'Boss Room',
    description: 'Meet the person behind this experience!',
    icon: '👤',
  },
  {
    x: 1,
    y: 4,  // Just right of the west door
    direction: 'west', 
    targetRoom: 'room3',
    roomName: 'Work Experience',
    description: 'Explore professional journey and key accomplishments',
    icon: '💼',
  },
  {
    x: 9,
    y: 4,  // Just left of the east door
    direction: 'east',
    targetRoom: 'room4', 
    roomName: 'My Hobbies',
    description: 'Discover passions: Reading, Football, and Traveling!',
    icon: '🎯',
  }
];

export interface SignalState {
  signal: DirectionalSignal;
  animationPhase: number;  // 0-1 for animation cycles
  isVisible: boolean;
  pulseIntensity: number;  // 0-1 for pulsing effect
  hoverStartTime?: number; // When hover/proximity started
}

class DirectionalSignalManager {
  private signals: Map<string, SignalState> = new Map();
  private animationTime: number = 0;
  private playerProximityDistance: number = 2; // tiles
  
  constructor() {
    this.initializeSignals();
  }
  
  private initializeSignals(): void {
    centralHubSignals.forEach(signal => {
      const key = `${signal.x}_${signal.y}`;
      this.signals.set(key, {
        signal,
        animationPhase: Math.random(), // Random start phase for variety
        isVisible: true,
        pulseIntensity: 0,
      });
    });
  }
  
  update(deltaTime: number, playerX: number, playerY: number, currentRoomId: string): void {
    // Only update signals in Central Hub
    if (currentRoomId !== 'room1') return;
    
    this.animationTime += deltaTime;
    
    this.signals.forEach((state, key) => {
      // Update animation phase
      state.animationPhase = (this.animationTime * 0.002 + Math.random() * 0.1) % 1;
      
      // Calculate proximity to player
      const dx = Math.abs(state.signal.x - playerX);
      const dy = Math.abs(state.signal.y - playerY);
      const distance = Math.max(dx, dy); // Use Manhattan distance for tile-based
      
      // Update proximity effects
      if (distance <= this.playerProximityDistance) {
        if (!state.hoverStartTime) {
          state.hoverStartTime = this.animationTime;
        }
        
        // Increase pulse intensity when player is near
        const proximityFactor = Math.max(0, (this.playerProximityDistance - distance) / this.playerProximityDistance);
        state.pulseIntensity = Math.min(1, proximityFactor * 1.5);
      } else {
        state.hoverStartTime = undefined;
        state.pulseIntensity = Math.max(0, state.pulseIntensity - deltaTime * 0.003); // Fade out
      }
    });
  }
  
  // Get the signal closest to the player (for status bar display)
  getNearestSignal(playerX: number, playerY: number, currentRoomId: string): DirectionalSignal | null {
    if (currentRoomId !== 'room1') return null;
    
    let nearestSignal: DirectionalSignal | null = null;
    let minDistance = this.playerProximityDistance + 1;
    
    this.signals.forEach((state) => {
      const dx = Math.abs(state.signal.x - playerX);
      const dy = Math.abs(state.signal.y - playerY);
      const distance = Math.max(dx, dy);
      
      if (distance <= this.playerProximityDistance && distance < minDistance) {
        minDistance = distance;
        nearestSignal = state.signal;
      }
    });
    
    return nearestSignal;
  }
  
  render(
    ctx: CanvasRenderingContext2D, 
    tileSize: number,
    currentRoomId: string
  ): void {
    // Only render signals in Central Hub
    if (currentRoomId !== 'room1') return;
    
    ctx.save();
    
    this.signals.forEach((state) => {
      if (!state.isVisible) return;
      
      const { signal } = state;
      const screenX = signal.x * tileSize;
      const screenY = signal.y * tileSize;
      const centerX = screenX + tileSize / 2;
      const centerY = screenY + tileSize / 2;
      
      // Render background glow effect
      this.renderSignalGlow(ctx, centerX, centerY, state);
      
      // Render directional arrow
      this.renderDirectionalArrow(ctx, centerX, centerY, signal.direction, state);
      
      // Render room icon
      this.renderRoomIcon(ctx, centerX, centerY - 8, signal.icon, state);
      
      // Render proximity tooltip
      if (state.pulseIntensity > 0.3) {
        this.renderTooltip(ctx, centerX, centerY - 32, signal, state);
      }
    });
    
    ctx.restore();
  }
  
  private renderSignalGlow(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    state: SignalState
  ): void {
    const baseRadius = 16;
    const pulseRadius = baseRadius + (Math.sin(state.animationPhase * Math.PI * 2) * 4);
    const glowRadius = pulseRadius + (state.pulseIntensity * 8);
    
    // Create radial gradient for glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
    gradient.addColorStop(0, `rgba(139, 172, 15, ${0.3 + state.pulseIntensity * 0.4})`); // GameBoy green
    gradient.addColorStop(0.5, `rgba(139, 172, 15, ${0.1 + state.pulseIntensity * 0.2})`);
    gradient.addColorStop(1, 'rgba(139, 172, 15, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  private renderDirectionalArrow(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    direction: string,
    state: SignalState
  ): void {
    const arrowSize = 12 + (state.pulseIntensity * 4);
    const animationOffset = Math.sin(state.animationPhase * Math.PI * 2) * 3;
    
    ctx.fillStyle = '#0f380f'; // GameBoy dark green
    ctx.strokeStyle = '#8bac0f'; // GameBoy light green
    ctx.lineWidth = 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Rotate based on direction
    switch (direction) {
      case 'north':
        ctx.rotate(0);
        break;
      case 'east':
        ctx.rotate(Math.PI / 2);
        break;
      case 'south':
        ctx.rotate(Math.PI);
        break;
      case 'west':
        ctx.rotate(-Math.PI / 2);
        break;
    }
    
    // Apply animation offset
    ctx.translate(0, animationOffset);
    
    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(0, -arrowSize);           // Top point
    ctx.lineTo(-arrowSize * 0.6, arrowSize * 0.3);  // Bottom left
    ctx.lineTo(0, 0);                    // Center notch
    ctx.lineTo(arrowSize * 0.6, arrowSize * 0.3);   // Bottom right
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
  
  private renderRoomIcon(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    icon: string,
    state: SignalState
  ): void {
    const iconSize = 16 + (state.pulseIntensity * 4);
    const bounce = Math.sin(state.animationPhase * Math.PI * 4) * 2;
    
    ctx.save();
    ctx.font = `${iconSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add shadow for better visibility
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(icon, centerX + 1, centerY + bounce + 1);
    
    // Main icon
    ctx.fillStyle = '#0f380f'; // GameBoy dark green
    ctx.fillText(icon, centerX, centerY + bounce);
    
    ctx.restore();
  }
  
  private renderTooltip(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    signal: DirectionalSignal,
    state: SignalState
  ): void {
    const opacity = Math.min(1, state.pulseIntensity * 2);
    
    // Tooltip background
    const text = signal.roomName;
    const padding = 8;
    const textWidth = ctx.measureText(text).width;
    const tooltipWidth = textWidth + (padding * 2);
    const tooltipHeight = 24;
    
    const tooltipX = centerX - tooltipWidth / 2;
    const tooltipY = centerY - tooltipHeight - 4;
    
    // Background with GameBoy styling
    ctx.fillStyle = `rgba(155, 188, 15, ${opacity * 0.9})`; // GameBoy lightest green
    ctx.strokeStyle = `rgba(15, 56, 15, ${opacity})`;      // GameBoy dark green
    ctx.lineWidth = 2;
    
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Tooltip text
    ctx.fillStyle = `rgba(15, 56, 15, ${opacity})`;        // GameBoy dark green
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, tooltipY + tooltipHeight / 2);
  }
  
  getSignalAt(x: number, y: number): DirectionalSignal | null {
    const key = `${x}_${y}`;
    const state = this.signals.get(key);
    return state ? state.signal : null;
  }
  
  // Get all signals for the current room
  getSignalsForRoom(roomId: string): DirectionalSignal[] {
    if (roomId !== 'room1') return [];
    return Array.from(this.signals.values()).map(state => state.signal);
  }
}

// Export singleton instance
export const directionalSignalManager = new DirectionalSignalManager();