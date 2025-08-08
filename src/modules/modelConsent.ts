// modules/modelConsent.ts - User consent system for large model downloads

import { shouldWarnUser, detectNetworkSpeed } from './networkDetection';

declare global {
  interface Window {
    aiModels?: { [key: string]: any };
  }
}

interface ConsentInfo {
  modelKey: string;
  modelName: string;
  size: string;
  description: string;
  requirements: string[];
  benefits: string[];
  estimatedTime: string;
}

interface ConsentResult {
  approved: boolean;
  remember?: boolean;
}

// Store user preferences - separate keys for each model
const PHI3_USER_CONSENT_KEY = 'phi3_model_consent';
const QWEN_USER_CONSENT_KEY = 'qwen_model_consent';
const DEVICE_CAPABILITY_KEY = 'device_capability_check';
const PHI3_DOWNLOAD_STATE_KEY = 'phi3_download_state';
const QWEN_DOWNLOAD_STATE_KEY = 'qwen_download_state';

function getConsentKey(modelKey: string): string {
  switch (modelKey) {
    case 'phi3':
      return PHI3_USER_CONSENT_KEY;
    case 'qwen':
      return QWEN_USER_CONSENT_KEY;
    default:
      return `${modelKey}_model_consent`;
  }
}

function getDownloadStateKey(modelKey: string): string {
  switch (modelKey) {
    case 'phi3':
      return PHI3_DOWNLOAD_STATE_KEY;
    case 'qwen':
      return QWEN_DOWNLOAD_STATE_KEY;
    default:
      return `${modelKey}_download_state`;
  }
}

export function hasUserConsentFor(modelKey: string): boolean {
  try {
    const consentKey = getConsentKey(modelKey);
    const stored = localStorage.getItem(consentKey);
    return stored === 'approved';
  } catch (error) {
    console.warn('Cannot access localStorage for consent check');
    return false;
  }
}

export function storeUserConsent(modelKey: string, approved: boolean): void {
  try {
    const consentKey = getConsentKey(modelKey);
    const downloadStateKey = getDownloadStateKey(modelKey);
    localStorage.setItem(consentKey, approved ? 'approved' : 'denied');
    if (approved) {
      // Also mark that user has decided (approved download)
      localStorage.setItem(downloadStateKey, 'user_approved');
    }
  } catch (error) {
    console.warn('Cannot store user consent in localStorage');
  }
}

export function hasUserApprovedDownload(modelKey: string): boolean {
  try {
    const downloadStateKey = getDownloadStateKey(modelKey);
    const state = localStorage.getItem(downloadStateKey);
    const hasApproved = state === 'user_approved';
    console.log(`🔍 Download approval check for ${modelKey}: ${hasApproved} (stored: ${state})`);
    return hasApproved;
  } catch (error) {
    console.warn('Cannot access localStorage for download state');
    return false;
  }
}

export function markDownloadApproved(modelKey: string): void {
  try {
    const downloadStateKey = getDownloadStateKey(modelKey);
    localStorage.setItem(downloadStateKey, 'user_approved');
    console.log(`✅ Marked ${modelKey} as user approved`);
  } catch (error) {
    console.warn('Cannot store download approval state');
  }
}

// Helper function to reset state for testing
export function clearDownloadState(modelKey: string): void {
  try {
    const downloadStateKey = getDownloadStateKey(modelKey);
    const consentKey = getConsentKey(modelKey);
    localStorage.removeItem(downloadStateKey);
    localStorage.removeItem(consentKey);
    console.log(`🧹 Cleared all consent state for ${modelKey}`);
  } catch (error) {
    console.warn('Cannot clear download state');
  }
}

export function getEstimatedDownloadTime(sizeGB: number): string {
  // Estimate based on typical connection speeds
  const connections = [
    { name: 'Fast Fiber', mbps: 100, time: (sizeGB * 1024 * 8) / 100 },
    { name: 'Broadband', mbps: 25, time: (sizeGB * 1024 * 8) / 25 },
    { name: 'Mobile 4G', mbps: 10, time: (sizeGB * 1024 * 8) / 10 }
  ];
  
  const fastestTime = Math.ceil(connections[0].time / 60); // Convert to minutes
  const slowestTime = Math.ceil(connections[2].time / 60);
  
  if (fastestTime === slowestTime) {
    return `~${fastestTime} minute${fastestTime > 1 ? 's' : ''}`;
  }
  
  return `${fastestTime}-${slowestTime} minutes`;
}

