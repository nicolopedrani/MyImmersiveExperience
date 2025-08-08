// modules/compatibilityWarning.ts - Browser compatibility warning system

import { getBrowserInfo, getCompatibilityInfo, CompatibilityInfo, BrowserInfo } from './browserDetection';

interface WarningDialogOptions {
  showOnce: boolean;
  storageKey: string;
  autoShow: boolean;
}

class CompatibilityWarningManager {
  private warningShown: Set<string> = new Set();
  private currentModal: HTMLElement | null = null;
  
  shouldShowWarning(options: WarningDialogOptions = { showOnce: true, storageKey: 'compatibility_warning_shown', autoShow: true }): boolean {
    const compatInfo = getCompatibilityInfo();
    const browserInfo = getBrowserInfo();
    
    // ALWAYS show warning for iOS devices (immediate warning required)
    if (browserInfo.os === 'iOS') {
      return true;
    }
    
    // Show warning for other problematic browser/device combinations
    if (compatInfo.level === 'poor' || compatInfo.warnings.length > 0) {
      // Check if warning was already shown (if showOnce is true)
      if (options.showOnce) {
        const hasShown = localStorage.getItem(options.storageKey) === 'true';
        if (hasShown) {
          return false;
        }
      }
      return options.autoShow;
    }
    
    // Don't show warning for good compatibility
    return false;
  }
  
