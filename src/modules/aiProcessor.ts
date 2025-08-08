// modules/aiProcessor.ts - AI processing with Transformers.js v3 CDN integration

import { requestModelConsent, hasUserConsentFor, hasUserApprovedDownload } from "./modelConsent";

declare global {
  interface Window {
    aiModels?: { [key: string]: any };
  }
}

interface CVContext {
  personalInfo: string;
  workExperience: string;
  education: string;
  skills: string;
  projects: string;
  achievements: string;
}

let aiPipeline: any = null;
let isModelLoaded = false;
let currentModelName = "";
let currentModelType = "";

// CDN-based transformers.js loading  
let transformersModule: any = null;

// Import enhanced browser detection
import { 
  getBrowserInfo, 
  getCompatibilityInfo, 
  isIOSDevice, 
  isMobileDevice, 
  supportsAI 
} from './browserDetection';

// Enhanced device capability detection for Phi-3 requirements
function getDeviceMemoryGB(): number {
  // Use Device Memory API if available, otherwise estimate
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory;
  }
  
  // Fallback estimation based on user agent and other factors
  if (isMobileDevice()) {
    return 2; // Conservative mobile estimate
  }
  
  // Desktop estimation - default to 4GB if unknown
  return 4;
}

function hasWebGPUSupport(): boolean {
  return 'gpu' in navigator;
}

function canRunModel(modelKey: string): { canRun: boolean; reason?: string; suggestion?: string } {
  const model = AI_MODELS[modelKey];
  if (!model) {
    return { canRun: false, reason: "Model not found" };
  }

  // iOS devices always use fallback
  if (isIOSDevice()) {
    return { 
      canRun: false, 
      reason: "iOS Safari compatibility", 
      suggestion: "Using smart fallback responses instead" 
    };
  }

  // Check memory requirements
  const availableMemory = getDeviceMemoryGB();
  if (availableMemory < model.minMemoryGB) {
    return { 
      canRun: false, 
      reason: `Requires ${model.minMemoryGB}GB RAM, detected ${availableMemory}GB`,
      suggestion: `Try ${model.minMemoryGB <= 2 ? 'DistilBERT' : 'Qwen'} for better performance`
    };
  }

  // Check WebGPU for models that strongly benefit from it
  if (model.recommendedWebGPU && !hasWebGPUSupport()) {
    // Phi-3 can still run on WASM but will be slower
    if (modelKey === 'phi3') {
      return { 
        canRun: true, 
        reason: "Will use CPU processing (slower performance)",
        suggestion: "Use Chrome/Edge for faster WebGPU acceleration"
      };
    }
  }

  return { canRun: true };
}

function getBestModelForDevice(): string {
  // Try models in order of preference/capability
  const modelPriority = ['phi3', 'qwen', 'distilbert'];
  
  for (const modelKey of modelPriority) {
    const capability = canRunModel(modelKey);
    if (capability.canRun) {
      return modelKey;
    }
  }
  
  // Fallback to smallest model
  return 'distilbert';
}

function getModelCapabilityInfo(modelKey: string): string {
  const model = AI_MODELS[modelKey];
  const capability = canRunModel(modelKey);
  
  if (!model) return "Model information not available";
  
  const parts = [
    `📊 ${model.size}`,
    `🧠 ${model.minMemoryGB}GB RAM required`
  ];
  
  if (model.recommendedWebGPU) {
    parts.push(`⚡ WebGPU recommended`);
  }
  
  if (!capability.canRun && capability.reason) {
    parts.push(`⚠️ ${capability.reason}`);
  }
  
  return parts.join(' • ');
}

// Browser-specific fallback responses based on compatibility
function getBrowserSpecificFallbackResponse(question: string): string {
  const browserInfo = getBrowserInfo();
  const compatInfo = getCompatibilityInfo();
  const lowerQ = question.toLowerCase();
  
  // Generate context-aware responses based on question type
  let contextResponse = "";
  
  // Greeting responses
  if (lowerQ.includes('hi') || lowerQ.includes('hello') || lowerQ.includes('ciao')) {
    contextResponse = "Hi there! I'm Nicolo Pedrani. Welcome to my interactive CV! I'm a Data Scientist at Deloitte Consulting and former R&D System Engineer. What would you like to know about my experience?";
  }
  // Experience-related questions
  else if (lowerQ.includes('experience') || lowerQ.includes('work') || lowerQ.includes('job')) {
    contextResponse = "I currently work as a Data Scientist at Deloitte Consulting, focusing on business analytics, machine learning, and client solutions. Previously, I was an R&D System Engineer at Leonardo SpA, working on defense systems and infrared technologies.";
  }
  // Skills questions
  else if (lowerQ.includes('skill') || lowerQ.includes('technology') || lowerQ.includes('programming')) {
    contextResponse = "My key skills include Python, R, machine learning, PyTorch, scikit-learn, Power BI, Azure ML, and statistical analysis. I also have experience with MATLAB, Simulink, and system engineering from my defense industry background.";
  }
  // Education questions  
  else if (lowerQ.includes('education') || lowerQ.includes('study') || lowerQ.includes('university')) {
    contextResponse = "I have a strong educational background in engineering and data science, which has equipped me with both theoretical knowledge and practical problem-solving skills across multiple domains.";
  }
  // Projects questions
  else if (lowerQ.includes('project') || lowerQ.includes('achievement')) {
    contextResponse = "I've worked on diverse projects including NPS analysis, energy cost optimization, fashion retail forecasting, recommendation systems, infrared detection systems, and missile warning technologies. Each project combined technical innovation with real business impact.";
  }
  // Default context
  else {
    contextResponse = "I'm Nicolo Pedrani - a Data Scientist at Deloitte with R&D experience at Leonardo SpA. I specialize in machine learning, business analytics, and defense systems. What specific aspect would you like to know more about?";
  }
  
  // Add browser-specific explanation
  let explanation = "";
  
  if (browserInfo.os === 'iOS' && browserInfo.name === 'Safari') {
    explanation = "I'm using pre-written responses because iOS Safari has known compatibility issues with AI models. ";
  } else if (browserInfo.isMobile && browserInfo.name === 'Chrome') {
    explanation = "I'm using simplified responses on Chrome mobile for better performance. ";
  } else if (browserInfo.isMobile && browserInfo.name === 'Firefox') {
    explanation = "I'm using basic responses optimized for Firefox mobile. ";
  } else if (browserInfo.isMobile) {
    explanation = `I'm using simplified responses optimized for ${browserInfo.name} mobile. `;
  } else {
    explanation = "I'm using fallback responses due to AI system limitations. ";
  }
  
  return explanation + contextResponse;
}

// Legacy function for backwards compatibility - now uses browser-specific logic
function getIOSFallbackResponse(question: string): string {
  return getBrowserSpecificFallbackResponse(question);
}

