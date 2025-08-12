// modules/tileStories.ts - Database of tile stories based on PROFILE.md

import { ModalContent } from './modalSystem';

export interface TileStory {
  tileId: number;
  roomId: string;
  modalContent: ModalContent;
}

export const tileStories: TileStory[] = [
  // ===== WORKING EXPERIENCE ROOM (room3) =====
  
  // Data Science Section (Left Side)
  {
    tileId: 29,
    roomId: 'room3',
    modalContent: {
      title: 'NPS Analysis Project',
      icon: '📊',
      category: 'Deloitte Consulting - Data Science',
      content: `At Deloitte, I worked on NPS forecasting for an energy company, incorporating external variables like energy cost fluctuations. The challenge was predicting customer satisfaction while accounting for market factors beyond the company's control. This taught me the importance of holistic thinking in data science.`
    }
  },

  {
    tileId: 30,
    roomId: 'room3',
    modalContent: {
      title: 'Energy Cost Optimization',
      icon: '⚡',
      category: 'Deloitte Consulting - Analytics',
      content: `I worked on energy cost optimization at Deloitte, analyzing consumption patterns and market dynamics to reduce client costs. The challenge was building models considering regulatory constraints and infrastructure limitations. Seeing direct impact through significant cost reductions showed me how data science drives real business value.`
    }
  },

  {
    tileId: 31,
    roomId: 'room3',
    modalContent: {
      title: 'Fashion Retail Forecasting',
      icon: '👗',
      category: 'Deloitte Consulting - Supply Chain Analytics',
      content: `I developed time series forecasting models for fashion retail demand to optimize supply chain management. Fashion retail presents unique challenges with seasonal trends and fast-changing preferences where small forecasting errors cause significant inventory issues. My models incorporated historical data, seasonal patterns, marketing campaigns, and weather data to optimize inventory levels.`
    }
  },

  {
    tileId: 32,
    roomId: 'room3',
    modalContent: {
      title: 'Distribution Network Analysis',
      icon: '🗺️',
      category: 'Deloitte Consulting - Supply Chain Optimization',
      content: `I analyzed complex logistics networks to identify optimization opportunities, mapping entire distribution networks from suppliers to customers. Small changes in routing or warehouse positioning could have massive ripple effects throughout the network. This work reinforced my appreciation for systems thinking and effective data visualization.`
    }
  },

  {
    tileId: 35,
    roomId: 'room3',
    modalContent: {
      title: 'Deloitte Consulting Experience',
      icon: '🏢',
      category: 'Professional Journey',
      content: `My time at Deloitte as a Data Scientist was transformative, teaching me to apply technical skills across multiple industries. The variety - from energy analytics to fashion forecasting - taught me to quickly adapt my analytical approach. I learned to balance technical depth with business pragmatism and clear communication.`
    }
  },

  {
    tileId: 36,
    roomId: 'room3',
    modalContent: {
      title: 'Power BI Dashboard Development',
      icon: '📈',
      category: 'Deloitte Consulting - Business Intelligence',
      content: `I developed comprehensive Power BI dashboards for energy clients, transforming raw data into actionable business insights. The challenge was presenting complex analytics in an intuitive way that decision-makers could quickly understand. This taught me the critical importance of user experience in data visualization.`
    }
  },

  {
    tileId: 37,
    roomId: 'room3',
    modalContent: {
      title: 'Advanced Business Intelligence',
      icon: '💼',
      category: 'Deloitte Consulting - Dashboard Systems',
      content: `I developed advanced business intelligence solutions at Deloitte, creating comprehensive analytical frameworks for enterprise clients. These systems provided predictive analytics, trend analysis, and self-service platforms for independent data-driven decisions. The most rewarding aspect was seeing organizations shift from gut-feel to evidence-based strategies.`
    }
  },

  {
    tileId: 38,
    roomId: 'room3',
    modalContent: {
      title: 'Python & Scikit-Learn Expertise',
      icon: '🐍',
      category: 'Technical Skills - Data Science Stack',
      content: `Python and scikit-learn became my primary tools for machine learning and statistical analysis. I used Python for data preprocessing, exploratory analysis, and building complex machine learning pipelines with scikit-learn's consistent API. This stack enables rapid prototyping while being robust enough for production deployment.`
    }
  },

  {
    tileId: 39,
    roomId: 'room3',
    modalContent: {
      title: 'PyTorch & LangChain Development',
      icon: '🤖',
      category: 'Advanced AI - RAG Systems',
      content: `I used LangChain and PyTorch to develop chatbots with RAG capabilities, combining language models with domain-specific knowledge retrieval. The challenge involved designing efficient retrieval systems, managing vector embeddings, and orchestrating retrieval-generation interactions. This showed me AI's potential for reasoning over large knowledge bases with authoritative, source-backed responses.`
    }
  },

  {
    tileId: 40,
    roomId: 'room3',
    modalContent: {
      title: 'Recommendation Systems',
      icon: '🌳',
      category: 'Deloitte Consulting - Customer Analytics',
      content: `I developed recommendation systems combining customer segmentation analysis with personalized algorithms. The challenge was understanding that effective recommendations require deep customer insights beyond purchase history. Using clustering algorithms, I built tailored engines for each segment, showing how segment-specific features dramatically improve recommendation quality.`
    }
  },

  // R&D Engineering Section (Right Side)
  {
    tileId: 45,
    roomId: 'room3',
    modalContent: {
      title: 'Infrared Spectrum Analysis',
      icon: '🌡️',
      category: 'Leonardo SpA - IR Optical Systems',
      content: `At Leonardo SpA, I work with infrared spectrum analysis for advanced optical systems with FPA photodetectors. My work involves analyzing spectral signatures, optimizing detector sensitivity, and understanding atmospheric effects on infrared transmission. The fascinating challenge is balancing sensitivity, range, resolution, and environmental robustness in real-world defense systems.`
    }
  },

  {
    tileId: 46,
    roomId: 'room3',
    modalContent: {
      title: 'Atmospheric Modeling',
      icon: '🌤️',
      category: 'Leonardo SpA - Radiative Transfer',
      content: `I develop atmospheric transmission models using radiative transfer theory to predict how atmospheric conditions affect infrared systems. Water vapor, CO2, dust, and particles absorb different wavelengths, significantly impacting detection range and accuracy. The challenge is balancing model accuracy with computational efficiency for real-time system validation.`
    }
  },

  {
    tileId: 47,
    roomId: 'room3',
    modalContent: {
      title: 'Multi-Camera Array Systems',
      icon: '📷',
      category: 'Leonardo SpA - 360° Coverage Systems',
      content: `I work on multi-camera array systems providing comprehensive 360-degree coverage for detection and tracking. The challenges include complex geometric calculations for complete coverage, calibrating multiple sensors, and fusing viewpoints into coherent situational pictures. These systems are critical for missile warning applications where threats can appear from any direction.`
    }
  },

  {
    tileId: 48,
    roomId: 'room3',
    modalContent: {
      title: 'Leonardo SpA - Current Role',
      icon: '🛡️',
      category: 'R&D System Engineer',
      content: `I currently work as a System R&D Engineer at Leonardo SpA, focusing on infrared optical systems and defense technologies. My role encompasses system design with requirements engineering and algorithm development for computer vision applications. Working in defense technology is incredibly rewarding, developing systems where reliability and performance are absolutely critical.`
    }
  },

  {
    tileId: 49,
    roomId: 'room3',
    modalContent: {
      title: 'Object Detection Systems',
      icon: '🎯',
      category: 'Leonardo SpA - Computer Vision',
      content: `I develop object detection algorithms for defense applications where extreme accuracy and reliability are critical. The technical challenge is balancing detection sensitivity with false alarm rates while operating in real-time across varying conditions. These systems form the foundation for advanced tracking and threat classification capabilities.`
    }
  },

  {
    tileId: 50,
    roomId: 'room3',
    modalContent: {
      title: 'Kalman Filter Implementation',
      icon: '🎲',
      category: 'Leonardo SpA - State Estimation',
      content: `I implement Kalman filters for state estimation in tracking systems, solving the fundamental problem of estimating position and velocity from noisy measurements. The algorithm optimally combines physics predictions with sensor data, essential for tracking threats and predicting future positions. The mathematical beauty lies in its recursive nature, continuously updating estimates based on measurement uncertainties.`
    }
  },

  {
    tileId: 51,
    roomId: 'room3',
    modalContent: {
      title: 'Optical Flow Analysis',
      icon: '🌊',
      category: 'Leonardo SpA - Motion Analysis',
      content: `I develop optical flow algorithms for motion vector analysis in surveillance and tracking systems. Optical flow calculates apparent motion between frames, providing dense motion information that helps detect camouflaged targets invisible to direct detection methods. The computational challenge is processing high-resolution video streams in real-time across multiple channels simultaneously.`
    }
  },

  {
    tileId: 55,
    roomId: 'room3',
    modalContent: {
      title: 'MATLAB & Simulink Development',
      icon: '📐',
      category: 'Leonardo SpA - System Modeling',
      content: `MATLAB and Simulink are my primary tools for system modeling and algorithm development at Leonardo SpA. MATLAB provides rapid prototyping for signal processing while Simulink enables comprehensive system models simulating entire sensor-to-decision chains. These simulations are crucial for validating designs before expensive hardware implementation across thousands of scenarios.`
    }
  },

  // ===== HOBBIES ROOM (room4) =====
  
  // Reading Section
  {
    tileId: 8,
    roomId: 'room4',
    modalContent: {
      title: 'My Love for Reading',
      icon: '📚',
      category: 'Personal Interests - Literature',
      content: `I discovered my passion for reading through "The Lord of the Rings" at age 11, opening my eyes to storytelling's power. Today I'm drawn to divulgative essays that make complex topics accessible and engaging. Reading has become essential to my continuous learning philosophy, shaping how I approach problems and understand different viewpoints.`
    }
  },

  {
    tileId: 28,
    roomId: 'room4',
    modalContent: {
      title: 'Travel Philosophy',
      icon: '🗺️',
      category: 'Personal Growth - Cultural Exploration',
      content: `Travel is one of the best forms of education - I've visited Vietnam, Japan, USA, Australia, Egypt, and many European countries. Each destination offers unique insights into different problem-solving approaches and cultural perspectives. These experiences have given me a global perspective that makes me more adaptable and creative in both personal and professional contexts.`
    }
  },

  // Football Section (covers the entire football field tiles 16-27)
  {
    tileId: 16,
    roomId: 'room4',
    modalContent: {
      title: 'Professional Football Career',
      icon: '⚽',
      category: 'Sports Background - AC COMO',
      content: `I played as a professional soccer player at AC COMO, where football taught me invaluable lessons about discipline, teamwork, and strategic thinking. The mental toughness required to perform under pressure translates directly to my engineering work. Beyond playing, I coached children, passing on technical skills and values like perseverance and collaborative success.`
    }
  },

  // Individual country flag interactions (samples - can be expanded)
  {
    tileId: 62,
    roomId: 'room4',
    modalContent: {
      title: 'Japan Experience',
      icon: '🏯',
      category: 'Travel Adventures - Asia',
      content: `Japan fascinated me with its blend of ancient tradition and cutting-edge technology, showcasing incredible innovation in transportation and manufacturing. Japanese culture's emphasis on continuous improvement (kaizen) has influenced my engineering approach - small, incremental improvements lead to significant advances. The experience broadened my perspective on how different cultures approach technological challenges innovatively.`
    }
  },

  {
    tileId: 60,
    roomId: 'room4',
    modalContent: {
      title: 'Australia Adventure',
      icon: '🦘',
      category: 'Travel Adventures - Oceania',
      content: `Australia impressed me with its balance of outdoor adventure and technological sophistication, particularly in mining and environmental systems. The Australian emphasis on work-life balance showed me how personal interests enhance creativity and productivity. The massive scale of landscapes and engineering projects gave me new appreciation for large-scale systems thinking.`
    }
  },

  {
    tileId: 63,
    roomId: 'room4',
    modalContent: {
      title: 'Vietnam Discovery',
      icon: '🏮',
      category: 'Travel Adventures - Southeast Asia',
      content: `Vietnam offered incredible lessons in resilience and adaptation, with rapid development showing how necessity drives remarkable innovation. Vietnamese engineers embracing technology to leapfrog traditional stages taught me creative problem-solving approaches. The cultural emphasis on family and long-term thinking provided valuable perspectives on balancing tradition with modernization.`
    }
  },

  // Additional country flag stories
  {
    tileId: 65,
    roomId: 'room4',
    modalContent: {
      title: 'Italy - Home & Heritage',
      icon: '🇮🇹',
      category: 'Home Country',
      content: `Italy is where I learned to appreciate the balance between tradition and innovation, enjoying life while working with passion. Growing up here taught me the importance of quality over quantity in food, relationships, and work. The Italian approach to craftsmanship and attention to detail has deeply influenced my engineering mindset.`
    }
  },

  {
    tileId: 67,
    roomId: 'room4',
    modalContent: {
      title: 'Germany Experience',
      icon: '🇩🇪',
      category: 'Travel Adventures - Europe',
      content: `Germany impressed me with its incredible efficiency and systematic approach to engineering and technology. The German work ethic balances thoroughness with efficiency, taking time to do things right while maintaining productivity. Germany also demonstrated how technology can effectively address environmental challenges through sustainable engineering approaches.`
    }
  },

  {
    tileId: 61,
    roomId: 'room4',
    modalContent: {
      title: 'United States Adventure',
      icon: '🇺🇸',
      category: 'Travel Adventures - North America',
      content: `The United States showcased innovation and entrepreneurial thinking on a massive scale with incredible diversity in approaches to problem-solving. The American culture of taking calculated risks and learning from failure has influenced my approach to technical challenges. The ability to bring together diverse backgrounds for common goals demonstrated the power of collaborative innovation.`
    }
  }
];

// Helper function to get tile story by tile ID and room ID
export function getTileStory(tileId: number, roomId: string): TileStory | undefined {
  return tileStories.find(story => story.tileId === tileId && story.roomId === roomId);
}

// Helper function to get all interactive tiles for a room
export function getInteractiveTilesForRoom(roomId: string): number[] {
  return tileStories
    .filter(story => story.roomId === roomId)
    .map(story => story.tileId);
}

// Check if a tile is interactive
export function isInteractiveTile(tileId: number, roomId: string): boolean {
  return tileStories.some(story => story.tileId === tileId && story.roomId === roomId);
}

// Get all football field tiles (they all share the same story)
export const FOOTBALL_FIELD_TILES = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];

// Add stories for all football field tiles
for (let i = 17; i <= 27; i++) {
  tileStories.push({
    tileId: i,
    roomId: 'room4',
    modalContent: tileStories.find(story => story.tileId === 16)!.modalContent
  });
}