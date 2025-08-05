// modules/aiProcessor.ts - AI processing with Transformers.js integration

import { pipeline } from '@huggingface/transformers';

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

// CV context data extracted from the portfolio game content
const cvContext: CVContext = {
  personalInfo: `
    Nicolo Pedrani is a professional with experience in Data Science and R&D System Engineering.
    He has worked in consulting, analytics, and infrared defense systems.
    He enjoys football, traveling (visited countries like Italy, France, Germany, US, Japan, Australia, Vietnam, Maldives, Spain, UK, Netherlands, Switzerland, Morocco, Egypt), and reading.
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
  `
};

export async function initializeAI(): Promise<boolean> {
  try {
    console.log("Initializing AI pipeline...");
    
    // Use a lightweight Q&A model suitable for browser deployment
    questionAnsweringPipeline = await pipeline(
      'question-answering', 
      'Xenova/distilbert-base-cased-distilled-squad',
      { 
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            console.log(`Downloading model: ${Math.round(progress.progress || 0)}%`);
          }
        }
      }
    );
    
    isModelLoaded = true;
    console.log("AI pipeline initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize AI pipeline:", error);
    isModelLoaded = false;
    return false;
  }
}

export function isAIReady(): boolean {
  return isModelLoaded && questionAnsweringPipeline !== null;
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
    
    if (!relevantContext) {
      return "I'd be happy to answer questions about my professional experience, skills, projects, or background. Could you please ask something more specific about my CV or career?";
    }

    // Use the Q&A pipeline
    const result = await questionAnsweringPipeline({
      question: question,
      context: relevantContext
    });

    // Enhance the answer with additional context if needed
    const enhancedAnswer = enhanceAnswer(result.answer, question);
    
    return enhancedAnswer || "I don't have specific information about that topic in my experience. Could you ask about my work at Deloitte, Leonardo SpA, or my technical skills?";
    
  } catch (error) {
    console.error("Error processing question:", error);
    return "I apologize, but I'm having trouble processing your question right now. Please try rephrasing it or ask about my work experience, skills, or projects.";
  }
}

function findRelevantContext(question: string): string {
  const questionLower = question.toLowerCase();
  let relevantSections: string[] = [];
  
  // Keywords for different sections
  const workKeywords = ['work', 'job', 'experience', 'deloitte', 'leonardo', 'consulting', 'engineer', 'project', 'company'];
  const skillsKeywords = ['skill', 'technology', 'programming', 'python', 'matlab', 'machine learning', 'ai', 'data science'];
  const educationKeywords = ['education', 'study', 'learn', 'degree', 'qualification'];
  const personalKeywords = ['hobby', 'travel', 'football', 'personal', 'interest', 'country', 'visit'];
  const projectKeywords = ['project', 'build', 'create', 'develop', 'system', 'application'];
  
  // Check which sections are relevant
  if (workKeywords.some(keyword => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.workExperience);
  }
  
  if (skillsKeywords.some(keyword => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.skills);
  }
  
  if (educationKeywords.some(keyword => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.education);
  }
  
  if (personalKeywords.some(keyword => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.personalInfo);
  }
  
  if (projectKeywords.some(keyword => questionLower.includes(keyword))) {
    relevantSections.push(cvContext.projects);
  }
  
  // If no specific section is identified, use all context
  if (relevantSections.length === 0) {
    relevantSections = Object.values(cvContext);
  }
  
  return relevantSections.join('\n\n');
}

function enhanceAnswer(answer: string, question: string): string {
  // Clean up the answer
  let enhanced = answer.trim();
  
  // Add context-specific enhancements
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('deloitte')) {
    enhanced += " At Deloitte, I focused on data science consulting, working with various analytics tools and helping clients optimize their business processes.";
  } else if (questionLower.includes('leonardo')) {
    enhanced += " At Leonardo SpA, I specialized in R&D for infrared and defense systems, working on cutting-edge technology for threat detection and tracking.";
  } else if (questionLower.includes('skill') || questionLower.includes('technology')) {
    enhanced += " I'm always eager to learn new technologies and apply them to solve complex problems in both business and technical domains.";
  } else if (questionLower.includes('project')) {
    enhanced += " I enjoy working on diverse projects that challenge me to combine technical expertise with practical problem-solving.";
  }
  
  return enhanced;
}

// Fallback responses for when AI is not available
export function getFallbackResponse(question: string): string {
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('experience') || questionLower.includes('work')) {
    return "I have experience in both Data Science consulting at Deloitte and R&D System Engineering at Leonardo SpA. I've worked on projects ranging from business analytics and machine learning to infrared defense systems and computer vision.";
  } else if (questionLower.includes('skill')) {
    return "My technical skills include Python, MATLAB, machine learning, data science, computer vision, and cloud platforms like Azure. I also have experience with business intelligence tools like Power BI.";
  } else if (questionLower.includes('deloitte')) {
    return "At Deloitte Consulting, I worked on data science projects including NPS analysis, energy cost optimization, fashion retail forecasting, and developing AI chatbots and recommendation systems.";
  } else if (questionLower.includes('leonardo')) {
    return "At Leonardo SpA, I was an R&D System Engineer working on infrared systems, missile warning coverage, object detection, and multi-target tracking using advanced computer vision and signal processing techniques.";
  } else if (questionLower.includes('hobby') || questionLower.includes('travel')) {
    return "I enjoy football, reading, and traveling. I've been fortunate to visit many countries including Japan, Australia, Vietnam, Maldives, and various European nations, which has given me a global perspective.";
  } else {
    return "I'm a professional with diverse experience in data science consulting and R&D engineering. Feel free to ask about my work at Deloitte, Leonardo SpA, my technical skills, or my projects!";
  }
}