// Progress tracking callback for UI updates
let progressUpdateCallback:
  | ((
      modelKey: string,
      percentage: number,
      loaded: string,
      total: string,
      remaining: string,
      rate?: number
    ) => void)
  | null = null;

// Background preloading system
let preloadedModels: { [key: string]: any } = {};
let backgroundLoadingStatus: { [key: string]: 'pending' | 'loading' | 'completed' | 'error' } = {
  distilbert: 'pending',
  qwen: 'pending',
  phi3: 'pending'
};

// Download state tracking for UI
let modelDownloadState: { [key: string]: {
  status: 'not_started' | 'downloading' | 'completed' | 'failed';
  progress: number;
  speed: number;
  bytesDownloaded: number;
  totalBytes: number;
  timeRemaining: number;
  userRequested: boolean; // NEW: Track if user explicitly requested this model
}} = {};

// Track which models user has explicitly requested (separate from background loading)
let userRequestedModels: Set<string> = new Set();
let backgroundProgressCallback: ((modelKey: string, status: string, progress?: number) => void) | null = null;

// Available AI models - both Q&A and chat models
const AI_MODELS: { [key: string]: any } = {
  distilbert: {
    name: "Xenova/distilbert-base-cased-distilled-squad",
    description: "DistilBERT model optimized for question-answering",
    size: "~65MB",
    type: "qa",
    minMemoryGB: 1,
    recommendedWebGPU: false,
  },
  qwen: {
    name: "onnx-community/Qwen2.5-0.5B-Instruct",
    description: "Qwen 2.5 0.5B Instruct - Small conversational language model",
    size: "~500MB",
    type: "chat",
    minMemoryGB: 2,
    recommendedWebGPU: false,
  },
  phi3: {
    name: "Xenova/Phi-3-mini-4k-instruct",
    description: "Phi-3 Mini - Advanced 3.8B parameter instruction model",
    size: "~1.8GB",
    type: "chat",
    minMemoryGB: 4,
    recommendedWebGPU: true,
    workingExamples: [
      "https://huggingface.co/spaces/webml-community/phi-3.5-webgpu",
      "https://github.com/huggingface/transformers.js-examples/tree/main/phi-3.5-webgpu"
    ]
  },
};

// Configuration - using @huggingface/transformers v3 with CDN
const MODEL_CONFIG = {
  preferredModel: "distilbert", // Start with smaller model for testing
  fallbackModels: ["distilbert"],
  enableModelFallback: true,
  useOnlyFallback: false, // Try to load real AI models
};

// CV context data extracted from the portfolio game content
const cvContext: CVContext = {
  personalInfo: `
    Nicolo Pedrani is a professional with experience in Data Science and R&D System Engineering.
    He has worked in consulting, analytics, and infrared defense systems.
    
    Personal interests and hobbies:
    - Football: Passionate about playing and watching football, enjoys both recreational games and following professional leagues
    - Extensive Travel: Has visited 14 countries across 4 continents including Italy, France, Germany, United States, Japan, Australia, Vietnam, Maldives, Spain, United Kingdom, Netherlands, Switzerland, Morocco, and Egypt
    - Reading: Enjoys reading technical literature, business books, and staying updated with industry trends
    - Cultural exploration: Through travel experiences has gained appreciation for different cultures, cuisines, and perspectives
    - Sports and fitness: Maintains active lifestyle through football and other physical activities
    - International perspective: Travel experiences have provided global mindset and cultural adaptability valuable in professional settings
  `,

  workExperience: `
    Deloitte Consulting - Data Science Experience:
    - NPS (Net Promoter Score) analysis and customer satisfaction analytics
    - Energy cost optimization projects
    - Fashion retail time series analysis and forecasting
    - Supply chain and distribution network mapping
    - Statistical analysis including forecast histograms and box plot analysis
    - Power BI dashboard development for business intelligence
    - Advanced analytics using Python and scikit-learn
    - Machine learning projects with PyTorch and LangChain
    - Recommendation system development
    - Azure Machine Learning and Azure Data Factory implementation
    - AI chatbot development
    - Project management with Gantt charts and timeline planning

    Leonardo SpA - R&D System Engineer Experience:
    - Infrared (IR) spectrum visualization and analysis
    - Atmospheric transmission modeling and analysis
    - Multi-camera array positioning systems
    - Object detection with bounding boxes using computer vision
    - Kalman filter implementation for state estimation
    - Optical flow motion vector analysis
    - 360-degree missile warning coverage systems
    - Threat detection interface development
    - Multiple target tracking systems
    - MATLAB and Simulink development
    - IR system architecture design
    - Requirements specification and documentation
    - IR detector hardware integration
  `,

  education: `
    Technical background in Data Science, Machine Learning, and System Engineering.
    Expertise in statistical analysis, computer vision, and defense systems.
  `,

  skills: `
    Programming: Python, MATLAB, TypeScript, JavaScript
    Data Science: scikit-learn, PyTorch, statistical analysis, time series forecasting
    Machine Learning: LangChain, recommendation systems, predictive modeling
    Cloud Platforms: Azure Machine Learning, Azure Data Factory
    Business Intelligence: Power BI, dashboard development
    Computer Vision: Object detection, optical flow, Kalman filtering
    Defense Systems: Infrared systems, missile warning systems, threat detection
    Project Management: Agile methodologies, Gantt charts
    Tools: MATLAB/Simulink, Git, various analytics platforms
  `,

  projects: `
    - Customer satisfaction analytics using NPS methodology
    - Energy cost optimization for large enterprises
    - Fashion retail demand forecasting using time series analysis
    - Supply chain optimization and network analysis
    - Interactive portfolio game (current project) using TypeScript and HTML5 Canvas
    - AI-powered chatbot development
    - Infrared detection and tracking systems
    - Multi-camera surveillance systems
    - Real-time threat detection and tracking
  `,

  achievements: `
    - Successfully implemented multiple data science projects at Deloitte
    - Developed advanced IR systems at Leonardo SpA
    - Created innovative interactive portfolio showcasing technical skills
    - Expert in both business analytics and defense system engineering
    - Traveled extensively, demonstrating cultural adaptability
    - Combines technical expertise with business consulting experience
  `,
};

