# 📶 Network Detection System

## **Overview**

The Interactive CV Platform features an intelligent network detection system that analyzes real connection speeds and provides personalized recommendations for AI model downloads. This system ensures users make informed decisions based on their actual network capabilities.

## **Network Detection Philosophy**

### **Core Principles**

1. **Real Measurements**: Tests actual download speeds, not just connection types
2. **User-Centric Recommendations**: Provides practical advice based on measured performance
3. **Transparent Communication**: Shows users exactly what to expect
4. **Graceful Degradation**: Adapts to various network conditions automatically
5. **Respect User Choice**: Always allows override of recommendations

## **Technical Implementation**

### **Network Speed Testing**

#### **Test Methodology**
```typescript
async function detectNetworkSpeed(): Promise<NetworkInfo> {
  const testFiles = [
    'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/hub/datasets-data-viewer.png', // ~500KB
    'https://huggingface.co/microsoft/DialoGPT-medium/resolve/main/pytorch_model.bin?download=true' // Larger file for accuracy
  ];
  
  let bestSpeed = 0;
  
  for (const testUrl of testFiles) {
    try {
      const startTime = performance.now();
      const response = await fetch(testUrl, { 
        method: 'HEAD', // Only get headers to measure connection speed
        cache: 'no-cache'
      });
      const endTime = performance.now();
      
      if (response.ok) {
        const fileSize = parseInt(response.headers.get('content-length') || '0');
        const downloadTime = (endTime - startTime) / 1000; // Convert to seconds
        const speedBps = fileSize / downloadTime; // Bytes per second
        const speedMbps = (speedBps * 8) / (1024 * 1024); // Convert to Mbps
        
        bestSpeed = Math.max(bestSpeed, speedMbps);
      }
    } catch (error) {
      console.warn('Speed test failed for:', testUrl, error);
    }
  }
  
  return {
    speed: bestSpeed || estimateFallbackSpeed(),
    type: getConnectionType(),
    quality: categorizeSpeed(bestSpeed),
    timestamp: Date.now()
  };
}
```

#### **Connection API Integration**
```typescript
function getConnectionType(): string {
  const connection = (navigator as any).connection;
  if (!connection) return 'unknown';
  
  return connection.effectiveType || connection.type || 'unknown';
}

function getConnectionDetails(): ConnectionDetails {
  const connection = (navigator as any).connection;
  if (!connection) return { type: 'unknown' };
  
  return {
    type: connection.effectiveType || 'unknown',
    downlink: connection.downlink || null, // Mbps
    rtt: connection.rtt || null, // Round trip time in ms
    saveData: connection.saveData || false
  };
}
```

### **Speed Categorization**

#### **Quality Classifications**
```typescript
function categorizeSpeed(speedMbps: number): NetworkQuality {
  if (speedMbps >= 10) return 'fast';
  if (speedMbps >= 2) return 'moderate';
  return 'slow';
}

interface NetworkQuality {
  'fast': {
    threshold: 10, // Mbps
    description: 'Fast connection - great for all models',
    color: '#8bac0f', // Success green
    recommendation: 'All AI models recommended'
  },
  'moderate': {
    threshold: 2, // Mbps
    description: 'Moderate connection - good for most models',
    color: '#f4a261', // Warning orange
    recommendation: 'Phi-3 may take time, Qwen recommended'
  },
  'slow': {
    threshold: 0, // Below 2 Mbps
    description: 'Slow connection - use smaller models',
    color: '#e63946', // Error red
    recommendation: 'DistilBERT recommended for best experience'
  }
}
```

## **Download Time Estimation**

### **Calculation Methods**

#### **Basic Time Estimation**
```typescript
function getDownloadEstimate(fileSizeGB: number, speedMbps: number): EstimateResult {
  // Convert GB to Mb (gigabytes to megabits)
  const fileSizeMb = fileSizeGB * 8 * 1024; // 1 GB = 8192 Mb
  
  // Basic calculation
  const estimatedSeconds = fileSizeMb / speedMbps;
  
  // Add overhead factors
  const networkOverhead = 1.2; // 20% overhead for network inefficiency
  const protocolOverhead = 1.1; // 10% overhead for HTTP/TCP
  
  const realisticSeconds = estimatedSeconds * networkOverhead * protocolOverhead;
  
  return {
    optimistic: Math.ceil(estimatedSeconds),
    realistic: Math.ceil(realisticSeconds),
    pessimistic: Math.ceil(realisticSeconds * 1.5), // 50% buffer for congestion
    formattedTime: formatTime(realisticSeconds)
  };
}
```

