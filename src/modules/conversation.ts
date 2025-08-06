// modules/conversation.ts - Conversation UI and management system

export interface ConversationMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export class ConversationSystem {
  private isActive: boolean = false;
  private conversationHistory: ConversationMessage[] = [];
  private modalElement: HTMLDivElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private messagesContainer: HTMLDivElement | null = null;
  private onAnswerCallback?: (question: string) => Promise<string>;
  private onModelSwitchCallback?: (modelName: string) => Promise<boolean>;

  constructor() {
    this.createConversationUI();
  }

  private createConversationUI(): void {
    // Create modal backdrop
    this.modalElement = document.createElement("div");
    this.modalElement.id = "conversation-modal";
    this.modalElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      z-index: 2000;
      justify-content: center;
      align-items: center;
    `;

    // Create conversation container
    const conversationContainer = document.createElement("div");
    conversationContainer.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      border-radius: 20px;
      width: 90%;
      max-width: 600px;
      height: 80%;
      max-height: 500px;
      display: flex;
      flex-direction: column;
      border: 4px solid #FFD700;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
    `;

    // Header
    const header = document.createElement("div");
    header.style.cssText = `
      background: linear-gradient(90deg, #FFD700, #FFA500);
      color: #1a1a2e;
      padding: 15px 20px;
      border-radius: 16px 16px 0 0;
      font-family: Arial, sans-serif;
      font-weight: bold;
      font-size: 18px;
      text-align: center;
      position: relative;
    `;
    header.innerHTML = `
      <div>💼 Chat with Nicolo Pedrani</div>
      <div style="font-size: 12px; font-weight: normal; margin-top: 3px;">Ask me about my professional experience and skills</div>
      <div style="font-size: 11px; margin-top: 5px; display: flex; align-items: center; gap: 10px;">
        <span>🤖 AI Model:</span>
        <select id="model-selector" style="
          background: rgba(26,26,46,0.3);
          color: #1a1a2e;
          border: 1px solid rgba(26,26,46,0.3);
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 10px;
          font-weight: bold;
          cursor: pointer;
        ">
          <option value="qwen">💬 Qwen Chat (~500MB)</option>
          <option value="distilbert">❓ DistilBERT Q&A (~65MB)</option>
        </select>
      </div>
      <button id="close-conversation" style="
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #1a1a2e;
        font-weight: bold;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      " onmouseover="this.style.background='rgba(26,26,46,0.1)'" onmouseout="this.style.background='none'">×</button>
    `;

    // Messages container
    this.messagesContainer = document.createElement("div");
    this.messagesContainer.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
    `;

    // Input area
    const inputArea = document.createElement("div");
    inputArea.style.cssText = `
      padding: 20px;
      border-top: 2px solid #333;
      display: flex;
      gap: 10px;
      align-items: center;
    `;

    this.inputElement = document.createElement("input");
    this.inputElement.type = "text";
    this.inputElement.placeholder = "Ask me about my experience, skills, projects...";
    this.inputElement.style.cssText = `
      flex: 1;
      padding: 12px 15px;
      border: 2px solid #444;
      border-radius: 25px;
      background: #2a2a3e;
      color: white;
      font-family: Arial, sans-serif;
      font-size: 14px;
      outline: none;
      transition: border-color 0.3s;
    `;

    const sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    sendButton.style.cssText = `
      padding: 12px 20px;
      background: linear-gradient(90deg, #FFD700, #FFA500);
      color: #1a1a2e;
      border: none;
      border-radius: 25px;
      font-family: Arial, sans-serif;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
    `;

    // Assemble the UI
    conversationContainer.appendChild(header);
    conversationContainer.appendChild(this.messagesContainer);
    inputArea.appendChild(this.inputElement);
    inputArea.appendChild(sendButton);
    conversationContainer.appendChild(inputArea);
    this.modalElement.appendChild(conversationContainer);
    document.body.appendChild(this.modalElement);

    // Event listeners
    const closeButton = header.querySelector("#close-conversation") as HTMLButtonElement;
    closeButton.addEventListener("click", () => this.closeConversation());

    sendButton.addEventListener("click", () => this.handleSendMessage());
    this.inputElement.addEventListener("keydown", (e) => {
      // Stop event propagation to prevent game controls from interfering
      e.stopPropagation();
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    this.inputElement.addEventListener("keyup", (e) => {
      // Stop event propagation to prevent game controls from interfering
      e.stopPropagation();
    });

    this.inputElement.addEventListener("focus", () => {
      this.inputElement!.style.borderColor = "#FFD700";
    });

    this.inputElement.addEventListener("blur", () => {
      this.inputElement!.style.borderColor = "#444";
    });

    sendButton.addEventListener("mouseenter", () => {
      sendButton.style.transform = "scale(1.05)";
    });

    sendButton.addEventListener("mouseleave", () => {
      sendButton.style.transform = "scale(1)";
    });

    // Model selector event listener
    const modelSelector = header.querySelector("#model-selector") as HTMLSelectElement;
    modelSelector.addEventListener("change", async (e) => {
      const selectedModel = (e.target as HTMLSelectElement).value;
      console.log(`🔄 Player selected AI model: ${selectedModel}`);
      
      if (this.onModelSwitchCallback) {
        // Show loading message
        this.addMessage({
          type: 'ai',
          content: `🔄 Switching to ${selectedModel === 'qwen' ? 'Qwen Chat' : 'DistilBERT Q&A'} model, please wait...`,
          timestamp: new Date()
        });
        
        try {
          const success = await this.onModelSwitchCallback(selectedModel);
          if (success) {
            this.addMessage({
              type: 'ai',
              content: `✅ Successfully switched to ${selectedModel === 'qwen' ? 'Qwen Chat model! I can now have more natural conversations with you.' : 'DistilBERT Q&A model! I can now answer your questions more precisely.'}`,
              timestamp: new Date()
            });
          } else {
            this.addMessage({
              type: 'ai',
              content: `❌ Failed to switch to ${selectedModel} model. I'll continue using the current model.`,
              timestamp: new Date()
            });
            // Reset selector to previous model
            modelSelector.value = selectedModel === 'qwen' ? 'distilbert' : 'qwen';
          }
        } catch (error) {
          console.error("Error switching model:", error);
          this.addMessage({
            type: 'ai',
            content: "❌ Error occurred while switching models. I'll continue using the current model.",
            timestamp: new Date()
          });
          // Reset selector to previous model
          modelSelector.value = selectedModel === 'qwen' ? 'distilbert' : 'qwen';
        }
      }
    });

    // Close on backdrop click
    this.modalElement.addEventListener("click", (e) => {
      if (e.target === this.modalElement) {
        this.closeConversation();
      }
    });

    // Escape key to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isActive) {
        this.closeConversation();
      }
    });
  }

  public showConversation(): void {
    if (this.modalElement) {
      this.modalElement.style.display = "flex";
      this.isActive = true;
      
      // Focus input after a brief delay
      setTimeout(() => {
        if (this.inputElement) {
          this.inputElement.focus();
          this.inputElement.click(); // Ensure mobile keyboards open
        }
      }, 200);

      // Add welcome message if this is the first conversation
      if (this.conversationHistory.length === 0) {
        this.addMessage({
          type: 'ai',
          content: "Hello! I'm Nicolo Pedrani. Feel free to ask me anything about my professional experience, technical skills, projects, or career background. You can also choose which AI model to use from the dropdown above! What would you like to know?",
          timestamp: new Date()
        });
      }
    }
  }

  public closeConversation(): void {
    if (this.modalElement) {
      this.modalElement.style.display = "none";
      this.isActive = false;
    }
  }

  public isConversationActive(): boolean {
    return this.isActive;
  }

  public setAnswerCallback(callback: (question: string) => Promise<string>): void {
    this.onAnswerCallback = callback;
  }

  public setModelSwitchCallback(callback: (modelName: string) => Promise<boolean>): void {
    this.onModelSwitchCallback = callback;
  }

  public updateModelSelector(currentModel: string): void {
    const modelSelector = document.querySelector("#model-selector") as HTMLSelectElement;
    if (modelSelector) {
      modelSelector.value = currentModel;
    }
  }

  private async handleSendMessage(): Promise<void> {
    if (!this.inputElement || !this.inputElement.value.trim()) return;

    const userMessage = this.inputElement.value.trim();
    this.inputElement.value = "";

    // Add user message
    this.addMessage({
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Get AI response
      const aiResponse = this.onAnswerCallback 
        ? await this.onAnswerCallback(userMessage)
        : "I'm sorry, the AI system is not yet connected. Please try again later.";

      // Remove typing indicator
      this.hideTypingIndicator();

      // Add AI response
      this.addMessage({
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error getting AI response:", error);
      this.hideTypingIndicator();
      this.addMessage({
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your question right now. Please try asking something else.",
        timestamp: new Date()
      });
    }
  }

  private addMessage(message: ConversationMessage): void {
    this.conversationHistory.push(message);
    
    if (!this.messagesContainer) return;

    const messageElement = document.createElement("div");
    messageElement.style.cssText = `
      display: flex;
      ${message.type === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
      margin-bottom: 10px;
    `;

    const bubble = document.createElement("div");
    bubble.style.cssText = `
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      ${message.type === 'user' 
        ? 'background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a1a2e; border-bottom-right-radius: 6px;'
        : 'background: #2a2a3e; color: white; border-bottom-left-radius: 6px; border: 1px solid #444;'
      }
    `;
    bubble.textContent = message.content;

    messageElement.appendChild(bubble);
    this.messagesContainer.appendChild(messageElement);

    // Scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private showTypingIndicator(): void {
    if (!this.messagesContainer) return;

    const typingElement = document.createElement("div");
    typingElement.id = "typing-indicator";
    typingElement.style.cssText = `
      display: flex;
      justify-content: flex-start;
      margin-bottom: 10px;
    `;

    const typingBubble = document.createElement("div");
    typingBubble.style.cssText = `
      background: #2a2a3e;
      color: #888;
      padding: 12px 16px;
      border-radius: 18px;
      border-bottom-left-radius: 6px;
      border: 1px solid #444;
      font-family: Arial, sans-serif;
      font-size: 14px;
      animation: typingPulse 1.5s infinite;
    `;
    typingBubble.textContent = "Nicolo is typing...";

    // Add typing animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes typingPulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `;
    if (!document.head.querySelector('style[data-typing]')) {
      style.setAttribute('data-typing', 'true');
      document.head.appendChild(style);
    }

    typingElement.appendChild(typingBubble);
    this.messagesContainer.appendChild(typingElement);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private hideTypingIndicator(): void {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  public getConversationHistory(): ConversationMessage[] {
    return [...this.conversationHistory];
  }

  public clearConversation(): void {
    this.conversationHistory = [];
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = "";
    }
  }
}