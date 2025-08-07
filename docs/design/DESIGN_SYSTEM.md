# 🎨 Design System

## **Overview**

The Interactive CV Platform uses a carefully crafted GameBoy-inspired design system that balances nostalgic aesthetics with modern usability. This design system ensures consistency, accessibility, and a unique visual identity across all components.

## **Design Philosophy**

### **Core Principles**

1. **Nostalgic Authenticity**: Faithfully recreates GameBoy aesthetics while remaining functional
2. **Progressive Enhancement**: Starts simple, adds sophistication based on device capabilities  
3. **Accessibility First**: Ensures usability for all users regardless of abilities
4. **Performance Conscious**: Optimizes visual elements for smooth performance
5. **Cross-Platform Consistency**: Maintains visual identity across all devices and browsers

### **GameBoy DNA**

Our design draws inspiration from the original Nintendo GameBoy (1989):
- **Monochromatic green palette** with carefully chosen accent colors
- **Pixel-perfect typography** using monospace fonts
- **Chunky, tactile buttons** with clear press states
- **Simple geometric layouts** that feel retro yet timeless
- **Subtle animations** that enhance without overwhelming

## **Color Palette**

### **Primary GameBoy Colors**

#### **Greens (Core Identity)**
```css
--gameboy-dark: #0f380f;     /* Darkest green - primary text, borders */
--gameboy-medium: #306230;   /* Medium green - secondary elements */
--gameboy-light: #8bac0f;    /* Light green - highlights, active states */
--gameboy-lightest: #9bbc0f; /* Lightest green - background, subtle elements */
```

#### **Background & Canvas**
```css
--gameboy-bg: #8bac0f;       /* Main background - authentic GameBoy screen color */
--gameboy-canvas: #9bbc0f;   /* Canvas background - slightly lighter */
--gameboy-paper: #c7d323;    /* Paper/card backgrounds */
```

### **Semantic Colors**

#### **System Status Colors**
```css
--success: #8bac0f;          /* Success states - uses brand green */
--warning: #f4a261;          /* Warnings - warm orange */
--error: #e63946;            /* Errors - clear red */
--info: #457b9d;             /* Information - calm blue */
```

#### **AI Model Colors**
```css
--distilbert: #306230;       /* DistilBERT - medium green */
--qwen: #457b9d;             /* Qwen - blue for distinction */
--phi3: #e63946;             /* Phi-3 - red for premium/advanced */
```

### **Interactive States**

#### **Button States**
```css
--button-idle: #306230;      /* Default button background */
--button-hover: #8bac0f;     /* Hover state - lighter green */
--button-active: #0f380f;    /* Active/pressed state - darkest green */
--button-disabled: #9bbc0f;  /* Disabled state - muted */
```

#### **Progress & Loading**
```css
--progress-bg: #306230;      /* Progress bar background */
--progress-fill: #8bac0f;    /* Progress bar fill */
--loading-spinner: #0f380f;  /* Loading animations */
```

## **Typography**

### **Font Stack**

#### **Primary (Monospace)**
```css
font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
```
- **Purpose**: Main UI text, buttons, labels
- **Characteristics**: Pixel-perfect alignment, authentic retro feel
- **Accessibility**: High contrast, clear character distinction

#### **Fallback (Sans-serif)**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```
- **Purpose**: Used when monospace becomes unreadable at small sizes
- **Context**: Fine print, mobile optimization

### **Type Scale**

#### **Heading Hierarchy**
```css
.h1 { font-size: 24px; font-weight: bold; }  /* Main titles */
.h2 { font-size: 20px; font-weight: bold; }  /* Section headers */
.h3 { font-size: 16px; font-weight: bold; }  /* Subsection headers */
.h4 { font-size: 14px; font-weight: bold; }  /* Minor headers */
```

#### **Body Text**
```css
.body-large { font-size: 16px; }    /* Main content, conversation */
.body { font-size: 14px; }          /* Standard UI text */
.body-small { font-size: 12px; }    /* Secondary information */
.caption { font-size: 10px; }       /* Fine print, labels */
```

