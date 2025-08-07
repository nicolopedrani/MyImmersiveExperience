# 📊 Progress Tracking System

## **Overview**

The Interactive CV Platform features a sophisticated progress tracking system that provides real-time feedback during AI model downloads. This system connects directly to the Transformers.js pipeline to show actual download progress, not simulated progress bars.

## **Real Progress Philosophy**

### **Core Principles**

1. **Authentic Data**: Shows actual download progress from Transformers.js callbacks
2. **Real-Time Updates**: Live statistics including speed, percentage, and time remaining
3. **User Transparency**: Clear, honest communication about download status
4. **Background Compatibility**: Allows users to continue using the app during downloads
5. **Performance Awareness**: Minimal overhead on system resources

### **Why Real Progress Matters**

The user specifically requested real progress tracking because:
- **Trust Building**: Users can see actual progress, not fake animations
- **Informed Decisions**: Accurate time estimates help users plan their workflow
- **Network Awareness**: Real download speeds help users understand their connection
- **Better UX**: Honest feedback prevents user frustration with unknown wait times

## **Technical Implementation**

### **Transformers.js Integration**

#### **Progress Callback Connection**
```typescript
import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js with progress callbacks
env.allowRemoteModels = true;
env.allowLocalModels = false;

interface ProgressInfo {
  status: 'download' | 'loading' | 'ready';
  name: string;
  file: string;
  progress: number;      // 0-100 percentage
  loaded: number;        // Bytes downloaded
  total: number;         // Total bytes
  speed?: number;        // Download speed in bytes/sec
  timeRemaining?: number; // Estimated seconds remaining
}

async function loadModelWithProgress(
  modelKey: string,
  progressCallback: (info: ProgressInfo) => void
): Promise<ModelPipeline> {
  const modelConfig = AI_MODELS[modelKey];
  
  // Set up progress tracking
  const progressTracker = new ProgressTracker(progressCallback);
  
  try {
    const model = await pipeline(
      modelConfig.type,
      modelConfig.name,
      {
        progress_callback: (data: any) => {
          progressTracker.handleTransformersProgress(data);
        },
        dtype: {
          embed_tokens: 'fp16',
          vision_encoder: 'fp32',
          decoder_model_merged: 'q4',
        },
        device: 'webgpu', // Use WebGPU when available
      }
    );
    
    progressTracker.complete();
    return model;
  } catch (error) {
    progressTracker.error(error);
    throw error;
  }
}
```

#### **Progress Data Processing**
```typescript
class ProgressTracker {
  private startTime: number = 0;
  private lastUpdateTime: number = 0;
  private lastBytesLoaded: number = 0;
  private speedHistory: number[] = [];
  private callback: (info: ProgressInfo) => void;
  
  constructor(callback: (info: ProgressInfo) => void) {
    this.callback = callback;
    this.startTime = Date.now();
  }
  
  handleTransformersProgress(data: any): void {
    const currentTime = Date.now();
    
    // Process raw Transformers.js progress data
    const progressInfo: ProgressInfo = {
      status: data.status || 'download',
      name: data.name || 'model',
      file: data.file || '',
      progress: this.calculateProgress(data),
      loaded: data.loaded || 0,
      total: data.total || 0
    };
    
    // Calculate download speed
    if (this.lastUpdateTime > 0 && progressInfo.loaded > this.lastBytesLoaded) {
      const timeDelta = (currentTime - this.lastUpdateTime) / 1000; // seconds
      const bytesDelta = progressInfo.loaded - this.lastBytesLoaded;
      const instantSpeed = bytesDelta / timeDelta; // bytes/sec
      
      // Smooth speed calculation with rolling average
      this.speedHistory.push(instantSpeed);
      if (this.speedHistory.length > 5) {
        this.speedHistory.shift(); // Keep last 5 samples
      }
      
      progressInfo.speed = this.getAverageSpeed();
      progressInfo.timeRemaining = this.estimateTimeRemaining(progressInfo);
    }
    
    this.lastUpdateTime = currentTime;
    this.lastBytesLoaded = progressInfo.loaded;
    
    // Send update to UI
    this.callback(progressInfo);
  }
  
  private calculateProgress(data: any): number {
    if (data.progress !== undefined) {
      return Math.round(data.progress * 100);
    }
    
    if (data.loaded && data.total) {
      return Math.round((data.loaded / data.total) * 100);
    }
    
    return 0;
  }
  
  private getAverageSpeed(): number {
    if (this.speedHistory.length === 0) return 0;
    
    const sum = this.speedHistory.reduce((a, b) => a + b, 0);
    return sum / this.speedHistory.length;
  }
  
  private estimateTimeRemaining(info: ProgressInfo): number {
    if (!info.speed || info.speed === 0) return 0;
    
    const remainingBytes = info.total - info.loaded;
    return Math.ceil(remainingBytes / info.speed);
  }
  
  complete(): void {
    this.callback({
      status: 'ready',
      name: 'model',
      file: '',
      progress: 100,
      loaded: 0,
      total: 0
    });
  }
  
  error(error: any): void {
    console.error('Progress tracking error:', error);
  }
}
```

