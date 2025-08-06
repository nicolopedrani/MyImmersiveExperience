// modules/aiProcessor.ts - AI processing with Transformers.js integration

import { pipeline } from "@xenova/transformers";

interface CVContext {
  personalInfo: string;
  workExperience: string;
  education: string;
  skills: string;
  projects: string;
  achievements: string;
}

let questionAnsweringPipeline: any = null;
let isModelLoaded = false;
let currentModelName = "";

// Available AI models - using proven working model
const AI_MODELS = {
  distilbert: {
    name: 'Xenova/distilbert-base-cased-distilled-squad',
    description: 'DistilBERT model optimized for question-answering',
    size: '~65MB'
  }
  // Other models kept for reference (may require authentication):
  // balanced: {
  //   name: 'Xenova/bert-base-multilingual-uncased-squad', 
  //   description: 'Multilingual BERT model - better understanding',
  //   size: '~170MB'
  // },
  // quality: {
  //   name: 'Xenova/bert-base-uncased-squad',
  //   description: 'BERT base model - high quality responses',
  //   size: '~110MB'
  // }
};

// Configuration - using only the working model
const MODEL_CONFIG = {
  preferredModel: 'distilbert',
  fallbackModels: [], // No fallbacks needed
  enableModelFallback: false
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

async function loadModel(modelKey: string): Promise<boolean> {
  const model = AI_MODELS[modelKey];
  if (!model) {
    console.error(`❌ Unknown model key: ${modelKey}`);
    return false;
  }

  try {
    console.log(`🤖 Loading ${modelKey} model: ${model.name}`);
    console.log(`📦 Model info: ${model.description} (${model.size})`);
    
    questionAnsweringPipeline = await pipeline(
      "question-answering",
      model.name,
      {
        progress_callback: (progress: any) => {
          if (progress.status === "downloading") {
            console.log(
              `📥 Downloading ${modelKey} model: ${Math.round(progress.progress || 0)}%`
            );
          }
        },
      }
    );

    // Test the model
    console.log(`🧪 Testing ${modelKey} model...`);
    const testResult = await questionAnsweringPipeline(
      "What is the name?",
      "The name is Nicolo Pedrani. He is a professional."
    );

    console.log(`🔍 ${modelKey} model test result:`, testResult);

    if (!testResult.answer || testResult.score < 0.01) {
      console.warn(`⚠️ ${modelKey} model test failed`);
      return false;
    } else {
      console.log(`✅ ${modelKey} model test successful!`);
      currentModelName = `${modelKey} (${model.name})`;
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to load ${modelKey} model:`, error);
    return false;
  }
}

export async function initializeAI(): Promise<boolean> {
  try {
    console.log("🔧 Initializing AI pipeline...");
    console.log(`🎯 Loading DistilBERT model for question-answering...`);

    const success = await loadModel('distilbert');
    
    if (success) {
      isModelLoaded = true;
      console.log(`🎉 AI pipeline initialized successfully!`);
      console.log(`📋 Active model: ${currentModelName}`);
      return true;
    } else {
      console.warn("⚠️ AI model failed to load, will rely on fallback responses");
      isModelLoaded = false;
      return false;
    }
  } catch (error) {
    console.error("💥 Critical error during AI initialization:", error);
    isModelLoaded = false;
    return false;
  }
}

export function isAIReady(): boolean {
  return isModelLoaded && questionAnsweringPipeline !== null;
}

export function getCurrentModelInfo(): { name: string; isReady: boolean; availableModels: typeof AI_MODELS } {
  return {
    name: currentModelName || "No model loaded",
    isReady: isAIReady(),
    availableModels: AI_MODELS
  };
}

export async function switchModel(modelKey: string): Promise<boolean> {
  if (!AI_MODELS[modelKey]) {
    console.error(`❌ Invalid model key: ${modelKey}. Available: ${Object.keys(AI_MODELS).join(', ')}`);
    return false;
  }

  console.log(`🔄 Switching to ${modelKey} model...`);
  const success = await loadModel(modelKey);
  
  if (success) {
    isModelLoaded = true;
    console.log(`✅ Successfully switched to ${modelKey} model!`);
  } else {
    console.error(`❌ Failed to switch to ${modelKey} model`);
  }
  
  return success;
}

export async function answerQuestion(question: string): Promise<string> {
  try {
    if (!isAIReady()) {
      // Try to initialize if not ready
      const initialized = await initializeAI();
      if (!initialized) {
        return "I'm sorry, the AI system is currently unavailable. Please try again later.";
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

    // Use the Q&A pipeline with correct parameter structure
    const result = await questionAnsweringPipeline(question, relevantContext);

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

  // Use varied responses for common topics
  if (questionLower.includes("deloitte")) {
    const responses = responseVariations.deloitte;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (questionLower.includes("leonardo")) {
    const responses = responseVariations.leonardo;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("skill") ||
    questionLower.includes("technology")
  ) {
    const responses = responseVariations.skills;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("football") ||
    questionLower.includes("soccer")
  ) {
    const responses = responseVariations.football;
    return responses[Math.floor(Math.random() * responses.length)];
  } else if (
    questionLower.includes("travel") ||
    questionLower.includes("country") ||
    questionLower.includes("visit")
  ) {
    const responses = responseVariations.travel;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Single responses for less common topics
  else if (
    questionLower.includes("experience") ||
    questionLower.includes("work")
  ) {
    return "I have experience in both Data Science consulting at Deloitte and R&D System Engineering at Leonardo SpA. I've worked on projects ranging from business analytics and machine learning to infrared defense systems and computer vision.";
  } else if (
    questionLower.includes("reading") ||
    questionLower.includes("book")
  ) {
    return "I'm an avid reader who enjoys both technical literature and business books. Reading helps me stay current with industry trends and broaden my perspective beyond just technical topics.";
  } else if (
    questionLower.includes("hobby") ||
    questionLower.includes("personal") ||
    questionLower.includes("interest")
  ) {
    return "My main hobbies are football, traveling, and reading. These interests have shaped me both personally and professionally - football taught me teamwork, travel gave me cultural awareness, and reading keeps me intellectually curious.";
  } else if (
    questionLower.includes("culture") ||
    questionLower.includes("international")
  ) {
    return "My international travel experiences have given me a global perspective that's valuable in today's interconnected world. I've experienced everything from the tech innovation in Japan to the rich history of Morocco.";
  } else {
    return "I'm a professional with diverse experience in data science consulting and R&D engineering. Feel free to ask about my work at Deloitte, Leonardo SpA, my technical skills, my hobbies, or my travel experiences!";
  }
}
