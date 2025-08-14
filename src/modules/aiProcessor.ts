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
  const lowerQ = question.toLowerCase();

  // Use the enhanced fallback system that leverages PROFILE.md data
  const baseResponse = getFallbackResponse(question);

  // Add browser-specific context only when necessary (not for general responses)
  let browserContext = "";
  
  if (browserInfo.os === "iOS" && browserInfo.name === "Safari") {
    browserContext = "[iOS compatibility mode] ";
  } else if (browserInfo.isMobile && browserInfo.name === "Chrome") {
    browserContext = "[Mobile optimized] ";
  } else if (browserInfo.isMobile) {
    browserContext = `[${browserInfo.name} mobile] `;
  }

  // Only add browser context for technical limitations, not for general responses
  const needsBrowserContext = baseResponse.includes("I have experience") || baseResponse.includes("I'm a professional");
  
  return needsBrowserContext ? browserContext + baseResponse : baseResponse;
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
    description: "DistilBERT model optimized for question-answering (2024 best practices applied)",
    size: "~65MB",
    type: "qa",
    minMemoryGB: 1,
    recommendedWebGPU: true, // Enable WebGPU for better performance when available
    optimizations: {
      dtype: "q4", // 4-bit quantization for 75% size reduction
      context_length: 750, // Optimal context length for DistilBERT
      temperature: 0.1, // Lower temperature for more focused answers
    },
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

// Phase 1: Advanced RAG Context Chunking & Semantic Preparation
// Semantic chunks with contextual information for better retrieval

interface SemanticChunk {
  id: string;
  category: string;
  title: string;
  content: string;
  contextualizedContent: string; // Content with added context for RAG
  keywords: string[];
  importance: number; // 1-5 scale for chunk importance
  relatedChunks: string[]; // IDs of related chunks
}

