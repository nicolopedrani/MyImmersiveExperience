# Practical Usage Examples
## @huggingface/transformers Integration & Vite Configuration

> **Source**: Official HuggingFace Transformers.js documentation, community examples, and production implementations

---

## Table of Contents
1. [Basic CDN Usage Examples](#basic-cdn-usage-examples)
2. [Vite Configuration Examples](#vite-configuration-examples)
3. [Model Loading Patterns](#model-loading-patterns)
4. [Qwen1.5-0.5B-Chat Examples](#qwen15-0.5b-chat-examples)
5. [DistilBERT Q&A Examples](#distilbert-qa-examples)
6. [Error Handling Patterns](#error-handling-patterns)
7. [Progressive Loading Examples](#progressive-loading-examples)
8. [Browser Compatibility Examples](#browser-compatibility-examples)

---

## Basic CDN Usage Examples

### Example 1: Simple CDN Import (Recommended for GitHub Pages)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Transformers.js CDN Example</title>
</head>
<body>
    <div id="status">Loading...</div>
    <div id="output"></div>

    <script type="module">
        // Direct CDN import - no build process needed
        import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1';
        
        // Configure environment for static sites
        env.allowRemoteModels = true;
        env.allowLocalModels = false;
        
        async function main() {
            const status = document.getElementById('status');
            const output = document.getElementById('output');
            
            try {
                status.textContent = 'Loading AI model...';
                
                const classifier = await pipeline(
                    'sentiment-analysis',
                    'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
                );
                
                status.textContent = 'Ready!';
                
                const result = await classifier('I love this project!');
                output.textContent = JSON.stringify(result, null, 2);
                
            } catch (error) {
                status.textContent = 'Error: ' + error.message;
            }
        }
        
        main();
    </script>
</body>
</html>
```

### Example 2: ES Module Pattern for TypeScript Projects
```typescript
// main.ts
import { pipeline, env, Pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1';

// Configure for production
env.allowRemoteModels = true;
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 1; // Conservative for compatibility

class AIService {
    private generator: Pipeline | null = null;
    private qa: Pipeline | null = null;
    
    async initialize(): Promise<boolean> {
        try {
            // Load multiple models concurrently
            const [generatorModel, qaModel] = await Promise.allSettled([
                pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
                    device: 'webgpu',
                    dtype: 'q4'
                }),
                pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad', {
                    device: 'cpu'
                })
            ]);
            
            this.generator = generatorModel.status === 'fulfilled' ? generatorModel.value : null;
            this.qa = qaModel.status === 'fulfilled' ? qaModel.value : null;
            
            return this.generator !== null || this.qa !== null;
        } catch (error) {
            console.error('AI initialization failed:', error);
            return false;
        }
    }
    
    async generateResponse(prompt: string): Promise<string> {
        if (this.generator) {
            const result = await this.generator(prompt, { max_new_tokens: 100 });
            return result[0].generated_text;
        }
        return "AI model not available";
    }
}

export default AIService;
```

---

## Vite Configuration Examples

### Example 1: Minimal Vite Config for CDN Approach (Recommended)
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/MyImmersiveExperience/', // GitHub Pages repository name
  
  // Minimal config - let CDN handle transformers.js
  build: {
    target: 'es2022', // Modern browsers for WebGPU support
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep game logic separate from potential AI bundle
          game: ['./src/modules/canvas.ts', './src/modules/player.ts'],
        }
      }
    }
  },
  
  // Development server
  server: {
    port: 5173,
    open: true
  },
  
  // Type checking
  esbuild: {
    target: 'es2022'
  }
});
```

### Example 2: Advanced Vite Config for NPM Package (If Using npm install)
```typescript
// vite.config.ts - For bundled approach (more complex)
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/MyImmersiveExperience/',
  
  // Handle Node.js polyfills for browser
  define: {
    global: 'globalThis',
    process: { env: {} }
  },
  
  resolve: {
    alias: {
      // Required for @huggingface/transformers compatibility
      'fs': 'memfs',
      'path': 'path-browserify',
      'crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
      'util': 'util',
      'buffer': 'buffer'
    }
  },
  
  optimizeDeps: {
    include: [
      '@huggingface/transformers',
      'buffer',
      'util'
    ],
    exclude: [
      // Large WASM/binary files
      'onnxruntime-web',
      'sharp'
    ]
  },
  
  build: {
    target: 'es2022',
    rollupOptions: {
      external: [
        // Don't bundle these - load from CDN
        'onnxruntime-web'
      ],
      plugins: [
        // Handle WASM files
        {
          name: 'wasm-pack',
          load(id) {
            if (id.endsWith('.wasm')) {
              return `export default "${id}"`;
            }
          }
        }
      ]
    },
    // Increase chunk size warning limit for AI models
    chunkSizeWarningLimit: 2000
  },
  
  worker: {
    format: 'es'
  }
});
```

### Example 3: Package.json for NPM Approach
```json
{
  "name": "ai-portfolio-game",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@huggingface/transformers": "^3.7.1"
  },
  "devDependencies": {
    "vite": "^7.0.6",
    "@types/node": "^24.1.0",
    "buffer": "^6.0.3",
    "crypto-browserify": "^3.12.0",
    "memfs": "^4.6.0",
    "path-browserify": "^1.0.1",
    "stream-browserify": "^3.0.0",
    "util": "^0.12.5"
  }
}
```

---

## Model Loading Patterns

### Example 1: Progressive Loading with User Feedback
```typescript
// progressiveLoader.ts
interface LoadingProgress {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress: number;
  message: string;
}

class ProgressiveModelLoader {
  private listeners: ((progress: LoadingProgress) => void)[] = [];
  
  onProgress(callback: (progress: LoadingProgress) => void) {
    this.listeners.push(callback);
  }
  
  private notify(progress: LoadingProgress) {
    this.listeners.forEach(cb => cb(progress));
  }
  
  async loadModel(modelName: string, task: string) {
    this.notify({ status: 'loading', progress: 0, message: 'Initializing...' });
    
    try {
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
      
      this.notify({ status: 'loading', progress: 20, message: 'Downloading model files...' });
      
      const model = await pipeline(task, modelName, {
        progress_callback: (data) => {
          if (data.status === 'downloading') {
            const progress = 20 + (data.progress || 0) * 0.7; // 20% to 90%
            this.notify({ 
              status: 'loading', 
              progress, 
              message: `Downloading: ${Math.round(progress)}%` 
            });
          } else if (data.status === 'loading') {
            this.notify({ 
              status: 'loading', 
              progress: 90, 
              message: 'Loading model into memory...' 
            });
          }
        }
      });
      
      this.notify({ status: 'ready', progress: 100, message: 'Model ready!' });
      return model;
      
    } catch (error) {
      this.notify({ 
        status: 'error', 
        progress: 0, 
        message: `Failed to load: ${error.message}` 
      });
      throw error;
    }
  }
}

// Usage example
const loader = new ProgressiveModelLoader();
loader.onProgress((progress) => {
  document.getElementById('loading-bar').style.width = `${progress.progress}%`;
  document.getElementById('loading-text').textContent = progress.message;
});

const model = await loader.loadModel('Xenova/Qwen1.5-0.5B-Chat', 'text-generation');
```

### Example 2: Smart Caching System
```typescript
// modelCache.ts
class ModelCache {
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();
  
  async getModel(modelName: string, task: string, options: any = {}) {
    const cacheKey = `${task}:${modelName}`;
    
    // Return cached model if available
    if (this.cache.has(cacheKey)) {
      console.log(`✅ Using cached model: ${modelName}`);
      return this.cache.get(cacheKey);
    }
    
    // Return existing loading promise if already loading
    if (this.loadingPromises.has(cacheKey)) {
      console.log(`⏳ Waiting for model already loading: ${modelName}`);
      return this.loadingPromises.get(cacheKey);
    }
    
    // Start loading new model
    console.log(`📥 Loading new model: ${modelName}`);
    const loadingPromise = this.loadModelInternal(modelName, task, options);
    
    this.loadingPromises.set(cacheKey, loadingPromise);
    
    try {
      const model = await loadingPromise;
      this.cache.set(cacheKey, model);
      this.loadingPromises.delete(cacheKey);
      return model;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      throw error;
    }
  }
  
  private async loadModelInternal(modelName: string, task: string, options: any) {
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
    return await pipeline(task, modelName, options);
  }
  
  clearCache() {
    this.cache.clear();
    console.log('🧹 Model cache cleared');
  }
  
  getCacheInfo() {
    return Array.from(this.cache.keys());
  }
}

// Global instance
export const modelCache = new ModelCache();
```

---

## Qwen1.5-0.5B-Chat Examples

### Example 1: Basic Chat Completion
```typescript
// qwenChat.ts
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1';

async function setupQwenChat() {
  const generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
    device: 'webgpu', // Use WebGPU for better performance
    dtype: 'q4',      // Quantized for smaller memory usage
  });
  
  return generator;
}

async function chatWithQwen(generator: any, message: string, context: string = '') {
  // Qwen chat template format (from HuggingFace model card)
  const prompt = `<|im_start|>system
You are Nicolo Pedrani, a Data Science professional. Answer questions about your experience in first person. Be concise and professional.

Context: ${context}
<|im_end|>
<|im_start|>user
${message}
<|im_end|>
<|im_start|>assistant
`;

  const response = await generator(prompt, {
    max_new_tokens: 150,
    do_sample: true,
    temperature: 0.7,
    top_k: 50,
    top_p: 0.95,
    repetition_penalty: 1.1,
    return_full_text: false
  });
  
  return response[0].generated_text.trim();
}

// Usage example
async function example() {
  const generator = await setupQwenChat();
  
  const context = "I worked at Deloitte as a Data Science consultant, focusing on NPS analysis and energy optimization projects.";
  const question = "Tell me about your experience with data science consulting";
  
  const answer = await chatWithQwen(generator, question, context);
  console.log('Qwen response:', answer);
}
```

### Example 2: Advanced Qwen Configuration with Error Handling
```typescript
// advancedQwen.ts
interface QwenConfig {
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  fallbackEnabled: boolean;
}

class QwenChatService {
  private generator: any = null;
  private config: QwenConfig;
  
  constructor(config: QwenConfig) {
    this.config = config;
  }
  
  async initialize(): Promise<boolean> {
    try {
      const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
      
      // Configure environment for optimal performance
      env.backends.onnx.wasm.numThreads = Math.max(1, navigator.hardwareConcurrency - 1);
      
      this.generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
        device: 'webgpu',
        dtype: 'q4',
        progress_callback: (data) => {
          if (data.status === 'downloading') {
            console.log(`Qwen loading: ${Math.round(data.progress || 0)}%`);
          }
        }
      });
      
      // Test the model with a simple prompt
      await this.testModel();
      
      console.log('✅ Qwen1.5-0.5B-Chat initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Qwen initialization failed:', error);
      
      if (this.config.fallbackEnabled) {
        console.log('🔄 Falling back to CPU mode...');
        return this.initializeFallback();
      }
      
      return false;
    }
  }
  
  private async initializeFallback(): Promise<boolean> {
    try {
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
      
      this.generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
        device: 'cpu', // Fallback to CPU
        dtype: 'fp32'  // Full precision for CPU
      });
      
      console.log('✅ Qwen fallback mode initialized');
      return true;
    } catch (error) {
      console.error('❌ Qwen fallback initialization failed:', error);
      return false;
    }
  }
  
  private async testModel(): Promise<void> {
    const testPrompt = '<|im_start|>system\nYou are a helpful assistant.<|im_end|>\n<|im_start|>user\nHello<|im_end|>\n<|im_start|>assistant\n';
    const result = await this.generator(testPrompt, {
      max_new_tokens: 10,
      return_full_text: false
    });
    
    if (!result || !result[0] || !result[0].generated_text) {
      throw new Error('Model test failed - no valid output generated');
    }
  }
  
  async generateResponse(userMessage: string, context: string = ''): Promise<string> {
    if (!this.generator) {
      throw new Error('Qwen model not initialized');
    }
    
    const systemPrompt = this.config.systemPrompt.replace('{{CONTEXT}}', context);
    
    const prompt = `<|im_start|>system
${systemPrompt}
<|im_end|>
<|im_start|>user
${userMessage}
<|im_end|>
<|im_start|>assistant
`;

    try {
      const result = await this.generator(prompt, {
        max_new_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        do_sample: this.config.temperature > 0,
        top_k: 50,
        top_p: 0.95,
        repetition_penalty: 1.1,
        return_full_text: false,
        // Stop tokens for Qwen
        stop: ['<|im_end|>', '<|endoftext|>']
      });
      
      return result[0].generated_text.trim();
    } catch (error) {
      console.error('Qwen generation error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }
}

// Usage example
const qwenConfig: QwenConfig = {
  maxTokens: 150,
  temperature: 0.7,
  systemPrompt: `You are Nicolo Pedrani, a professional Data Scientist and R&D System Engineer. 
Answer questions about your experience in first person. Be concise and professional.

Your background: {{CONTEXT}}

Important: Never mention being an AI. Respond as Nicolo Pedrani.`,
  fallbackEnabled: true
};

export default QwenChatService;
```

---

## DistilBERT Q&A Examples

### Example 1: Basic Question Answering
```typescript
// distilbertQA.ts
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1';

async function setupDistilBertQA() {
  const qa = await pipeline(
    'question-answering',
    'Xenova/distilbert-base-cased-distilled-squad',
    {
      device: 'cpu', // DistilBERT works well on CPU
      dtype: 'fp32'
    }
  );
  
  return qa;
}

async function answerQuestion(qa: any, question: string, context: string) {
  const result = await qa(question, context);
  
  return {
    answer: result.answer,
    confidence: result.score,
    start: result.start,
    end: result.end
  };
}

// Usage example
async function example() {
  const qa = await setupDistilBertQA();
  
  const context = `
    Nicolo Pedrani has extensive experience in Data Science and R&D System Engineering. 
    At Deloitte Consulting, he worked on NPS analysis, energy cost optimization, 
    and fashion retail forecasting. He developed AI chatbots and recommendation systems 
    using Python, scikit-learn, and PyTorch. At Leonardo SpA, he specialized in 
    infrared systems, object detection, and missile warning systems using MATLAB and computer vision.
  `;
  
  const questions = [
    "Where did Nicolo work?",
    "What programming languages does he use?",
    "What kind of systems did he work on at Leonardo?"
  ];
  
  for (const question of questions) {
    const result = await answerQuestion(qa, question, context);
    console.log(`Q: ${question}`);
    console.log(`A: ${result.answer} (confidence: ${result.confidence.toFixed(2)})`);
    console.log('---');
  }
}
```

### Example 2: Advanced Q&A with Context Selection
```typescript
// smartQA.ts
class SmartQASystem {
  private qa: any = null;
  private contextDatabase: Map<string, string> = new Map();
  
  constructor() {
    this.setupContextDatabase();
  }
  
  private setupContextDatabase() {
    this.contextDatabase.set('work', `
      Professional Experience:
      - Deloitte Consulting: Data Science consultant focusing on NPS analysis, energy optimization, fashion retail forecasting
      - Leonardo SpA: R&D System Engineer working on infrared systems, missile warning systems, object detection
    `);
    
    this.contextDatabase.set('skills', `
      Technical Skills:
      - Programming: Python, MATLAB, TypeScript, JavaScript
      - Data Science: scikit-learn, PyTorch, statistical analysis, time series forecasting
      - Cloud: Azure Machine Learning, Azure Data Factory, Power BI
      - Computer Vision: Object detection, optical flow, Kalman filtering
    `);
    
    this.contextDatabase.set('projects', `
      Notable Projects:
      - Customer satisfaction analytics using NPS methodology
      - Energy cost optimization for large enterprises
      - Fashion retail demand forecasting
      - Interactive portfolio game with AI integration
      - Infrared detection and tracking systems
    `);
  }
  
  async initialize() {
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
    
    this.qa = await pipeline(
      'question-answering',
      'Xenova/distilbert-base-cased-distilled-squad',
      {
        device: 'cpu',
        dtype: 'fp32'
      }
    );
  }
  
  private selectRelevantContext(question: string): string {
    const questionLower = question.toLowerCase();
    let selectedContexts: string[] = [];
    
    // Simple keyword matching
    if (questionLower.includes('work') || questionLower.includes('job') || 
        questionLower.includes('deloitte') || questionLower.includes('leonardo')) {
      selectedContexts.push(this.contextDatabase.get('work')!);
    }
    
    if (questionLower.includes('skill') || questionLower.includes('technology') || 
        questionLower.includes('programming') || questionLower.includes('python')) {
      selectedContexts.push(this.contextDatabase.get('skills')!);
    }
    
    if (questionLower.includes('project') || questionLower.includes('build') || 
        questionLower.includes('developed')) {
      selectedContexts.push(this.contextDatabase.get('projects')!);
    }
    
    // If no specific context found, use all
    if (selectedContexts.length === 0) {
      selectedContexts = Array.from(this.contextDatabase.values());
    }
    
    return selectedContexts.join('\n\n').substring(0, 800); // Limit context size
  }
  
  async answerQuestion(question: string): Promise<{
    answer: string;
    confidence: number;
    contextUsed: string;
  }> {
    if (!this.qa) {
      throw new Error('QA system not initialized');
    }
    
    const context = this.selectRelevantContext(question);
    
    console.log('Selected context length:', context.length);
    console.log('Context preview:', context.substring(0, 200) + '...');
    
    const result = await this.qa(question, context);
    
    return {
      answer: result.answer,
      confidence: result.score,
      contextUsed: context
    };
  }
}

// Usage example
async function advancedQAExample() {
  const qaSystem = new SmartQASystem();
  await qaSystem.initialize();
  
  const questions = [
    "What did Nicolo do at Deloitte?",
    "Which programming languages does he know?",
    "Tell me about his machine learning projects"
  ];
  
  for (const question of questions) {
    const result = await qaSystem.answerQuestion(question);
    console.log(`Q: ${question}`);
    console.log(`A: ${result.answer}`);
    console.log(`Confidence: ${result.confidence.toFixed(2)}`);
    console.log('---');
  }
}
```

---

## Error Handling Patterns

### Example 1: Comprehensive Error Handling
```typescript
// errorHandling.ts
enum AIErrorType {
  NETWORK_ERROR = 'network_error',
  MODEL_LOADING_FAILED = 'model_loading_failed',
  INFERENCE_FAILED = 'inference_failed',
  WEBGPU_NOT_SUPPORTED = 'webgpu_not_supported',
  OUT_OF_MEMORY = 'out_of_memory',
  TIMEOUT = 'timeout'
}

interface AIError {
  type: AIErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
}

class AIErrorHandler {
  static createError(type: AIErrorType, message: string, originalError?: Error): AIError {
    return {
      type,
      message,
      originalError,
      retryable: this.isRetryable(type)
    };
  }
  
  private static isRetryable(type: AIErrorType): boolean {
    switch (type) {
      case AIErrorType.NETWORK_ERROR:
      case AIErrorType.TIMEOUT:
        return true;
      case AIErrorType.WEBGPU_NOT_SUPPORTED:
      case AIErrorType.OUT_OF_MEMORY:
        return false;
      default:
        return true;
    }
  }
  
  static async handleWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: AIError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.categorizeError(error);
        
        if (!lastError.retryable || attempt === maxRetries) {
          throw lastError;
        }
        
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
        await this.delay(delayMs * Math.pow(2, attempt)); // Exponential backoff
      }
    }
    
    throw lastError!;
  }
  
  private static categorizeError(error: any): AIError {
    const message = error.message || 'Unknown error';
    
    if (message.includes('fetch')) {
      return this.createError(AIErrorType.NETWORK_ERROR, 'Network connection failed', error);
    }
    
    if (message.includes('WebGPU')) {
      return this.createError(AIErrorType.WEBGPU_NOT_SUPPORTED, 'WebGPU not supported', error);
    }
    
    if (message.includes('memory') || message.includes('OOM')) {
      return this.createError(AIErrorType.OUT_OF_MEMORY, 'Insufficient memory', error);
    }
    
    if (message.includes('timeout')) {
      return this.createError(AIErrorType.TIMEOUT, 'Operation timed out', error);
    }
    
    return this.createError(AIErrorType.MODEL_LOADING_FAILED, message, error);
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage example
async function robustModelLoading() {
  try {
    const model = await AIErrorHandler.handleWithRetry(async () => {
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
      return await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
        device: 'webgpu'
      });
    }, 3, 2000);
    
    console.log('✅ Model loaded successfully');
    return model;
    
  } catch (error) {
    const aiError = error as AIError;
    console.error(`❌ Model loading failed: ${aiError.message}`);
    
    // Handle different error types
    switch (aiError.type) {
      case AIErrorType.WEBGPU_NOT_SUPPORTED:
        console.log('🔄 Falling back to CPU mode...');
        return loadCPUFallback();
      
      case AIErrorType.OUT_OF_MEMORY:
        console.log('🔄 Trying smaller model...');
        return loadSmallerModel();
      
      case AIErrorType.NETWORK_ERROR:
        console.log('📱 Check your internet connection');
        break;
      
      default:
        console.log('💬 Using fallback responses');
    }
    
    return null;
  }
}

async function loadCPUFallback() {
  const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
  return await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
    device: 'cpu',
    dtype: 'fp32'
  });
}

async function loadSmallerModel() {
  const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
  return await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
}
```

---

## Progressive Loading Examples

### Example 1: Progressive Loading with UI Updates
```typescript
// progressiveUI.ts
interface LoadingState {
  phase: string;
  progress: number;
  timeRemaining?: string;
  canCancel: boolean;
}

class ProgressiveAILoader {
  private startTime: number = 0;
  private onStateChange?: (state: LoadingState) => void;
  private cancelled = false;
  
  onStateChange(callback: (state: LoadingState) => void) {
    this.onStateChange = callback;
  }
  
  private updateState(phase: string, progress: number, canCancel = true) {
    if (this.cancelled) return;
    
    const elapsed = Date.now() - this.startTime;
    const estimated = progress > 0 ? (elapsed / progress) * (100 - progress) : 0;
    const timeRemaining = estimated > 0 ? `${Math.ceil(estimated / 1000)}s remaining` : undefined;
    
    this.onStateChange?.({
      phase,
      progress,
      timeRemaining,
      canCancel
    });
  }
  
  cancel() {
    this.cancelled = true;
    console.log('🛑 AI loading cancelled by user');
  }
  
  async loadAISystem(): Promise<any> {
    this.startTime = Date.now();
    this.cancelled = false;
    
    try {
      // Phase 1: Import transformers library
      this.updateState('Loading AI library...', 0);
      
      if (this.cancelled) throw new Error('Cancelled');
      
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
      
      this.updateState('Checking browser compatibility...', 10);
      
      // Phase 2: Check WebGPU support
      const hasWebGPU = await this.checkWebGPUSupport();
      const device = hasWebGPU ? 'webgpu' : 'cpu';
      
      this.updateState(`Preparing ${device.toUpperCase()} backend...`, 20);
      
      if (this.cancelled) throw new Error('Cancelled');
      
      // Phase 3: Load model with progress tracking
      const model = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
        device,
        dtype: hasWebGPU ? 'q4' : 'fp32',
        progress_callback: (data) => {
          if (this.cancelled) return;
          
          if (data.status === 'downloading') {
            const progress = 20 + (data.progress || 0) * 0.6; // 20% to 80%
            this.updateState('Downloading AI model...', progress);
          } else if (data.status === 'loading') {
            this.updateState('Loading model into memory...', 85);
          }
        }
      });
      
      if (this.cancelled) throw new Error('Cancelled');
      
      // Phase 4: Test model
      this.updateState('Testing AI system...', 90, false);
      await this.testModel(model);
      
      this.updateState('AI system ready!', 100, false);
      
      return model;
      
    } catch (error) {
      if (error.message === 'Cancelled') {
        this.updateState('Loading cancelled', 0, false);
        return null;
      }
      
      throw error;
    }
  }
  
  private async checkWebGPUSupport(): Promise<boolean> {
    try {
      const adapter = await navigator.gpu?.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }
  
  private async testModel(model: any): Promise<void> {
    const testPrompt = '<|im_start|>system\nTest<|im_end|>\n<|im_start|>user\nHello<|im_end|>\n<|im_start|>assistant\n';
    const result = await model(testPrompt, { max_new_tokens: 5 });
    
    if (!result || !result[0]?.generated_text) {
      throw new Error('Model test failed');
    }
  }
}

// UI Integration Example
class LoadingUI {
  private loader = new ProgressiveAILoader();
  private progressBar: HTMLElement;
  private statusText: HTMLElement;
  private cancelButton: HTMLElement;
  private timeText: HTMLElement;
  
  constructor() {
    this.setupUI();
    this.loader.onStateChange((state) => this.updateUI(state));
  }
  
  private setupUI() {
    const container = document.createElement('div');
    container.className = 'ai-loading-container';
    container.innerHTML = `
      <div class="loading-content">
        <h3>Loading AI System</h3>
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
        <div class="loading-info">
          <span id="status-text">Initializing...</span>
          <span id="time-text"></span>
        </div>
        <button id="cancel-button" class="cancel-btn">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(container);
    
    this.progressBar = document.getElementById('progress-fill')!;
    this.statusText = document.getElementById('status-text')!;
    this.cancelButton = document.getElementById('cancel-button')!;
    this.timeText = document.getElementById('time-text')!;
    
    this.cancelButton.addEventListener('click', () => {
      this.loader.cancel();
    });
  }
  
  private updateUI(state: LoadingState) {
    this.progressBar.style.width = `${state.progress}%`;
    this.statusText.textContent = state.phase;
    this.timeText.textContent = state.timeRemaining || '';
    this.cancelButton.style.display = state.canCancel ? 'block' : 'none';
    
    if (state.progress >= 100) {
      setTimeout(() => {
        document.querySelector('.ai-loading-container')?.remove();
      }, 2000);
    }
  }
  
  async startLoading(): Promise<any> {
    return await this.loader.loadAISystem();
  }
}

// CSS for the loading UI
const loadingCSS = `
.ai-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin: 1rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #45a049);
  transition: width 0.3s ease;
}

.loading-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.cancel-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = loadingCSS;
document.head.appendChild(style);
```

---

## Browser Compatibility Examples

### Example 1: Feature Detection and Fallbacks
```typescript
// browserCompat.ts
class BrowserCapabilityDetector {
  async detectCapabilities() {
    const capabilities = {
      webgpu: await this.checkWebGPU(),
      webassembly: this.checkWebAssembly(),
      esModules: this.checkESModules(),
      serviceWorkers: this.checkServiceWorkers(),
      offscreenCanvas: this.checkOffscreenCanvas(),
      sharedArrayBuffer: this.checkSharedArrayBuffer()
    };
    
    console.log('Browser capabilities:', capabilities);
    return capabilities;
  }
  
  private async checkWebGPU(): Promise<boolean> {
    try {
      if (!navigator.gpu) return false;
      const adapter = await navigator.gpu.requestAdapter();
      return !!adapter;
    } catch (error) {
      console.log('WebGPU check failed:', error);
      return false;
    }
  }
  
  private checkWebAssembly(): boolean {
    return typeof WebAssembly === 'object' && 
           typeof WebAssembly.instantiate === 'function';
  }
  
  private checkESModules(): boolean {
    try {
      new Function('import("")');
      return true;
    } catch {
      return false;
    }
  }
  
  private checkServiceWorkers(): boolean {
    return 'serviceWorker' in navigator;
  }
  
  private checkOffscreenCanvas(): boolean {
    return typeof OffscreenCanvas !== 'undefined';
  }
  
  private checkSharedArrayBuffer(): boolean {
    return typeof SharedArrayBuffer !== 'undefined';
  }
  
  getOptimalConfiguration(capabilities: any) {
    return {
      device: capabilities.webgpu ? 'webgpu' : 'cpu',
      dtype: capabilities.webgpu ? 'q4' : 'fp32',
      numThreads: capabilities.sharedArrayBuffer ? 
        Math.max(1, navigator.hardwareConcurrency - 1) : 1,
      useWorkers: capabilities.serviceWorkers && capabilities.offscreenCanvas
    };
  }
}

// Usage in main application
async function initializeAIWithCompatibility() {
  const detector = new BrowserCapabilityDetector();
  const capabilities = await detector.detectCapabilities();
  const config = detector.getOptimalConfiguration(capabilities);
  
  console.log('Using configuration:', config);
  
  // Show user what to expect
  if (!capabilities.webgpu) {
    showUserNotification(
      'WebGPU not supported. AI will run on CPU (slower performance).',
      'info'
    );
  }
  
  if (!capabilities.webassembly) {
    showUserNotification(
      'WebAssembly not supported. AI features may not work.',
      'warning'
    );
    return null;
  }
  
  try {
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
    
    const model = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
      device: config.device,
      dtype: config.dtype,
      // Additional config based on capabilities
    });
    
    return model;
  } catch (error) {
    console.error('Model loading failed:', error);
    return null;
  }
}

function showUserNotification(message: string, type: 'info' | 'warning' | 'error') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
```

### Example 2: Cross-Browser Testing Helper
```typescript
// crossBrowserTest.ts
interface BrowserTestResult {
  browser: string;
  version: string;
  webgpu: boolean;
  wasm: boolean;
  performance: 'fast' | 'medium' | 'slow';
  modelLoadTime?: number;
  errors: string[];
}

class CrossBrowserTester {
  async runCompatibilityTest(): Promise<BrowserTestResult> {
    const result: BrowserTestResult = {
      browser: this.getBrowserInfo().name,
      version: this.getBrowserInfo().version,
      webgpu: false,
      wasm: false,
      performance: 'slow',
      errors: []
    };
    
    try {
      // Test WebGPU
      result.webgpu = await this.testWebGPU();
      
      // Test WebAssembly
      result.wasm = this.testWebAssembly();
      
      // Test model loading performance
      if (result.wasm) {
        const startTime = performance.now();
        await this.testModelLoading();
        result.modelLoadTime = performance.now() - startTime;
        
        result.performance = this.classifyPerformance(result.modelLoadTime, result.webgpu);
      }
      
    } catch (error) {
      result.errors.push(error.message);
    }
    
    return result;
  }
  
  private getBrowserInfo(): { name: string; version: string } {
    const ua = navigator.userAgent;
    
    if (ua.includes('Chrome')) {
      const version = ua.match(/Chrome\/([0-9]+)/)?.[1] || 'unknown';
      return { name: 'Chrome', version };
    } else if (ua.includes('Firefox')) {
      const version = ua.match(/Firefox\/([0-9]+)/)?.[1] || 'unknown';
      return { name: 'Firefox', version };
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      const version = ua.match(/Version\/([0-9]+)/)?.[1] || 'unknown';
      return { name: 'Safari', version };
    } else {
      return { name: 'Unknown', version: 'unknown' };
    }
  }
  
  private async testWebGPU(): Promise<boolean> {
    try {
      if (!navigator.gpu) return false;
      const adapter = await navigator.gpu.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }
  
  private testWebAssembly(): boolean {
    try {
      return typeof WebAssembly === 'object';
    } catch {
      return false;
    }
  }
  
  private async testModelLoading(): Promise<void> {
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1');
    
    // Load a small model for testing
    const model = await pipeline(
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
    
    // Test inference
    const result = await model('This is a test');
    if (!result || result.length === 0) {
      throw new Error('Model inference failed');
    }
  }
  
  private classifyPerformance(loadTime: number, hasWebGPU: boolean): 'fast' | 'medium' | 'slow' {
    if (hasWebGPU && loadTime < 10000) return 'fast';
    if (loadTime < 30000) return 'medium';
    return 'slow';
  }
}

// Automated testing across different scenarios
async function runFullCompatibilityTest() {
  const tester = new CrossBrowserTester();
  const result = await tester.runCompatibilityTest();
  
  console.log('=== Browser Compatibility Test Results ===');
  console.log(`Browser: ${result.browser} ${result.version}`);
  console.log(`WebGPU Support: ${result.webgpu ? '✅' : '❌'}`);
  console.log(`WebAssembly Support: ${result.wasm ? '✅' : '❌'}`);
  console.log(`Performance Category: ${result.performance}`);
  
  if (result.modelLoadTime) {
    console.log(`Model Load Time: ${Math.round(result.modelLoadTime)}ms`);
  }
  
  if (result.errors.length > 0) {
    console.log('Errors encountered:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Generate recommendations
  const recommendations = generateRecommendations(result);
  console.log('\n=== Recommendations ===');
  recommendations.forEach(rec => console.log(`- ${rec}`));
  
  return result;
}

function generateRecommendations(result: BrowserTestResult): string[] {
  const recommendations: string[] = [];
  
  if (!result.webgpu) {
    recommendations.push('Enable WebGPU flags for better performance');
    recommendations.push('Consider using CPU-optimized models');
  }
  
  if (!result.wasm) {
    recommendations.push('WebAssembly required for AI functionality');
    recommendations.push('Update browser to latest version');
  }
  
  if (result.performance === 'slow') {
    recommendations.push('Consider using smaller models (DistilBERT instead of Qwen)');
    recommendations.push('Show longer loading times to users');
  }
  
  if (result.browser === 'Safari') {
    recommendations.push('Test WebKit-specific issues');
    recommendations.push('Consider progressive enhancement');
  }
  
  return recommendations;
}
```

---

This comprehensive examples document covers all the practical implementation patterns discovered during research, providing real-world code examples for successful integration of @huggingface/transformers with Vite and static site deployment on GitHub Pages.