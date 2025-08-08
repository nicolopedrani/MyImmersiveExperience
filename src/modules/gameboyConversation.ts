// modules/gameboyConversation.ts - GameBoy/Pokémon-style conversation system

import { answerQuestion, switchModel, getCurrentModelKey, canRunModel, getModelCapabilityInfo, getModelDownloadState, isUserRequestedDownload, hasUserRequestedModel } from "./aiProcessor";
import { hasUserApprovedDownload } from "./modelConsent";
import { compatibilityWarningManager } from './compatibilityWarning';
import { getBrowserInfo, getCompatibilityInfo } from './browserDetection';

interface ConversationState {
  isActive: boolean;
  currentState: 'input' | 'loading' | 'response';
  currentResponse: string;
}

class GameBoyConversation {
  private state: ConversationState = {
    isActive: false,
    currentState: 'input',
    currentResponse: ''
  };

  private messageArea: HTMLDivElement | null = null;
  private statusBar: HTMLDivElement | null = null;
  private modelSelector: HTMLSelectElement | null = null;
  private inputArea: HTMLDivElement | null = null;
  private responseArea: HTMLDivElement | null = null;
  private textInput: HTMLInputElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private userResizedHeight: number = 150; // Track user's preferred height

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.statusBar = document.getElementById('status-bar') as HTMLDivElement;
    if (!this.statusBar) {
      console.error('Status bar not found');
      return;
    }