export async function requestModelConsent(modelKey: string, modelInfo: any, onProgress?: (progress: number, speed: number, bytesDownloaded: number, totalBytes: number) => void): Promise<ConsentResult> {
  console.log(`🤔 Checking consent for ${modelKey}...`);
  
  // Check if user already gave PERMANENT consent (with "remember" option)
  if (hasUserConsentFor(modelKey)) {
    console.log(`✅ ${modelKey} has permanent consent, skipping dialog`);
    return { approved: true };
  }
  
  // Check if model is already loaded (avoid double consent)
  if (window.aiModels && window.aiModels[modelKey]) {
    console.log(`✅ ${modelKey} already loaded, skipping consent`);
    return { approved: true };
  }
  
  console.log(`🔍 First time requesting ${modelKey} - showing consent dialog with network analysis`);
  
  // Store progress callback globally for real progress tracking
  if (onProgress) {
    (window as any).modelProgressCallback = onProgress;
  }

  // Prepare consent information
  const sizeInGB = parseFloat(modelInfo.size.replace('~', '').replace('GB', ''));
  
  // Check network speed and get warnings
  console.log('🔍 Checking network capabilities...');
  const networkCheck = await shouldWarnUser(sizeInGB);
  const estimatedTime = networkCheck.estimate.timeFormatted;

  const consentInfo: ConsentInfo = {
    modelKey,
    modelName: modelInfo.name,
    size: modelInfo.size,
    description: modelInfo.description,
    requirements: [
      `${modelInfo.minMemoryGB || '4'}GB RAM`,
      modelKey === 'phi3' ? 'Desktop browser recommended' : 'Modern browser required',
      ...(modelInfo.recommendedWebGPU ? ['WebGPU support (Chrome/Edge)'] : [])
    ],
    benefits: modelKey === 'qwen' ? [
      'Conversational AI capabilities',
      'Natural dialogue interactions',
      'Context-aware responses',
      'Better than basic Q&A'
    ] : [
      'Advanced conversational AI',
      'Professional-quality responses',
      'Better understanding of context',
      'More detailed explanations'
    ],
    estimatedTime
  };

  return new Promise<ConsentResult>((resolve) => {
    showConsentDialog(consentInfo, networkCheck, (result) => {
      if (result.approved) {
        // Always mark as approved when user consents
        markDownloadApproved(modelKey);
        if (result.remember) {
          storeUserConsent(modelKey, true);
        }
      }
      resolve(result);
    });
  });
}

