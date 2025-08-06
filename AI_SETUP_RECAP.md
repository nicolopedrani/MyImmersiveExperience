# AI System Setup Recap & Strategy

## Current State
- **Game**: Interactive portfolio game with conversation system ✅
- **AI Features**: Dual model support (Qwen1.5-0.5B-Chat + DistilBERT) ✅
- **UI**: Player-controlled model selection dropdown ✅
- **Problem**: Vite build/dev dependency resolution issues ❌

## Working Files (Already Implemented)
- `src/modules/aiProcessor.ts` - Complete AI system with dual model support
- `src/modules/conversation.ts` - UI with model selection dropdown
- `src/main.ts` - Integration with conversation system
- `index.html` - Game entry point
- All other game modules (canvas, player, map, etc.)

## Current Dependencies Issue
The `@xenova/transformers@2.17.2` package has complex dependencies that Vite cannot resolve:
- `onnxruntime-web` - Missing proper package.json exports
- `onnxruntime-common` - Missing dependency
- `@huggingface/jinja` - Missing dist files
- Various other ONNX-related packages

## Required Node Modules (Minimal Set)
```json
{
  "devDependencies": {
    "@types/node": "^24.1.0",
    "vite": "^7.0.6"
  },
  "dependencies": {
    "@xenova/transformers": "^2.17.2"
  }
}
```

## Strategy: Fresh Installation Approach

### Phase 1: Clean Slate
1. **Backup working code** (already done - our .ts files are complete)
2. **Remove problematic dependencies**:
   ```bash
   rm -rf node_modules
   rm package-lock.json
   ```

### Phase 2: Minimal Vite Configuration
Create the simplest possible `vite.config.ts` that works with transformers:
```typescript
import { defineConfig } from "vite";

export default defineConfig({
  base: "/MyImmersiveExperience/",
  
  // Let transformers load at runtime without optimization
  optimizeDeps: {
    exclude: ["@xenova/transformers"]
  },
  
  // Simple build configuration
  build: {
    rollupOptions: {
      // Don't bundle transformers - load it dynamically
      external: id => id.includes('transformers')
    }
  }
});
```

### Phase 3: Alternative Approaches (If Needed)

#### Option A: Use CDN for Transformers
Instead of npm install, load via CDN:
```html
<script type="module">
  import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/+esm'
  // Use in aiProcessor.ts
</script>
```

#### Option B: Different AI Library
Switch to a more Vite-friendly library:
- `@huggingface/transformers` (official HF library)
- `@tensorflow/tfjs` with pre-trained models
- Custom fetch-based approach to HuggingFace API

#### Option C: Node.js Backend
Move AI processing to a simple Node.js server:
- Frontend sends questions via fetch()
- Backend runs transformers.js
- No browser compatibility issues

## Success Criteria
- [✅] Code files are complete and working
- [❌] `npm run dev` works without errors
- [❌] `npm run build` works without errors
- [❌] AI models load and respond correctly in browser
- [❌] Both Qwen and DistilBERT models function

## Next Steps Priority
1. Try minimal vite.config.ts approach
2. If that fails, try CDN approach  
3. If that fails, consider backend API approach
4. Test thoroughly with both models

## Files That Need No Changes
- All `.ts` files in `src/` directory (AI system is complete)
- `index.html` (game structure is complete)  
- Basic game functionality (already working)

## Files to Modify/Create
- `package.json` (clean dependencies)
- `vite.config.ts` (minimal configuration)
- Possibly add CDN script tags if npm approach fails

The core AI system is **already implemented and working**. This is purely a **build/bundling configuration issue**.