// Background loading function that stores models instead of overwriting aiPipeline
async function loadModelInBackground(modelKey: string): Promise<boolean> {
  const model = AI_MODELS[modelKey];
  if (!model || !transformersModule) {
    console.error(`❌ Model key invalid or transformers not loaded: ${modelKey}`);
    backgroundLoadingStatus[modelKey] = 'error';
    return false;
  }

  try {
    console.log(`🔄 Background loading ${modelKey} model: ${model.name}`);
    backgroundLoadingStatus[modelKey] = 'loading';
    
    if (backgroundProgressCallback) {
      backgroundProgressCallback(modelKey, 'loading', 0);
    }

    // Choose pipeline type based on model type
    const pipelineType = model.type === "chat" ? "text-generation" : "question-answering";

    // Configure options for background loading with Phi-3 specific settings
    const pipelineOptions: any = {
      device: hasWebGPUSupport() && model.recommendedWebGPU ? "webgpu" : "wasm",
      // Phi-3 specific configuration
      ...(modelKey === 'phi3' && {
        dtype: "q4",
        use_external_data_format: true,
      }),
      progress_callback: (progress: any) => {
        if (progress.status === "downloading") {
          // Since content-length isn't available, we'll use a chunk-based progress estimate
          const chunkProgress = Math.min(progress.loaded ? Math.floor(progress.loaded / (1024 * 1024)) : 0, 90);
          console.log(`📥 Background downloading ${modelKey}: ~${chunkProgress}MB loaded...`);
          
          // Only update download state if this is a user-requested download
          if (hasUserRequestedModel(modelKey)) {
            updateDownloadState(modelKey, progress);
          }
          
          // Send real progress data to UI if progress dialog is open
          if ((window as any).updateModelProgress) {
            const loaded = progress.loaded || 0;
            const total = progress.total || (1.8 * 1024 * 1024 * 1024); // 1.8GB estimate if not available
            
            (window as any).updateModelProgress({
              progress: progress.progress || (loaded / total),
              bytesDownloaded: loaded,
              totalBytes: total
            });
          }
          
          if (backgroundProgressCallback) {
            backgroundProgressCallback(modelKey, 'downloading', chunkProgress);
          }
        } else if (progress.status === "loading") {
          console.log(`🧠 Loading ${modelKey} model into memory...`);
          if (backgroundProgressCallback) {
            backgroundProgressCallback(modelKey, 'finalizing', 95);
          }
        }
      },
    };

    // Configure dtype for different models
    if (modelKey === "qwen") {
      pipelineOptions.dtype = "q4";
    } else {
      pipelineOptions.dtype = "q4";
    }

    // Load the model and store it
    const pipeline = await transformersModule.pipeline(pipelineType, model.name, pipelineOptions);
    
    // Store the preloaded model
    preloadedModels[modelKey] = {
      pipeline,
      modelInfo: model,
      loadTime: Date.now()
    };

    // Store in global window object to prevent double consent
    if (typeof window !== 'undefined') {
      window.aiModels = window.aiModels || {};
      window.aiModels[modelKey] = true;
    }

    backgroundLoadingStatus[modelKey] = 'completed';
    console.log(`✅ Background loading of ${modelKey} completed!`);
    
    if (backgroundProgressCallback) {
      backgroundProgressCallback(modelKey, 'completed', 100);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to background load ${modelKey} model:`, error);
    backgroundLoadingStatus[modelKey] = 'error';
    if (backgroundProgressCallback) {
      backgroundProgressCallback(modelKey, 'error', 0);
    }
    return false;
  }
}

async function loadModel(modelKey: string): Promise<boolean> {
  const model = AI_MODELS[modelKey];
  if (!model || !transformersModule) {
    console.error(
      `❌ Model key invalid or transformers not loaded: ${modelKey}`
    );
    return false;
  }

  try {
    console.log(`🤖 Loading ${modelKey} model: ${model.name}`);
    console.log(`📦 Model info: ${model.description} (${model.size})`);
    
    // Initialize download state immediately when starting to load (user-requested)
    initializeDownloadState(modelKey, true);
    markModelAsUserRequested(modelKey);

    // Choose pipeline type based on model type
    const pipelineType =
      model.type === "chat" ? "text-generation" : "question-answering";

    // Configure options based on model type and available files
    const pipelineOptions: any = {
      device: "webgpu", // Try WebGPU first, will fallback to CPU automatically
      progress_callback: (progress: any) => {
        if (progress.status === "downloading") {
          const percentage = Math.round(progress.progress || 0);
          const loaded = progress.loaded || 0;
          const total = progress.total || 0;
          const remaining = total - loaded;
          
          // Only update download state if this is a user-requested download
          if (hasUserRequestedModel(modelKey)) {
            updateDownloadState(modelKey, progress);
          }
          
          // Send real progress data to UI if progress dialog is open
          if ((window as any).updateModelProgress) {
            (window as any).updateModelProgress({
              progress: progress.progress || 0,
              bytesDownloaded: loaded,
              totalBytes: total
            });
          }

          // Calculate download speed if available
          let speedInfo = "";
          if (progress.rate && progress.rate > 0) {
            const speedMBps = (progress.rate / (1024 * 1024)).toFixed(1);
            const remainingSeconds =
              remaining > 0 ? Math.round(remaining / progress.rate) : 0;
            speedInfo = ` | ${speedMBps} MB/s | ${remainingSeconds}s remaining`;
          }

          // Format bytes
          const formatBytes = (bytes: number) => {
            if (bytes === 0) return "0 B";
            const k = 1024;
            const sizes = ["B", "KB", "MB", "GB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return (
              parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
            );
          };

          const loadedStr = formatBytes(loaded);
          const totalStr = formatBytes(total);
          const remainingStr = formatBytes(remaining);

          console.log(
            `📥 Downloading ${modelKey} model: ${percentage}% (${loadedStr}/${totalStr}, ${remainingStr} left)${speedInfo}`
          );

          // Update progress bar in conversation UI if available
          if (progressUpdateCallback) {
            progressUpdateCallback(
              modelKey,
              percentage,
              loadedStr,
              totalStr,
              remainingStr,
              progress.rate
            );
          }
        } else if (progress.status === "loading") {
          console.log(`🧠 Loading ${modelKey} model into memory...`);
        }
      },
    };

    // Configure dtype for different models
    if (modelKey === "qwen") {
      pipelineOptions.dtype = "q4"; // Use 4-bit quantization for good balance of quality and speed
    } else {
      // For other models like DistilBERT, use standard dtype
      pipelineOptions.dtype = "q4";
    }

    // Load the model using CDN-based transformers
    aiPipeline = await transformersModule.pipeline(
      pipelineType,
      model.name,
      pipelineOptions
    );

    // Test the model based on its type
    console.log(`🧪 Testing ${modelKey} model...`);
    let testResult;

    if (model.type === "chat") {
      // Test chat model with a simple generation using proper format
      let testPrompt;
      try {
        // Try to use chat template
        const testMessages = [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is your name?" },
        ];
        testPrompt = aiPipeline.tokenizer.apply_chat_template(testMessages, {
          tokenize: false,
          add_generation_prompt: true,
        });
      } catch (error) {
        // Use model-specific fallback format
        if (modelKey === "qwen") {
          testPrompt = `<|im_start|>system
You are a helpful assistant.<|im_end|>
<|im_start|>user
What is your name?<|im_end|>
<|im_start|>assistant
`;
        } else {
          testPrompt =
            "System: You are a helpful assistant.\nUser: What is your name?\nAssistant:";
        }
      }

      testResult = await aiPipeline(testPrompt, {
        max_new_tokens: 20,
        do_sample: false,
        return_full_text: false,
      });
      console.log(`🔍 ${modelKey} chat test result:`, testResult);

      // Check if we got a reasonable response
      if (
        !testResult ||
        !testResult[0]?.generated_text ||
        testResult[0].generated_text.length < 3
      ) {
        console.warn(`⚠️ ${modelKey} model test failed`);
        return false;
      }
    } else {
      // Test Q&A model
      testResult = await aiPipeline(
        "What is the name?",
        "The name is Nicolo Pedrani. He is a professional."
      );
      console.log(`🔍 ${modelKey} Q&A test result:`, testResult);

      if (!testResult.answer || testResult.score < 0.01) {
        console.warn(`⚠️ ${modelKey} model test failed`);
        return false;
      }
    }

    console.log(`✅ ${modelKey} model test successful!`);
    currentModelName = `${modelKey} (${model.name})`;
    currentModelType = model.type;
    console.log(`🔄 Model switched to: ${currentModelName}`);
    console.log(`📝 Model type: ${currentModelType}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to load ${modelKey} model:`, error);
    return false;
  }
}

export async function initializeAI(): Promise<boolean> {
  try {
    console.log("🔧 Checking AI system initialization...");
    
    // Force fallback mode for iOS devices due to known Safari compatibility issues
    if (isIOSDevice()) {
      console.log("🍎 iOS device detected - disabling AI models due to Safari ONNX Runtime issues");
      isModelLoaded = false;
      currentModelName = "iOS Fallback System";
      currentModelType = "fallback";
      console.log("✅ iOS fallback system initialized successfully!");
      return true;
    }

    // Skip AI loading if configured for fallback only
    if (MODEL_CONFIG.useOnlyFallback) {
      console.log("🔄 Using fallback responses only (AI models disabled)");
      isModelLoaded = false;
      currentModelName = "Fallback System";
      currentModelType = "fallback";
      console.log("✅ Fallback system initialized successfully!");
      return true;
    }

    // Check if we have preloaded models available
    const defaultModel = MODEL_CONFIG.preferredModel;
    
    if (preloadedModels[defaultModel] && backgroundLoadingStatus[defaultModel] === 'completed') {
      console.log(`⚡ Using preloaded ${defaultModel} model for initialization!`);
      
      // Use the preloaded model
      aiPipeline = preloadedModels[defaultModel].pipeline;
      currentModelName = `${defaultModel} (${preloadedModels[defaultModel].modelInfo.name})`;
      currentModelType = preloadedModels[defaultModel].modelInfo.type;
      isModelLoaded = true;
      
      console.log(`✅ AI system ready with preloaded ${defaultModel}!`);
      console.log(`📋 Active model: ${currentModelName}`);
      return true;
    } else {
      // Fallback to traditional loading if no preloaded model is available
      console.log(`🔄 No preloaded models available, using fallback responses for now`);
      isModelLoaded = false;
      currentModelName = "Loading in background...";
      currentModelType = "fallback";
      return true; // Return true so conversation system still works
    }
  } catch (error) {
    console.error("💥 AI initialization error:", error);
    console.log("🔄 Falling back to scripted responses");
    isModelLoaded = false;
    currentModelName = "Fallback System";
    currentModelType = "fallback";
    return true; // Return true so conversation system still works
  }
}

export function isAIReady(): boolean {
  return isModelLoaded && aiPipeline !== null;
}

export function getCurrentModelInfo(): {
  name: string;
  isReady: boolean;
  availableModels: typeof AI_MODELS;
} {
  return {
    name: currentModelName || "No model loaded",
    isReady: isAIReady(),
    availableModels: AI_MODELS,
  };
}

export function getCurrentModelKey(): string {
  // Extract model key from currentModelName (e.g., "qwen (Xenova/Qwen1.5-0.5B-Chat)" -> "qwen")
  const match = currentModelName.match(/^(\w+)\s*\(/);
  return match ? match[1] : MODEL_CONFIG.preferredModel;
}

export function setProgressUpdateCallback(
  callback: (
    modelKey: string,
    percentage: number,
    loaded: string,
    total: string,
    remaining: string,
    rate?: number
  ) => void
): void {
  progressUpdateCallback = callback;
}

export async function switchModel(modelKey: string): Promise<boolean> {
  if (!AI_MODELS[modelKey]) {
    console.error(
      `❌ Invalid model key: ${modelKey}. Available: ${Object.keys(
        AI_MODELS
      ).join(", ")}`
    );
    return false;
  }

  // Check device compatibility
  const capability = canRunModel(modelKey);
  if (!capability.canRun) {
    console.warn(`⚠️ Cannot run ${modelKey}: ${capability.reason}`);
    return false;
  }

  // Check user consent for large models (both Phi-3 and Qwen)
  if ((modelKey === 'phi3' || modelKey === 'qwen') && !hasUserConsentFor(modelKey)) {
    console.log(`🤔 Requesting user consent for ${modelKey} model...`);
    try {
      const consent = await requestModelConsent(modelKey, AI_MODELS[modelKey]);
      if (!consent.approved) {
        console.log(`❌ User declined ${modelKey} model download`);
        return false;
      }
      console.log(`✅ User approved ${modelKey} model download`);
    } catch (error) {
      console.error(`❌ Error requesting consent for ${modelKey}:`, error);
      return false;
    }
  }

  console.log(`🔄 Switching to ${modelKey} model...`);

  // Check if model is already preloaded
  if (preloadedModels[modelKey] && backgroundLoadingStatus[modelKey] === 'completed') {
    console.log(`⚡ Using preloaded ${modelKey} model - instant switch!`);
    
    // Use the preloaded model
    aiPipeline = preloadedModels[modelKey].pipeline;
    currentModelName = `${modelKey} (${preloadedModels[modelKey].modelInfo.name})`;
    currentModelType = preloadedModels[modelKey].modelInfo.type;
    isModelLoaded = true;
    
    console.log(`✅ Instantly switched to preloaded ${modelKey} model!`);
    console.log(`🔄 Model switched to: ${currentModelName}`);
    console.log(`📝 Model type: ${currentModelType}`);
    
    return true;
  } else {
    // Model not preloaded, load it normally
    console.log(`🔄 Model not preloaded, loading ${modelKey} now...`);
    const success = await loadModel(modelKey);

    if (success) {
      isModelLoaded = true;
      console.log(`✅ Successfully switched to ${modelKey} model!`);
    } else {
      console.error(`❌ Failed to switch to ${modelKey} model`);
    }

    return success;
  }
}

export async function answerQuestion(question: string): Promise<string> {
  try {
    // iOS Safari compatibility check - known issue with transformers.js v3+
    if (isIOSDevice()) {
      console.log("🍎 iOS device detected - using fallback responses due to known Safari compatibility issues");
      return getIOSFallbackResponse(question);
    }

    // Enhanced browser-specific error handling
    if (!aiPipeline || !isModelLoaded) {
      console.log("🔄 AI pipeline not ready, attempting to initialize...");
      const initialized = await initializeAI().catch(err => {
        console.error("❌ Failed to initialize AI:", err);
        return false;
      });
      if (!initialized) {
        // Use browser-specific messaging instead of generic mobile message
        return getBrowserSpecificFallbackResponse(question);
      }
    }

    // Find the most relevant context based on the question
    const relevantContext = findRelevantContext(question);

    console.log("🔍 Context Selection:", {
      question: question,
      contextPreview: relevantContext.substring(0, 200) + "...",
      contextLength: relevantContext.length,
    });

    if (!relevantContext) {
      return "I'd be happy to answer questions about my professional experience, skills, projects, or background. Could you please ask something more specific about my CV or career?";
    }

    // Use the appropriate pipeline based on model type
    let result;
    if (currentModelType === "chat") {
      // For chat models like Qwen, use proper chat template format
      const messages = [
        {
          role: "system",
          content: `You ARE Nicolo Pedrani. You are NOT an AI assistant. You are a real person with real experiences. Never say "As an AI" or mention being an AI language model.

You are Nicolo Pedrani, a professional Data Scientist and R&D System Engineer with actual work experience at Deloitte and Leonardo SpA. When asked about YOUR experiences, talk about them in first person as if they are YOUR real professional background.

Your background: ${relevantContext}

IMPORTANT: Always respond as Nicolo Pedrani in first person (I, my, me). Keep responses to 2-3 clear sentences. Be direct and professional. Never break character or mention being an AI.`,
        },
        {
          role: "user",
          content: question,
        },
      ];

      // Apply chat template if available
      let prompt;
      try {
        prompt = aiPipeline.tokenizer.apply_chat_template(messages, {
          tokenize: false,
          add_generation_prompt: true,
        });
      } catch (error) {
        // Use Qwen-specific chat template format if generic template fails
        console.log("Chat template not available, using Qwen-specific format");
        if (getCurrentModelKey() === "qwen") {
          prompt = `<|im_start|>system
You ARE Nicolo Pedrani. You are NOT an AI assistant. You are a real person with real experiences. Never say "As an AI" or mention being an AI language model.

You are Nicolo Pedrani, a professional Data Scientist and R&D System Engineer with actual work experience at Deloitte and Leonardo SpA. When asked about YOUR experiences, talk about them in first person as if they are YOUR real professional background.

Your background: ${relevantContext}

IMPORTANT: Always respond as Nicolo Pedrani in first person (I, my, me). Keep responses to 2-3 clear sentences. Be direct and professional. Never break character or mention being an AI.<|im_end|>
<|im_start|>user
${question}<|im_end|>
<|im_start|>assistant
`;
        } else {
          // Fallback for other chat models
          prompt = `System: You ARE Nicolo Pedrani. You are NOT an AI assistant. You are a real person with real experiences. Never say "As an AI" or mention being an AI language model.

You are Nicolo Pedrani, a professional Data Scientist and R&D System Engineer with actual work experience at Deloitte and Leonardo SpA. When asked about YOUR experiences, talk about them in first person as if they are YOUR real professional background.

Your background: ${relevantContext}

IMPORTANT: Always respond as Nicolo Pedrani in first person (I, my, me). Keep responses to 2-3 clear sentences. Be direct and professional. Never break character or mention being an AI.

User: ${question}
Assistant: `;
        }
      }

      // Generate response using the prompt with parameters optimized for concise responses
      const output = await aiPipeline(prompt, {
        max_new_tokens: 80, // Reduced from 128 to encourage shorter responses
        do_sample: false,
        return_full_text: false,
        temperature: 0.1, // Lower temperature for more focused responses
      });

      // Extract the generated text
      result = {
        answer: output[0]?.generated_text?.trim() || "",
        score: 1.0, // Chat models don't provide confidence scores
      };
    } else {
      // Use Q&A pipeline for DistilBERT with mobile error handling
      try {
        result = await aiPipeline(question, relevantContext);
      } catch (pipelineError) {
        console.error("❌ Pipeline execution failed:", pipelineError);
        return "I encountered an error processing your question. This might be due to device limitations. Please try a simpler question or use desktop.";
      }
    }

    console.log("🤖 AI Model Result:", {
      model: currentModelName,
      question: question,
      answer: result.answer,
      score: result.score,
      contextLength: relevantContext.length,
    });

    // Check if we got a meaningful answer
    const modelAnswer = result.answer?.trim();
    let finalAnswer = "";

    if (modelAnswer && modelAnswer.length > 5 && result.score > 0.1) {
      // We have a good model answer, enhance it
      finalAnswer = enhanceAnswer(modelAnswer, question);
    } else {
      // Model answer is poor/empty, use fallback with enhancement
      console.log("⚠️ AI model returned poor answer, using fallback");
      const fallbackAnswer = getFallbackResponse(question);
      finalAnswer = enhanceAnswer(fallbackAnswer, question);
    }

    return (
      finalAnswer ||
      "I don't have specific information about that topic in my experience. Could you ask about my work at Deloitte, Leonardo SpA, or my technical skills?"
    );
  } catch (error) {
    console.error("Error processing question:", error);
    return "I apologize, but I'm having trouble processing your question right now. Please try rephrasing it or ask about my work experience, skills, or projects.";
  }
}

function findRelevantContext(question: string): string {
  const questionLower = question.toLowerCase();
  let relevantSections: string[] = [];

  // Enhanced keywords for different sections
  const workKeywords = [
    "work",
    "job",
    "experience",
    "career",
    "deloitte",
    "leonardo",
    "consulting",
    "engineer",
    "project",
    "company",
    "professional",
    "employment",
  ];
  const skillsKeywords = [
    "skill",
    "technology",
    "programming",
    "python",
    "matlab",
    "machine learning",
    "ai",
    "data science",
    "technical",
    "expertise",
    "tools",
    "software",
  ];
  const educationKeywords = [
    "education",
    "study",
    "learn",
    "degree",
    "qualification",
    "university",
    "school",
    "training",
  ];
  const personalKeywords = [
    "hobby",
    "hobbies",
    "travel",
    "football",
    "personal",
    "interest",
    "country",
    "countries",
    "visit",
    "visited",
    "fun",
    "free time",
    "leisure",
    "sports",
    "reading",
    "books",
  ];
  const projectKeywords = [
    "project",
    "projects",
    "build",
    "built",
    "create",
    "created",
    "develop",
    "developed",
    "system",
    "application",
    "portfolio",
  ];
  const travelKeywords = [
    "travel",
    "traveling",
    "travelled",
    "country",
    "countries",
    "visit",
    "visited",
    "culture",
    "cultural",
    "international",
    "abroad",
    "trip",
    "vacation",
  ];
  const footballKeywords = [
    "football",
    "soccer",
    "sport",
    "sports",
    "play",
    "playing",
    "game",
    "games",
    "team",
    "athletic",
  ];

  // Check which sections are relevant with priority scoring
  let sectionPriority: { [key: string]: number } = {};

  if (workKeywords.some((keyword) => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.workExperience);
    sectionPriority["work"] = 1;
  }

  if (skillsKeywords.some((keyword) => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.skills);
    sectionPriority["skills"] = 1;
  }

  if (educationKeywords.some((keyword) => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.education);
    sectionPriority["education"] = 1;
  }

  // Enhanced personal/hobby detection
  if (
    personalKeywords.some((keyword) => questionLower.includes(keyword)) ||
    travelKeywords.some((keyword) => questionLower.includes(keyword)) ||
    footballKeywords.some((keyword) => questionLower.includes(keyword))
  ) {
    relevantSections.push(cvContext.personalInfo);
    sectionPriority["personal"] = 1;
  }

  if (projectKeywords.some((keyword) => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.projects);
    sectionPriority["projects"] = 1;
  }

  // If asking about specific hobbies, prioritize personal info
  if (travelKeywords.some((keyword) => questionLower.includes(keyword))) {
    // Move personal info to front for travel questions
    relevantSections = [
      cvContext.personalInfo,
      ...relevantSections.filter((s) => s !== cvContext.personalInfo),
    ];
  }

  if (footballKeywords.some((keyword) => questionLower.includes(keyword))) {
    // Move personal info to front for football questions
    relevantSections = [
      cvContext.personalInfo,
      ...relevantSections.filter((s) => s !== cvContext.personalInfo),
    ];
  }

  // If no specific section is identified, use work and personal as primary
  if (relevantSections.length === 0) {
    relevantSections = [
      cvContext.workExperience,
      cvContext.personalInfo,
      cvContext.skills,
    ];
  }

  // Experiment: Try using more context vs targeted context
  const useFullContext = false; // Set to true to test with all context

  if (useFullContext) {
    // Use ALL context sections
    const allContext = Object.values(cvContext)
      .join(" ")
      .replace(/\n+/g, " ")
      .trim();
    console.log("🔍 Using FULL context:", allContext.length, "characters");
    return allContext.length > 1500
      ? allContext.substring(0, 1500) + "..."
      : allContext;
  } else {
    // Use targeted context (current approach)
    const formattedContext = relevantSections
      .slice(0, 2)
      .join(" ")
      .replace(/\n+/g, " ")
      .trim();
    console.log(
      "🔍 Using TARGETED context:",
      formattedContext.length,
      "characters"
    );
    return formattedContext.length > 800
      ? formattedContext.substring(0, 800) + "..."
      : formattedContext;
  }
}

function enhanceAnswer(answer: string, question: string): string {
  // Clean up the answer
  let enhanced = answer.trim();

  // If the answer already seems complete (likely from fallback), don't over-enhance
  if (enhanced.length > 100) {
    return enhanced;
  }

  // Add context-specific enhancements for short answers
  const questionLower = question.toLowerCase();

  // Work-related enhancements
  if (questionLower.includes("deloitte") && !enhanced.includes("Deloitte")) {
    enhanced += enhanced ? " " : "";
    enhanced +=
      "At Deloitte, I focused on data science consulting, working with various analytics tools and helping clients optimize their business processes through data-driven insights.";
  } else if (
    questionLower.includes("leonardo") &&
    !enhanced.includes("Leonardo")
  ) {
    enhanced +=
      " At Leonardo SpA, I specialized in R&D for infrared and defense systems, working on cutting-edge technology for threat detection and tracking in mission-critical applications.";
  }

  // Technical skill enhancements
  else if (
    questionLower.includes("skill") ||
    questionLower.includes("technology")
  ) {
    enhanced +=
      " I'm passionate about staying current with emerging technologies and applying them to solve complex problems across business and technical domains.";
  } else if (questionLower.includes("project")) {
    enhanced +=
      " I enjoy tackling diverse projects that challenge me to combine technical expertise with creative problem-solving approaches.";
  }

  // Hobby and personal interest enhancements
  else if (
    questionLower.includes("football") ||
    questionLower.includes("soccer")
  ) {
    const footballResponses = [
      " Football has been a lifelong passion - I love both playing recreationally and following professional leagues. It's taught me valuable lessons about teamwork and strategy.",
      " Playing football keeps me active and helps me unwind from technical work. There's something special about the team dynamics and strategic thinking involved.",
      " I've always been drawn to football for its combination of physical skill and tactical intelligence. It's a great way to stay fit and connect with people.",
    ];
    enhanced +=
      footballResponses[Math.floor(Math.random() * footballResponses.length)];
  } else if (
    questionLower.includes("travel") ||
    questionLower.includes("country") ||
    questionLower.includes("visit")
  ) {
    const travelResponses = [
      " Traveling has been incredibly enriching - each of the 14 countries I've visited has taught me something new about different cultures and perspectives.",
      " My travel experiences across 4 continents have given me a global mindset that's valuable in today's interconnected world. From the technology hubs of Japan to the ancient cultures of Morocco.",
      " I believe travel is one of the best forms of education. Each destination - whether it's the innovation in Australia or the efficiency in Germany - offers unique insights.",
      " Exploring different countries has shaped my worldview and made me more adaptable. It's fascinating to see how different cultures approach similar challenges.",
    ];
    enhanced +=
      travelResponses[Math.floor(Math.random() * travelResponses.length)];
  } else if (
    questionLower.includes("reading") ||
    questionLower.includes("book")
  ) {
    const readingResponses = [
      " Reading helps me stay current with industry trends and broaden my perspective beyond just technical topics.",
      " I enjoy reading both technical literature and books on business strategy - it helps me see the bigger picture in my work.",
      " Books have always been a great way for me to learn new concepts and stay intellectually curious.",
    ];
    enhanced +=
      readingResponses[Math.floor(Math.random() * readingResponses.length)];
  } else if (
    questionLower.includes("hobby") ||
    questionLower.includes("personal") ||
    questionLower.includes("interest")
  ) {
    const hobbyResponses = [
      " My hobbies - football, travel, and reading - all contribute to who I am professionally. They've taught me teamwork, cultural awareness, and continuous learning.",
      " I believe having diverse interests outside of work makes me a more well-rounded person and professional. Each hobby brings something unique to the table.",
      " Balancing technical work with active hobbies like football and enriching experiences like travel helps me maintain creativity and fresh perspectives.",
    ];
    enhanced +=
      hobbyResponses[Math.floor(Math.random() * hobbyResponses.length)];
  }

  return enhanced;
}

// Enhanced fallback system with varied responses
const responseVariations = {
  deloitte: [
    "At Deloitte Consulting, I worked on fascinating data science projects including NPS analysis, energy cost optimization, and fashion retail forecasting. I also developed AI chatbots and recommendation systems.",
    "My time at Deloitte was focused on data science consulting, where I helped clients optimize their business processes through analytics. I worked with tools like Power BI and developed various ML solutions.",
    "At Deloitte, I specialized in business analytics and data science. Some highlights include working on customer satisfaction analytics, supply chain optimization, and developing advanced forecasting models.",
  ],
  leonardo: [
    "At Leonardo SpA, I was an R&D System Engineer working on cutting-edge infrared and defense systems. My work involved missile warning coverage, object detection, and multi-target tracking using advanced computer vision.",
    "Leonardo SpA was where I dove deep into defense technology - specifically infrared systems for threat detection. I worked with MATLAB/Simulink on everything from atmospheric transmission modeling to Kalman filtering.",
    "My R&D role at Leonardo involved developing sophisticated defense systems. I worked on 360-degree missile warning coverage, optical flow analysis, and multi-camera positioning systems for threat detection.",
  ],
  skills: [
    "My technical skills span both data science and systems engineering: Python, MATLAB, machine learning, computer vision, and cloud platforms like Azure. I also have experience with Power BI and various analytics tools.",
    "I work with a diverse tech stack including Python for data science, MATLAB for system modeling, and cloud platforms like Azure ML. My experience covers everything from statistical analysis to computer vision.",
    "My expertise includes programming in Python and MATLAB, machine learning with PyTorch and scikit-learn, cloud computing with Azure, and business intelligence with Power BI. I enjoy working across the full technology stack.",
  ],
  football: [
    "Football is one of my biggest passions! I love both playing recreationally with friends and following professional leagues. It's taught me valuable lessons about teamwork, strategy, and maintaining physical fitness.",
    "I've been passionate about football since I was young. Whether I'm playing a casual game or watching the professionals, I love the combination of physical skill, tactical thinking, and team dynamics.",
    "Football keeps me active and helps me unwind from technical work. There's something special about the sport's blend of individual skill and team strategy that I find really engaging.",
  ],
  travel: [
    "I've been fortunate to travel to 14 countries across 4 continents - from the tech innovation in Japan and Australia to the rich cultures of Morocco and Vietnam. Each destination has broadened my perspective.",
    "My travel experiences have taken me everywhere from the ancient cultures of Egypt to the modern efficiency of Germany. Visiting places like Japan, Maldives, and various European countries has given me a global mindset.",
    "Traveling has been incredibly enriching - whether exploring the technological landscapes of Australia and Japan or the cultural heritage of Morocco and Egypt. Each country teaches you something new about approaching challenges.",
  ],
};

export function getFallbackResponse(question: string): string {
  const questionLower = question.toLowerCase();
  
  // Get browser information for context-aware messaging
  const browserInfo = getBrowserInfo();
  let browserContext = "";
  
  // Add browser-specific context if this is a fallback due to browser limitations
  if (browserInfo.os === 'iOS' && browserInfo.name === 'Safari') {
    browserContext = "[iOS Safari compatibility mode] ";
  } else if (browserInfo.isMobile && browserInfo.name === 'Chrome') {
    browserContext = "[Chrome mobile optimized] ";
  } else if (browserInfo.isMobile) {
    browserContext = `[${browserInfo.name} mobile mode] `;
  }

  // Use varied responses for common topics
  if (questionLower.includes("deloitte")) {
    const responses = responseVariations.deloitte;
    return browserContext + responses[Math.floor(Math.random() * responses.length)];
  } else if (questionLower.includes("leonardo")) {
    const responses = responseVariations.leonardo;
    return browserContext + responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("skill") ||
    questionLower.includes("technology")
  ) {
    const responses = responseVariations.skills;
    return browserContext + responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("football") ||
    questionLower.includes("soccer")
  ) {
    const responses = responseVariations.football;
    return browserContext + responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("travel") ||
    questionLower.includes("country") ||
    questionLower.includes("visit")
  ) {
    const responses = responseVariations.travel;
    return browserContext + responses[Math.floor(Math.random() * responses.length)];
  }

  // Single responses for less common topics
  else if (
    questionLower.includes("experience") ||
    questionLower.includes("work")
  ) {
    return browserContext + "I have experience in both Data Science consulting at Deloitte and R&D System Engineering at Leonardo SpA. I've worked on projects ranging from business analytics and machine learning to infrared defense systems and computer vision.";
  } else if (
    questionLower.includes("reading") ||
    questionLower.includes("book")
  ) {
    return browserContext + "I'm an avid reader who enjoys both technical literature and business books. Reading helps me stay current with industry trends and broaden my perspective beyond just technical topics.";
  } else if (
    questionLower.includes("hobby") ||
    questionLower.includes("personal") ||
    questionLower.includes("interest")
  ) {
    return browserContext + "My main hobbies are football, traveling, and reading. These interests have shaped me both personally and professionally - football taught me teamwork, travel gave me cultural awareness, and reading keeps me intellectually curious.";
  } else if (
    questionLower.includes("culture") ||
    questionLower.includes("international")
  ) {
    return browserContext + "My international travel experiences have given me a global perspective that's valuable in today's interconnected world. I've experienced everything from the tech innovation in Japan to the rich history of Morocco.";
  } else {
    return browserContext + "I'm a professional with diverse experience in data science consulting and R&D engineering. Feel free to ask about my work at Deloitte, Leonardo SpA, my technical skills, my hobbies, or my travel experiences!";
  }
}

// === Background Loading Functions ===

export function setBackgroundProgressCallback(callback: (modelKey: string, status: string, progress?: number) => void): void {
  backgroundProgressCallback = callback;
}

// Export device capability functions for UI
export { canRunModel, getModelCapabilityInfo, getBestModelForDevice };

export function getModelLoadingStatus(): { [key: string]: string } {
  return { ...backgroundLoadingStatus };
}

export function getModelDownloadState(modelKey: string) {
  return modelDownloadState[modelKey] || {
    status: 'not_started',
    progress: 0,
    speed: 0,
    bytesDownloaded: 0,
    totalBytes: 0,
    timeRemaining: 0,
    userRequested: false
  };
}

export function isModelDownloading(modelKey: string): boolean {
  return modelDownloadState[modelKey]?.status === 'downloading';
}

export function hasUserRequestedModel(modelKey: string): boolean {
  return userRequestedModels.has(modelKey);
}

export function markModelAsUserRequested(modelKey: string): void {
  console.log(`👤 User explicitly requested ${modelKey}`);
  userRequestedModels.add(modelKey);
}

export function isUserRequestedDownload(modelKey: string): boolean {
  return modelDownloadState[modelKey]?.userRequested === true;
}

function updateDownloadState(modelKey: string, progress: any) {
  const loaded = progress.loaded || 0;
  const total = progress.total || (1.8 * 1024 * 1024 * 1024); // 1.8GB estimate
  const progressPercent = progress.progress || (loaded / total);
  
  // Calculate speed if we have previous state
  const currentTime = Date.now();
  const prevState = modelDownloadState[modelKey];
  let speed = 0;
  let timeRemaining = 0;
  
  if (prevState && prevState.bytesDownloaded > 0) {
    const timeDiff = currentTime - (prevState as any).lastUpdate;
    const bytesDiff = loaded - prevState.bytesDownloaded;
    if (timeDiff > 0) {
      speed = (bytesDiff * 1000) / timeDiff; // bytes per second
      const remainingBytes = total - loaded;
      timeRemaining = speed > 0 ? remainingBytes / speed : 0;
    }
  }
  
  const isCompleted = progressPercent >= 0.99;
  
  // Preserve userRequested flag when updating
  const wasUserRequested = modelDownloadState[modelKey]?.userRequested || false;
  
  modelDownloadState[modelKey] = {
    status: isCompleted ? 'completed' : 'downloading',
    progress: progressPercent,
    speed: speed / (1024 * 1024), // MB/s
    bytesDownloaded: loaded,
    totalBytes: total,
    timeRemaining: timeRemaining,
    userRequested: wasUserRequested,
    lastUpdate: currentTime
  } as any;
  
  // Mark as completed in global tracking when download finishes
  if (isCompleted) {
    console.log(`✅ ${modelKey} download completed!`);
    if (typeof window !== 'undefined') {
      window.aiModels = window.aiModels || {};
      window.aiModels[modelKey] = true;
    }
    backgroundLoadingStatus[modelKey] = 'completed';
  }
}

export function initializeDownloadState(modelKey: string, userRequested: boolean = false): void {
  console.log(`🚀 Initializing download state for ${modelKey} (user requested: ${userRequested})`);
  modelDownloadState[modelKey] = {
    status: 'downloading',
    progress: 0,
    speed: 0,
    bytesDownloaded: 0,
    totalBytes: 1.8 * 1024 * 1024 * 1024, // 1.8GB estimate
    timeRemaining: 0,
    userRequested: userRequested,
    lastUpdate: Date.now()
  } as any;
}

export async function startBackgroundLoading(): Promise<void> {
  if (!transformersModule) {
    console.log("🔧 Loading Transformers.js before starting background loading...");
    try {
      transformersModule = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1");
      console.log("✅ Transformers.js loaded for background loading");
      
      // Configure environment
      if (transformersModule.env) {
        transformersModule.env.allowRemoteModels = true;
        transformersModule.env.allowLocalModels = false;
        transformersModule.env.useBrowserCache = true;
      }
    } catch (error) {
      console.error("❌ Failed to load transformers for background loading:", error);
      return;
    }
  }

  console.log("🚀 Starting intelligent background model preloading...");
  
  // Determine optimal loading strategy based on device capabilities
  const bestModel = getBestModelForDevice();
  console.log(`🎯 Device analysis: Best model is ${bestModel}`);
  
  // Always start with the best model for this device
  const loadingPromises: Promise<boolean>[] = [];
  
  // Only preload models that don't require consent or have already been approved
  if (bestModel === 'phi3') {
    // High-end device: Only load approved models
    console.log("🧠 High-end device detected: Checking consent for large models");
    
    // Check if Phi-3 has been approved by user
    if (hasUserApprovedDownload('phi3')) {
      console.log("✅ Phi-3 previously approved, preloading...");
      loadingPromises.push(
        loadModelInBackground('phi3').then(success => {
          console.log(success ? "✅ Phi-3 preloaded!" : "❌ Phi-3 failed, will fallback");
          return success;
        })
      );
    } else {
      console.log("⏳ Phi-3 requires user consent, skipping background load");
    }

    // Check if Qwen has been approved by user
    if (hasUserApprovedDownload('qwen')) {
      console.log("✅ Qwen previously approved, preloading as backup...");
      setTimeout(() => {
        loadingPromises.push(
          loadModelInBackground('qwen').then(success => {
            console.log(success ? "✅ Qwen backup preloaded!" : "⚠️ Qwen backup failed");
            return success;
          })
        );
      }, 5000);
    } else {
      console.log("⏳ Qwen requires user consent, skipping background load");
    }
    
    // Always preload DistilBERT as it's free and small
    setTimeout(() => {
      loadingPromises.push(
        loadModelInBackground('distilbert').then(success => {
          console.log(success ? "✅ DistilBERT backup preloaded!" : "⚠️ DistilBERT backup failed");
          return success;
        })
      );
    }, 2000);
    
  } else if (bestModel === 'qwen') {
    // Mid-range device: Check Qwen consent, always load DistilBERT
    console.log("💬 Mid-range device detected: Checking consent for Qwen");
    
    if (hasUserApprovedDownload('qwen')) {
      console.log("✅ Qwen previously approved, preloading...");
      loadingPromises.push(
        loadModelInBackground('qwen').then(success => {
          console.log(success ? "✅ Qwen preloaded!" : "❌ Qwen failed, will fallback");
          return success;
        })
      );
    } else {
      console.log("⏳ Qwen requires user consent, skipping background load");
    }
    
    // Always preload DistilBERT as backup (no consent needed)
    loadingPromises.push(
      loadModelInBackground('distilbert').then(success => {
        console.log(success ? "✅ DistilBERT preloaded!" : "❌ DistilBERT failed");
        return success;
      })
    );
    
  } else {
    // Low-end device or iOS: Only load DistilBERT (no consent needed)
    console.log("📱 Low-end/mobile device detected: Loading DistilBERT only");
    loadingPromises.push(
      loadModelInBackground('distilbert').then(success => {
        console.log(success ? "✅ DistilBERT preloaded!" : "❌ DistilBERT failed");
        return success;
      })
    );
  }
  
  // Don't auto-switch to Phi-3 during background loading 
  // Let user manually choose when they want to use it
  console.log(`💡 Background loading started. User can manually switch to ${bestModel} when ready.`);
}