### **Multi-File Progress Aggregation**

#### **Handling Multiple Model Files**
```typescript
class MultiFileProgressTracker {
  private fileProgresses: Map<string, ProgressInfo> = new Map();
  private totalExpectedFiles: number = 0;
  private callback: (info: AggregateProgressInfo) => void;
  
  constructor(callback: (info: AggregateProgressInfo) => void) {
    this.callback = callback;
  }
  
  handleFileProgress(fileData: any): void {
    const fileName = fileData.file || fileData.name || 'unknown';
    
    const fileProgress: ProgressInfo = {
      status: fileData.status,
      name: fileName,
      file: fileName,
      progress: this.calculateProgress(fileData),
      loaded: fileData.loaded || 0,
      total: fileData.total || 0
    };
    
    this.fileProgresses.set(fileName, fileProgress);
    
    // Calculate aggregate progress
    const aggregate = this.calculateAggregateProgress();
    this.callback(aggregate);
  }
  
  private calculateAggregateProgress(): AggregateProgressInfo {
    let totalLoaded = 0;
    let totalSize = 0;
    let completedFiles = 0;
    let activeFile = '';
    
    for (const [fileName, progress] of this.fileProgresses.entries()) {
      totalLoaded += progress.loaded;
      totalSize += progress.total;
      
      if (progress.progress >= 100) {
        completedFiles++;
      } else if (progress.progress > 0) {
        activeFile = fileName;
      }
    }
    
    const overallProgress = totalSize > 0 ? (totalLoaded / totalSize) * 100 : 0;
    
    return {
      overallProgress: Math.round(overallProgress),
      filesCompleted: completedFiles,
      totalFiles: this.fileProgresses.size,
      currentFile: activeFile,
      totalDownloaded: totalLoaded,
      totalSize: totalSize,
      files: Array.from(this.fileProgresses.values())
    };
  }
}

interface AggregateProgressInfo {
  overallProgress: number;
  filesCompleted: number;
  totalFiles: number;
  currentFile: string;
  totalDownloaded: number;
  totalSize: number;
  files: ProgressInfo[];
}
```

## **User Interface Integration**

### **Progress Dialog Component**