#### **Code & Technical**
```css
.code { 
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 13px;
  background: rgba(15, 56, 15, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}
```

### **Text Colors**

#### **Contrast Levels**
```css
--text-primary: #0f380f;     /* High contrast - main content */
--text-secondary: #306230;   /* Medium contrast - supporting text */
--text-tertiary: #8bac0f;    /* Low contrast - subtle information */
--text-inverse: #9bbc0f;     /* Light text on dark backgrounds */
```

## **Layout System**

### **Grid Foundation**

#### **64px Base Grid**
The entire interface is built on a 64x64 pixel grid system:
- **Tile Size**: 64x64px (matches GameBoy sprite standards)
- **Room Dimensions**: Multiples of 64px (e.g., 832x576px = 13x9 tiles)
- **UI Components**: Aligned to 8px sub-grid for precise positioning

#### **Responsive Breakpoints**
```css
--mobile-max: 768px;         /* Mobile devices */
--tablet-min: 769px;         /* Tablet portrait */
--tablet-max: 1024px;        /* Tablet landscape */  
--desktop-min: 1025px;       /* Desktop and larger */
```

### **Spacing Scale**

#### **Consistent Spacing Units**
```css
--space-xs: 4px;    /* Tight spacing - borders, small gaps */
--space-sm: 8px;    /* Small spacing - button padding */
--space-md: 16px;   /* Medium spacing - component margins */
--space-lg: 24px;   /* Large spacing - section separation */
--space-xl: 32px;   /* Extra large - major layout divisions */
--space-xxl: 48px;  /* Maximum spacing - page margins */
```

### **Z-Index Hierarchy**
```css
--z-background: -1;    /* Background elements */
--z-content: 1;        /* Main content */
--z-ui: 10;           /* UI overlays */
--z-modal: 100;       /* Modal dialogs */
--z-debug: 9999;      /* Debug panels (development only) */
```

## **Component Design**

### **Buttons**

#### **Primary Button**
```css
.button-primary {
  background: var(--button-idle);
  color: var(--text-inverse);
  border: 2px solid var(--gameboy-dark);
  padding: var(--space-sm) var(--space-md);
  font-family: monospace;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s ease;
}

.button-primary:hover {
  background: var(--button-hover);
  transform: translateY(-1px);
}

.button-primary:active {
  background: var(--button-active);
  transform: translateY(1px);
}
```

#### **Secondary Button**
```css
.button-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--gameboy-medium);
  /* Same padding and transitions as primary */
}
```

### **Modal Dialogs**

#### **Base Modal Structure**
```css
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 56, 15, 0.8);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: var(--gameboy-paper);
  border: 4px solid var(--gameboy-dark);
  border-radius: 0; /* Sharp corners for retro feel */
  padding: var(--space-lg);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}
```

### **Progress Bars**

#### **Horizontal Progress Bar**
```css
.progress-container {
  width: 100%;
  height: 16px;
  background: var(--progress-bg);
  border: 2px solid var(--gameboy-dark);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--progress-fill);
  transition: width 0.3s ease;
  position: relative;
}

/* Animated progress indicator */
.progress-fill::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(255,255,255,0.1) 4px,
    rgba(255,255,255,0.1) 8px
  );
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% { transform: translateX(0); }
  100% { transform: translateX(16px); }
}
```

### **Form Elements**

#### **Input Fields**
```css
.input {
  background: var(--gameboy-lightest);
  border: 2px solid var(--gameboy-medium);
  color: var(--text-primary);
  font-family: monospace;
  font-size: 14px;
  padding: var(--space-sm);
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--gameboy-dark);
  background: var(--gameboy-paper);
}

.input::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}
```

#### **Dropdown Selectors**
```css
.select {
  background: var(--gameboy-lightest);
  border: 2px solid var(--gameboy-medium);
  color: var(--text-primary);
  font-family: monospace;
  font-size: 14px;
  padding: var(--space-sm);
  cursor: pointer;
}

.select:hover {
  border-color: var(--gameboy-dark);
}
```

