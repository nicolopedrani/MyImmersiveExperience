# 🧩 Component Library

## **Overview**

This component library provides a comprehensive reference for all UI components used in the Interactive CV Platform. Each component follows the GameBoy design system and includes responsive variants, interaction states, and accessibility features.

## **Base Components**

### **Button Components**

#### **Primary Button**
The main action button with GameBoy-style chunky appearance.

```html
<button class="button button-primary" type="button">
  Primary Action
</button>
```

```css
.button-primary {
  background: var(--gameboy-medium);
  color: var(--text-inverse);
  border: 3px solid var(--gameboy-dark);
  padding: 12px 24px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
  outline: none;
}

.button-primary:hover {
  background: var(--gameboy-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(15, 56, 15, 0.3);
}

.button-primary:active {
  background: var(--gameboy-dark);
  transform: translateY(0);
  box-shadow: none;
}

.button-primary:focus {
  outline: 3px solid var(--info);
  outline-offset: 2px;
}

.button-primary:disabled {
  background: var(--gameboy-lightest);
  color: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

**Variants:**
- **Secondary**: `button-secondary` - Outlined style for less prominent actions
- **Danger**: `button-danger` - Red accent for destructive actions  
- **Small**: `button-small` - Compact version for tight spaces
- **Large**: `button-large` - Prominent version for key actions

#### **Secondary Button**
```css
.button-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 3px solid var(--gameboy-medium);
}

.button-secondary:hover {
  background: var(--gameboy-lightest);
  border-color: var(--gameboy-dark);
}
```

#### **Icon Button**
```html
<button class="button button-icon" aria-label="Close dialog">
  <span class="icon">✕</span>
</button>
```

```css
.button-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  background: var(--gameboy-medium);
  border: 2px solid var(--gameboy-dark);
}

.button-icon .icon {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-inverse);
}
```

### **Form Components**

#### **Text Input**
```html
<div class="input-group">
  <label for="user-input" class="input-label">Your Question</label>
  <input type="text" id="user-input" class="input" placeholder="Ask me about my experience...">
</div>
```

```css
.input-group {
  margin-bottom: var(--space-md);
}

.input-label {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
  text-transform: uppercase;
}

.input {
  width: 100%;
  background: var(--gameboy-lightest);
  border: 2px solid var(--gameboy-medium);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px;
  outline: none;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.input:focus {
  border-color: var(--gameboy-dark);
  background: var(--gameboy-paper);
}

.input::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

.input:invalid {
  border-color: var(--error);
}
```

#### **Select Dropdown**
```html
<div class="select-group">
  <label for="ai-model" class="input-label">AI Model</label>
  <select id="ai-model" class="select">
    <option value="distilbert">🚀 DistilBERT Q&A</option>
    <option value="qwen">💬 Qwen Chat</option>
    <option value="phi3">🧠 Phi-3 Advanced</option>
  </select>
</div>
```

```css
.select {
  width: 100%;
  background: var(--gameboy-lightest);
  border: 2px solid var(--gameboy-medium);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px;
  cursor: pointer;
  outline: none;
  appearance: none; /* Remove default styling */
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%230f380f'><path d='M4 6l4 4 4-4'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
}

.select:hover {
  border-color: var(--gameboy-dark);
}

.select:focus {
  border-color: var(--gameboy-dark);
  background-color: var(--gameboy-paper);
}
```

## **Layout Components**

### **Modal Dialog**
```html
<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div class="modal-dialog">
    <div class="modal-header">
      <h2 id="modal-title" class="modal-title">Dialog Title</h2>
      <button class="modal-close button-icon" aria-label="Close dialog">✕</button>
    </div>
    <div class="modal-body">
      <p>Modal content goes here...</p>
    </div>
    <div class="modal-footer">
      <button class="button button-primary">Confirm</button>
      <button class="button button-secondary">Cancel</button>
    </div>
  </div>
</div>
```

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 56, 15, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  animation: fadeIn 0.3s ease-out;
}

.modal-dialog {
  background: var(--gameboy-paper);
  border: 4px solid var(--gameboy-dark);
  max-width: 90vw;
  max-height: 90vh;
  width: 500px;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  padding: var(--space-lg);
  border-bottom: 2px solid var(--gameboy-medium);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal-title {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
  text-transform: uppercase;
}

.modal-body {
  padding: var(--space-lg);
  flex: 1;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}

.modal-footer {
  padding: var(--space-lg);
  border-top: 2px solid var(--gameboy-medium);
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  flex-shrink: 0;
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Mobile responsive modal */
@media (max-width: 768px) {
  .modal-dialog {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border: none;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .button {
    width: 100%;
  }
}
```

### **Card Component**
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">🤖 AI Model Status</h3>
  </div>
  <div class="card-body">
    <p>Current model: DistilBERT Q&A</p>
    <div class="card-actions">
      <button class="button button-secondary button-small">Switch Model</button>
    </div>
  </div>
</div>
```

```css
.card {
  background: var(--gameboy-paper);
  border: 3px solid var(--gameboy-medium);
  margin-bottom: var(--space-md);
}

.card-header {
  padding: var(--space-md);
  border-bottom: 2px solid var(--gameboy-medium);
  background: var(--gameboy-lightest);
}

.card-title {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  text-transform: uppercase;
}

.card-body {
  padding: var(--space-md);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.card-actions {
  margin-top: var(--space-md);
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}
```

## **Feedback Components**

### **Progress Bar**
```html
<div class="progress-container" role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar">
    <div class="progress-fill" style="width: 65%"></div>
  </div>
  <div class="progress-text">
    <span class="progress-percentage">65%</span>
    <span class="progress-details">12.3 MB/s • 2m 34s remaining</span>
  </div>
</div>
```

```css
.progress-container {
  margin: var(--space-md) 0;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: var(--gameboy-medium);
  border: 2px solid var(--gameboy-dark);
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--gameboy-light);
  transition: width 0.3s ease;
  position: relative;
}

/* Animated stripes for active progress */
.progress-fill.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    rgba(255,255,255,0.2) 8px,
    rgba(255,255,255,0.2) 16px
  );
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% { transform: translateX(0); }
  100% { transform: translateX(32px); }
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-xs);
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--text-secondary);
}