#### **Real-Time Progress Modal**
```typescript
class ProgressDialog {
  private container: HTMLElement;
  private progressBar: HTMLElement;
  private progressText: HTMLElement;
  private speedText: HTMLElement;
  private timeText: HTMLElement;
  private detailsContainer: HTMLElement;
  
  constructor() {
    this.createDialog();
  }
  
  private createDialog(): void {
    this.container = document.createElement('div');
    this.container.className = 'progress-modal-overlay';
    this.container.innerHTML = `
      <div class="progress-modal">
        <div class="progress-header">
          <h2>🧠 Downloading Phi-3 Advanced</h2>
          <button class="progress-minimize" aria-label="Minimize">−</button>
        </div>
        
        <div class="progress-main">
          <div class="progress-bar-container">
            <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-fill"></div>
              <div class="progress-percentage">0%</div>
            </div>
          </div>
          
          <div class="progress-stats">
            <div class="stat-item">
              <span class="stat-label">Speed:</span>
              <span class="stat-value speed-value">Calculating...</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Time Remaining:</span>
              <span class="stat-value time-value">Calculating...</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Downloaded:</span>
              <span class="stat-value downloaded-value">0 MB / 0 MB</span>
            </div>
          </div>
        </div>
        
        <div class="progress-details" style="display: none;">
          <div class="file-progress-list"></div>
        </div>
        
        <div class="progress-footer">
          <div class="progress-tip">
            💡 You can continue using the app while this downloads
          </div>
          <div class="progress-actions">
            <button class="btn-continue-background">Continue in Background</button>
            <button class="btn-show-details">Show Details</button>
          </div>
        </div>
      </div>
    `;
    
    this.bindElements();
    this.attachEventListeners();
  }
  
  updateProgress(info: ProgressInfo): void {
    // Update progress bar
    const progressFill = this.container.querySelector('.progress-fill') as HTMLElement;
    const progressPercentage = this.container.querySelector('.progress-percentage') as HTMLElement;
    
    progressFill.style.width = `${info.progress}%`;
    progressPercentage.textContent = `${info.progress}%`;
    
    // Update speed
    if (info.speed) {
      const speedMBps = info.speed / (1024 * 1024); // Convert to MB/s
      const speedText = speedMBps >= 1 
        ? `${speedMBps.toFixed(1)} MB/s`
        : `${(speedMBps * 1024).toFixed(0)} KB/s`;
      
      this.container.querySelector('.speed-value')!.textContent = speedText;
    }
    
    // Update time remaining
    if (info.timeRemaining) {
      const timeText = this.formatTime(info.timeRemaining);
      this.container.querySelector('.time-value')!.textContent = timeText;
    }
    
    // Update downloaded amount
    const downloadedMB = (info.loaded / (1024 * 1024)).toFixed(1);
    const totalMB = (info.total / (1024 * 1024)).toFixed(1);
    this.container.querySelector('.downloaded-value')!.textContent = 
      `${downloadedMB} MB / ${totalMB} MB`;
    
    // Update progress bar accessibility
    const progressBar = this.container.querySelector('.progress-bar') as HTMLElement;
    progressBar.setAttribute('aria-valuenow', info.progress.toString());
  }
  
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }
}
```

### **In-Conversation Progress Display**

#### **Compact Progress Indicator**
```typescript
function createConversationProgressIndicator(
  modelKey: string,
  modelName: string
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'conversation-progress';
  container.innerHTML = `
    <div class="progress-message">
      <strong>🧠 ${modelName} is downloading...</strong>
    </div>
    
    <div class="mini-progress-bar">
      <div class="mini-progress-fill" style="width: 0%"></div>
    </div>
    
    <div class="progress-stats-mini">
      <span class="mini-percentage">0%</span>
      <span class="mini-speed">Calculating...</span>
      <span class="mini-time">Calculating...</span>
    </div>
    
    <div class="progress-tip-mini">
      💡 You can continue chatting with other models while this downloads
    </div>
  `;
  
  return container;
}

function updateConversationProgress(
  container: HTMLElement,
  info: ProgressInfo
): void {
  const fill = container.querySelector('.mini-progress-fill') as HTMLElement;
  const percentage = container.querySelector('.mini-percentage') as HTMLElement;
  const speed = container.querySelector('.mini-speed') as HTMLElement;
  const time = container.querySelector('.mini-time') as HTMLElement;
  
  fill.style.width = `${info.progress}%`;
  percentage.textContent = `${info.progress}%`;
  
  if (info.speed) {
    const speedMBps = info.speed / (1024 * 1024);
    speed.textContent = `${speedMBps.toFixed(1)} MB/s`;
  }
  
  if (info.timeRemaining) {
    const minutes = Math.ceil(info.timeRemaining / 60);
    time.textContent = `${minutes}m left`;
  }
}
```

