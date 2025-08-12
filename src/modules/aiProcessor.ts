// modules/aiProcessor.ts - AI processing with Transformers.js v3 CDN integration

import {
  requestModelConsent,
  hasUserConsentFor,
  hasUserApprovedDownload,
} from "./modelConsent";

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

// Initialize transformers.js from CDN using ES module import (your documented approach)
async function initializeTransformers(): Promise<void> {
  if (transformersModule) return; // Already loaded

  try {
    console.log("📦 Loading Transformers.js from CDN...");

    // Use ES module dynamic import (matches your TECHNICAL-STRATEGY.md)
    const { pipeline, env } = await import(
      "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.1"
    );

    // Configure environment for static sites (from your EXAMPLES_USAGE.md)
    env.allowRemoteModels = true;
    env.allowLocalModels = false;

    // Phi-3 specific configuration from working examples
    env.backends.onnx.wasm.proxy = false;
    env.backends.onnx.wasm.numThreads = 1; // Disable multithreading (known bug)

    transformersModule = { pipeline };

    console.log("✅ Transformers.js loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load transformers.js:", error);
    throw error;
  }
}

// Import enhanced browser detection
import {
  getBrowserInfo,
  getCompatibilityInfo,
  isIOSDevice,
  isMobileDevice,
  supportsAI,
} from "./browserDetection";