.progress-percentage {
  font-weight: bold;
  color: var(--text-primary);
}

/* Mobile: Stack progress details vertically */
@media (max-width: 768px) {
  .progress-text {
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }
}
```

### **Loading Spinner**
```html
<div class="loading-container">
  <div class="loading-spinner" role="status" aria-label="Loading"></div>
  <div class="loading-text">Loading AI model...</div>
</div>
```

```css
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--gameboy-medium);
  border-top: 4px solid var(--gameboy-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
    border-top-color: var(--gameboy-dark);
  }
}
```

### **Alert Messages**
```html
<div class="alert alert-info" role="alert">
  <div class="alert-icon">ℹ️</div>
  <div class="alert-content">
    <div class="alert-title">Information</div>
    <div class="alert-message">Your model is loading in the background.</div>
  </div>
  <button class="alert-close button-icon" aria-label="Close alert">✕</button>
</div>
```

```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 2px solid;
  margin-bottom: var(--space-md);
  font-family: 'Courier New', monospace;
}

.alert-info {
  background: rgba(69, 123, 157, 0.1);
  border-color: var(--info);
  color: var(--info);
}

.alert-success {
  background: rgba(139, 172, 15, 0.1);
  border-color: var(--success);
  color: var(--success);
}

.alert-warning {
  background: rgba(244, 162, 97, 0.1);
  border-color: var(--warning);
  color: var(--warning);
}

.alert-error {
  background: rgba(230, 57, 70, 0.1);
  border-color: var(--error);
  color: var(--error);
}

.alert-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: var(--space-xs);
  text-transform: uppercase;
}

.alert-message {
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-primary);
}

.alert-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid currentColor;
}
```

## **Conversation Components**

### **Message Bubble**
```html
<div class="message-bubble message-user">
  <div class="message-content">What programming languages do you know?</div>
  <div class="message-meta">You • 2:34 PM</div>
</div>

<div class="message-bubble message-ai">
  <div class="message-header">
    <span class="ai-model-badge">🚀 DistilBERT</span>
  </div>
  <div class="message-content">I have experience with Python, JavaScript, TypeScript, and MATLAB...</div>
  <div class="message-meta">AI Response • 2:34 PM</div>
</div>
```

```css
.message-bubble {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  border: 2px solid var(--gameboy-medium);
  font-family: 'Courier New', monospace;
  position: relative;
}

.message-user {
  background: var(--gameboy-lightest);
  margin-left: 20%;
  border-left: 4px solid var(--info);
}

.message-ai {
  background: var(--gameboy-paper);
  margin-right: 20%;
  border-left: 4px solid var(--success);
}

.message-header {
  margin-bottom: var(--space-xs);
}