## **State Management**

### **Download State Tracking**

#### **Progress State Manager**
```typescript
class ProgressStateManager {
  private downloadStates: Map<string, DownloadState> = new Map();
  private callbacks: Map<string, Set<ProgressCallback>> = new Map();
  
  startDownload(modelKey: string, modelName: string): void {
    const state: DownloadState = {
      modelKey,
      modelName,
      status: 'downloading',
      progress: 0,
      startTime: Date.now(),
      lastUpdate: Date.now(),
      speed: 0,
      bytesDownloaded: 0,
      totalBytes: 0,
      timeRemaining: 0,
      error: null
    };
    
    this.downloadStates.set(modelKey, state);
    this.notifyCallbacks(modelKey, state);
  }
  
  updateDownload(modelKey: string, info: ProgressInfo): void {
    const state = this.downloadStates.get(modelKey);
    if (!state) return;
    
    const updatedState: DownloadState = {
      ...state,
      progress: info.progress,
      lastUpdate: Date.now(),
      speed: info.speed || 0,
      bytesDownloaded: info.loaded,
      totalBytes: info.total,
      timeRemaining: info.timeRemaining || 0
    };
    
    this.downloadStates.set(modelKey, updatedState);
    this.notifyCallbacks(modelKey, updatedState);
    
    // Persist state to localStorage for recovery
    this.persistState(modelKey, updatedState);
  }
  
  completeDownload(modelKey: string): void {
    const state = this.downloadStates.get(modelKey);
    if (!state) return;
    
    const completedState: DownloadState = {
      ...state,
      status: 'completed',
      progress: 100,
      lastUpdate: Date.now(),
      timeRemaining: 0
    };
    
    this.downloadStates.set(modelKey, completedState);
    this.notifyCallbacks(modelKey, completedState);
    
    // Clean up completed download state after delay
    setTimeout(() => {
      this.downloadStates.delete(modelKey);
      localStorage.removeItem(`download_state_${modelKey}`);
    }, 5000);
  }
  
  private persistState(modelKey: string, state: DownloadState): void {
    try {
      localStorage.setItem(
        `download_state_${modelKey}`,
        JSON.stringify({
          ...state,
          // Don't persist callbacks or large objects
          callbacks: undefined
        })
      );
    } catch (error) {
      console.warn('Failed to persist download state:', error);
    }
  }
  
  restoreState(modelKey: string): DownloadState | null {
    try {
      const saved = localStorage.getItem(`download_state_${modelKey}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to restore download state:', error);
      return null;
    }
  }
}

interface DownloadState {
  modelKey: string;
  modelName: string;
  status: 'downloading' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime: number;
  lastUpdate: number;
  speed: number;
  bytesDownloaded: number;
  totalBytes: number;
  timeRemaining: number;
  error: Error | null;
}
```

## **Performance Optimization**

### **Efficient Progress Updates**

#### **Throttled Update Strategy**
```typescript
class ThrottledProgressUpdater {
  private lastUpdateTime: number = 0;
  private updateInterval: number = 100; // Update UI every 100ms maximum
  private pendingUpdate: ProgressInfo | null = null;
  private updateTimeout: number | null = null;
  