// Enhanced device capability detection for Phi-3 requirements
function getDeviceMemoryGB(): number {
  // Use Device Memory API if available, otherwise estimate
  if ("deviceMemory" in navigator) {
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
  return "gpu" in navigator;
}

function canRunModel(modelKey: string): {
  canRun: boolean;
  reason?: string;
  suggestion?: string;
} {
  const model = AI_MODELS[modelKey];
  if (!model) {
    return { canRun: false, reason: "Model not found" };
  }

  // Pre-written responses are always available
  if (modelKey === "prewritten") {
    return { canRun: true };
  }

  // iOS devices cannot run AI models
  if (isIOSDevice()) {
    return {
      canRun: false,
      reason: "iOS devices have Transformers.js compatibility issues",
      suggestion:
        "Use pre-written responses or desktop browser for AI features",
    };
  }

  // Check memory requirements
  const availableMemory = getDeviceMemoryGB();
  if (availableMemory < model.minMemoryGB) {
    return {
      canRun: false,
      reason: `Requires ${model.minMemoryGB}GB RAM, detected ${availableMemory}GB`,
      suggestion: `Try ${
        model.minMemoryGB <= 2 ? "DistilBERT" : "Qwen"
      } for better performance`,
    };
  }

  // Check WebGPU for models that strongly benefit from it
  if (model.recommendedWebGPU && !hasWebGPUSupport()) {
    // Phi-3 can still run on WASM but will be slower
    if (modelKey === "phi3") {
      return {
        canRun: true,
        reason: "Will use CPU processing (slower performance)",
        suggestion: "Use Chrome/Edge for faster WebGPU acceleration",
      };
    }
  }

  return { canRun: true };
}

function getBestModelForDevice(): string {
  // This function is used ONLY for recommendations, not auto-switching
  // For iOS or incompatible devices, recommend prewritten
  if (isIOSDevice()) {
    return "prewritten";
  }

  // Try AI models in order of preference/capability for recommendation
  const modelPriority = ["phi3", "qwen", "distilbert"];

  for (const modelKey of modelPriority) {
    const capability = canRunModel(modelKey);
    if (capability.canRun) {
      return modelKey; // This is just a recommendation, not auto-selection
    }
  }

  // Final recommendation: pre-written responses
  return "prewritten";
}

function getModelCapabilityInfo(modelKey: string): string {
  const model = AI_MODELS[modelKey];
  const capability = canRunModel(modelKey);

  if (!model) return "Model information not available";

  const parts = [`📊 ${model.size}`, `🧠 ${model.minMemoryGB}GB RAM required`];

  if (model.recommendedWebGPU) {
    parts.push(`⚡ WebGPU recommended`);
  }

  if (!capability.canRun && capability.reason) {
    parts.push(`⚠️ ${capability.reason}`);
  }

  return parts.join(" • ");
}

// Browser-specific fallback responses based on compatibility
function getBrowserSpecificFallbackResponse(question: string): string {
  const browserInfo = getBrowserInfo();
  const compatInfo = getCompatibilityInfo();
  const lowerQ = question.toLowerCase();

  // Generate context-aware responses based on question type
  let contextResponse = "";

  // Greeting responses
  if (
    lowerQ.includes("hi") ||
    lowerQ.includes("hello") ||
    lowerQ.includes("ciao")
  ) {
    contextResponse =
      "Hi there! I'm Nicolo Pedrani. Welcome to my interactive CV! I'm a Data Scientist at Deloitte Consulting and former R&D System Engineer. What would you like to know about my experience?";
  }
  // Experience-related questions
  else if (
    lowerQ.includes("experience") ||
    lowerQ.includes("work") ||
    lowerQ.includes("job")
  ) {
    contextResponse =
      "I currently work as a Data Scientist at Deloitte Consulting, focusing on business analytics, machine learning, and client solutions. Previously, I was an R&D System Engineer at Leonardo SpA, working on defense systems and infrared technologies.";
  }
  // Skills questions
  else if (
    lowerQ.includes("skill") ||
    lowerQ.includes("technology") ||
    lowerQ.includes("programming")
  ) {
    contextResponse =
      "My key skills include Python, R, machine learning, PyTorch, scikit-learn, Power BI, Azure ML, and statistical analysis. I also have experience with MATLAB, Simulink, and system engineering from my defense industry background.";
  }
  // Education questions
  else if (
    lowerQ.includes("education") ||
    lowerQ.includes("study") ||
    lowerQ.includes("university")
  ) {
    contextResponse =
      "I have a strong educational background in engineering and data science, which has equipped me with both theoretical knowledge and practical problem-solving skills across multiple domains.";
  }
  // Projects questions
  else if (lowerQ.includes("project") || lowerQ.includes("achievement")) {
    contextResponse =
      "I've worked on diverse projects including NPS analysis, energy cost optimization, fashion retail forecasting, recommendation systems, infrared detection systems, and missile warning technologies. Each project combined technical innovation with real business impact.";
  }
  // Default context
  else {
    contextResponse =
      "I'm Nicolo Pedrani - a Data Scientist at Deloitte with R&D experience at Leonardo SpA. I specialize in machine learning, business analytics, and defense systems. What specific aspect would you like to know more about?";
  }

  // Add browser-specific explanation
  let explanation = "";

  if (browserInfo.os === "iOS" && browserInfo.name === "Safari") {
    explanation =
      "I'm using pre-written responses because iOS Safari has known compatibility issues with AI models. ";
  } else if (browserInfo.isMobile && browserInfo.name === "Chrome") {
    explanation =
      "I'm using simplified responses on Chrome mobile for better performance. ";
  } else if (browserInfo.isMobile && browserInfo.name === "Firefox") {
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
let backgroundLoadingStatus: {
  [key: string]: "pending" | "loading" | "completed" | "error";
} = {
  prewritten: "completed", // Pre-written responses are always ready
  distilbert: "pending",
  qwen: "pending",
  phi3: "pending",
};

// Download state tracking for UI
let modelDownloadState: {
  [key: string]: {
    status: "not_started" | "downloading" | "completed" | "failed";
    progress: number;
    speed: number;
    bytesDownloaded: number;
    totalBytes: number;
    timeRemaining: number;
    userRequested: boolean; // NEW: Track if user explicitly requested this model
  };
} = {};

// Track which models user has explicitly requested (separate from background loading)
let userRequestedModels: Set<string> = new Set();
let backgroundProgressCallback:
  | ((modelKey: string, status: string, progress?: number) => void)
  | null = null;

// Available AI models - both Q&A and chat models
const AI_MODELS: { [key: string]: any } = {
  prewritten: {
    name: "Pre-Written Responses",
    description: "Instant, reliable responses based on CV content",
    size: "0MB",
    type: "fallback",
    minMemoryGB: 0,
    recommendedWebGPU: false,
  },
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
    description:
      "Qwen 2.5 0.5B Instruct - ONNX-optimized conversational model (verified working 2024)",
    size: "~500MB",
    type: "chat",
    minMemoryGB: 2,
    recommendedWebGPU: false,
  },
  phi3: {
    name: "onnx-community/Phi-3.5-mini-instruct-onnx-web",
    description:
      "Phi-3.5 Mini - Web-optimized ONNX model (verified working with transformers.js)",
    size: "~1.8GB",
    type: "chat",
    minMemoryGB: 4,
    recommendedWebGPU: true,
    workingExamples: [
      "https://huggingface.co/onnx-community/Phi-3.5-mini-instruct-onnx-web",
      "https://github.com/huggingface/transformers.js-examples",
    ],
  },
};

// Configuration - using @huggingface/transformers v3 with CDN
const MODEL_CONFIG = {
  preferredModel: "prewritten", // Default to pre-written for all devices
  fallbackModels: ["prewritten", "distilbert"],
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
  if (!model) {
    console.error(`❌ Invalid model key: ${modelKey}`);
    backgroundLoadingStatus[modelKey] = "error";
    return false;
  }

  // Initialize transformers.js if not already loaded
  if (!transformersModule) {
    try {
      await initializeTransformers();
    } catch (error) {
      console.error(
        `❌ Failed to initialize transformers for background loading of ${modelKey}:`,
        error
      );
      backgroundLoadingStatus[modelKey] = "error";
      return false;
    }
  }

  try {
    console.log(`🔄 Background loading ${modelKey} model: ${model.name}`);
    backgroundLoadingStatus[modelKey] = "loading";

    if (backgroundProgressCallback) {
      backgroundProgressCallback(modelKey, "loading", 0);
    }

    // Choose pipeline type based on model type
    const pipelineType =
      model.type === "chat" ? "text-generation" : "question-answering";

    // Configure options for background loading with Phi-3 specific settings
    const pipelineOptions: any = {
      device: hasWebGPUSupport() && model.recommendedWebGPU ? "webgpu" : "wasm",
      // Phi-3 specific configuration (critical for working properly)
      ...(modelKey === "phi3" && {
        dtype: "q4f16", // Web-optimized quantization format
        use_external_data_format: true, // Required for Phi-3
      }),
      progress_callback: (progress: any) => {
        if (progress.status === "downloading") {
          // Since content-length isn't available, we'll use a chunk-based progress estimate
          const chunkProgress = Math.min(
            progress.loaded ? Math.floor(progress.loaded / (1024 * 1024)) : 0,
            90
          );
          console.log(
            `📥 Background downloading ${modelKey}: ~${chunkProgress}MB loaded...`
          );

          // Only update download state if this is a user-requested download
          if (hasUserRequestedModel(modelKey)) {
            updateDownloadState(modelKey, progress);
          }

          // Send real progress data to UI if progress dialog is open
          if ((window as any).updateModelProgress) {
            const loaded = progress.loaded || 0;
            const total = progress.total || 1.8 * 1024 * 1024 * 1024; // 1.8GB estimate if not available

            (window as any).updateModelProgress({
              progress: progress.progress || loaded / total,
              bytesDownloaded: loaded,
              totalBytes: total,
            });
          }

          if (backgroundProgressCallback) {
            backgroundProgressCallback(modelKey, "downloading", chunkProgress);
          }
        } else if (progress.status === "loading") {
          console.log(`🧠 Loading ${modelKey} model into memory...`);
          if (backgroundProgressCallback) {
            backgroundProgressCallback(modelKey, "finalizing", 95);
          }
        }
      },
    };

    // Configure dtype for non-Phi3 models (Phi-3 already configured above)
    if (modelKey !== "phi3") {
      pipelineOptions.dtype = "q4"; // Use 4-bit quantization for efficiency
    }

    // Load the model and store it
    const pipeline = await transformersModule.pipeline(
      pipelineType,
      model.name,
      pipelineOptions
    );

    // Store the preloaded model
    preloadedModels[modelKey] = {
      pipeline,
      modelInfo: model,
      loadTime: Date.now(),
    };

    // Store in global window object to prevent double consent
    if (typeof window !== "undefined") {
      window.aiModels = window.aiModels || {};
      window.aiModels[modelKey] = true;
    }

    backgroundLoadingStatus[modelKey] = "completed";
    console.log(`✅ Background loading of ${modelKey} completed!`);

    if (backgroundProgressCallback) {
      backgroundProgressCallback(modelKey, "completed", 100);
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to background load ${modelKey} model:`, error);
    backgroundLoadingStatus[modelKey] = "error";
    if (backgroundProgressCallback) {
      backgroundProgressCallback(modelKey, "error", 0);
    }
    return false;
  }
}

async function loadModel(modelKey: string): Promise<boolean> {
  const model = AI_MODELS[modelKey];
  if (!model) {
    console.error(`❌ Invalid model key: ${modelKey}`);
    return false;
  }

  // Initialize transformers.js if not already loaded
  if (!transformersModule) {
    try {
      await initializeTransformers();
    } catch (error) {
      console.error(
        `❌ Failed to initialize transformers for ${modelKey}:`,
        error
      );
      return false;
    }
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
      device: hasWebGPUSupport() && model.recommendedWebGPU ? "webgpu" : "wasm",
      // Phi-3 specific configuration (critical for working properly)
      ...(modelKey === "phi3" && {
        dtype: "q4f16", // Web-optimized quantization format
        use_external_data_format: true, // Required for Phi-3
      }),
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
              totalBytes: total,
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

    // Configure dtype for non-Phi3 models (Phi-3 already configured above)
    if (modelKey !== "phi3") {
      pipelineOptions.dtype = "q4"; // Use 4-bit quantization for efficiency
    }

    // Load the model using CDN-based transformers
    aiPipeline = await transformersModule.pipeline(
      pipelineType,
      model.name,
      pipelineOptions
    );

    // Test the model based on its type
    console.log(`🧪 Testing ${modelKey} model...`);

    // Update progress dialog if visible
    if ((window as any).updateModelStatus) {
      (window as any).updateModelStatus(`🧪 Testing ${modelKey} model...`);
    }

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

    // Update progress dialog if visible
    if ((window as any).updateModelStatus) {
      (window as any).updateModelStatus(`✅ ${modelKey} model ready!`);
    }

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
    console.log("🔧 Initializing AI system with pre-written responses...");

    // EVERYONE starts with pre-written responses (user-driven upgrades only)
    console.log(
      "🔄 Starting with pre-written responses - AI models load only when user selects them"
    );
    isModelLoaded = true; // Pre-written responses are always "loaded"
    currentModelName = "prewritten (Pre-Written Responses)";
    currentModelType = "fallback";
    aiPipeline = null; // No AI pipeline needed for pre-written responses

    console.log("✅ Pre-written response system ready!");
    console.log("📋 Active model: Pre-Written Responses");
    console.log("💡 AI models will load when user explicitly selects them");

    return true;
  } catch (error) {
    console.error("💥 AI initialization error:", error);
    console.log("🔄 Falling back to pre-written responses");
    isModelLoaded = true;
    currentModelName = "prewritten (Pre-Written Responses)";
    currentModelType = "fallback";
    aiPipeline = null;
    return true;
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

  // Handle pre-written responses (always available)
  if (modelKey === "prewritten") {
    console.log("🔄 Switching to pre-written responses mode");
    currentModelName = "prewritten (Pre-Written Responses)";
    currentModelType = "fallback";
    isModelLoaded = true;
    aiPipeline = null; // No AI pipeline needed for pre-written
    return true;
  }

  // Check device compatibility for AI models
  const capability = canRunModel(modelKey);
  if (!capability.canRun) {
    console.warn(`⚠️ Cannot run ${modelKey}: ${capability.reason}`);
    return false;
  }

  // Check user consent for large models (both Phi-3 and Qwen)
  if (
    (modelKey === "phi3" || modelKey === "qwen") &&
    !hasUserConsentFor(modelKey)
  ) {
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
  if (
    preloadedModels[modelKey] &&
    backgroundLoadingStatus[modelKey] === "completed"
  ) {
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
      console.log(
        "🍎 iOS device detected - using fallback responses due to known Safari compatibility issues"
      );
      return getIOSFallbackResponse(question);
    }

    // Enhanced browser-specific error handling
    if (!aiPipeline || !isModelLoaded) {
      console.log("🔄 AI pipeline not ready, attempting to initialize...");
      const initialized = await initializeAI().catch((err) => {
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

    // Check if we're using pre-written responses (no AI pipeline)
    if (currentModelType === "fallback" || !aiPipeline) {
      console.log("🔄 Using pre-written fallback response");
      return getBrowserSpecificFallbackResponse(question);
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
    "computer vision",
    "tracking",
    "optical flow",
    "infrared",
    "ir",
    "fpa",
    "photodetector",
    "atmospheric modeling",
    "radiative transfer",
    "langchain",
    "rag",
    "power bi",
    "azure",
    "simulink",
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
    "ac como",
    "como",
    "professional player",
    "coach",
    "coaching",
    "trainer",
    "training",
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

// Semantic analysis for better topic matching
function analyzeQuestionTopics(questionLower: string): Record<string, number> {
  const topicScores: Record<string, number> = {};
  
  // Deloitte-specific keywords (weighted by specificity)
  const deloitteKeywords = {
    'nps': 3, 'net promoter score': 3, 'energy company': 3, 'exogenous variables': 3,
    'fashion retail': 3, 'supply chain': 3, 'forecasting': 2, 'customer segmentation': 3,
    'recommendation system': 3, 'langchain': 3, 'rag': 3, 'power bi': 3, 'dashboard': 2,
    'deloitte': 2, 'consulting': 1, 'data science': 1, 'analytics': 1
  };
  
  // Leonardo SpA-specific keywords
  const leonardoKeywords = {
    'fpa': 3, 'focal plane array': 3, 'photodetector': 3, 'infrared': 3, 'ir system': 3,
    'srr': 3, 'pdr': 3, 'cdr': 3, 'system requirements review': 3, 'optical flow': 3,
    'tracking algorithm': 3, 'atmospheric modeling': 3, 'radiative transfer': 3,
    'simulated scenario': 3, 'kalman filter': 3, 'computer vision': 2, 'defense': 2,
    'leonardo': 2, 'missile warning': 3, 'threat detection': 3
  };
  
  // Football-specific keywords
  const footballKeywords = {
    'ac como': 3, 'como': 2, 'professional soccer': 3, 'professional football': 3,
    'coaching': 2, 'coach': 2, 'teamwork': 2, 'football': 1, 'soccer': 1, 'sport': 1
  };
  
  // Travel-specific keywords (country-specific gets higher score)
  const travelKeywords = {
    'vietnam': 3, 'japan': 3, 'australia': 3, 'egypt': 3, 'germany': 3, 'morocco': 3,
    'cultural exchange': 3, 'global perspective': 2, 'international': 2,
    'travel': 1, 'country': 1, 'visit': 1, 'culture': 1
  };
  
  // Reading-specific keywords
  const readingKeywords = {
    'lord of the rings': 3, 'divulgative essays': 3, 'continuous learning': 2,
    'reading': 1, 'book': 1, 'literature': 2
  };
  
  // Technical skills keywords
  const skillsKeywords = {
    'python': 2, 'matlab': 2, 'pytorch': 2, 'scikit-learn': 2, 'azure ml': 3,
    'machine learning': 2, 'statistical analysis': 2, 'programming': 1,
    'technology': 1, 'skill': 1
  };
  
  // Calculate scores for each topic
  const allTopics = {
    deloitte: deloitteKeywords,
    leonardo: leonardoKeywords, 
    football: footballKeywords,
    travel: travelKeywords,
    reading: readingKeywords,
    skills: skillsKeywords
  };
  
  for (const [topic, keywords] of Object.entries(allTopics)) {
    let score = 0;
    for (const [keyword, weight] of Object.entries(keywords)) {
      if (questionLower.includes(keyword)) {
        score += weight;
      }
    }
    if (score > 0) {
      topicScores[topic] = score;
    }
  }
  
  return topicScores;
}

function getBestMatchingTopic(topicScores: Record<string, number>): string | null {
  let bestTopic = null;
  let highestScore = 0;
  
  for (const [topic, score] of Object.entries(topicScores)) {
    if (score > highestScore) {
      highestScore = score;
      bestTopic = topic;
    }
  }
  
  return highestScore >= 2 ? bestTopic : null; // Minimum threshold
}

// Enhanced fallback system with varied responses based on PROFILE.md
const responseVariations: Record<string, string[]> = {
  deloitte: [
    "At Deloitte Consulting, I worked on diverse data science projects including NPS (Net Promoter Score) forecasting for energy companies incorporating exogenous variables like energy cost fluctuations, fashion retail forecasting for supply chain optimization, and customer segmentation with personalized recommendation systems.",
    "My Deloitte experience involved advanced analytics: developing LangChain-based RAG (Retrieval-Augmented Generation) chatbots for customer service automation, creating interactive Power BI dashboards for real-time energy industry monitoring, and building predictive models across multiple business scenarios.",
    "At Deloitte, I specialized in business analytics across industries. Key projects included fashion retail demand prediction with inventory optimization, energy company customer satisfaction modeling using external market factors, and sophisticated recommendation engines based on behavioral clustering analysis.",
  ],
  leonardo: [
    "I currently work as a System R&D Engineer at Leonardo SpA, focusing on infrared optical systems with FPA (Focal Plane Array) photodetectors. My role spans system design with SRR/PDR/CDR reviews and algorithm development for tracking systems and optical flow analysis in real-time defense applications.",
    "At Leonardo SpA, I develop cutting-edge IR optical systems and computer vision algorithms. My work includes atmospheric modeling using radiative transfer theory, Kalman filter implementation for state estimation, and creating simulated scenarios to test system performance under various conditions.",
    "My Leonardo role involves two core activities: requirements engineering for defense systems and algorithm development for computer vision. I work extensively with FPA photodetectors, atmospheric radiative characteristics modeling, and tracking algorithms for missile warning and threat detection systems.",
  ],
  skills: [
    "My technical expertise spans data science and system engineering: Python with scikit-learn and PyTorch for ML, MATLAB/Simulink for system modeling, computer vision algorithms including tracking and optical flow, and cloud platforms like Azure ML and Azure Data Factory for scalable analytics.",
    "I work with a comprehensive tech stack: Python for statistical analysis and machine learning, MATLAB for defense system simulation, Power BI for business intelligence, and advanced computer vision techniques. My background bridges business analytics and technical R&D engineering.",
    "My core competencies include programming in Python and MATLAB, machine learning with PyTorch and scikit-learn, cloud computing with Azure ecosystem, business intelligence with Power BI dashboards, and specialized defense technology like IR systems and atmospheric modeling.",
  ],
  football: [
    "Football is my lifelong passion! I played as a professional soccer player at AC COMO and coached children in football fundamentals. The sport taught me teamwork, strategic thinking, and leadership - skills I directly apply to collaborative engineering projects and technical problem-solving.",
    "My football journey includes professional experience at AC COMO and mentoring young players as a coach. Beyond just a hobby, football developed my understanding of teamwork dynamics, tactical analysis, and performance under pressure - all valuable in defense system engineering.",
    "I've had an incredible football career from playing professionally at AC COMO to coaching the next generation. The discipline, collaboration skills, and strategic thinking learned through football continuously benefit my approach to complex technical challenges and team leadership.",
  ],
  travel: [
    "I'm passionate about travel and cultural exchange! I've visited Vietnam, Japan, USA, Australia, Egypt, Germany, France, Poland, the Baltic republics, and more across multiple continents. Each destination offered unique insights into different approaches to innovation, efficiency, and problem-solving.",
    "My international experiences span technological innovation hubs like Japan and Australia, rich historical cultures like Egypt and Vietnam, and efficient engineering approaches in Germany. I believe travel is essential education - exposing you to diverse perspectives that enhance both personal growth and professional adaptability.",
    "Exploring different countries has profoundly shaped my global perspective. From experiencing Japan's continuous improvement philosophy (kaizen) to Germany's systematic engineering approach, each culture offers unique problem-solving insights that I apply in my technical work and international collaboration.",
  ],
  reading: [
    "I discovered my love for reading through 'The Lord of the Rings' at age 11 - that epic adventure opened my eyes to storytelling's power. Today I'm drawn to divulgative essays that make complex topics accessible and engaging, supporting my philosophy of continuous learning through diverse perspectives.",
    "My reading journey began with Tolkien's masterpiece when I was 11, sparking a lifelong passion for literature. Now I focus on divulgative essays and technical literature that broaden understanding beyond my immediate field, helping me stay intellectually curious and professionally adaptable.",
    "Reading has been essential to my continuous learning philosophy since discovering 'The Lord of the Rings' as a child. I particularly enjoy authors who take specialized knowledge and present it accessibly - this habit of diverse reading shapes how I approach problems, process information, and understand different viewpoints.",
  ],
  // Country-specific travel responses
  japan: [
    "Japan fascinated me with its perfect blend of ancient tradition and cutting-edge technology. The technological innovation there is incredible - from efficient transportation systems to manufacturing approaches. What struck me most was the Japanese philosophy of continuous improvement (kaizen), which has influenced my own engineering approach.",
    "My experience in Japan was transformative - witnessing firsthand how they balance respect for tradition with technological advancement. The attention to detail and systematic approach to problem-solving I observed there directly influences how I approach complex engineering challenges today.",
    "Japan showed me how different cultures can approach technological challenges in uniquely innovative ways. The experience of navigating a completely different cultural context taught me valuable lessons about adaptation and creative problem-solving that I apply in international technical collaborations."
  ],
  australia: [
    "Australia impressed me with its incredible balance of outdoor adventure culture and technological sophistication. The country's approach to innovation, particularly in mining technology and environmental systems, was fascinating to observe and provided insights into large-scale engineering solutions.",
    "What I appreciated most about Australia was the emphasis on work-life balance and how this actually enhances creativity and productivity. The scale of everything - from landscapes to engineering projects - gave me new appreciation for systems thinking at a massive scale.",
    "Australia's approach to managing resources across continental distances and coordinating operations in remote locations showed me impressive solutions for large-scale challenges. The experience reinforced my belief that diverse environments foster innovative thinking and adaptability."
  ],
  vietnam: [
    "Vietnam offered incredible lessons in resilience and adaptation. The rapid development and ingenuity of Vietnamese engineers in embracing technology to leapfrog traditional development stages was truly inspiring - from mobile payment systems to creative urban transportation solutions.",
    "I was particularly impressed by how Vietnamese culture emphasizes family, community, and long-term thinking, providing valuable perspective on how different societies approach complex problems. The Vietnamese approach to balancing tradition with modernization offers insights I apply in integrating new technologies with existing systems.",
    "The warmth and hospitality of Vietnamese people, combined with witnessing the country's remarkable technological advancement, made it an unforgettable experience that continues to influence my worldview and approach to collaborative innovation."
  ],
  germany: [
    "Germany impressed me with its incredible efficiency and systematic approach to engineering and technology. The German work ethic perfectly balances thoroughness with efficiency - taking the time needed to do things right while maintaining high productivity levels.",
    "The German reputation for precision and quality is absolutely well-deserved and has significantly influenced my professional standards. I particularly appreciated how they integrate sustainability and environmental consciousness into engineering solutions, providing models for addressing environmental challenges through technology.",
    "Germany demonstrated how systematic thinking and methodical approaches can lead to exceptional engineering outcomes. The experience enhanced my appreciation for thorough planning, quality control, and sustainable engineering practices that I now apply in defense system development."
  ],
  egypt: [
    "Egypt provided an incredible window into rich historical culture while showcasing how ancient civilizations developed sophisticated engineering solutions. Witnessing the intersection of historical achievements with modern development offered unique perspectives on long-term thinking and sustainable design.",
    "The experience in Egypt taught me to appreciate how different cultures have approached monumental engineering challenges throughout history. Understanding these historical perspectives provides valuable context for modern engineering problems and solutions.",
    "Egypt's combination of ancient wisdom and modern adaptation showed me how engineering principles transcend time and culture. The experience broadened my understanding of how different societies approach complex technical challenges over millennia."
  ],
};

export function getFallbackResponse(question: string): string {
  const questionLower = question.toLowerCase();

  // Get browser information for context-aware messaging
  const browserInfo = getBrowserInfo();
  let browserContext = "";

  // Add browser-specific context if this is a fallback due to browser limitations
  if (browserInfo.os === "iOS" && browserInfo.name === "Safari") {
    browserContext = "[iOS Safari compatibility mode] ";
  } else if (browserInfo.isMobile && browserInfo.name === "Chrome") {
    browserContext = "[Chrome mobile optimized] ";
  } else if (browserInfo.isMobile) {
    browserContext = `[${browserInfo.name} mobile mode] `;
  }

  // Enhanced semantic topic analysis
  const topicScores = analyzeQuestionTopics(questionLower);
  const bestTopic = getBestMatchingTopic(topicScores);
  
  // Use best matching topic if found with high confidence
  if (bestTopic && responseVariations[bestTopic]) {
    const responses = responseVariations[bestTopic];
    return browserContext + responses[Math.floor(Math.random() * responses.length)];
  }

  // Enhanced fallback keyword matching for edge cases
  if (questionLower.includes("deloitte")) {
    const responses = responseVariations.deloitte;
    return (
      browserContext + responses[Math.floor(Math.random() * responses.length)]
    );
  } else if (questionLower.includes("leonardo")) {
    const responses = responseVariations.leonardo;
    return (
      browserContext + responses[Math.floor(Math.random() * responses.length)]
    );
  } else if (
    questionLower.includes("skill") ||
    questionLower.includes("technology") ||
    questionLower.includes("programming") ||
    questionLower.includes("python") ||
    questionLower.includes("matlab")
  ) {
    const responses = responseVariations.skills;
    return (
      browserContext + responses[Math.floor(Math.random() * responses.length)]
    );
  } else if (
    questionLower.includes("football") ||
    questionLower.includes("soccer") ||
    questionLower.includes("como") ||
    questionLower.includes("coach")
  ) {
    const responses = responseVariations.football;
    return (
      browserContext + responses[Math.floor(Math.random() * responses.length)]
    );
  } else if (
    questionLower.includes("travel") ||
    questionLower.includes("country") ||
    questionLower.includes("visit") ||
    questionLower.includes("culture")
  ) {
    const responses = responseVariations.travel;
    return (
      browserContext + responses[Math.floor(Math.random() * responses.length)]
    );
  } else if (
    questionLower.includes("reading") ||
    questionLower.includes("book") ||
    questionLower.includes("literature") ||
    questionLower.includes("lord of the rings")
  ) {
    const responses = responseVariations.reading;
    return (
      browserContext + responses[Math.floor(Math.random() * responses.length)]
    );
  }

  // Single responses for less common topics
  else if (
    questionLower.includes("experience") ||
    questionLower.includes("work")
  ) {
    return (
      browserContext +
      "I have experience in both Data Science consulting at Deloitte and R&D System Engineering at Leonardo SpA. I've worked on projects ranging from business analytics and machine learning to infrared defense systems and computer vision."
    );
  } else if (
    questionLower.includes("reading") ||
    questionLower.includes("book")
  ) {
    return (
      browserContext +
      "I discovered my love for reading through 'The Lord of the Rings' when I was 11 years old. Now I'm an avid reader who enjoys divulgative essays and technical literature. Reading helps me stay current with industry trends and broaden my perspective beyond just technical topics."
    );
  } else if (
    questionLower.includes("hobby") ||
    questionLower.includes("personal") ||
    questionLower.includes("interest")
  ) {
    return (
      browserContext +
      "My main hobbies are football, traveling, and reading. These interests have shaped me both personally and professionally - football taught me teamwork, travel gave me cultural awareness, and reading keeps me intellectually curious."
    );
  } else if (
    questionLower.includes("culture") ||
    questionLower.includes("international")
  ) {
    return (
      browserContext +
      "My international travel experiences have given me a global perspective that's valuable in today's interconnected world. I've experienced everything from the tech innovation in Japan to the rich history of Morocco."
    );
  } else if (
    questionLower.includes("nps") ||
    questionLower.includes("net promoter") ||
    questionLower.includes("srr") ||
    questionLower.includes("pdr") ||
    questionLower.includes("cdr") ||
    questionLower.includes("fpa") ||
    questionLower.includes("focal plane") ||
    questionLower.includes("rag") ||
    questionLower.includes("retrieval augmented")
  ) {
    return (
      browserContext +
      "I work with various technical acronyms and methodologies: NPS (Net Promoter Score) for customer analytics, SRR/PDR/CDR (System/Preliminary/Critical Design Reviews) for engineering processes, FPA (Focal Plane Array) photodetectors for IR systems, and RAG (Retrieval-Augmented Generation) for advanced AI applications."
    );
  } else {
    return (
      browserContext +
      "I'm a professional with diverse experience in data science consulting and R&D engineering. Feel free to ask about my work at Deloitte, Leonardo SpA, my technical skills, my hobbies, or my travel experiences!"
    );
  }
}

// === Background Loading Functions ===

export function setBackgroundProgressCallback(
  callback: (modelKey: string, status: string, progress?: number) => void
): void {
  backgroundProgressCallback = callback;
}

// Export device capability functions for UI
export { canRunModel, getModelCapabilityInfo, getBestModelForDevice };

export function getModelLoadingStatus(): { [key: string]: string } {
  return { ...backgroundLoadingStatus };
}

export function getModelDownloadState(modelKey: string) {
  return (
    modelDownloadState[modelKey] || {
      status: "not_started",
      progress: 0,
      speed: 0,
      bytesDownloaded: 0,
      totalBytes: 0,
      timeRemaining: 0,
      userRequested: false,
    }
  );
}

export function isModelDownloading(modelKey: string): boolean {
  return modelDownloadState[modelKey]?.status === "downloading";
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
  const total = progress.total || 1.8 * 1024 * 1024 * 1024; // 1.8GB estimate
  const progressPercent = progress.progress || loaded / total;

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
    status: isCompleted ? "completed" : "downloading",
    progress: progressPercent,
    speed: speed / (1024 * 1024), // MB/s
    bytesDownloaded: loaded,
    totalBytes: total,
    timeRemaining: timeRemaining,
    userRequested: wasUserRequested,
    lastUpdate: currentTime,
  } as any;

  // Mark as completed in global tracking when download finishes
  if (isCompleted) {
    console.log(`✅ ${modelKey} download completed!`);
    if (typeof window !== "undefined") {
      window.aiModels = window.aiModels || {};
      window.aiModels[modelKey] = true;
    }
    backgroundLoadingStatus[modelKey] = "completed";
  }
}

export function initializeDownloadState(
  modelKey: string,
  userRequested: boolean = false
): void {
  console.log(
    `🚀 Initializing download state for ${modelKey} (user requested: ${userRequested})`
  );
  modelDownloadState[modelKey] = {
    status: "downloading",
    progress: 0,
    speed: 0,
    bytesDownloaded: 0,
    totalBytes: 1.8 * 1024 * 1024 * 1024, // 1.8GB estimate
    timeRemaining: 0,
    userRequested: userRequested,
    lastUpdate: Date.now(),
  } as any;
}

export async function startBackgroundLoading(): Promise<void> {
  console.log(
    "🚀 Background loading disabled - AI models load only when user selects them"
  );
  console.log("💡 This prevents performance impact during app startup");
  console.log("📋 Users start with instant pre-written responses");
  console.log(
    "🎯 AI models will download when user explicitly chooses them in dropdown"
  );

  // No background loading - user-driven only!
  // This prevents:
  // 1. Heavy downloads impacting startup performance
  // 2. Automatic consent dialogs appearing
  // 3. Memory usage from loaded models user didn't request
}