.ai-model-badge {
  background: var(--gameboy-medium);
  color: var(--text-inverse);
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  word-wrap: break-word;
}

.message-meta {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: var(--space-xs);
  text-align: right;
}

/* Mobile: Full width messages */
@media (max-width: 768px) {
  .message-user {
    margin-left: 0;
    margin-right: 10%;
  }
  
  .message-ai {
    margin-right: 0;
    margin-left: 10%;
  }
}
```

### **Model Selector**
```html
<div class="model-selector">
  <label class="model-selector-label">Choose AI Model:</label>
  <div class="model-options">
    <button class="model-option active" data-model="distilbert">
      <span class="model-icon">🚀</span>
      <span class="model-name">DistilBERT Q&A</span>
      <span class="model-size">65MB</span>
      <span class="model-status">Ready</span>
    </button>
    
    <button class="model-option" data-model="qwen">
      <span class="model-icon">💬</span>
      <span class="model-name">Qwen Chat</span>
      <span class="model-size">500MB</span>
      <span class="model-status">Loading...</span>
    </button>
    
    <button class="model-option disabled" data-model="phi3">
      <span class="model-icon">🧠</span>
      <span class="model-name">Phi-3 Advanced</span>
      <span class="model-size">1.8GB</span>
      <span class="model-status">Requires Consent</span>
    </button>
  </div>
</div>
```

```css
.model-selector {
  margin-bottom: var(--space-lg);
}

.model-selector-label {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
  text-transform: uppercase;
}

.model-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.model-option {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--gameboy-lightest);
  border: 2px solid var(--gameboy-medium);
  cursor: pointer;
  font-family: 'Courier New', monospace;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

.model-option:hover:not(.disabled) {
  background: var(--gameboy-paper);
  border-color: var(--gameboy-dark);
  transform: translateY(-1px);
}

.model-option.active {
  background: var(--gameboy-medium);
  color: var(--text-inverse);
  border-color: var(--gameboy-dark);
}

.model-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.model-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.model-name {
  font-weight: bold;
  flex: 1;
}

.model-size {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 60px;
  text-align: right;
}

.model-status {
  font-size: 12px;
  font-weight: bold;
  min-width: 100px;
  text-align: right;
}

.model-option.active .model-size,
.model-option.active .model-status {
  color: var(--text-inverse);
}

/* Mobile: Adjust layout for smaller screens */
@media (max-width: 768px) {
  .model-option {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
  
  .model-name {
    order: 1;
    flex-basis: 100%;
  }
  
  .model-icon {
    order: 2;
  }
  
  .model-size {
    order: 3;
    min-width: auto;
  }
  
  .model-status {
    order: 4;
    min-width: auto;
  }
}
```

## **Touch Components (Mobile)**

### **Touch Control Pad**
```html
<div class="touch-controls">
  <div class="movement-pad">
    <button class="direction-btn direction-up" data-direction="up">↑</button>
    <button class="direction-btn direction-down" data-direction="down">↓</button>
    <button class="direction-btn direction-left" data-direction="left">←</button>
    <button class="direction-btn direction-right" data-direction="right">→</button>
  </div>
  <div class="action-buttons">
    <button class="action-btn action-interact">A</button>
    <button class="action-btn action-menu">B</button>
  </div>
</div>
```

```css
.touch-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 56, 15, 0.9);
  backdrop-filter: blur(4px);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: var(--z-ui);
}

.movement-pad {
  position: relative;
  width: 120px;
  height: 120px;
}

.direction-btn {
  position: absolute;
  width: 40px;
  height: 40px;
  background: var(--gameboy-medium);
  border: 2px solid var(--gameboy-dark);
  color: var(--text-inverse);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
}

.direction-btn:active {
  background: var(--gameboy-dark);
  transform: scale(0.95);
}

.direction-up {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.direction-down {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.direction-left {
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.direction-right {
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.action-buttons {
  display: flex;
  gap: var(--space-md);
}

.action-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--gameboy-medium);
  border: 3px solid var(--gameboy-dark);
  color: var(--text-inverse);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.1s ease;
}

.action-btn:active {
  background: var(--gameboy-dark);
  transform: scale(0.9);
}

/* Hide touch controls on desktop */
@media (min-width: 1025px) {
  .touch-controls {
    display: none;
  }
}
```

This comprehensive component library provides all the building blocks needed to maintain consistency and implement new features within the Interactive CV Platform's GameBoy-inspired design system.