function showConsentDialog(info: ConsentInfo, networkCheck: any, callback: (result: ConsentResult) => void): void {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'model-consent-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(5px);
  `;

  // Create dialog
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    font-family: 'Courier New', monospace;
  `;

  const modelTitle = info.modelKey === 'qwen' ? '💬 Qwen Chat AI' : '🧠 Phi-3 Advanced AI';
  const modelSubtitle = info.modelKey === 'qwen' ? 
    'Conversational AI for interactive dialogue' : 
    'Enhanced conversational intelligence for your CV';

  dialog.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #333; font-size: 24px;">${modelTitle}</h2>
      <p style="margin: 10px 0; color: #666; font-size: 14px;">${modelSubtitle}</p>
    </div>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">📊 Download Information</h3>
      <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.6;">
        <li><strong>Size:</strong> ${info.size}</li>
        <li><strong>Connection Speed:</strong> ${networkCheck.networkInfo.speed.toFixed(1)} Mbps</li>
        <li><strong>Estimated Time:</strong> ${info.estimatedTime}</li>
        <li><strong>One-time download</strong> (cached for future use)</li>
      </ul>
    </div>

    ${networkCheck.shouldWarn ? `
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">⚠️ Connection Warning</h3>
      <p style="margin: 0; color: #856404; line-height: 1.6; font-size: 14px;">
        ${networkCheck.networkInfo.warning || `Slow connection detected. Download may take ${info.estimatedTime}.`}
      </p>
      <p style="margin: 10px 0 0 0; color: #856404; line-height: 1.6; font-size: 13px;">
        💡 <strong>Recommendations:</strong> Switch to WiFi, use a faster connection, or try the ${info.modelKey === 'qwen' ? 'lighter DistilBERT model' : 'lighter Qwen or DistilBERT models'} instead.
      </p>
    </div>
    ` : ''}

    <div style="background: #e7f3ff; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #0066cc; font-size: 16px;">⚡ What You'll Get</h3>
      <ul style="margin: 0; padding-left: 20px; color: #0066cc; line-height: 1.6;">
        ${info.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
      </ul>
    </div>

    <div style="background: #fff3cd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">🔧 Requirements</h3>
      <ul style="margin: 0; padding-left: 20px; color: #856404; line-height: 1.6;">
        ${info.requirements.map(req => `<li>${req}</li>`).join('')}
      </ul>
    </div>

    <div style="background: #d1ecf1; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
      <p style="margin: 0; color: #0c5460; font-size: 13px; text-align: center;">
        💡 <strong>Tip:</strong> You can always switch back to ${info.modelKey === 'qwen' ? 'lighter DistilBERT model' : 'lighter models (DistilBERT/Qwen)'} anytime
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <label style="display: flex; align-items: center; cursor: pointer; color: #333;">
        <input type="checkbox" id="remember-choice" style="margin-right: 10px; transform: scale(1.2);">
        <span>Remember my choice (don't ask again)</span>
      </label>
    </div>

    <div style="display: flex; gap: 15px; justify-content: center;">
      <button id="consent-cancel" style="
        padding: 12px 24px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        transition: background-color 0.2s;
      ">Maybe Later</button>
      
      <button id="consent-approve" style="
        padding: 12px 24px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        transition: background-color 0.2s;
      ">Download ${info.modelKey === 'qwen' ? 'Qwen 💬' : 'Phi-3 🚀'}</button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  // Add style for hover effects
  const style = document.createElement('style');
  style.textContent = `
    #consent-cancel:hover { background: #5a6268 !important; }
    #consent-approve:hover { background: #0056b3 !important; }
  `;
  document.head.appendChild(style);

  // Escape key handler
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
      callback({ approved: false });
    }
  };
  document.addEventListener('keydown', escHandler);

  // Cleanup function
  const cleanup = () => {
    document.removeEventListener('keydown', escHandler);
    document.head.removeChild(style);
    document.body.removeChild(overlay);
  };

  // Event handlers
  const rememberCheckbox = dialog.querySelector('#remember-choice') as HTMLInputElement;
  const cancelBtn = dialog.querySelector('#consent-cancel') as HTMLButtonElement;
  const approveBtn = dialog.querySelector('#consent-approve') as HTMLButtonElement;

  cancelBtn.addEventListener('click', () => {
    cleanup();
    callback({ approved: false });
  });

  approveBtn.addEventListener('click', () => {
    // Show progress and start download
    showDownloadProgress(dialog, callback, {
      approved: true, 
      remember: rememberCheckbox.checked 
    });
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      cleanup();
      callback({ approved: false });
    }
  });

  // Focus the approve button
  setTimeout(() => approveBtn.focus(), 100);
}