#### **Advanced Estimation with Historical Data**
```typescript
class NetworkEstimator {
  private historicalSpeeds: number[] = [];
  private readonly maxHistorySize = 10;
  
  addSpeedSample(speed: number): void {
    this.historicalSpeeds.push(speed);
    if (this.historicalSpeeds.length > this.maxHistorySize) {
      this.historicalSpeeds.shift();
    }
  }
  
  getAverageSpeed(): number {
    if (this.historicalSpeeds.length === 0) return 0;
    return this.historicalSpeeds.reduce((a, b) => a + b, 0) / this.historicalSpeeds.length;
  }
  
  getSpeedVariability(): number {
    const avg = this.getAverageSpeed();
    const variance = this.historicalSpeeds.reduce((acc, speed) => {
      return acc + Math.pow(speed - avg, 2);
    }, 0) / this.historicalSpeeds.length;
    return Math.sqrt(variance);
  }
  
  getConfidenceAdjustedEstimate(fileSizeGB: number): EstimateResult {
    const avgSpeed = this.getAverageSpeed();
    const variability = this.getSpeedVariability();
    
    // Adjust estimate based on connection stability
    const stabilityFactor = Math.max(0.5, 1 - (variability / avgSpeed));
    const adjustedSpeed = avgSpeed * stabilityFactor;
    
    return getDownloadEstimate(fileSizeGB, adjustedSpeed);
  }
}
```

## **User Interface Integration**

### **Network Status Display**

#### **Connection Speed Indicator**
```typescript
function createNetworkStatusDisplay(networkInfo: NetworkInfo): HTMLElement {
  const container = document.createElement('div');
  container.className = 'network-status';
  
  const qualityClass = `network-${networkInfo.quality}`;
  const qualityIcon = getQualityIcon(networkInfo.quality);
  
  container.innerHTML = `
    <div class="network-indicator ${qualityClass}">
      <span class="network-icon">${qualityIcon}</span>
      <div class="network-details">
        <div class="network-speed">${networkInfo.speed.toFixed(1)} Mbps</div>
        <div class="network-type">${networkInfo.type.toUpperCase()}</div>
      </div>
    </div>
    <div class="network-recommendation">
      ${getRecommendationText(networkInfo.quality)}
    </div>
  `;
  
  return container;
}

function getQualityIcon(quality: NetworkQuality): string {
  switch (quality) {
    case 'fast': return '🚀';
    case 'moderate': return '⚠️';
    case 'slow': return '🐌';
    default: return '❓';
  }
}
```

#### **Download Estimate Display**
```typescript
function createDownloadEstimateDisplay(
  modelInfo: AIModel, 
  networkInfo: NetworkInfo
): HTMLElement {
  const estimate = getDownloadEstimate(
    parseFloat(modelInfo.size.replace('GB', '')), 
    networkInfo.speed
  );
  
  const container = document.createElement('div');
  container.className = 'download-estimate';
  
  container.innerHTML = `
    <div class="estimate-header">
      <h4>📊 Download Information</h4>
    </div>
    <div class="estimate-details">
      <div class="estimate-row">
        <span class="estimate-label">Size:</span>
        <span class="estimate-value">${modelInfo.size}</span>
      </div>
      <div class="estimate-row">
        <span class="estimate-label">Speed:</span>
        <span class="estimate-value">${networkInfo.speed.toFixed(1)} Mbps</span>
      </div>
      <div class="estimate-row">
        <span class="estimate-label">Estimated Time:</span>
        <span class="estimate-value ${getTimeWarningClass(estimate.realistic)}">
          ${estimate.formattedTime}
        </span>
      </div>
      <div class="estimate-note">
        ${getTimeRangeText(estimate)}
      </div>
    </div>
  `;
  
  return container;
}

function getTimeWarningClass(seconds: number): string {
  if (seconds > 1800) return 'time-warning'; // > 30 minutes
  if (seconds > 600) return 'time-caution';  // > 10 minutes
  return 'time-good';
}
```

## **Recommendation Engine**

### **Model Recommendation Logic**