  scheduleUpdate(info: ProgressInfo, callback: (info: ProgressInfo) => void): void {
    this.pendingUpdate = info;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;
    
    if (timeSinceLastUpdate >= this.updateInterval) {
      // Update immediately
      this.performUpdate(callback);
    } else if (!this.updateTimeout) {
      // Schedule update for later
      const delay = this.updateInterval - timeSinceLastUpdate;
      this.updateTimeout = window.setTimeout(() => {
        this.performUpdate(callback);
      }, delay);
    }
  }
  
  private performUpdate(callback: (info: ProgressInfo) => void): void {
    if (this.pendingUpdate) {
      callback(this.pendingUpdate);
      this.lastUpdateTime = Date.now();
      this.pendingUpdate = null;
    }
    
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }
  }
}
```

### **Memory-Efficient Progress Tracking**

#### **Circular Buffer for Speed History**
```typescript
class CircularBuffer<T> {
  private buffer: T[];
  private head: number = 0;
  private size: number = 0;
  
  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }
  
  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    this.size = Math.min(this.size + 1, this.capacity);
  }
  
  getAverage(accessor: (item: T) => number): number {
    if (this.size === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < this.size; i++) {
      const index = (this.head - this.size + i + this.capacity) % this.capacity;
      sum += accessor(this.buffer[index]);
    }
    
    return sum / this.size;
  }
  
  clear(): void {
    this.head = 0;
    this.size = 0;
  }
}

// Usage for speed history
const speedHistory = new CircularBuffer<SpeedSample>(10);

interface SpeedSample {
  timestamp: number;
  bytesPerSecond: number;
  windowSize: number; // bytes measured in this window
}
```

## **Error Handling & Recovery**

### **Progress Interruption Handling**

#### **Download Recovery System**
```typescript
class DownloadRecoveryManager {
  private recoveryAttempts: Map<string, number> = new Map();
  private maxRetryAttempts: number = 3;
  
  async handleDownloadFailure(
    modelKey: string,
    error: Error,
    progressState: DownloadState
  ): Promise<boolean> {
    const attempts = this.recoveryAttempts.get(modelKey) || 0;
    
    if (attempts >= this.maxRetryAttempts) {
      this.showFinalFailureDialog(modelKey, error);
      return false;
    }
    
    this.recoveryAttempts.set(modelKey, attempts + 1);
    
    // Show recovery dialog to user
    const shouldRetry = await this.showRecoveryDialog(modelKey, error, attempts + 1);
    
    if (shouldRetry) {
      // Reset progress and retry
      await this.retryDownload(modelKey, progressState);
      return true;
    }
    
    return false;
  }
  
  private async showRecoveryDialog(
    modelKey: string,
    error: Error,
    attemptNumber: number
  ): Promise<boolean> {
    const dialog = document.createElement('div');
    dialog.className = 'recovery-modal-overlay';
    dialog.innerHTML = `
      <div class="recovery-modal">
        <div class="recovery-header">
          <h2>⚠️ Download Interrupted</h2>
        </div>
        <div class="recovery-body">
          <p>The download was interrupted due to a network error.</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>This is attempt ${attemptNumber} of ${this.maxRetryAttempts}.</p>
        </div>
        <div class="recovery-footer">
          <button class="btn-retry primary">Retry Download</button>
          <button class="btn-cancel secondary">Use Different Model</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    return new Promise((resolve) => {
      dialog.querySelector('.btn-retry')?.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(true);
      });
      
      dialog.querySelector('.btn-cancel')?.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(false);
      });
    });
  }
  
  private async retryDownload(modelKey: string, previousState: DownloadState): Promise<void> {
    // Clear any cached partial downloads
    await this.clearPartialDownload(modelKey);
    
    // Reset progress state
    const progressManager = new ProgressStateManager();
    progressManager.startDownload(modelKey, previousState.modelName);
    
    // Restart download with fresh state
    await this.initiateDownload(modelKey);
  }
}
```

This comprehensive progress tracking system ensures users always have accurate, real-time information about their AI model downloads, building trust through transparency and providing the honest feedback that creates a superior user experience.