  createCompatibilityWarningDialog(): HTMLElement {
    const browserInfo = getBrowserInfo();
    const compatInfo = getCompatibilityInfo();
    
    const overlay = document.createElement('div');
    overlay.className = 'compatibility-warning-overlay';
    overlay.innerHTML = `
      <div class="compatibility-warning-modal">
        <div class="warning-header">
          <h2 class="warning-title">
            ${this.getWarningIcon(compatInfo.level)} Browser Compatibility Information
          </h2>
          <button class="warning-close" aria-label="Close">&times;</button>
        </div>
        
        <div class="warning-body">
          <div class="browser-info">
            <h3>🌐 Your Browser: ${browserInfo.name} ${browserInfo.version}</h3>
            <p>Platform: ${browserInfo.os} ${browserInfo.osVersion} (${browserInfo.isDesktop ? 'Desktop' : browserInfo.isTablet ? 'Tablet' : 'Mobile'})</p>
          </div>
          
          <div class="compatibility-status ${compatInfo.level}">
            <h3>${this.getCompatibilityTitle(compatInfo.level)}</h3>
            <p>${compatInfo.message}</p>
          </div>
          
          <div class="ai-support-matrix">
            <h4>🤖 Response Options:</h4>
            <div class="model-support-grid">
              <div class="model-item supported">
                <span class="model-name">🔄 Pre-Written Responses</span>
                <span class="model-status">✅ Always Available</span>
              </div>
              <div class="model-item ${compatInfo.aiSupport.distilbert ? 'supported' : 'unsupported'}">
                <span class="model-name">🚀 DistilBERT Q&A</span>
                <span class="model-status">${compatInfo.aiSupport.distilbert ? '✅ Supported' : '❌ Unsupported'}</span>
              </div>
              <div class="model-item ${compatInfo.aiSupport.qwen ? 'supported' : 'unsupported'}">
                <span class="model-name">💬 Qwen Chat</span>
                <span class="model-status">${compatInfo.aiSupport.qwen ? '✅ Supported' : '❌ Unsupported'}</span>
              </div>
              <div class="model-item ${compatInfo.aiSupport.phi3 ? 'supported' : 'unsupported'}">
                <span class="model-name">🧠 Phi-3 Advanced</span>
                <span class="model-status">${compatInfo.aiSupport.phi3 ? '✅ Supported' : '❌ Unsupported'}</span>
              </div>
            </div>
            
            <div class="recommended-model">
              <p><strong>💡 Recommended:</strong> ${this.getModelDisplayName(compatInfo.recommendedModel)}</p>
              ${!compatInfo.aiSupport[compatInfo.recommendedModel] ? 
                '<p class="fallback-notice"><em>Note: This will use pre-written responses as live AI processing is not supported on your browser.</em></p>' : 
                ''}
            </div>
          </div>
          
          ${compatInfo.warnings.length > 0 ? `
            <div class="warnings-section">
              <h4>⚠️ Important Notes:</h4>
              <ul>
                ${compatInfo.warnings.map(warning => `<li>${warning}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${compatInfo.suggestions.length > 0 ? `
            <div class="suggestions-section">
              <h4>💡 Suggestions:</h4>
              <ul>
                ${compatInfo.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <div class="warning-footer">
          <div class="dont-show-again">
            <label>
              <input type="checkbox" id="dont-show-again-checkbox">
              Don't show this again
            </label>
          </div>
          <div class="warning-actions">
            <button class="btn-understand primary">I Understand</button>
          </div>
        </div>
      </div>
    `;
    
    return overlay;
  }
  
  showCompatibilityWarning(options: WarningDialogOptions = { showOnce: true, storageKey: 'compatibility_warning_shown', autoShow: true }): Promise<void> {
    return new Promise((resolve) => {
      // Close any existing modal first
      if (this.currentModal) {
        document.body.removeChild(this.currentModal);
        this.currentModal = null;
      }
      
      const dialog = this.createCompatibilityWarningDialog();
      this.currentModal = dialog;
      document.body.appendChild(dialog);
      
      // Focus management
      const firstFocusable = dialog.querySelector('button') as HTMLElement;
      firstFocusable?.focus();
      
      // Event handlers
      const closeDialog = () => {
        const dontShowAgain = dialog.querySelector('#dont-show-again-checkbox') as HTMLInputElement;
        if (dontShowAgain?.checked && options.showOnce) {
          localStorage.setItem(options.storageKey, 'true');
        }
        
        if (document.body.contains(dialog)) {
          document.body.removeChild(dialog);
        }
        this.currentModal = null;
        resolve();
      };
      
      // Close button
      dialog.querySelector('.warning-close')?.addEventListener('click', closeDialog);
      
      // Understand button
      dialog.querySelector('.btn-understand')?.addEventListener('click', closeDialog);
      
      // ESC key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeDialog();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      // Click outside to close
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          closeDialog();
        }
      });
    });
  }
  
  private getWarningIcon(level: string): string {
    switch (level) {
      case 'excellent': return '✅';
      case 'good': return '👍';
      case 'limited': return '⚠️';
      case 'poor': return '⛔';
      default: return 'ℹ️';
    }
  }
  
  private getCompatibilityTitle(level: string): string {
    switch (level) {
      case 'excellent': return '✨ Excellent Compatibility';
      case 'good': return '👍 Good Compatibility';
      case 'limited': return '⚠️ Limited Compatibility';
      case 'poor': return '⛔ Poor Compatibility';
      default: return 'ℹ️ Compatibility Information';
    }
  }
  
  private getModelDisplayName(modelKey: string): string {
    switch (modelKey) {
      case 'prewritten': return '🔄 Pre-Written Responses (0MB) - Instant & reliable';
      case 'distilbert': return '🚀 DistilBERT Q&A (65MB) - Fast responses';
      case 'qwen': return '💬 Qwen Chat (500MB) - Conversational AI';
      case 'phi3': return '🧠 Phi-3 Advanced (1.8GB) - Premium experience';
      default: return modelKey;
    }
  }
  
  // Quick compatibility check for specific features
  static checkModelCompatibility(modelKey: string): { compatible: boolean; reason?: string } {
    const compatInfo = getCompatibilityInfo();
    const browserInfo = getBrowserInfo();
    
    switch (modelKey) {
      case 'prewritten':
        return { compatible: true };
      case 'distilbert':
        return { compatible: compatInfo.aiSupport.distilbert };
      case 'qwen':
        return { 
          compatible: compatInfo.aiSupport.qwen,
          reason: !compatInfo.aiSupport.qwen ? 
            (browserInfo.os === 'iOS' ? 'iOS compatibility limitations' : 'Insufficient resources') : undefined
        };
      case 'phi3':
        return { 
          compatible: compatInfo.aiSupport.phi3,
          reason: !compatInfo.aiSupport.phi3 ? 
            (browserInfo.isMobile ? 'Mobile devices not supported' : 'Requires desktop browser') : undefined
        };
      default:
        return { compatible: false, reason: 'Unknown model' };
    }
  }
  
  // Create a compact compatibility indicator for UI
  createCompatibilityIndicator(): HTMLElement {
    const compatInfo = getCompatibilityInfo();
    const browserInfo = getBrowserInfo();
    
    const indicator = document.createElement('div');
    indicator.className = `compatibility-indicator ${compatInfo.level}`;
    indicator.innerHTML = `
      <span class="indicator-icon">${this.getWarningIcon(compatInfo.level)}</span>
      <span class="indicator-text">${browserInfo.name} ${compatInfo.level}</span>
    `;
    
    indicator.title = compatInfo.message;
    
    // Click to show full warning
    indicator.addEventListener('click', () => {
      this.showCompatibilityWarning({ showOnce: false, storageKey: 'temp', autoShow: true });
    });
    
    return indicator;
  }
}

// Export singleton instance
export const compatibilityWarningManager = new CompatibilityWarningManager();

// CSS styles for the warning dialog
export const warningDialogStyles = `
.compatibility-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 56, 15, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.compatibility-warning-modal {
  background: var(--gameboy-paper, #c7d323);
  border: 4px solid var(--gameboy-dark, #0f380f);
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.warning-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid var(--gameboy-medium, #306230);
  background: var(--gameboy-lightest, #9bbc0f);
}

.warning-title {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: var(--gameboy-dark, #0f380f);
  text-transform: uppercase;
}

.warning-close {
  background: transparent;
  border: 2px solid var(--gameboy-dark, #0f380f);
  width: 32px;
  height: 32px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: var(--gameboy-dark, #0f380f);
}

.warning-close:hover {
  background: var(--gameboy-medium, #306230);
  color: var(--gameboy-lightest, #9bbc0f);
}

.warning-body {
  padding: 20px;
  line-height: 1.5;
}

.browser-info h3,
.compatibility-status h3,
.ai-support-matrix h4,
.warnings-section h4,
.suggestions-section h4 {
  margin: 16px 0 8px 0;
  color: var(--gameboy-dark, #0f380f);
  font-weight: bold;
}

.compatibility-status {
  padding: 16px;
  margin: 16px 0;
  border: 2px solid;
}

.compatibility-status.excellent {
  background: rgba(139, 172, 15, 0.2);
  border-color: var(--gameboy-light, #8bac0f);
}

.compatibility-status.good {
  background: rgba(139, 172, 15, 0.1);
  border-color: var(--gameboy-medium, #306230);
}

.compatibility-status.limited {
  background: rgba(244, 162, 97, 0.2);
  border-color: #f4a261;
}

.compatibility-status.poor {
  background: rgba(230, 57, 70, 0.2);
  border-color: #e63946;
}

.model-support-grid {
  display: grid;
  gap: 8px;
  margin: 12px 0;
}

.model-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 2px solid var(--gameboy-medium, #306230);
}

.model-item.supported {
  background: rgba(139, 172, 15, 0.1);
}

.model-item.unsupported {
  background: rgba(0, 0, 0, 0.1);
  opacity: 0.7;
}

.model-name {
  font-weight: bold;
}

.recommended-model {
  margin-top: 12px;
  padding: 12px;
  background: rgba(139, 172, 15, 0.2);
  border: 2px solid var(--gameboy-light, #8bac0f);
}

.fallback-notice {
  margin-top: 8px;
  padding: 8px;
  background: rgba(244, 162, 97, 0.3);
  border: 1px solid #f4a261;
  font-size: 12px;
  color: var(--gameboy-dark, #0f380f);
  border-radius: 4px;
}

.warnings-section ul,
.suggestions-section ul {
  margin: 8px 0;
  padding-left: 20px;
}

.warnings-section li,
.suggestions-section li {
  margin: 4px 0;
}

.warning-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 2px solid var(--gameboy-medium, #306230);
  background: var(--gameboy-lightest, #9bbc0f);
}

.dont-show-again label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--gameboy-dark, #0f380f);
}

.btn-understand {
  background: var(--gameboy-medium, #306230);
  color: var(--gameboy-lightest, #9bbc0f);
  border: 2px solid var(--gameboy-dark, #0f380f);
  padding: 12px 24px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-understand:hover {
  background: var(--gameboy-light, #8bac0f);
  color: var(--gameboy-dark, #0f380f);
}

.compatibility-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid var(--gameboy-medium, #306230);
  font-size: 12px;
  cursor: pointer;
  background: var(--gameboy-lightest, #9bbc0f);
  color: var(--gameboy-dark, #0f380f);
}

.compatibility-indicator:hover {
  background: var(--gameboy-light, #8bac0f);
}

.compatibility-indicator.excellent { border-color: var(--gameboy-light, #8bac0f); }
.compatibility-indicator.good { border-color: var(--gameboy-medium, #306230); }
.compatibility-indicator.limited { border-color: #f4a261; }
.compatibility-indicator.poor { border-color: #e63946; }

@media (max-width: 768px) {
  .compatibility-warning-overlay {
    padding: 0;
    align-items: stretch;
  }
  
  .compatibility-warning-modal {
    width: 100%;
    height: 100vh;
    max-width: none;
    max-height: none;
    border: none;
    border-radius: 0;
    display: flex;
    flex-direction: column;
  }
  
  .warning-body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .warning-footer {
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
  }
  
  .model-support-grid {
    gap: 6px;
  }
  
  .model-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  /* Prevent viewport zoom on mobile */
  .compatibility-warning-modal * {
    font-size: max(16px, 1em);
    line-height: 1.4;
  }
}
`;