#### **Primary Recommendation Algorithm**
```typescript
function getModelRecommendation(networkInfo: NetworkInfo): ModelRecommendation {
  const { speed, quality } = networkInfo;
  
  // Base recommendations on speed and stability
  if (quality === 'fast' && speed >= 15) {
    return {
      primary: 'phi3',
      secondary: 'qwen',
      reasoning: 'Fast connection suitable for premium AI experience',
      warningLevel: 'none'
    };
  }
  
  if (quality === 'moderate' || (quality === 'fast' && speed < 15)) {
    return {
      primary: 'qwen',
      secondary: 'distilbert',
      reasoning: 'Balanced model recommended for your connection speed',
      warningLevel: 'info',
      alternatives: {
        phi3: 'Available but will take 15+ minutes to download'
      }
    };
  }
  
  // Slow connection
  return {
    primary: 'distilbert',
    secondary: null,
    reasoning: 'Optimized for slower connections - instant responses',
    warningLevel: 'warning',
    alternatives: {
      qwen: 'Will take 30+ minutes to download',
      phi3: 'Not recommended - may take hours'
    }
  };
}
```

#### **Context-Aware Recommendations**
```typescript
function getContextualRecommendation(
  networkInfo: NetworkInfo,
  userContext: UserContext
): ModelRecommendation {
  const baseRecommendation = getModelRecommendation(networkInfo);
  
  // Adjust for mobile devices
  if (userContext.isMobile) {
    if (baseRecommendation.primary === 'phi3') {
      return {
        ...baseRecommendation,
        primary: 'qwen',
        reasoning: 'Qwen recommended for mobile devices - better battery life',
        mobileOptimization: true
      };
    }
  }
  
  // Adjust for battery saver mode
  if (userContext.batteryLevel && userContext.batteryLevel < 20) {
    return {
      ...baseRecommendation,
      primary: 'distilbert',
      reasoning: 'DistilBERT recommended to preserve battery',
      batteryOptimization: true
    };
  }
  
  // Adjust for data saver mode
  if (networkInfo.saveData) {
    return {
      ...baseRecommendation,
      primary: 'distilbert',
      reasoning: 'Data saver mode detected - using minimal download',
      dataSaverOptimization: true
    };
  }
  
  return baseRecommendation;
}
```

## **Real-Time Network Monitoring**

### **Connection Quality Monitoring**

#### **Continuous Speed Assessment**
```typescript
class NetworkMonitor {
  private currentSpeed: number = 0;
  private speedHistory: SpeedSample[] = [];
  private monitoringInterval: number | null = null;
  private callbacks: NetworkCallback[] = [];
  
  startMonitoring(): void {
    this.monitoringInterval = window.setInterval(() => {
      this.performSpeedCheck();
    }, 30000); // Check every 30 seconds during downloads
  }
  
  private async performSpeedCheck(): Promise<void> {
    try {
      const networkInfo = await detectNetworkSpeed();
      this.updateSpeedHistory(networkInfo);
      this.notifyCallbacks(networkInfo);
    } catch (error) {
      console.warn('Network monitoring check failed:', error);
    }
  }
  
  private updateSpeedHistory(networkInfo: NetworkInfo): void {
    const sample: SpeedSample = {
      speed: networkInfo.speed,
      timestamp: Date.now(),
      quality: networkInfo.quality
    };
    
    this.speedHistory.push(sample);
    
    // Keep only last 10 minutes of data
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    this.speedHistory = this.speedHistory.filter(
      sample => sample.timestamp > tenMinutesAgo
    );
  }
  
  getRecentSpeedTrend(): 'improving' | 'stable' | 'degrading' {
    if (this.speedHistory.length < 3) return 'stable';
    
    const recent = this.speedHistory.slice(-3);
    const speeds = recent.map(s => s.speed);
    
    const trend = speeds.reduce((acc, speed, index) => {
      if (index === 0) return acc;
      return acc + (speed - speeds[index - 1]);
    }, 0);
    
    if (trend > 2) return 'improving';
    if (trend < -2) return 'degrading';
    return 'stable';
  }
}
```

### **Adaptive Download Strategy**

