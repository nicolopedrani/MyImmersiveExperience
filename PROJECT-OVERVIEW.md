# MyImmersiveExperience - Interactive Portfolio

## 🎯 Project Purpose

**MyImmersiveExperience** is an innovative interactive portfolio designed specifically for recruiters and hiring managers. Instead of a traditional resume or portfolio website, this project presents personal information, skills, and experiences through an explorable 2D pixel-art game environment.

**Primary Goal**: Create a memorable and engaging way for potential employers to discover Nicolo's background, interests, and technical capabilities while showcasing development skills through the interactive experience itself.

## 🎮 Game Overview

The experience is structured as a **room-based exploration game** where visitors can navigate through different areas, each representing a different aspect of professional and personal profile:

### Room Structure
- **🏠 Central Hub (Main Room)** - Welcome area and navigation center
- **🎨 Hobbies Room** - Personal interests and activities (football, travel flags, reading)
- **💼 Working Experience Room** - Professional background with Data Science (Deloitte) and R&D Engineering (Leonardo SpA) sections
- **👑 Boss Room** - Interactive AI-powered conversation with Nicolo about his CV and experience

## 🚀 Deployment Target: GitHub Pages (Static Website)
**Critical Constraint**: This project must be deployable as a static website on GitHub Pages with no backend server requirements.

## ✅ Current Status - Completed Components

### Game Engine & Core Systems
- Complete game engine with modular TypeScript architecture
- HTML5 Canvas rendering and sprite system  
- Tile-based rendering system with sprite sheets
- Room management and navigation system
- Real-time character movement and animations
- Touch controls for mobile devices
- Asset management system with organized loading and caching
- Debug tools for development
- Responsive design adapting to different screen sizes

### Room Implementation Status
- ✅ **Central Hub** - Completed with navigation paths
- ✅ **Hobbies Room** - Completed with football field and travel flags  
- ✅ **Working Experience Room** - Completed with Data Science and R&D sections
- ✅ **Boss Room** - Completed with conversation interface

### AI Integration
- Boss conversation interface with professional chat modal
- High-quality fallback response system
- Professional CV context integration
- Comprehensive knowledge base covering work experience, technical skills, and personal interests
- Context-aware response matching

## ❌ Critical Issue: AI Model Integration

**Problem**: Cannot load transformer models (@xenova/transformers@2.17.2) due to:
- ONNX runtime dependency resolution issues with Vite
- Browser compatibility problems with WebAssembly backends  
- Static deployment constraints for GitHub Pages
- Deprecated package with missing dependencies

**Impact**: Game works with fallback responses but lacks real AI functionality

**Solution Status**: Research completed - migration to @huggingface/transformers@3.7.1 required

## 🤖 Target AI System

### AI Models
1. **Qwen1.5-0.5B-Chat** (~500MB) - Advanced conversational model for natural dialogue
2. **DistilBERT-Squad** (~65MB) - Question-answering model for direct queries

### Conversation Topics Coverage
- **Work Experience** - Deloitte Consulting (Data Science) and Leonardo SpA (R&D Engineering)
- **Technical Skills** - Python, MATLAB, Machine Learning, Computer Vision, Cloud Platforms
- **Personal Interests** - Football, International Travel (14 countries), Reading  
- **Projects & Achievements** - Business analytics, defense systems, interactive portfolio

### User Experience Flow
1. **Proximity Detection** - Approach Nicolo in the Boss Room
2. **Interactive Prompt** - "Press SPACE to talk to Nicolo"
3. **Professional Chat** - Real-time AI responses about experience and skills
4. **Mobile Friendly** - Touch controls and responsive design

## 🛠 Technical Implementation

### Core Technologies
- **TypeScript** - Type-safe development with modern JavaScript features
- **HTML5 Canvas** - 2D rendering and game graphics
- **Vite** - Modern build tool with hot reload for development
- **Hugging Face Transformers.js** - Browser-based AI for intelligent conversation (planned migration)
- **GitHub Pages** - Static hosting and deployment

### Development Workflow
```bash
# Development
npm run dev          # Start development server with hot reload

# Production  
npm run build        # Create optimized build
npm run deploy       # Deploy to GitHub Pages
```

## 🎨 Visual Design

**Pixel-art aesthetic** with carefully curated sprite sheets and tilesets:
- Custom character animations
- Themed room environments  
- Interactive objects and decorations
- Country flags representing travel experiences
- Professional-themed visual elements

## 📋 Next Phase: Technical Strategy Implementation

Refer to documentation for detailed implementation approach:
- **TECHNICAL-STRATEGY.md** - Research findings, risk analysis, and 4-week migration plan
- **EXAMPLES_USAGE.md** - Practical code examples and integration patterns

**Primary Objective**: Achieve full AI functionality with static GitHub Pages deployment by Q1 2025.

## 🎯 Target Audience & Value Proposition

**Primary**: Recruiters, hiring managers, and potential employers  
**Secondary**: Fellow developers interested in creative portfolio approaches

### Why This Approach?
1. **Memorable Experience** - Stands out from traditional portfolios with interactive gameplay
2. **Technical Demonstration** - Showcases actual coding, AI integration, and design skills  
3. **Interactive Engagement** - Encourages exploration and direct conversation
4. **Modern Technology Stack** - Demonstrates familiarity with TypeScript, AI, and browser technologies
5. **Creative Problem Solving** - Shows ability to think outside the box and implement innovative solutions
6. **AI Innovation** - Integrates cutting-edge browser-based AI for personalized recruiter experience

## 🔗 Live Experience

**Deployment**: `https://[username].github.io/MyImmersiveExperience/`

---

*This project represents the intersection of technical skill, creative thinking, and professional presentation - exactly the kind of innovative approach brought to development challenges.*