# 📖 API Reference

## **Core Interfaces & Types**

### **Player Interface**
```typescript
interface Player {
  x: number;              // X coordinate in pixels
  y: number;              // Y coordinate in pixels
  direction: Direction;   // Current facing direction
  animationState: AnimationState;  // Current animation
  currentFrame: number;   // Animation frame index
}

enum Direction {
  UP = 'up',
  DOWN = 'down', 
  LEFT = 'left',
  RIGHT = 'right'
}

enum AnimationState {
  IDLE = 'idle',
  WALK = 'walk'
}
```

### **AI Model Interfaces**
```typescript
interface AIModel {
  name: string;                    // HuggingFace model identifier
  description: string;             // User-friendly description
  size: string;                   // Download size (e.g., "1.8GB")
  type: 'qa' | 'chat';           // Model capability type
  minMemoryGB: number;           // Required device memory
  recommendedWebGPU: boolean;    // WebGPU optimization flag
}

interface ModelPipeline {
  process(input: string): Promise<string>;
  dispose(): void;
  getModelInfo(): AIModel;
}

interface ConsentResult {
  approved: boolean;              // User approval status
  remember: boolean;             // Persistent consent flag
  networkInfo?: NetworkInfo;     // Connection details
}

interface NetworkInfo {
  speed: number;                 // Speed in Mbps
  type: string;                  // Connection type
  quality: 'fast' | 'moderate' | 'slow';
  estimatedTime: number;         // Download time estimate
}
```

### **Room Management**
```typescript
interface Room {
  id: string;                    // Unique room identifier
  name: string;                  // Display name
  backgroundSprite: string;      // Background image path
  interactables: Interactable[]; // Interactive elements
  spawnPosition: { x: number; y: number }; // Player spawn point
}

interface Interactable {
  id: string;                    // Unique identifier
  x: number;                     // X position
  y: number;                     // Y position
  width: number;                 // Interaction area width
  height: number;                // Interaction area height
  action: string;                // Action type
  sprite?: string;               // Optional sprite
}
```

## **Canvas Module (`canvas.ts`)**

### **Initialization**
```typescript
function initCanvas(): CanvasRenderingContext2D
```
- **Purpose**: Initialize canvas element and return 2D context
- **Returns**: Canvas 2D rendering context
- **Side Effects**: Sets up canvas size and styling
- **Usage**: Called once during application startup

### **Rendering Functions**
```typescript
function clearCanvas(ctx: CanvasRenderingContext2D): void
```
- **Purpose**: Clear canvas with GameBoy green background
- **Parameters**: Canvas rendering context
- **Usage**: Called at start of each frame

```typescript
function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLImageElement,
  x: number,
  y: number,
  frame?: number,
  direction?: Direction
): void
```
- **Purpose**: Draw sprite at specified position with optional frame
- **Parameters**:
  - `ctx`: Canvas rendering context
  - `sprite`: Loaded sprite image
  - `x`, `y`: Position coordinates
  - `frame`: Animation frame (optional, default 0)
  - `direction`: Sprite direction for flipping (optional)

```typescript
function getCanvasSize(): { width: number; height: number }
```
- **Purpose**: Get current canvas dimensions
- **Returns**: Object with width and height properties
- **Usage**: For responsive calculations and positioning

## **Player Management (`playerManager.ts`)**

### **Player Control**
```typescript
function updatePlayerPosition(
  deltaTime: number,
  inputState: InputState
): void
```
- **Purpose**: Update player position based on input and time
- **Parameters**:
  - `deltaTime`: Time since last frame (for smooth movement)
  - `inputState`: Current input state
- **Side Effects**: Modifies global player state

```typescript
function animatePlayer(deltaTime: number): void
```
- **Purpose**: Update player animation state and frames
- **Parameters**: Time delta for consistent animation speed
- **Usage**: Called every frame to advance animations

```typescript
function getPlayerPosition(): { x: number; y: number }
```
- **Purpose**: Get current player coordinates
- **Returns**: Player position object
- **Usage**: For collision detection and UI positioning

```typescript
function setPlayerDirection(direction: Direction): void
```
- **Purpose**: Change player facing direction
- **Parameters**: New direction value
- **Side Effects**: Updates animation state if needed

## **Room Management (`roomManager.ts`)**

### **Navigation**
```typescript
function switchToRoom(roomId: string): Promise<void>
```
- **Purpose**: Navigate to different room with transition
- **Parameters**: Target room identifier
- **Returns**: Promise that resolves when transition completes
- **Usage**: Called when player moves to new area

```typescript
function getCurrentRoom(): Room
```
- **Purpose**: Get current room information
- **Returns**: Current room object
- **Usage**: For room-specific logic and rendering

