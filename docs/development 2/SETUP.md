# 🔧 Development Setup Guide

## **Prerequisites**

Before setting up the Interactive CV Platform development environment, ensure you have the following installed:

### **Required Software**
- **Node.js**: Version 16+ (includes npm)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, or Edge for testing
- **Code Editor**: VS Code recommended with TypeScript support

### **Optional Tools**
- **ImageMagick**: For asset optimization and analysis
- **Chrome DevTools**: For WebGPU debugging
- **GitHub CLI**: For repository management

## **Quick Setup**

### **1. Clone Repository**
```bash
# Clone the project
git clone https://github.com/yourusername/MyImmersiveExperience.git
cd MyImmersiveExperience

# Check out development branch
git checkout development
```

### **2. Install Dependencies**
```bash
# Install all packages
npm install

# Verify installation
npm list --depth=0
```

### **3. Start Development Server**
```bash
# Start development server with hot reload
npm run dev

# Server starts at http://localhost:5173
```

### **4. Verify Installation**
- Open browser to `http://localhost:5173`
- GameBoy-style interface should load
- Test AI conversation functionality
- Check browser console for any errors

## **Development Scripts**

### **Available Commands**
```json
{
  "dev": "vite",                    // Development server with hot reload
  "build": "vite build",            // Production build
  "preview": "vite preview",        // Preview production build
  "deploy": "./deploy.sh",          // Deploy to GitHub Pages
  "lint": "tsc --noEmit"           // TypeScript type checking
}
```

### **Development Workflow**
```bash
# Daily development
npm run dev              # Start development server
npm run lint             # Check TypeScript types
npm run build            # Test production build
npm run preview          # Preview built version
```

### **Deployment Workflow**
```bash
# Prepare for deployment
npm run build            # Create production build
npm run deploy           # Deploy to GitHub Pages
```

## **Project Configuration**

### **Vite Configuration (`vite.config.js`)**
```javascript
export default {
  base: '/MyImmersiveExperience/',  // GitHub Pages path
  build: {
    outDir: 'dist',                 // Build output directory
    assetsDir: 'assets',           // Static assets directory
    sourcemap: true                // Generate source maps
  },
  server: {
    host: true,                    // Allow external connections
    port: 5173                     // Development server port
  }
};
```

### **TypeScript Configuration (`tsconfig.json`)**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*",
    "main.ts",
    "*.ts"
  ]
}
```

## **Environment Setup**

### **VS Code Configuration**
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.associations": {
    "*.ts": "typescript"
  }
}
```

### **Recommended VS Code Extensions**
- **TypeScript and JavaScript Language Features** (built-in)
- **Vite** - For better Vite integration
- **Live Server** - Alternative development server
- **WebGL GLSL Editor** - For shader development (future)

## **Browser Development Setup**

### **Chrome DevTools Setup**
1. **Enable WebGPU**: Go to `chrome://flags` and enable:
   - WebGPU
   - WebGPU Developer Features
2. **Performance Profiling**: Use Performance tab for optimization
3. **Memory Monitoring**: Monitor memory usage during AI model loading

### **Firefox Developer Tools**
1. **WASM Debugging**: Enable WebAssembly debugging
2. **Network Monitoring**: Track model download performance
3. **Console Filtering**: Set up filters for AI system logs

### **Cross-Browser Testing**
```bash
# Test development build on different browsers
npm run dev

# Test production build locally
npm run build
npm run preview

# Test different network conditions
# Use browser dev tools to simulate slow connections
```

## **Asset Development**

### **Asset Directory Structure**
```
assets/
├── images/
│   ├── sprites/           # Character sprites
│   ├── tilesets/          # Background tiles
│   ├── ui/                # Interface elements
│   └── icons/             # Small icons
├── audio/                 # Sound effects (future)
└── data/
    └── assets_metadata.json  # Asset configuration
```

### **Asset Optimization**
```bash
# Generate asset inventory
find assets -type f \( -iname "*.png" -o -iname "*.jpg" \) | while read file; do
  size=$(du -h "$file" | cut -f1)
  dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
  echo "$file | $size | $dimensions"
done > assets_inventory.txt

# Optimize images (optional)
find assets -name "*.png" -exec optipng -o7 {} \;
```

## **AI Model Development**