function showDownloadProgress(dialog: HTMLDivElement, callback: (result: ConsentResult) => void, result: ConsentResult): void {
  // Find parent overlay and style for cleanup
  const overlay = dialog.parentElement as HTMLDivElement;
  const style = document.head.querySelector('style:last-child') as HTMLStyleElement;
  // Get model info from dialog title  
  const isQwen = dialog.innerHTML.includes('Qwen Chat AI');
  const progressTitle = isQwen ? '💬 Downloading Qwen' : '🧠 Downloading Phi-3';
  const progressSubtitle = isQwen ? 'Conversational AI model is downloading...' : 'Advanced AI model is downloading...';

  // Replace dialog content with progress view
  dialog.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="margin: 0; color: #333; font-size: 24px;">${progressTitle}</h2>
      <p style="margin: 10px 0; color: #666; font-size: 14px;">${progressSubtitle}</p>
    </div>

    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="font-weight: bold;">Progress:</span>
          <span id="progress-percentage">0%</span>
        </div>
        <div style="background: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden;">
          <div id="progress-bar" style="background: linear-gradient(90deg, #007bff, #0056b3); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666;">
        <span id="download-speed">Estimating speed...</span>
        <span id="time-remaining">Calculating time...</span>
      </div>
    </div>

    <div style="background: #e7f3ff; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <p style="margin: 0; color: #0066cc; font-size: 13px; text-align: center;">
        💡 <strong>Tip:</strong> You can continue using the app while the model downloads in the background
      </p>
    </div>

    <div style="text-align: center;">
      <button id="continue-background" style="
        padding: 12px 24px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-weight: bold;
      ">Continue in Background</button>
    </div>
  `;

  // Set up continue button with cleanup
  const cleanup = () => {
    if (style && style.parentNode) {
      document.head.removeChild(style);
    }
    if (overlay && overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  };

  const continueBtn = dialog.querySelector('#continue-background') as HTMLButtonElement;
  continueBtn.addEventListener('click', () => {
    cleanup(); // Close dialog first
    callback(result);
  });

  // Set up real progress tracking
  const progressBar = dialog.querySelector('#progress-bar') as HTMLDivElement;
  const progressPercentage = dialog.querySelector('#progress-percentage') as HTMLSpanElement;
  const downloadSpeed = dialog.querySelector('#download-speed') as HTMLSpanElement;
  const timeRemaining = dialog.querySelector('#time-remaining') as HTMLSpanElement;

  let startTime = Date.now();
  let lastUpdateTime = startTime;
  let lastBytesDownloaded = 0;
  let isComplete = false;

  // Real progress callback that gets called by Transformers.js
  (window as any).updateModelProgress = (progressData: {
    progress: number, 
    bytesDownloaded: number, 
    totalBytes: number
  }) => {
    if (isComplete) return;

    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const timeSinceLastUpdate = currentTime - lastUpdateTime;
    
    // Calculate real download speed
    const bytesInThisUpdate = progressData.bytesDownloaded - lastBytesDownloaded;
    const speedBytesPerSecond = timeSinceLastUpdate > 0 ? 
      (bytesInThisUpdate * 1000) / timeSinceLastUpdate : 0;
    const speedMBPerSecond = speedBytesPerSecond / (1024 * 1024);
    
    // Calculate real time remaining
    const bytesRemaining = progressData.totalBytes - progressData.bytesDownloaded;
    const timeRemainingSeconds = speedBytesPerSecond > 0 ? 
      bytesRemaining / speedBytesPerSecond : 0;

    // Update UI with real data
    const progressPercent = Math.round(progressData.progress * 100);
    progressBar.style.width = `${progressPercent}%`;
    progressPercentage.textContent = `${progressPercent}%`;
    
    // Format download speed
    if (speedMBPerSecond > 0) {
      downloadSpeed.textContent = `${speedMBPerSecond.toFixed(1)} MB/s`;
    } else {
      downloadSpeed.textContent = 'Calculating speed...';
    }
    
    // Format time remaining
    if (timeRemainingSeconds > 60) {
      timeRemaining.textContent = `${Math.round(timeRemainingSeconds / 60)}m remaining`;
    } else if (timeRemainingSeconds > 0) {
      timeRemaining.textContent = `${Math.round(timeRemainingSeconds)}s remaining`;
    } else {
      timeRemaining.textContent = 'Calculating time...';
    }

    // Check if download is complete
    if (progressData.progress >= 0.99 || progressPercent >= 99) {
      isComplete = true;
      progressBar.style.width = '100%';
      progressPercentage.textContent = '100%';
      timeRemaining.textContent = 'Complete!';
      downloadSpeed.textContent = `${speedMBPerSecond.toFixed(1)} MB/s (finished)`;
      
      setTimeout(() => {
        callback(result);
      }, 1500);
    }

    // Update for next calculation
    lastUpdateTime = currentTime;
    lastBytesDownloaded = progressData.bytesDownloaded;
  };

  // Initial state
  downloadSpeed.textContent = 'Starting download...';
  timeRemaining.textContent = 'Calculating...';

  // Store cleanup function
  (continueBtn as any).cleanup = () => {
    (window as any).updateModelProgress = null;
    isComplete = true;
  };
}

// Export functions for use in AI processor
export { requestModelConsent as default };