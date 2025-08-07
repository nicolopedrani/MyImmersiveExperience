// modules/gameboyConversation.ts - GameBoy/Pokémon-style conversation system

import { answerQuestion, switchModel, getCurrentModelKey, canRunModel, getModelCapabilityInfo, getModelDownloadState, isUserRequestedDownload, hasUserRequestedModel } from "./aiProcessor";
import { hasUserApprovedDownload } from "./modelConsent";

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
      transition: height 0.3s ease-in-out;
      z-index: 10;
      display: none;
    `;

    // Create model selector
    this.modelSelector = document.createElement('select');
    this.modelSelector.id = 'conversation-model-selector';
    this.modelSelector.style.cssText = `
      position: absolute;
      top: 8px;
      left: 8px;
      background: #f0f0f0;
      color: #000;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 2px 4px;
      font-size: 10px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    // Dynamically populate model selector with capability info
    this.updateModelSelector();

    // Create close button for mobile
    this.closeButton = document.createElement('button');
    this.closeButton.id = 'conversation-close-button';
    this.closeButton.textContent = '✕';
    this.closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 20;
    `;

    // Create input area
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
      opacity: 0;
      transition: opacity 0.3s ease;
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

    // Assemble the message area
    this.inputArea.appendChild(this.textInput);
    this.inputArea.appendChild(sendButton);
    
    this.messageArea.appendChild(this.modelSelector);
    this.messageArea.appendChild(this.closeButton);
    this.messageArea.appendChild(this.inputArea);
    this.messageArea.appendChild(this.responseArea);

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

  public showConversation(): void {
    if (!this.messageArea) return;

    this.state.isActive = true;
    this.state.currentState = 'input';

    // Show and expand message area
    this.messageArea.style.display = 'block';
    this.messageArea.style.height = '150px';

    // Update model selector
    if (this.modelSelector) {
      this.modelSelector.value = getCurrentModelKey();
    }

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

    // Collapse and hide message area completely
    this.messageArea.style.height = '0';
    setTimeout(() => {
      if (this.messageArea) {
        this.messageArea.style.display = 'none';
      }
    }, 300);

    // Show status bar text
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.style.opacity = '1';
    }
  }

  public isConversationActive(): boolean {
    return this.state.isActive;
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

    const models = [
      { key: 'distilbert', icon: '❓', name: 'DistilBERT Q&A', size: '65MB' },
      { key: 'qwen', icon: '💬', name: 'Qwen Chat', size: '500MB' },
      { key: 'phi3', icon: '🧠', name: 'Phi-3 Advanced', size: '1.8GB', badge: 'NEW!' }
    ];

    this.modelSelector.innerHTML = models.map(model => {
      const capability = canRunModel(model.key);
      const disabled = !capability.canRun;
      const badge = model.badge ? ` ⭐${model.badge}` : '';
      const warning = disabled && capability.reason ? ` (${capability.reason})` : '';
      
      return `<option value="${model.key}" ${disabled ? 'disabled' : ''}>
        ${model.icon} ${model.name} (${model.size})${badge}${warning}
      </option>`;
    }).join('');
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
}

// Create global instance
const gameBoyConversation = new GameBoyConversation();

export { gameBoyConversation };