```typescript
function checkRoomInteractions(
  playerX: number, 
  playerY: number
): Interactable | null
```
- **Purpose**: Check if player is near interactive elements
- **Parameters**: Player coordinates
- **Returns**: Interactable object or null
- **Usage**: For triggering conversations and actions

### **Room State**
```typescript
function updateRoomState(deltaTime: number): void
```
- **Purpose**: Update room-specific animations and state
- **Parameters**: Time delta for animations
- **Usage**: Called every frame for active room

```typescript
function getRoomById(roomId: string): Room | null
```
- **Purpose**: Get room configuration by ID
- **Parameters**: Room identifier
- **Returns**: Room object or null if not found
- **Usage**: For room data lookup

## **AI Processing (`aiProcessor.ts`)**

### **Model Management**
```typescript
async function loadModel(
  modelKey: string,
  progressCallback?: (progress: number) => void
): Promise<ModelPipeline>
```
- **Purpose**: Load AI model with optional progress tracking
- **Parameters**:
  - `modelKey`: Model identifier ('distilbert', 'qwen', 'phi3')
  - `progressCallback`: Optional progress reporting function
- **Returns**: Promise resolving to loaded model pipeline
- **Throws**: Error if model fails to load

```typescript
async function processQuestion(
  question: string,
  modelKey: string = 'auto'
): Promise<string>
```
- **Purpose**: Process user question with specified or auto-selected model
- **Parameters**:
  - `question`: User input question
  - `modelKey`: Specific model or 'auto' for automatic selection
- **Returns**: Promise resolving to AI response
- **Usage**: Main interface for AI conversations

### **Device Detection**
```typescript
function getBestModelForDevice(): string
```
- **Purpose**: Determine optimal model based on device capabilities
- **Returns**: Recommended model key
- **Algorithm**: Considers memory, WebGPU support, device type

```typescript
function getDeviceMemoryGB(): number
```
- **Purpose**: Estimate device memory in gigabytes
- **Returns**: Memory estimate (fallback to 4GB if unknown)
- **Method**: Uses Navigator API when available

```typescript
function hasWebGPUSupport(): boolean
```
- **Purpose**: Check if browser supports WebGPU acceleration
- **Returns**: Boolean indicating WebGPU availability
- **Usage**: For model optimization decisions

```typescript
function isMobileDevice(): boolean
```
- **Purpose**: Detect if running on mobile device
- **Returns**: Boolean indicating mobile device
- **Method**: User agent and touch support detection

```typescript
function isIOSDevice(): boolean
```
- **Purpose**: Specific iOS device detection
- **Returns**: Boolean indicating iOS device
- **Usage**: For iOS-specific fallback handling

## **User Consent (`modelConsent.ts`)**

### **Consent Management**
```typescript
async function requestModelConsent(
  modelKey: string,
  modelInfo: AIModel
): Promise<ConsentResult>
```
- **Purpose**: Request user consent for large model download
- **Parameters**:
  - `modelKey`: Model identifier
  - `modelInfo`: Model configuration and requirements
- **Returns**: Promise resolving to consent decision
- **Side Effects**: May show modal dialog to user

```typescript
function hasUserConsentFor(modelKey: string): boolean
```
- **Purpose**: Check if user has given permanent consent
- **Parameters**: Model identifier
- **Returns**: Boolean indicating consent status
- **Storage**: Reads from localStorage

```typescript
function hasUserApprovedDownload(modelKey: string): boolean
```
- **Purpose**: Check if user approved download (session or permanent)
- **Parameters**: Model identifier
- **Returns**: Boolean indicating approval status
- **Usage**: For determining when to show consent dialog

### **Progress Tracking**
```typescript
function showDownloadProgress(
  modelKey: string,
  modelName: string,
  onBackgroundClick?: () => void
): void
```
- **Purpose**: Display download progress modal with real-time updates
- **Parameters**:
  - `modelKey`: Model identifier for progress tracking
  - `modelName`: User-friendly model name
  - `onBackgroundClick`: Optional callback for background mode
- **Side Effects**: Creates and shows progress modal

```typescript
function updateProgressBar(
  progressElement: HTMLElement,
  progress: number,
  speed?: number,
  timeRemaining?: number
): void
```
- **Purpose**: Update progress bar with download statistics
- **Parameters**:
  - `progressElement`: Progress bar DOM element
  - `progress`: Completion percentage (0-100)
  - `speed`: Optional download speed in MB/s
  - `timeRemaining`: Optional time remaining in seconds

## **Network Detection (`networkDetection.ts`)**