### **Local Model Testing**
```typescript
// Test models locally without full app
const testModel = async (modelKey: string) => {
  try {
    const model = await loadModel(modelKey);
    const response = await model.process("Tell me about your experience");
    console.log(`${modelKey} response:`, response);
  } catch (error) {
    console.error(`${modelKey} failed:`, error);
  }
};

// Test all models
testModel('distilbert');
testModel('qwen');
testModel('phi3');
```

### **Network Speed Testing**
```bash
# Simulate different network speeds in Chrome DevTools
# Network > Throttling > Custom > Set download/upload speeds

# Test download speeds
curl -w "@curl-format.txt" -o /dev/null -s "https://huggingface.co/test-file"
```

## **Debugging Setup**

### **Development Debug Panel**
The debug panel shows during development:
- Player coordinates and state
- Current room and navigation status
- AI model loading status
- Network speed and connection info
- Frame rate and performance metrics

```typescript
// Toggle debug panel in main.ts
if (import.meta.env.DEV) {
  updateDebugPanel(currentTime);
}
```

### **Browser Console Debugging**
```typescript
// Enable detailed logging
localStorage.setItem('debug_ai', 'true');
localStorage.setItem('debug_network', 'true');
localStorage.setItem('debug_ui', 'true');

// View AI system state
console.log('AI Models:', window.aiModels);
console.log('Download State:', window.downloadState);
console.log('User Consents:', window.userConsents);
```

### **Performance Monitoring**
```javascript
// Monitor memory usage
const memoryInfo = (performance as any).memory;
if (memoryInfo) {
  console.log('Memory Usage:', {
    used: Math.round(memoryInfo.usedJSHeapSize / 1048576) + 'MB',
    total: Math.round(memoryInfo.totalJSHeapSize / 1048576) + 'MB',
    limit: Math.round(memoryInfo.jsHeapSizeLimit / 1048576) + 'MB'
  });
}

// Monitor model loading performance
console.time('model-load-phi3');
await loadModel('phi3');
console.timeEnd('model-load-phi3');
```

## **Git Workflow**

### **Branch Strategy**
```bash
# Main branches
main              # Production-ready code
development       # Integration branch
gh-pages         # Deployed version

# Feature branches
feature/ai-improvements
feature/ui-updates
fix/mobile-compatibility
```

### **Development Workflow**
```bash
# Start new feature
git checkout development
git pull origin development
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add feature description"

# Push and create PR
git push origin feature/my-feature
# Create PR on GitHub from feature branch to development
```

### **Deployment Process**
```bash
# From development branch
git checkout development
npm run build              # Test build
npm run deploy            # Deploy to GitHub Pages

# Or manual deployment
git checkout gh-pages
git merge development
npm run build
cp -r dist/* .
git add . && git commit -m "Deploy update"
git push origin gh-pages
```

## **Troubleshooting**

### **Common Issues**

#### **Module Not Found Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **TypeScript Compilation Errors**
```bash
# Check TypeScript configuration
npm run lint

# Clear TypeScript cache
rm -rf .tsc-cache
```

#### **Asset Loading Issues**
```bash
# Verify asset paths in assets_metadata.json
# Check console for 404 errors
# Ensure assets are in correct directory structure
```

#### **AI Model Loading Failures**
```bash
# Check network connectivity
curl -I https://huggingface.co/

# Test WebGPU support
# Go to chrome://gpu/ and check WebGPU status

# Clear browser cache and localStorage
localStorage.clear();
```

### **Performance Issues**
- **Slow Development Server**: Check for large files in assets/
- **Memory Leaks**: Monitor memory in DevTools during AI model switching
- **Slow AI Responses**: Verify WebGPU is enabled and working

### **Browser Compatibility Issues**
- **Safari**: AI models may not work, fallback responses should appear
- **Firefox**: Some WebGPU features limited, should fall back to WASM
- **Mobile**: Large models (Phi-3) should be disabled automatically

## **Testing Setup**

### **Manual Testing Checklist**
- [ ] Development server starts without errors
- [ ] GameBoy interface loads correctly
- [ ] Room navigation works (arrow keys/touch)
- [ ] AI conversation system functional
- [ ] Model downloading and consent flow works
- [ ] Progress bars show real download progress
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsive design working
- [ ] Production build generates successfully
- [ ] Deployed version matches local build

### **Testing Different Scenarios**
```bash
# Test slow network
# Use Chrome DevTools Network throttling

# Test mobile devices
# Use Chrome DevTools Device emulation

# Test different browsers
# Firefox, Safari, Edge testing

# Test different screen sizes
# Responsive design verification
```

This setup guide ensures a smooth development experience for contributing to the Interactive CV Platform.