#### **Dynamic Quality Adjustment**
```typescript
class AdaptiveDownloader {
  private currentQuality: NetworkQuality = 'moderate';
  private downloadPaused: boolean = false;
  
  async downloadWithAdaptation(
    url: string, 
    progressCallback: (progress: ProgressInfo) => void
  ): Promise<ArrayBuffer> {
    const monitor = new NetworkMonitor();
    
    monitor.onSpeedChange((networkInfo) => {
      this.handleSpeedChange(networkInfo, progressCallback);
    });
    
    monitor.startMonitoring();
    
    try {
      const response = await fetch(url);
      const reader = response.body?.getReader();
      const contentLength = parseInt(response.headers.get('content-length') || '0');
      
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];
      
      while (reader && !this.downloadPaused) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        const progress = contentLength > 0 ? (receivedLength / contentLength) * 100 : 0;
        progressCallback({
          progress,
          downloadedBytes: receivedLength,
          totalBytes: contentLength,
          speed: this.calculateCurrentSpeed(receivedLength),
          estimatedTimeRemaining: this.estimateRemainingTime(receivedLength, contentLength)
        });
      }
      
      // Combine chunks into single ArrayBuffer
      const result = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        result.set(chunk, position);
        position += chunk.length;
      }
      
      return result.buffer;
    } finally {
      monitor.stopMonitoring();
    }
  }
  
  private handleSpeedChange(
    networkInfo: NetworkInfo, 
    progressCallback: (progress: ProgressInfo) => void
  ): void {
    if (networkInfo.quality === 'slow' && this.currentQuality !== 'slow') {
      // Connection degraded significantly
      progressCallback({
        warning: 'Connection speed has decreased. Download may take longer.',
        showPauseOption: true
      });
    }
    
    this.currentQuality = networkInfo.quality;
  }
}
```

## **Error Handling & Fallbacks**

### **Network Error Recovery**

#### **Connection Timeout Handling**
```typescript
async function robustNetworkTest(timeoutMs: number = 10000): Promise<NetworkInfo> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Network test timeout')), timeoutMs);
  });
  
  try {
    const result = await Promise.race([
      detectNetworkSpeed(),
      timeoutPromise
    ]);
    
    return result;
  } catch (error) {
    console.warn('Network test failed, using fallback:', error);
    return getFallbackNetworkInfo();
  }
}

function getFallbackNetworkInfo(): NetworkInfo {
  const connection = (navigator as any).connection;
  
  // Use Connection API if available
  if (connection?.effectiveType) {
    const estimatedSpeed = estimateSpeedFromEffectiveType(connection.effectiveType);
    return {
      speed: estimatedSpeed,
      type: connection.effectiveType,
      quality: categorizeSpeed(estimatedSpeed),
      fallback: true,
      timestamp: Date.now()
    };
  }
  
  // Conservative fallback
  return {
    speed: 5, // Assume moderate connection
    type: 'unknown',
    quality: 'moderate',
    fallback: true,
    timestamp: Date.now()
  };
}
```

#### **Offline Detection**
```typescript
function handleOfflineScenario(): NetworkInfo {
  return {
    speed: 0,
    type: 'offline',
    quality: 'offline' as any,
    offline: true,
    timestamp: Date.now(),
    message: 'No internet connection detected. Please check your connection and try again.'
  };
}

// Monitor online/offline status
window.addEventListener('online', () => {
  console.log('Connection restored');
  // Retry network detection
  detectNetworkSpeed().then(networkInfo => {
    updateNetworkStatus(networkInfo);
  });
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  updateNetworkStatus(handleOfflineScenario());
});
```

## **Privacy & Data Protection**

### **Privacy-First Network Testing**

The network detection system is designed with privacy in mind:

1. **No Personal Data**: Only measures connection speed, no user identification
2. **Minimal Data Collection**: Only essential network performance metrics
3. **Local Storage Only**: All data stays on user's device
4. **No External Analytics**: No data sent to third-party services
5. **User Control**: Users can disable network testing in settings

```typescript
const PRIVACY_SETTINGS = {
  enableNetworkTesting: true,
  shareNetworkData: false, // Never share with external services
  storeSpeedHistory: true,  // Keep local history for better estimates
  maxHistoryDays: 7        // Automatically delete old data
};

function respectPrivacySettings(): boolean {
  return localStorage.getItem('privacy_network_testing') !== 'false';
}
```

This comprehensive network detection system ensures users always get accurate, personalized recommendations for their specific network conditions while maintaining their privacy and providing transparent information about download expectations.