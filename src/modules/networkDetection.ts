// modules/networkDetection.ts - Network speed detection and warnings

interface NetworkInfo {
  speed: number; // Mbps
  confidence: 'high' | 'medium' | 'low';
  method: 'connection_api' | 'speed_test' | 'estimate';
  warning?: string;
}

// Test file for speed measurement (small file from HuggingFace)
const TEST_FILE_URL = 'https://huggingface.co/datasets/huggingface/sample-test-data/resolve/main/sample.jsonl';
const TEST_FILE_SIZE_KB = 50; // Approximate size in KB

export async function detectNetworkSpeed(): Promise<NetworkInfo> {
  console.log('🔍 Detecting network speed...');
  
  // Method 1: Try Network Information API (Chrome/Edge)
  const connectionInfo = getConnectionAPI();
  if (connectionInfo.speed > 0) {
    console.log(`📡 Network API detected: ${connectionInfo.speed} Mbps`);
    return {
      speed: connectionInfo.speed,
      confidence: 'medium',
      method: 'connection_api',
      warning: connectionInfo.speed < 1.5 ? 
        `Very slow connection detected (${connectionInfo.speed} Mbps). 1.8GB download may take 3+ hours.` : 
        undefined
    };
  }

  // Method 2: Speed test with small file
  try {
    const speedTestResult = await performSpeedTest();
    console.log(`⚡ Speed test result: ${speedTestResult.speed} Mbps`);
    
    return {
      speed: speedTestResult.speed,
      confidence: speedTestResult.confidence,
      method: 'speed_test',
      warning: speedTestResult.speed < 1.5 ? 
        `Slow connection detected (${speedTestResult.speed.toFixed(1)} Mbps). Large model download not recommended.` : 
        speedTestResult.speed < 5 ? 
        `Moderate connection speed (${speedTestResult.speed.toFixed(1)} Mbps). Download may take 10+ minutes.` :
        undefined
    };
  } catch (error) {
    console.warn('❌ Speed test failed:', error);
    
    // Method 3: Conservative estimate
    return {
      speed: 2.5, // Conservative estimate
      confidence: 'low',
      method: 'estimate',
      warning: 'Could not detect connection speed. Download time may vary significantly.'
    };
  }
}

function getConnectionAPI(): { speed: number } {
  // Check for Network Information API
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
                    
  if (connection && connection.downlink) {
    return { speed: connection.downlink };
  }
  
  return { speed: 0 };
}

async function performSpeedTest(): Promise<{ speed: number; confidence: 'high' | 'medium' | 'low' }> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(TEST_FILE_URL, {
      cache: 'no-store', // Ensure fresh download
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.blob();
    const endTime = Date.now();
    
    const downloadTimeSeconds = (endTime - startTime) / 1000;
    const downloadSizeKB = data.size / 1024;
    const speedKbps = (downloadSizeKB * 8) / downloadTimeSeconds; // Convert to Kbps
    const speedMbps = speedKbps / 1000; // Convert to Mbps
    
    // Determine confidence based on test duration and size
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    if (downloadTimeSeconds < 0.5) {
      confidence = 'low'; // Too fast to be accurate
    } else if (downloadTimeSeconds > 2 && downloadSizeKB > 30) {
      confidence = 'high'; // Good test duration and size
    }
    
    console.log(`📊 Speed test details: ${downloadSizeKB.toFixed(0)}KB in ${downloadTimeSeconds.toFixed(2)}s = ${speedMbps.toFixed(1)} Mbps`);
    
    return {
      speed: Math.max(speedMbps, 0.1), // Minimum 0.1 Mbps
      confidence
    };
    
  } catch (error) {
    console.error('Speed test failed:', error);
    throw error;
  }
}

export function getDownloadEstimate(fileSizeGB: number, speedMbps: number): {
  timeMinutes: number;
  timeFormatted: string;
  recommendation: 'good' | 'acceptable' | 'slow' | 'very_slow';
} {
  const fileSizeMB = fileSizeGB * 1024;
  const speedMBps = speedMbps / 8; // Convert Mbps to MB/s
  const timeSeconds = fileSizeMB / speedMBps;
  const timeMinutes = timeSeconds / 60;
  
  let timeFormatted: string;
  if (timeMinutes < 1) {
    timeFormatted = `${Math.round(timeSeconds)}s`;
  } else if (timeMinutes < 60) {
    timeFormatted = `${Math.round(timeMinutes)}m`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = Math.round(timeMinutes % 60);
    timeFormatted = `${hours}h ${minutes}m`;
  }
  
  let recommendation: 'good' | 'acceptable' | 'slow' | 'very_slow';
  if (timeMinutes <= 5) {
    recommendation = 'good';
  } else if (timeMinutes <= 15) {
    recommendation = 'acceptable';
  } else if (timeMinutes <= 60) {
    recommendation = 'slow';
  } else {
    recommendation = 'very_slow';
  }
  
  return {
    timeMinutes,
    timeFormatted,
    recommendation
  };
}

export async function shouldWarnUser(modelSizeGB: number = 1.8): Promise<{
  shouldWarn: boolean;
  networkInfo: NetworkInfo;
  estimate: ReturnType<typeof getDownloadEstimate>;
}> {
  const networkInfo = await detectNetworkSpeed();
  const estimate = getDownloadEstimate(modelSizeGB, networkInfo.speed);
  
  const shouldWarn = 
    estimate.recommendation === 'very_slow' || 
    estimate.recommendation === 'slow' ||
    networkInfo.speed < 2;
  
  return {
    shouldWarn,
    networkInfo,
    estimate
  };
}