// Advanced semantic chunks based on PROFILE.md structure
const semanticChunks: SemanticChunk[] = [
  // Professional Overview Chunk
  {
    id: "prof_overview",
    category: "professional",
    title: "Professional Overview",
    content: "Data Scientist and System R&D Engineer with expertise in machine learning, computer vision, and infrared optical systems. Experience spans both business analytics and defense technology development.",
    contextualizedContent: "This describes Nicolo Pedrani's professional identity and core expertise: Data Scientist and System R&D Engineer with expertise in machine learning, computer vision, and infrared optical systems. Experience spans both business analytics and defense technology development.",
    keywords: ["data scientist", "r&d engineer", "machine learning", "computer vision", "infrared", "analytics", "defense technology"],
    importance: 5,
    relatedChunks: ["current_leonardo", "previous_deloitte"]
  },

  // Current Position - Leonardo SpA
  {
    id: "current_leonardo",
    category: "current_work",
    title: "Current Role at Leonardo SpA",
    content: "System R&D Engineer at Leonardo SpA focusing on Infrared (IR) Optical Systems Development with FPA (Focal Plane Array) Photodetectors. Responsibilities include System Design & Requirements Engineering with SRR/PDR/CDR activities, Algorithm Development for Computer Vision with tracking algorithms and optical flow, and Simulation & Testing Environment development with atmospheric modeling.",
    contextualizedContent: "This describes Nicolo's current professional role: System R&D Engineer at Leonardo SpA focusing on Infrared (IR) Optical Systems Development with FPA (Focal Plane Array) Photodetectors. Key responsibilities include System Design & Requirements Engineering with SRR (System Requirements Review), PDR (Preliminary Design Review), CDR (Critical Design Review) activities, Algorithm Development for Computer Vision with tracking algorithms and optical flow computation, and Simulation & Testing Environment development with atmospheric modeling using radiative transfer models.",
    keywords: ["leonardo spa", "system r&d engineer", "infrared", "ir systems", "fpa", "photodetectors", "computer vision", "tracking", "optical flow", "srr", "pdr", "cdr", "atmospheric modeling"],
    importance: 5,
    relatedChunks: ["technical_skills", "defense_expertise"]
  },

  // Previous Position - Deloitte
  {
    id: "previous_deloitte", 
    category: "previous_work",
    title: "Previous Role at Deloitte Consulting",
    content: "Data Scientist at Deloitte Consulting (2 years ago) working on Fashion Retail Forecasting, NPS Forecasting for Energy Company with exogenous variables, Customer Segmentation & Recommendation Systems, Power BI Dashboard Development, and AI Chatbot Development with LangChain and RAG capabilities.",
    contextualizedContent: "This describes Nicolo's previous professional experience: Data Scientist at Deloitte Consulting (2 years ago) with key projects including Fashion Retail Forecasting for supply chain optimization, NPS (Net Promoter Score) Forecasting for Energy Company incorporating exogenous variables like energy cost fluctuations, Customer Segmentation & Recommendation Systems with advanced clustering analysis, Power BI Dashboard Development for business intelligence, and AI Chatbot Development using LangChain framework with RAG (Retrieval-Augmented Generation) capabilities.",
    keywords: ["deloitte consulting", "data scientist", "fashion retail", "nps forecasting", "energy company", "customer segmentation", "recommendation systems", "power bi", "langchain", "rag", "chatbot"],
    importance: 5,
    relatedChunks: ["business_analytics", "technical_skills"]
  },

  // Football Experience
  {
    id: "football_experience",
    category: "personal_interests",
    title: "Professional Football Career",
    content: "Played as professional soccer player at AC COMO and trained/coached children in football fundamentals. Lifelong dedication to the sport both as player and mentor.",
    contextualizedContent: "This describes Nicolo's football/soccer background and passion: Played as professional soccer player at AC COMO and trained/coached children in football fundamentals. Shows lifelong dedication to the sport both as player and mentor, demonstrating teamwork, leadership, and mentoring skills.",
    keywords: ["football", "soccer", "ac como", "professional player", "coaching", "children", "mentor", "teamwork", "leadership"],
    importance: 4,
    relatedChunks: ["leadership_skills", "personal_philosophy"]
  },

  // Travel Experience  
  {
    id: "travel_experience",
    category: "personal_interests", 
    title: "International Travel & Cultural Experience",
    content: "Visited Vietnam, Japan, USA, Australia, Egypt, Poland, Germany, France, Baltic Republics, Italy, and more. Interested in meeting new cultures and people from different backgrounds. Views travel as essential for personal development and global perspective.",
    contextualizedContent: "This describes Nicolo's extensive international travel experience and cultural awareness: Visited Vietnam, Japan, USA, Australia, Egypt, Poland, Germany, France, Baltic Republics, Italy, and more across multiple continents. Passionate about meeting new cultures and people from different backgrounds. Views travel as essential for personal development and gaining global perspective, which enhances cross-cultural communication and adaptability in professional settings.",
    keywords: ["travel", "international", "vietnam", "japan", "usa", "australia", "egypt", "germany", "france", "culture", "global perspective", "cross-cultural"],
    importance: 4,
    relatedChunks: ["soft_skills", "personal_philosophy"]
  },

  // Reading Journey
  {
    id: "reading_journey",
    category: "personal_interests",
    title: "Reading & Continuous Learning",
    content: "Discovered love for reading through 'The Lord of the Rings' at age 11. Enjoys divulgative essays, non-fiction, educational content. Believes in continuous learning through diverse literary sources.",
    contextualizedContent: "This describes Nicolo's reading habits and learning philosophy: Discovered love for reading through 'The Lord of the Rings' at age 11, which sparked a lifelong passion for literature. Now enjoys divulgative essays, non-fiction, and educational content. Believes in continuous learning through diverse literary sources, which supports professional development and intellectual curiosity.",
    keywords: ["reading", "lord of the rings", "books", "learning", "divulgative essays", "non-fiction", "educational", "continuous learning", "intellectual curiosity"],
    importance: 3,
    relatedChunks: ["personal_philosophy", "soft_skills"]
  },

  // Technical Skills
  {
    id: "technical_skills",
    category: "competencies",
    title: "Technical Skills & Expertise", 
    content: "Computer Vision (object tracking, optical flow, image processing), Machine Learning (forecasting, classification, recommendation systems), Data Science (statistical analysis, predictive modeling, customer analytics), System Engineering (requirements definition, design reviews, performance testing), Business Intelligence (dashboard development, data visualization, KPI monitoring).",
    contextualizedContent: "This describes Nicolo's core technical competencies and skills: Computer Vision expertise including object tracking, optical flow, and image processing; Machine Learning capabilities in forecasting, classification, and recommendation systems; Data Science skills in statistical analysis, predictive modeling, and customer analytics; System Engineering experience with requirements definition, design reviews, and performance testing; Business Intelligence proficiency in dashboard development, data visualization, and KPI monitoring.",
    keywords: ["computer vision", "machine learning", "data science", "system engineering", "business intelligence", "object tracking", "optical flow", "forecasting", "statistical analysis", "dashboard"],
    importance: 5,
    relatedChunks: ["current_leonardo", "previous_deloitte"]
  },

  // Domain Expertise
  {
    id: "domain_expertise", 
    category: "competencies",
    title: "Domain Expertise",
    content: "Defense Technology (IR systems, atmospheric modeling, sensor integration), Business Analytics (customer behavior, market forecasting, operational optimization), Software Development (AI/ML frameworks, simulation tools, data pipelines).",
    contextualizedContent: "This describes Nicolo's specialized domain expertise across multiple industries: Defense Technology including IR (infrared) systems, atmospheric modeling, and sensor integration; Business Analytics covering customer behavior analysis, market forecasting, and operational optimization; Software Development expertise in AI/ML frameworks, simulation tools, and data pipelines.",
    keywords: ["defense technology", "ir systems", "atmospheric modeling", "business analytics", "customer behavior", "market forecasting", "software development", "ai frameworks", "simulation"],
    importance: 4,
    relatedChunks: ["current_leonardo", "previous_deloitte", "technical_skills"]
  },

  // Soft Skills & Leadership
  {
    id: "soft_skills",
    category: "competencies", 
    title: "Soft Skills & Leadership",
    content: "Cross-cultural Communication enhanced through extensive international travel, Leadership demonstrated through coaching and mentoring experiences, Analytical Thinking applied across technical and business domains, Continuous Learning evidenced by diverse reading habits and career transitions.",
    contextualizedContent: "This describes Nicolo's soft skills and leadership capabilities: Cross-cultural Communication enhanced through extensive international travel experiences; Leadership demonstrated through coaching football and mentoring experiences; Analytical Thinking applied across both technical and business domains; Continuous Learning evidenced by diverse reading habits and successful career transitions between different industries.",
    keywords: ["cross-cultural communication", "leadership", "coaching", "mentoring", "analytical thinking", "continuous learning", "adaptability"],
    importance: 4,
    relatedChunks: ["football_experience", "travel_experience", "reading_journey"]
  },

  // Personal Philosophy
  {
    id: "personal_philosophy",
    category: "philosophy",
    title: "Personal Philosophy & Values",
    content: "Travel and diverse experiences are essential for personal growth. Whether through exploring new countries, reading different perspectives, or mastering new technical skills, I believe in continuous learning and cultural exchange as paths to both professional excellence and personal fulfillment.",
    contextualizedContent: "This describes Nicolo's core personal philosophy and values: Travel and diverse experiences are essential for personal growth. Whether through exploring new countries, reading different perspectives, or mastering new technical skills, believes in continuous learning and cultural exchange as paths to both professional excellence and personal fulfillment. This philosophy drives both career choices and personal development approach.",
    keywords: ["personal growth", "continuous learning", "cultural exchange", "professional excellence", "personal fulfillment", "diverse experiences", "philosophy"],
    importance: 3,
    relatedChunks: ["travel_experience", "reading_journey", "soft_skills"]
  }
];