## **Animation System**

### **Animation Principles**

1. **Subtle & Purposeful**: Animations enhance usability without being distracting
2. **Performance-First**: Uses CSS transforms and opacity for smooth performance
3. **GameBoy-Appropriate**: Movements feel chunky and deliberate, not smooth/modern
4. **Accessibility**: Respects `prefers-reduced-motion` setting

### **Core Animations**

#### **Fade Transitions**
```css
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-out {
  animation: fadeOut 0.3s ease-in;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

#### **Button Press Animation**
```css
.button-press {
  transition: transform 0.1s ease;
}

.button-press:active {
  transform: translateY(2px);
}
```

#### **Loading Spinner**
```css
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--gameboy-medium);
  border-top: 3px solid var(--gameboy-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### **Accessibility Considerations**
```css
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
    border-top-color: var(--gameboy-dark);
  }
  
  .progress-fill::after {
    animation: none;
  }
  
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

## **Responsive Behavior**

### **Mobile Adaptations**

#### **Touch Target Sizing**
```css
@media (max-width: 768px) {
  .button {
    min-height: 44px; /* Apple's recommended touch target size */
    min-width: 44px;
    padding: var(--space-md);
  }
  
  .touch-control {
    min-height: 60px; /* Larger for game controls */
    min-width: 60px;
  }
}
```

#### **Text Scaling**
```css
@media (max-width: 768px) {
  .body-large { font-size: 18px; } /* Larger for readability */
  .body { font-size: 16px; }
  .body-small { font-size: 14px; }
  
  .modal-content {
    padding: var(--space-md);
    margin: var(--space-md);
  }
}
```

### **Desktop Enhancements**

#### **Hover States**
```css
@media (min-width: 769px) {
  .interactive:hover {
    cursor: pointer;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(15, 56, 15, 0.3);
  }
}
```

#### **Keyboard Focus**
```css
.focusable:focus {
  outline: 2px solid var(--info);
  outline-offset: 2px;
}

.button:focus {
  outline: 3px solid var(--info);
  outline-offset: 1px;
}
```

## **Accessibility Features**

### **Color Contrast**

All color combinations meet WCAG 2.1 AA standards:
- **Primary text**: 7:1 contrast ratio (AAA level)
- **Secondary text**: 4.5:1 contrast ratio (AA level)
- **UI elements**: 3:1 contrast ratio for non-text elements

### **Screen Reader Support**

#### **ARIA Labels & Roles**
```html
<button aria-label="Switch to Phi-3 Advanced AI model" role="button">
  🧠 Phi-3 Advanced
</button>

<div role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100">
  <span class="sr-only">Download progress: 45%</span>
</div>

<div role="alert" aria-live="polite">
  Model loaded successfully
</div>
```

#### **Screen Reader Only Content**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### **Keyboard Navigation**

#### **Focus Management**
```css
.focus-trap {
  /* Ensures focus stays within modal dialogs */
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--gameboy-dark);
  color: var(--text-inverse);
  padding: 8px;
  z-index: 1000;
  text-decoration: none;
}

.skip-link:focus {
  top: 6px;
}
```

## **Performance Considerations**

### **CSS Optimization**

#### **Critical CSS**
Only essential styles are inlined, rest loaded asynchronously:
```css
/* Critical above-the-fold styles */
.gameboy-container { /* Immediate layout styles */ }
.loading-screen { /* Loading state styles */ }
```

#### **GPU Acceleration**
```css
.gpu-accelerated {
  transform: translate3d(0, 0, 0); /* Trigger GPU acceleration */
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### **Asset Optimization**

#### **Color Optimization**
- Uses a limited palette to reduce CSS size
- Leverages CSS custom properties for easy theming
- Minimal gradients and shadows to maintain performance

#### **Animation Performance**
```css
.performant-animation {
  /* Only animate transform and opacity for best performance */
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform, opacity;
}
```

This design system ensures the Interactive CV Platform maintains its unique GameBoy identity while providing excellent usability and accessibility across all devices and user needs.