    this.createMessageArea();
  }

  private createMessageArea(): void {
    // Create expanded message area (initially hidden completely)
    this.messageArea = document.createElement('div');
    this.messageArea.id = 'gameboy-message-area';
    this.messageArea.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      color: #000;
      border: 2px solid #0a0a0a;
      border-bottom: none;
      border-radius: 8px 8px 0 0;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 14px;
      height: 0;
      overflow: hidden;
      transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 100;
      display: none;
      min-height: 150px;
      max-height: 70vh;
      resize: vertical;
    `;
    
    // Create resize handle for better UX on mobile
    const resizeHandle = document.createElement('div');
    resizeHandle.id = 'message-resize-handle';
    resizeHandle.style.cssText = `
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 6px;
      background: #ccc;
      border-radius: 3px;
      cursor: row-resize;
      margin: 4px 0;
      z-index: 130;
      touch-action: none;
    `;
    
    // Create header area for controls
    const headerArea = document.createElement('div');
    headerArea.id = 'message-header';
    headerArea.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      z-index: 110;
    `;

    // Create model selector (now inside header)
    this.modelSelector = document.createElement('select');
    this.modelSelector.id = 'conversation-model-selector';
    this.modelSelector.style.cssText = `
      background: #f0f0f0;
      color: #000;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 4px 6px;
      font-size: 12px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      cursor: pointer;
      max-width: 200px;
      flex-shrink: 1;
      z-index: 120;
      position: relative;
    `;
    // Dynamically populate model selector with capability info
    this.updateModelSelector();

    // Create close button for mobile (now inside header)
    this.closeButton = document.createElement('button');
    this.closeButton.id = 'conversation-close-button';
    this.closeButton.textContent = '✕';
    this.closeButton.style.cssText = `
      background: #f44336;
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    `;

    // Create response area (main content area)
    this.responseArea = document.createElement('div');
    this.responseArea.id = 'conversation-response-area';
    this.responseArea.style.cssText = `
      position: absolute;
      top: 46px;
      left: 8px;
      right: 8px;
      bottom: 56px;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 12px;
      overflow-y: auto;
      font-size: 13px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
      -webkit-overflow-scrolling: touch;
      z-index: 90;
    `;

    // Create input area (now at bottom with proper spacing)
    this.inputArea = document.createElement('div');
    this.inputArea.id = 'conversation-input-area';
    this.inputArea.style.cssText = `
      position: absolute;
      bottom: 8px;
      left: 8px;
      right: 8px;
      height: 40px;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    this.textInput = document.createElement('input');
    this.textInput.type = 'text';
    this.textInput.placeholder = 'Ask about my CV and experience...';
    this.textInput.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border: 2px solid #333;
      border-radius: 4px;
      background: white;
      color: #000;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: bold;
      outline: none;
    `;

    const sendButton = document.createElement('button');
    sendButton.textContent = '📤';
    sendButton.style.cssText = `
      margin-left: 8px;
      padding: 8px 12px;
      border: 2px solid #333;
      border-radius: 4px;
      background: #f0f0f0;
      color: #000;
      font-size: 14px;
      cursor: pointer;
      font-weight: bold;
    `;

    // Create response area
    this.responseArea = document.createElement('div');
    this.responseArea.id = 'conversation-response-area';
    this.responseArea.style.cssText = `
      position: absolute;
      top: 35px;
      left: 8px;
      right: 8px;
      bottom: 60px;
      padding: 8px;
      overflow-y: auto;
      line-height: 1.4;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-bottom: 1px solid #ccc;
    `;

    // Assemble the new structured layout
    this.inputArea.appendChild(this.textInput);
    this.inputArea.appendChild(sendButton);
    
    // Add model selector and close button to header
    headerArea.appendChild(this.modelSelector);
    headerArea.appendChild(this.closeButton);
    
    // Assemble the message area with proper structure
    this.messageArea.appendChild(resizeHandle);
    this.messageArea.appendChild(headerArea);
    this.messageArea.appendChild(this.responseArea);
    this.messageArea.appendChild(this.inputArea);
    
    // Add resize functionality for mobile/desktop
    this.addResizeFunctionality(resizeHandle);

    // Insert message area before status bar
    if (this.statusBar?.parentNode && this.messageArea) {
      this.statusBar.parentNode.insertBefore(this.messageArea, this.statusBar);
    }

    // Set up event listeners
    sendButton.addEventListener('click', () => this.handleSendMessage());
    this.textInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    this.modelSelector.addEventListener('change', () => this.handleModelChange());
    this.closeButton.addEventListener('click', () => this.hideConversation());

    // Global escape listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state.isActive) {
        this.hideConversation();
      }
    });
  }

  public async showConversation(): Promise<void> {
    if (!this.messageArea) return;

    // Check if we should show compatibility warning first
    if (compatibilityWarningManager.shouldShowWarning()) {
      try {
        await compatibilityWarningManager.showCompatibilityWarning();
      } catch (error) {
        console.log('Compatibility warning skipped or closed:', error);
      }
    }

    this.state.isActive = true;
    this.state.currentState = 'input';

    // Show and expand message area
    this.messageArea.style.display = 'block';
    this.messageArea.style.height = `${this.userResizedHeight}px`;

    // Update model selector with browser compatibility information
    this.updateModelSelector();

    // Ensure resize handle is properly restored
    this.restoreResizeHandle();

    // Show input elements immediately (no delay for smooth interaction)
    if (this.modelSelector) this.modelSelector.style.opacity = '1';
    if (this.closeButton) this.closeButton.style.opacity = '1';
    if (this.inputArea) this.inputArea.style.opacity = '1';
    if (this.textInput) {
      this.textInput.focus();
    }

    // Hide status bar text
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.style.opacity = '0';
    }
  }

  public hideConversation(): void {
    if (!this.messageArea) return;

    this.state.isActive = false;

    // Hide all elements
    if (this.modelSelector) this.modelSelector.style.opacity = '0';
    if (this.closeButton) this.closeButton.style.opacity = '0';
    if (this.inputArea) this.inputArea.style.opacity = '0';
    if (this.responseArea) this.responseArea.style.opacity = '0';

    // Clear input and response
    if (this.textInput) this.textInput.value = '';
    if (this.responseArea) this.responseArea.textContent = '';

    // Reset to default size when closing chat
    console.log(`🔄 Resetting message area from ${this.userResizedHeight}px to default 150px`);
    this.userResizedHeight = 150;

    // Collapse and hide message area completely
    this.messageArea.style.height = '0';
    setTimeout(() => {
      if (this.messageArea) {
        this.messageArea.style.display = 'none';
      }
    }, 200);

    // Show status bar text
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.style.opacity = '1';
    }
  }

  public isConversationActive(): boolean {
    return this.state.isActive;
  }

  private restoreResizeHandle(): void {
    if (!this.messageArea) return;
    
    const resizeHandle = this.messageArea.querySelector('#message-resize-handle') as HTMLElement;
    if (resizeHandle) {
      console.log('🔧 Restoring resize handle visibility and properties');
      
      // Force restore the handle's CSS properties
      resizeHandle.style.cssText = `
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 6px;
        background: #ccc;
        border-radius: 3px;
        cursor: row-resize;
        margin: 4px 0;
        z-index: 130;
        touch-action: none;
        display: block;
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
      `;
      
      // Force a reflow to ensure changes are applied
      resizeHandle.offsetHeight;
      
      console.log('✅ Resize handle restored');
    } else {
      console.warn('⚠️ Resize handle not found in message area');
    }
  }

  private async handleSendMessage(): Promise<void> {
    if (!this.textInput || !this.textInput.value.trim()) return;

    const question = this.textInput.value.trim();
    this.textInput.value = '';

    // Switch to loading state
    this.state.currentState = 'loading';
    this.showLoadingState();

    try {
      // Get AI response
      const response = await answerQuestion(question);
      
      // Show response
      this.showResponse(response);
    } catch (error) {
      console.error('Error getting AI response:', error);
      this.showResponse('Sorry, I had trouble processing your question. Please try again.');
    }
  }

  private showLoadingState(): void {
    if (!this.inputArea || !this.responseArea) return;

    // Keep input visible but disabled, show loading in response area
    if (this.textInput) {
      this.textInput.disabled = true;
      this.textInput.placeholder = 'Thinking...';
    }
    this.responseArea.style.opacity = '1';
    this.responseArea.textContent = 'Thinking...';

    this.state.currentState = 'loading';
  }

  private showResponse(response: string): void {
    if (!this.responseArea) return;

    this.state.currentResponse = response;
    this.responseArea.textContent = response;
    this.state.currentState = 'response';

    // Re-enable input for smooth conversation flow
    if (this.textInput) {
      this.textInput.disabled = false;
      this.textInput.placeholder = 'Ask about my CV and experience...';
      this.textInput.focus(); // Keep focus for immediate next question
    }

    // Keep both response and input visible for smooth conversation
    if (this.responseArea) this.responseArea.style.opacity = '1';
    if (this.inputArea) this.inputArea.style.opacity = '1';
  }

  public handleSpaceInConversation(): void {
    // No longer needed - conversation is always ready for input
    // ESC key will be used to exit conversation instead
  }

  private updateModelSelector(): void {
    if (!this.modelSelector) return;

    const compatInfo = getCompatibilityInfo();
    const browserInfo = getBrowserInfo();
    
    const models = [
      { key: 'prewritten', icon: '🔄', name: 'Pre-Written Responses', size: '0MB', description: 'Instant & reliable' },
      { key: 'distilbert', icon: '🚀', name: 'DistilBERT Q&A', size: '65MB', description: 'Fast responses' },
      { key: 'qwen', icon: '💬', name: 'Qwen Chat', size: '500MB', description: 'Conversational AI' },
      { key: 'phi3', icon: '🧠', name: 'Phi-3 Advanced', size: '1.8GB', description: 'Premium experience' }
    ];

    // Set current model as default
    this.modelSelector.value = getCurrentModelKey();

    this.modelSelector.innerHTML = models.map(model => {
      const isSupported = compatInfo.aiSupport[model.key as keyof typeof compatInfo.aiSupport];
      const isRecommended = compatInfo.recommendedModel === model.key;
      
      let statusText = '';
      let optionText = '';
      
      // Pre-written responses are always supported
      if (model.key === 'prewritten') {
        statusText = isRecommended ? ' - Recommended' : '';
        optionText = `${model.icon} ${model.name} (${model.size}) - ${model.description}${statusText}`;
      } else if (!isSupported) {
        // For unsupported AI models, make it clear they are disabled
        if (browserInfo.os === 'iOS') {
          statusText = ' - Not compatible with iOS';
        } else if (model.key === 'phi3' && browserInfo.isMobile) {
          statusText = ' - Desktop only';
        } else {
          statusText = ' - Not compatible';
        }
        // Use grayed out text for disabled options
        optionText = `${model.icon} ${model.name} (${model.size})${statusText}`;
      } else {
        // For supported AI models, show full description
        statusText = isRecommended ? ' - Recommended' : '';
        optionText = `${model.icon} ${model.name} (${model.size}) - ${model.description}${statusText}`;
      }
      
      // Only disable AI models that aren't supported, never disable prewritten
      const shouldDisable = model.key !== 'prewritten' && !isSupported;
      return `<option value="${model.key}" ${shouldDisable ? 'disabled style="color: #666; background: #f0f0f0;"' : ''}>
        ${optionText}
      </option>`;
    }).join('');
    
    // Always default to prewritten responses (user-driven upgrades only)
    this.modelSelector.value = 'prewritten';
    
    // Ensure we're actually using prewritten responses (no auto-switching)
    const currentModel = getCurrentModelKey();
    if (currentModel !== 'prewritten') {
      console.log(`🔄 Setting active model to prewritten (was: ${currentModel})`);
      switchModel('prewritten');
    }
    
    // Add mobile-specific improvements for the dropdown
    if (browserInfo.isMobile) {
      this.modelSelector.style.fontSize = '16px'; // Prevent zoom on iOS
      this.modelSelector.style.userSelect = 'none';
      this.modelSelector.style.webkitUserSelect = 'none';
      
      // Add touch-friendly styling
      this.modelSelector.style.minHeight = '44px'; // iOS recommended touch target
      this.modelSelector.style.padding = '12px 8px';
      this.modelSelector.style.borderRadius = '8px';
      this.modelSelector.style.border = '2px solid #333';
      this.modelSelector.style.background = 'white';
      this.modelSelector.style.color = '#000';
      
      // Ensure dropdown appears above ALL other elements including response area  
      this.modelSelector.style.zIndex = '150';
      this.modelSelector.style.position = 'relative';
    }
  }

  private async handleModelChange(): Promise<void> {
    if (!this.modelSelector) return;

    const selectedModel = this.modelSelector.value;
    console.log(`🔄 Switching to ${selectedModel} model...`);
    
    const modelNames: { [key: string]: string } = {
      'distilbert': 'DistilBERT Q&A',
      'qwen': 'Qwen Chat', 
      'phi3': 'Phi-3 Advanced'
    };

    // Check if this is Phi-3 and user has ALREADY EXPLICITLY REQUESTED it
    if (selectedModel === 'phi3') {
      const downloadState = getModelDownloadState('phi3');
      const userApproved = hasUserApprovedDownload('phi3');
      const userRequestedDownload = isUserRequestedDownload('phi3');
      
      console.log(`🔍 Phi-3 switch check:`, {
        userApproved,
        userRequestedDownload,
        downloadStatus: downloadState.status,
        progress: downloadState.progress
      });
      
      // ONLY show progress if user explicitly requested AND approved this download
      if (userApproved && userRequestedDownload && downloadState.status === 'downloading') {
        console.log(`📊 User requested and approved - showing progress for active download`);
        this.showDownloadProgress(selectedModel, modelNames[selectedModel]);
        return;
      }
      
      // In all other cases (first time, background only, etc.), let switchModel handle the consent dialog
      console.log(`🚀 First time or background only - will show consent dialog`);
    }
    
    // Show loading state during model switch
    if (this.responseArea) {
      this.responseArea.style.opacity = '1';
      this.responseArea.textContent = `Switching to ${modelNames[selectedModel] || selectedModel}...`;
    }

    try {
      const success = await switchModel(selectedModel);
      if (success) {
        if (this.responseArea) {
          this.responseArea.textContent = `✅ Switched to ${modelNames[selectedModel] || selectedModel}!`;
        }
        setTimeout(() => {
          if (this.responseArea) this.responseArea.style.opacity = '0';
          if (this.inputArea) this.inputArea.style.opacity = '1';
        }, 1000);
      } else {
        if (this.responseArea) {
          this.responseArea.textContent = `❌ Failed to switch to ${selectedModel}. Try again later.`;
        }
        // Reset selector
        this.modelSelector.value = getCurrentModelKey();
      }
    } catch (error) {
      console.error('Error switching model:', error);
      if (this.responseArea) {
        this.responseArea.textContent = '❌ Error switching models. Try again later.';
      }
    }
  }

  private showDownloadProgress(modelKey: string, modelName: string): void {
    if (!this.responseArea) return;
    
    console.log(`📊 Showing download progress UI for ${modelKey}`);
    this.responseArea.style.opacity = '1';
    
    // Create progress display in conversation area
    this.responseArea.innerHTML = `
      <div style="text-align: center; padding: 15px;">
        <div style="margin-bottom: 10px;">
          <strong>🧠 ${modelName} is downloading...</strong>
        </div>
        
        <div style="background: #f0f0f0; border-radius: 10px; height: 8px; margin: 10px 0; overflow: hidden;">
          <div id="conv-progress-bar" style="background: linear-gradient(90deg, #007bff, #0056b3); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
        </div>
        
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 10px;">
          <span id="conv-progress-percent">0%</span>
          <span id="conv-download-speed">Calculating...</span>
          <span id="conv-time-remaining">Estimating...</span>
        </div>
        
        <div style="font-size: 10px; color: #888;">
          💡 You can continue chatting with other models while this downloads
        </div>
      </div>
    `;

    // Start real-time progress updates
    const updateInterval = setInterval(() => {
      const downloadState = getModelDownloadState(modelKey);
      
      const progressBar = this.responseArea?.querySelector('#conv-progress-bar') as HTMLDivElement;
      const progressPercent = this.responseArea?.querySelector('#conv-progress-percent') as HTMLSpanElement;
      const downloadSpeed = this.responseArea?.querySelector('#conv-download-speed') as HTMLSpanElement;
      const timeRemaining = this.responseArea?.querySelector('#conv-time-remaining') as HTMLSpanElement;

      if (!progressBar || !this.responseArea) {
        console.log(`❌ Progress elements not found, clearing interval for ${modelKey}`);
        clearInterval(updateInterval);
        return;
      }
      
      console.log(`📊 Updating progress UI:`, {
        modelKey,
        status: downloadState.status,
        progress: downloadState.progress,
        speed: downloadState.speed
      });

      const percent = Math.round(downloadState.progress * 100);
      progressBar.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;
      
      if (downloadState.speed > 0) {
        downloadSpeed.textContent = `${downloadState.speed.toFixed(1)} MB/s`;
      } else {
        downloadSpeed.textContent = 'Calculating...';
      }
      
      if (downloadState.timeRemaining > 60) {
        timeRemaining.textContent = `${Math.round(downloadState.timeRemaining / 60)}m left`;
      } else if (downloadState.timeRemaining > 0) {
        timeRemaining.textContent = `${Math.round(downloadState.timeRemaining)}s left`;
      } else {
        timeRemaining.textContent = 'Estimating...';
      }

      // Check if download completed
      if (downloadState.status === 'completed') {
        clearInterval(updateInterval);
        if (this.responseArea) {
          this.responseArea.innerHTML = `
            <div style="text-align: center; padding: 15px; color: #28a745;">
              ✅ <strong>${modelName} ready!</strong><br>
              <span style="font-size: 11px;">Switching to advanced AI model...</span>
            </div>
          `;
        }
        
        // Auto-switch to the completed model
        setTimeout(async () => {
          try {
            await switchModel(modelKey);
            if (this.responseArea) {
              this.responseArea.style.opacity = '0';
            }
            if (this.inputArea) {
              this.inputArea.style.opacity = '1';
            }
          } catch (error) {
            console.error('Failed to switch to completed model:', error);
          }
        }, 2000);
      }
    }, 1000); // Update every second
  }

  private addResizeFunctionality(resizeHandle: HTMLElement): void {
    console.log('🔧 Setting up resize functionality');
    
    let isResizing = false;
    let startY = 0;
    let startHeight = 0;
    let originalTransition = '';
    let resizeState = 'idle'; // Track resize state for debugging
    
    // Add visual feedback to resize handle
    resizeHandle.style.transition = 'background 0.2s ease';
    resizeHandle.style.cursor = 'row-resize';
    
    // Hover effects
    const handleMouseEnter = () => {
      if (!isResizing) {
        resizeHandle.style.background = '#bbb';
        console.log('🎯 Resize handle hover');
      }
    };
    
    const handleMouseLeave = () => {
      if (!isResizing) {
        resizeHandle.style.background = '#ccc';
      }
    };
    
    // Clean up function for event listeners  
    const cleanupResizeListeners = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
      console.log('🧹 Cleaned up resize listeners');
    };
    
    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      console.log('🖱️ Resize handle mousedown triggered');
      
      if (!this.messageArea) {
        console.warn('❌ No message area found');
        return;
      }
      
      if (isResizing) {
        console.warn('⚠️ Already resizing, ignoring');
        return;
      }
      
      isResizing = true;
      resizeState = 'starting';
      startY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      startHeight = this.messageArea.offsetHeight;
      
      console.log(`📏 Starting resize from height: ${startHeight}px, Y: ${startY}`);
      
      // Disable transition during resize for smooth performance
      originalTransition = this.messageArea.style.transition;
      this.messageArea.style.transition = 'none';
      
      // Visual feedback
      resizeHandle.style.background = '#999';
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      resizeState = 'active';
      
      // Add temporary event listeners
      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onMouseMove, { passive: false });
      document.addEventListener('touchend', onMouseUp);
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizing || !this.messageArea) {
        console.warn('⚠️ MouseMove called but not resizing or no message area');
        return;
      }
      
      const currentY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      const deltaY = startY - currentY; // Drag up = bigger, drag down = smaller
      
      // Calculate new height with better constraints
      const minHeight = 150;
      const maxHeight = Math.min(window.innerHeight * 0.85, 800);
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
      
      // Apply the height change immediately for smooth resizing
      this.messageArea.style.height = `${newHeight}px`;
      this.userResizedHeight = newHeight;
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    const onMouseUp = (e?: Event) => {
      if (!isResizing) {
        console.log('🔄 MouseUp called but not resizing - ignoring');
        return;
      }
      
      console.log('🏁 Ending resize operation');
      
      if (this.messageArea) {
        // Save the final height as user preference
        this.userResizedHeight = this.messageArea.offsetHeight;
        console.log(`💾 Final height saved: ${this.userResizedHeight}px`);
        
        // Restore transition after resize is complete
        this.messageArea.style.transition = originalTransition;
      }
      
      // Reset state and visual feedback
      isResizing = false;
      resizeState = 'idle';
      resizeHandle.style.background = '#ccc';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Clean up temporary event listeners
      cleanupResizeListeners();
      
      console.log('✅ Resize completed, ready for next resize');
      
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    // Add permanent event listeners to the handle
    resizeHandle.addEventListener('mousedown', onMouseDown);
    resizeHandle.addEventListener('touchstart', onMouseDown, { passive: false });
    resizeHandle.addEventListener('mouseenter', handleMouseEnter);
    resizeHandle.addEventListener('mouseleave', handleMouseLeave);
    
    console.log('✅ Resize functionality setup complete');
  }
}

// Create global instance
const gameBoyConversation = new GameBoyConversation();

export { gameBoyConversation };