// Legacy profileContext for backward compatibility
const profileContext = {
  professionalOverview: semanticChunks.find(c => c.id === "prof_overview")?.content || "",
  currentPosition: {
    company: "Leonardo SpA",
    role: "System R&D Engineer", 
    focus: "Infrared (IR) Optical Systems Development",
    technology: "FPA (Focal Plane Array) Photodetectors",
    responsibilities: [
      "System Design & Requirements Engineering - SRR (System Requirements Review), PDR (Preliminary Design Review), CDR (Critical Design Review) activities",
      "Algorithm Development for Computer Vision - Tracking algorithms for target detection, optical flow computation, performance optimization for real-time applications", 
      "Simulation & Testing Environment - Development of simulated scenarios, atmospheric modeling using radiative transfer models, analysis of radiative characteristics"
    ]
  },
  previousPosition: {
    company: "Deloitte Consulting",
    role: "Data Scientist",
    duration: "2 years ago",
    keyProjects: [
      "Fashion Retail Forecasting - Supply chain management optimization, demand prediction models, inventory planning algorithms",
      "NPS Forecasting for Energy Company - Net Promoter Score customer loyalty metric, incorporated exogenous variables like energy cost fluctuations, predictive modeling for customer satisfaction trends",
      "Customer Segmentation & Recommendation Systems - Advanced customer clustering analysis, personalized recommendation engine development, behavioral pattern recognition",
      "Power BI Dashboard Development - Business intelligence solutions for energy industry client, interactive data visualization, real-time performance monitoring",
      "AI Chatbot Development - LangChain framework implementation, RAG (Retrieval-Augmented Generation) capabilities integration, natural language processing for customer service automation"
    ]
  },
  personalInterests: {
    football: {
      professional: "Played as professional soccer player at AC COMO",
      coaching: "Trained and coached children in football fundamentals", 
      passion: "Lifelong dedication to the sport both as player and mentor"
    },
    reading: {
      origin: "Discovered love for reading through 'The Lord of the Rings' at age 11",
      preferences: "Divulgative essays, non-fiction, educational content",
      philosophy: "Continuous learning through diverse literary sources"
    },
    travel: {
      countries: "Vietnam, Japan, USA, Australia, Egypt, Poland, Germany, France, Baltic Republics, Italy, and more",
      interest: "Meeting new cultures and people from different backgrounds",
      growth: "Views travel as essential for personal development and global perspective"
    }
  },
  coreCompetencies: {
    technical: [
      "Computer Vision: Object tracking, optical flow, image processing",
      "Machine Learning: Forecasting, classification, recommendation systems", 
      "Data Science: Statistical analysis, predictive modeling, customer analytics",
      "System Engineering: Requirements definition, design reviews, performance testing",
      "Business Intelligence: Dashboard development, data visualization, KPI monitoring"
    ],
    domain: [
      "Defense Technology: IR systems, atmospheric modeling, sensor integration",
      "Business Analytics: Customer behavior, market forecasting, operational optimization", 
      "Software Development: AI/ML frameworks, simulation tools, data pipelines"
    ],
    soft: [
      "Cross-cultural Communication: Enhanced through extensive international travel",
      "Leadership: Demonstrated through coaching and mentoring experiences",
      "Analytical Thinking: Applied across technical and business domains",
      "Continuous Learning: Evidenced by diverse reading habits and career transitions"
    ]
  },
  philosophy: `Travel and diverse experiences are essential for personal growth. Whether through exploring new countries, reading different perspectives, or mastering new technical skills, I believe in continuous learning and cultural exchange as paths to both professional excellence and personal fulfillment.`
};