### **Speed Testing**
```typescript
async function detectNetworkSpeed(): Promise<NetworkInfo>
```
- **Purpose**: Measure actual network speed and analyze connection
- **Returns**: Promise resolving to network information
- **Method**: Downloads test files from HuggingFace CDN
- **Timeout**: 10 second maximum per test

```typescript
function getDownloadEstimate(
  fileSizeGB: number,
  speedMbps: number
): number
```
- **Purpose**: Calculate download time estimate
- **Parameters**:
  - `fileSizeGB`: File size in gigabytes
  - `speedMbps`: Connection speed in Mbps
- **Returns**: Estimated download time in seconds
- **Usage**: For user-friendly time estimates

```typescript
function getConnectionQuality(speedMbps: number): 'fast' | 'moderate' | 'slow'
```
- **Purpose**: Categorize connection speed for user feedback
- **Parameters**: Speed in megabits per second
- **Returns**: Quality category
- **Thresholds**: >10 Mbps = fast, 2-10 = moderate, <2 = slow

## **Conversation Interface (`gameboyConversation.ts`)**

### **UI Management**
```typescript
function initConversationUI(): void
```
- **Purpose**: Initialize chat interface and event handlers
- **Side Effects**: Sets up DOM elements and event listeners
- **Usage**: Called when entering conversation mode

```typescript
function showConversationPanel(): void
```
- **Purpose**: Display conversation interface with model selector
- **Side Effects**: Shows modal overlay with chat interface
- **Usage**: Triggered by room interactions

```typescript
function hideConversationPanel(): void
```
- **Purpose**: Close conversation interface
- **Side Effects**: Removes modal overlay and cleans up
- **Usage**: When user exits conversation

### **Message Handling**
```typescript
async function processUserMessage(message: string): Promise<void>
```
- **Purpose**: Handle user input and generate AI response
- **Parameters**: User message text
- **Side Effects**: Updates conversation history and triggers AI processing
- **Usage**: Called when user submits message

```typescript
function addMessageToHistory(
  message: string,
  sender: 'user' | 'ai',
  modelName?: string
): void
```
- **Purpose**: Add message to conversation display
- **Parameters**:
  - `message`: Message content
  - `sender`: Message sender type
  - `modelName`: Optional AI model name for attribution

### **Model Selection**
```typescript
function updateModelSelector(): void
```
- **Purpose**: Update model dropdown with available options
- **Side Effects**: Modifies DOM selector options
- **Usage**: Called when model availability changes

```typescript
async function switchToModel(modelKey: string): Promise<void>
```
- **Purpose**: Switch to different AI model
- **Parameters**: Target model identifier
- **Returns**: Promise resolving when switch completes
- **Side Effects**: May trigger consent dialog or model loading

## **Input Management (`inputManager.ts`)**

### **Input State**
```typescript
interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  menu: boolean;
}
```

### **Event Handling**
```typescript
function initInputHandlers(): void
```
- **Purpose**: Set up keyboard and touch event listeners
- **Side Effects**: Attaches event listeners to document
- **Usage**: Called during application initialization

```typescript
function getInputState(): InputState
```
- **Purpose**: Get current input state
- **Returns**: Object with current key states
- **Usage**: For player movement and interaction detection

```typescript
function handleKeyDown(event: KeyboardEvent): void
```
- **Purpose**: Process keyboard key press events
- **Parameters**: Keyboard event object
- **Side Effects**: Updates input state

```typescript
function handleKeyUp(event: KeyboardEvent): void
```
- **Purpose**: Process keyboard key release events
- **Parameters**: Keyboard event object
- **Side Effects**: Updates input state

## **Desktop Controls (`desktopControls.ts`)**

### **Device Detection**
```typescript
function isDesktopDevice(): boolean
```
- **Purpose**: Determine if running on desktop device
- **Returns**: Boolean indicating desktop device
- **Method**: Screen size and touch capability analysis

### **UI Enhancements**
```typescript
function initDesktopControls(): void
```
- **Purpose**: Initialize desktop-specific UI enhancements
- **Side Effects**: May hide touch controls, show keyboard hints
- **Usage**: Called during application initialization

```typescript
function toggleTouchControls(visible: boolean): void
```
- **Purpose**: Show or hide touch-based UI elements
- **Parameters**: Visibility flag
- **Usage**: For responsive design adjustments

## **Error Handling Patterns**

### **Standard Error Response**
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
```

### **Common Error Types**
- **ModelLoadError**: AI model failed to load
- **NetworkError**: Network connection issues
- **ConsentRequired**: User consent needed for operation
- **UnsupportedBrowser**: Browser lacks required features
- **InsufficientMemory**: Device memory too low

This API reference provides comprehensive documentation for all public interfaces and functions in the Interactive CV Platform.