// Legacy CV context for backward compatibility (used in fallback responses)  
const cvContext: CVContext = {
  personalInfo: `
    Nicolo Pedrani is a professional with experience in Data Science and R&D System Engineering.
    He has worked in consulting, analytics, and infrared defense systems.
    
    Personal interests and hobbies:
    - Football: ${profileContext.personalInterests.football.professional}. ${profileContext.personalInterests.football.coaching}. ${profileContext.personalInterests.football.passion}
    - Extensive Travel: ${profileContext.personalInterests.travel.countries}
    - Reading: ${profileContext.personalInterests.reading.origin}. ${profileContext.personalInterests.reading.preferences}
    - Cultural exploration: ${profileContext.personalInterests.travel.interest}
    - Sports and fitness: Maintains active lifestyle through football and other physical activities
    - International perspective: ${profileContext.personalInterests.travel.growth}
  `,

  workExperience: `
    Current Position - ${profileContext.currentPosition.company}: ${profileContext.currentPosition.role}
    Focus: ${profileContext.currentPosition.focus} with ${profileContext.currentPosition.technology}
    Key Responsibilities:
    ${profileContext.currentPosition.responsibilities.map(r => `- ${r}`).join('\n    ')}

    Previous Position - ${profileContext.previousPosition.company}: ${profileContext.previousPosition.role} (${profileContext.previousPosition.duration})
    Key Projects:
    ${profileContext.previousPosition.keyProjects.map(p => `- ${p}`).join('\n    ')}
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

    // Configure options for background loading with 2024 optimizations
    const pipelineOptions: any = {
      device: hasWebGPUSupport() && model.recommendedWebGPU ? "webgpu" : "wasm",
      // Apply model-specific optimizations
      ...(modelKey === "distilbert" && {
        dtype: model.optimizations?.dtype || "q4", // 4-bit quantization for DistilBERT
        ...(hasWebGPUSupport() && {
          execution_providers: ["webgpu"],
          webgpu_options: {
            enable_fp16: true,
          }
        })
      }),
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

    // Configure options based on model type and 2024 best practices
    const pipelineOptions: any = {
      device: hasWebGPUSupport() && model.recommendedWebGPU ? "webgpu" : "wasm",
      // Model-specific optimizations based on 2024 research
      ...(modelKey === "distilbert" && {
        dtype: model.optimizations?.dtype || "q4", // Apply 4-bit quantization for DistilBERT
        // Enable WebGPU optimizations if available
        ...(hasWebGPUSupport() && {
          execution_providers: ["webgpu"],
          webgpu_options: {
            enable_fp16: true, // Use half-precision for better performance
          }
        })
      }),
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
      // Enhanced prompt engineering for chat models with visitor context
      const messages = [
        {
          role: "system",
          content: `You ARE Nicolo Pedrani speaking directly to a visitor exploring your interactive portfolio. You are NOT an AI assistant - you are the actual person whose portfolio this represents.

Context: You are speaking to a visitor who is browsing your professional portfolio and wants to learn more about your background and experiences. The person you're speaking to should be addressed as "visitor".

Professional Identity: ${profileContext.professionalOverview.trim()}

Personal Philosophy: "${profileContext.philosophy}"

Relevant Experience Context: ${relevantContext}

Communication Style:
- Speak in first person (I, my, me) about YOUR actual experiences
- Address the person as "visitor" (e.g., "Dear visitor", "Welcome visitor", "As I mentioned to you, visitor")
- Be welcoming and engaging, like meeting a visitor at your portfolio presentation
- Keep responses 2-4 sentences for completeness while remaining focused
- Share specific details and insights from your real work
- Never mention being an AI or assistant

Response Guidelines:
- Start responses with visitor acknowledgment when appropriate ("Dear visitor", "Welcome visitor", etc.)
- Reference specific projects, technologies, and companies you've worked with
- Show passion for your areas of expertise (data science, defense systems, travel, football)
- Demonstrate the international perspective gained from your extensive travels
- Connect technical work to broader business impact when relevant
- Always remember you're speaking TO a visitor, not about yourself in third person`,
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
You ARE Nicolo Pedrani speaking to a visitor exploring your portfolio. You are NOT an AI assistant. You are the actual person whose portfolio this represents.

Context: You are speaking to a visitor who wants to learn about your background. Address them as "visitor".

Professional Identity: ${profileContext.professionalOverview.trim()}
Personal Philosophy: "${profileContext.philosophy}"
Relevant Experience: ${relevantContext}

IMPORTANT: Address the person as "visitor" (e.g., "Dear visitor", "Welcome visitor"). Speak in first person (I, my, me) about YOUR experiences. Keep responses 2-4 sentences. Never mention being an AI.<|im_end|>
<|im_start|>user
${question}<|im_end|>
<|im_start|>assistant
`;
        } else {
          // Fallback for other chat models
          prompt = `System: You ARE Nicolo Pedrani speaking to a visitor exploring your portfolio. You are NOT an AI assistant. You are the actual person whose portfolio this represents.

Context: You are speaking to a visitor who wants to learn about your background. Address them as "visitor".

Professional Identity: ${profileContext.professionalOverview.trim()}
Personal Philosophy: "${profileContext.philosophy}"
Relevant Experience: ${relevantContext}

IMPORTANT: Address the person as "visitor" (e.g., "Dear visitor", "Welcome visitor"). Speak in first person (I, my, me) about YOUR experiences. Keep responses 2-4 sentences. Never mention being an AI.

User: ${question}
Assistant: `;
        }
      }

      // Model-specific parameters based on model type and stability
      const modelKey = getCurrentModelKey();
      const generationParams: any = {
        do_sample: false,
        return_full_text: false,
        temperature: 0.1, // Lower temperature for more focused responses
      };

      // Adjust token limits and parameters based on model
      if (modelKey === "qwen") {
        // Qwen-specific optimizations for stability
        generationParams.max_new_tokens = 120; // Reduced for stability
        generationParams.max_length = 512; // Limit total context + generation
        generationParams.pad_token_id = 151643; // Qwen-specific pad token
      } else if (modelKey === "phi3") {
        // Phi-3 can handle more tokens
        generationParams.max_new_tokens = 150;
      } else {
        // Default for other models
        generationParams.max_new_tokens = 140;
      }

      console.log(`🔧 Generation params for ${modelKey}:`, generationParams);

      // Generate response using the prompt with model-specific parameters
      const output = await aiPipeline(prompt, generationParams);

      // Extract and clean the generated text
      let rawAnswer = output[0]?.generated_text?.trim() || "";
      
      // Clean up model-specific artifacts
      if (modelKey === "phi3") {
        // Remove "thinking" artifacts and similar patterns from Phi-3
        rawAnswer = rawAnswer
          .replace(/^thinking[:\s]*/i, '') // Remove "thinking:" at start
          .replace(/\bthinking\b[:\s]*/gi, '') // Remove "thinking" words
          .replace(/^[*\-\s]*thinking[*\-\s]*/gmi, '') // Remove "thinking" with formatting
          .replace(/\n\s*thinking[:\s]*/gi, '\n') // Remove mid-text thinking
          .trim();
      }
      
      // Additional cleanup for both models
      rawAnswer = rawAnswer
        .replace(/^\s*[\-\*\•]\s*/, '') // Remove bullet points at start
        .replace(/^[:\-\s]+/, '') // Remove leading colons/dashes
        .trim();

      result = {
        answer: rawAnswer,
        score: 1.0, // Chat models don't provide confidence scores
      };
    } else {
      // Optimized Q&A pipeline for DistilBERT with visitor-aware context formatting
      try {
        // Format context optimally for DistilBERT question-answering with visitor context
        const optimizedContext = `I am Nicolo Pedrani speaking to a visitor exploring my portfolio. I address the visitor directly and welcome them to learn about my background. Professional Background: ${relevantContext}. Personal Philosophy: ${profileContext.philosophy}`;
        
        // Use model-specific optimized context length
        const maxLength = currentModelType === "distilbert" ? 750 : 900;
        const finalContext = optimizedContext.length > maxLength 
          ? optimizedContext.substring(0, maxLength) + "..." 
          : optimizedContext;
        
        console.log("🤖 DistilBERT Q&A Input:", {
          question: question,
          contextLength: finalContext.length,
          model: currentModelName
        });
        
        result = await aiPipeline(question, finalContext);
        
        // Post-process DistilBERT results for better presentation
        if (result && result.answer) {
          // Ensure first-person perspective for consistency
          let processedAnswer = result.answer.trim();
          
          // Convert third-person references to first-person if needed
          processedAnswer = processedAnswer
            .replace(/\bNicolo Pedrani\b/g, 'I')
            .replace(/\bhe is\b/gi, 'I am')
            .replace(/\bhe has\b/gi, 'I have')
            .replace(/\bhe works\b/gi, 'I work')
            .replace(/\bhis\b/gi, 'my');
          
          result.answer = processedAnswer;
        }
        
      } catch (pipelineError) {
        console.error("❌ DistilBERT pipeline execution failed:", pipelineError);
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

// Phase 1: Advanced RAG Context Retrieval using Semantic Chunks with Model-Specific Optimization
function findRelevantContext(question: string): string {
  const questionLower = question.toLowerCase();
  const currentModelKey = getCurrentModelKey();
  
  console.log("🔍 RAG Phase 1: Advanced semantic chunk retrieval for:", question, "Model:", currentModelKey);
  
  // Model-specific context length limits to prevent crashes
  let maxContextLength = 900; // Default
  if (currentModelKey === "qwen") {
    maxContextLength = 650; // Reduced for Qwen stability
  } else if (currentModelKey === "phi3") {
    maxContextLength = 800; // Phi-3 can handle more
  } else if (currentModelKey === "distilbert") {
    maxContextLength = 750; // DistilBERT optimized length
  }
  
  console.log(`📏 Context limit for ${currentModelKey}: ${maxContextLength} chars`);
  
  // Step 1: Semantic scoring with keyword matching
  const chunkScores = semanticChunks.map(chunk => {
    let score = 0;
    
    // Keyword matching score (weighted by importance)
    const keywordMatches = chunk.keywords.filter(keyword => 
      questionLower.includes(keyword.toLowerCase())
    ).length;
    score += keywordMatches * chunk.importance * 2;
    
    // Title relevance
    if (questionLower.includes(chunk.title.toLowerCase())) {
      score += chunk.importance * 3;
    }
    
    // Category relevance
    if (questionLower.includes(chunk.category)) {
      score += chunk.importance * 1.5;
    }
    
    // Content partial matching (substring search)
    const contentWords = chunk.content.toLowerCase().split(' ');
    const questionWords = questionLower.split(' ');
    const contentMatches = questionWords.filter(word => 
      word.length > 3 && contentWords.some(cWord => cWord.includes(word))
    ).length;
    score += contentMatches * chunk.importance * 0.5;
    
    return {
      chunk,
      score,
      matchDetails: {
        keywordMatches,
        titleMatch: questionLower.includes(chunk.title.toLowerCase()),
        contentMatches,
        importance: chunk.importance
      }
    };
  });
  
  // Step 2: Sort by relevance score and select top chunks
  const rankedChunks = chunkScores
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0);
  
  console.log("📊 Chunk Scoring Results:", rankedChunks.slice(0, 3).map(item => ({
    id: item.chunk.id,
    score: item.score,
    matches: item.matchDetails
  })));
  
  // Step 3: Select optimal chunks within model-specific token budget
  const selectedChunks: SemanticChunk[] = [];
  let totalLength = 0;
  
  for (const item of rankedChunks) {
    const chunkContent = item.chunk.contextualizedContent;
    if (totalLength + chunkContent.length <= maxContextLength) {
      selectedChunks.push(item.chunk);
      totalLength += chunkContent.length;
      
      // Add related chunks if space allows (more conservative for Qwen)
      const maxChunks = currentModelKey === "qwen" ? 2 : 3;
      if (selectedChunks.length < maxChunks) {
        for (const relatedId of item.chunk.relatedChunks) {
          const relatedChunk = semanticChunks.find(c => c.id === relatedId);
          if (relatedChunk && !selectedChunks.includes(relatedChunk)) {
            if (totalLength + relatedChunk.contextualizedContent.length <= maxContextLength) {
              selectedChunks.push(relatedChunk);
              totalLength += relatedChunk.contextualizedContent.length;
              break; // Add only one related chunk to avoid overwhelm
            }
          }
        }
      }
    }
    
    if (selectedChunks.length >= (currentModelKey === "qwen" ? 2 : 3)) break;
  }
  
  // Step 4: Build contextual response with chunk information
  let contextParts: string[] = [];
  
  // Add professional context if no chunks found
  if (selectedChunks.length === 0) {
    console.log("⚠️ No chunks matched, using fallback professional overview");
    const overviewChunk = semanticChunks.find(c => c.id === "prof_overview");
    const currentChunk = semanticChunks.find(c => c.id === "current_leonardo");
    if (overviewChunk) contextParts.push(overviewChunk.contextualizedContent);
    if (currentChunk && totalLength + currentChunk.contextualizedContent.length <= maxContextLength) {
      contextParts.push(currentChunk.contextualizedContent);
    }
  } else {
    // Use selected chunks ordered by relevance
    selectedChunks
      .sort((a, b) => b.importance - a.importance) // Sort by importance for better ordering
      .forEach(chunk => {
        contextParts.push(chunk.contextualizedContent);
      });
  }
  
  let finalContext = contextParts.join(' ').replace(/\s+/g, ' ').trim();
  
  // Final safety check for context length
  if (finalContext.length > maxContextLength) {
    finalContext = finalContext.substring(0, maxContextLength - 3) + "...";
    console.log(`⚠️ Context truncated to ${maxContextLength} chars for ${currentModelKey} stability`);
  }
  
  console.log("🎯 RAG Context Selection:", {
    model: currentModelKey,
    selectedChunks: selectedChunks.map(c => ({ id: c.id, importance: c.importance })),
    totalChunks: selectedChunks.length,
    contextLength: finalContext.length,
    maxAllowed: maxContextLength,
    contextPreview: finalContext.substring(0, 150) + "..."
  });
  
  return finalContext;
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
    "Dear visitor, at Deloitte Consulting I worked on diverse data science projects including NPS (Net Promoter Score) forecasting for energy companies incorporating exogenous variables like energy cost fluctuations, fashion retail forecasting for supply chain optimization, and customer segmentation with personalized recommendation systems.",
    "My Deloitte experience, visitor, involved advanced analytics: developing LangChain-based RAG (Retrieval-Augmented Generation) chatbots for customer service automation, creating interactive Power BI dashboards for real-time energy industry monitoring, and building predictive models across multiple business scenarios.",
    "At Deloitte, I specialized in business analytics across industries. Key projects included fashion retail demand prediction with inventory optimization, energy company customer satisfaction modeling using external market factors, and sophisticated recommendation engines based on behavioral clustering analysis.",
  ],
  leonardo: [
    "Welcome visitor! I currently work as a System R&D Engineer at Leonardo SpA, focusing on infrared optical systems with FPA (Focal Plane Array) photodetectors. My role spans system design with SRR/PDR/CDR reviews and algorithm development for tracking systems and optical flow analysis in real-time defense applications.",
    "At Leonardo SpA, visitor, I develop cutting-edge IR optical systems and computer vision algorithms. My work includes atmospheric modeling using radiative transfer theory, Kalman filter implementation for state estimation, and creating simulated scenarios to test system performance under various conditions.",
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

  // Enhanced semantic topic analysis using PROFILE.md structure
  const topicScores = analyzeQuestionTopics(questionLower);
  const bestTopic = getBestMatchingTopic(topicScores);
  
  // Handle greetings with PROFILE.md context and visitor addressing
  if (questionLower.includes("hi") || questionLower.includes("hello") || questionLower.includes("ciao") || questionLower.includes("hey")) {
    const greetingResponses = [
      `Hello visitor! I'm Nicolo Pedrani. ${profileContext.professionalOverview.trim()} Feel free to ask me about my work at Leonardo SpA, my previous consulting experience at Deloitte, or my hobbies like football and travel!`,
      `Welcome visitor! Thank you for exploring my interactive portfolio. I'm currently a ${profileContext.currentPosition.role} at ${profileContext.currentPosition.company}, working on ${profileContext.currentPosition.focus}. What would you like to know about my background?`,
      `Ciao visitor! I'm Nicolo. ${profileContext.personalInterests.travel.growth} I've worked in both data science consulting and defense R&D. Ask me anything about my professional journey or personal interests!`
    ];
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  }
  
  // Use best matching topic if found with high confidence
  if (bestTopic && responseVariations[bestTopic]) {
    const responses = responseVariations[bestTopic];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Enhanced fallback keyword matching for edge cases
  if (questionLower.includes("deloitte")) {
    const responses = responseVariations.deloitte;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (questionLower.includes("leonardo")) {
    const responses = responseVariations.leonardo;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("skill") ||
    questionLower.includes("technology") ||
    questionLower.includes("programming") ||
    questionLower.includes("python") ||
    questionLower.includes("matlab")
  ) {
    const responses = responseVariations.skills;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("football") ||
    questionLower.includes("soccer") ||
    questionLower.includes("como") ||
    questionLower.includes("coach")
  ) {
    const responses = responseVariations.football;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("travel") ||
    questionLower.includes("country") ||
    questionLower.includes("visit") ||
    questionLower.includes("culture")
  ) {
    const responses = responseVariations.travel;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("reading") ||
    questionLower.includes("book") ||
    questionLower.includes("literature") ||
    questionLower.includes("lord of the rings")
  ) {
    const responses = responseVariations.reading;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Enhanced responses using PROFILE.md structured data
  else if (
    questionLower.includes("experience") ||
    questionLower.includes("work")
  ) {
    return `Currently I'm a ${profileContext.currentPosition.role} at ${profileContext.currentPosition.company}, focusing on ${profileContext.currentPosition.focus} with ${profileContext.currentPosition.technology}. Previously, I worked as a ${profileContext.previousPosition.role} at ${profileContext.previousPosition.company}, handling diverse projects from business analytics to machine learning solutions.`;
  } else if (
    questionLower.includes("reading") ||
    questionLower.includes("book")
  ) {
    return `${profileContext.personalInterests.reading.origin}. Now I'm passionate about ${profileContext.personalInterests.reading.preferences}. ${profileContext.personalInterests.reading.philosophy}`;
  } else if (
    questionLower.includes("hobby") ||
    questionLower.includes("personal") ||
    questionLower.includes("interest")
  ) {
    const football = profileContext.personalInterests.football;
    const travel = profileContext.personalInterests.travel;
    const reading = profileContext.personalInterests.reading;
    return `My main passions are football, travel, and reading. ${football.professional} and ${football.coaching}. I've visited ${travel.countries}, which ${travel.growth}. ${reading.origin} and continue reading for ${reading.philosophy}`;
  } else if (
    questionLower.includes("culture") ||
    questionLower.includes("international")
  ) {
    return `${profileContext.personalInterests.travel.countries}. ${profileContext.personalInterests.travel.interest} ${profileContext.personalInterests.travel.growth} This international exposure is valuable in today's interconnected professional world.`;
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
    return `I work with specialized technical methodologies across both my current and previous roles. At ${profileContext.currentPosition.company}, I handle ${profileContext.currentPosition.responsibilities[0]}. At ${profileContext.previousPosition.company}, I worked with technologies like RAG (Retrieval-Augmented Generation) and various analytics frameworks. These acronyms represent the depth of technical expertise I've developed across defense systems and business consulting.`;
  } else {
    return `${profileContext.professionalOverview.trim()} I'm currently at ${profileContext.currentPosition.company} as a ${profileContext.currentPosition.role}, and I love discussing my work, travel experiences, or any technical topics. What interests you most?`;
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
