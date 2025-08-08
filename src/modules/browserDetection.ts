// modules/browserDetection.ts - Enhanced browser and device detection system

export interface BrowserInfo {
  name: string;           // 'Chrome', 'Safari', 'Firefox', 'Edge'
  version: string;        // Version number
  engine: string;         // 'Blink', 'WebKit', 'Gecko'
  isDesktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  os: string;            // 'Windows', 'macOS', 'iOS', 'Android', 'Linux'
  osVersion: string;
  supportsWebGPU: boolean;
  supportsWebAssembly: boolean;
  estimatedRAM: number;   // GB
  compatibilityLevel: 'excellent' | 'good' | 'limited' | 'poor';
}

export interface CompatibilityInfo {
  level: 'excellent' | 'good' | 'limited' | 'poor';
  aiSupport: {
    prewritten: boolean;
    distilbert: boolean;
    qwen: boolean; 
    phi3: boolean;
  };
  recommendedModel: 'prewritten' | 'distilbert' | 'qwen' | 'phi3';
  warnings: string[];
  suggestions: string[];
  message: string;
}

class BrowserDetector {
  private userAgent: string;
  private browserInfo: BrowserInfo | null = null;

  constructor() {
    this.userAgent = navigator.userAgent;
  }

  detectBrowser(): BrowserInfo {
    if (this.browserInfo) return this.browserInfo;

    const info: BrowserInfo = {
      name: this.getBrowserName(),
      version: this.getBrowserVersion(),
      engine: this.getBrowserEngine(),
      isDesktop: this.isDesktop(),
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      os: this.getOperatingSystem(),
      osVersion: this.getOSVersion(),
      supportsWebGPU: this.checkWebGPUSupport(),
      supportsWebAssembly: this.checkWebAssemblySupport(),
      estimatedRAM: this.estimateRAM(),
      compatibilityLevel: 'good' // Will be calculated below
    };

    // Calculate overall compatibility
    info.compatibilityLevel = this.calculateCompatibility(info);
    
    this.browserInfo = info;
    return info;
  }

  private getBrowserName(): string {
    const ua = this.userAgent;
    
    // Check for iOS Chrome first (uses CriOS instead of Chrome)
    if (ua.includes('CriOS')) {
      return 'Chrome';
    } else if (ua.includes('Chrome') && !ua.includes('Edge')) {
      return 'Chrome';
    } else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('CriOS')) {
      return 'Safari';
    } else if (ua.includes('Firefox')) {
      return 'Firefox';
    } else if (ua.includes('Edge')) {
      return 'Edge';
    } else if (ua.includes('Opera') || ua.includes('OPR')) {
      return 'Opera';
    } else if (ua.includes('Samsung')) {
      return 'Samsung Internet';
    } else {
      return 'Unknown';
    }
  }

  private getBrowserVersion(): string {
    const ua = this.userAgent;
    let match: RegExpMatchArray | null;

    // Handle iOS Chrome version (CriOS)
    if (ua.includes('CriOS')) {
      match = ua.match(/CriOS\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    } else if (ua.includes('Chrome') && !ua.includes('Edge')) {
      match = ua.match(/Chrome\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('CriOS')) {
      match = ua.match(/Safari\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    } else if (ua.includes('Firefox')) {
      match = ua.match(/Firefox\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    } else if (ua.includes('Edge')) {
      match = ua.match(/Edge\/(\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }

    return 'Unknown';
  }

  private getBrowserEngine(): string {
    const ua = this.userAgent;
    
    // iOS Chrome uses WebKit but has Blink-like capabilities
    if (ua.includes('CriOS')) {
      return 'Blink'; // iOS Chrome - treat as Blink for compatibility
    } else if (ua.includes('WebKit') && ua.includes('Chrome')) {
      return 'Blink'; // Chrome, Edge, Opera
    } else if (ua.includes('WebKit') && !ua.includes('Chrome') && !ua.includes('CriOS')) {
      return 'WebKit'; // Safari
    } else if (ua.includes('Gecko') && ua.includes('Firefox')) {
      return 'Gecko'; // Firefox
    } else {
      return 'Unknown';
    }
  }

  private isDesktop(): boolean {
    const ua = this.userAgent;
    return !(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua) ||
      ('ontouchstart' in window && screen.width < 1024)
    );
  }

  private isMobile(): boolean {
    const ua = this.userAgent;
    return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
           (('ontouchstart' in window) && screen.width < 768);
  }

  private isTablet(): boolean {
    const ua = this.userAgent;
    return /iPad/.test(ua) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
           (('ontouchstart' in window) && screen.width >= 768 && screen.width < 1024);
  }

  private getOperatingSystem(): string {
    const ua = this.userAgent;
    
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'iOS';
    } else if (/Android/.test(ua)) {
      return 'Android';
    } else if (/Windows/.test(ua)) {
      return 'Windows';
    } else if (/Macintosh|Mac OS X/.test(ua)) {
      return 'macOS';
    } else if (/Linux/.test(ua)) {
      return 'Linux';
    } else {
      return 'Unknown';
    }
  }

  private getOSVersion(): string {
    const ua = this.userAgent;
    let match: RegExpMatchArray | null;

    switch (this.getOperatingSystem()) {
      case 'iOS':
        match = ua.match(/OS (\d+_\d+)/);
        return match ? match[1].replace('_', '.') : 'Unknown';
      case 'Android':
        match = ua.match(/Android (\d+\.\d+)/);
        return match ? match[1] : 'Unknown';
      case 'Windows':
        match = ua.match(/Windows NT (\d+\.\d+)/);
        return match ? match[1] : 'Unknown';
      case 'macOS':
        match = ua.match(/Mac OS X (\d+_\d+)/);
        return match ? match[1].replace('_', '.') : 'Unknown';
      default:
        return 'Unknown';
    }
  }

  private checkWebGPUSupport(): boolean {
    return 'gpu' in navigator;
  }

  private checkWebAssemblySupport(): boolean {
    try {
      if (typeof WebAssembly === 'object' && 
          typeof WebAssembly.instantiate === 'function') {
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  private estimateRAM(): number {
    // Use Device Memory API if available
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory;
    }

    // Fallback estimation based on device type and browser
    const os = this.getOperatingSystem();
    const isMobile = this.isMobile();
    const isTablet = this.isTablet();

    if (isMobile) {
      return os === 'iOS' ? 3 : 2; // iOS tends to have more RAM
    } else if (isTablet) {
      return os === 'iOS' ? 4 : 3; // iPad Pro models have more RAM
    } else {
      return 8; // Desktop default estimate
    }
  }

  private calculateCompatibility(info: BrowserInfo): 'excellent' | 'good' | 'limited' | 'poor' {
    let score = 0;

    // Browser compatibility scores
    if (info.name === 'Chrome' || info.name === 'Edge') {
      score += 40; // Best compatibility
    } else if (info.name === 'Firefox') {
      score += 30; // Good but limited WebGPU
    } else if (info.name === 'Safari') {
      score += info.os === 'iOS' ? 10 : 25; // iOS Safari has issues
    } else {
      score += 15; // Other browsers
    }

    // Platform scores
    if (info.isDesktop) {
      score += 30;
    } else if (info.isTablet) {
      score += 20;
    } else if (info.isMobile) {
      score += 10;
    }

    // WebGPU support
    if (info.supportsWebGPU) {
      score += 20;
    }

    // RAM availability
    if (info.estimatedRAM >= 8) {
      score += 10;
    } else if (info.estimatedRAM >= 4) {
      score += 5;
    }

    // Determine compatibility level
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'limited';
    return 'poor';
  }

  getCompatibilityInfo(): CompatibilityInfo {
    const browser = this.detectBrowser();
    const info: CompatibilityInfo = {
      level: browser.compatibilityLevel,
      aiSupport: {
        prewritten: true, // Pre-written responses always work
        distilbert: this.canRunDistilBERT(browser),
        qwen: this.canRunQwen(browser),
        phi3: this.canRunPhi3(browser)
      },
      recommendedModel: this.getRecommendedModel(browser),
      warnings: this.getWarnings(browser),
      suggestions: this.getSuggestions(browser),
      message: this.getCompatibilityMessage(browser)
    };

    return info;
  }

  private canRunDistilBERT(browser: BrowserInfo): boolean {
    // Based on research: Transformers.js v3 has critical issues on iOS devices
    // Both iOS Safari and iOS Chrome crash due to WebAssembly/memory issues
    if (browser.os === 'iOS') {
      return false; // Transformers.js v3 crashes on all iOS browsers
    }
    return browser.supportsWebAssembly;
  }

  private canRunQwen(browser: BrowserInfo): boolean {
    // Qwen requires more resources and better browser support
    if (browser.os === 'iOS') {
      return false; // iOS has general compatibility issues
    }
    
    if (browser.isMobile && browser.estimatedRAM < 3) {
      return false; // Not enough RAM on mobile
    }

    return browser.supportsWebAssembly && 
           (browser.name === 'Chrome' || browser.name === 'Edge' || browser.name === 'Firefox');
  }

  private canRunPhi3(browser: BrowserInfo): boolean {
    // Phi-3 requires significant resources and best browser support
    if (browser.os === 'iOS' || browser.isMobile) {
      return false; // Too resource intensive for mobile
    }

    return browser.isDesktop && 
           browser.estimatedRAM >= 4 && 
           browser.supportsWebAssembly && 
           (browser.name === 'Chrome' || browser.name === 'Edge');
  }

  private getRecommendedModel(browser: BrowserInfo): 'prewritten' | 'distilbert' | 'qwen' | 'phi3' {
    // iOS devices always use pre-written responses
    if (browser.os === 'iOS') {
      return 'prewritten';
    }
    
    // For devices that can run AI models, recommend best available
    if (this.canRunPhi3(browser)) return 'phi3';
    if (this.canRunQwen(browser)) return 'qwen';
    if (this.canRunDistilBERT(browser)) return 'distilbert';
    
    // Fallback to pre-written responses for incompatible devices
    return 'prewritten';
  }

  private getWarnings(browser: BrowserInfo): string[] {
    const warnings: string[] = [];

    if (browser.os === 'iOS') {
      warnings.push('iOS devices have critical compatibility issues with Transformers.js v3');
      warnings.push('AI models will crash on iOS - only pre-written responses available');
      warnings.push('Use a desktop browser for full AI model support');
    }

    if (browser.isMobile && browser.estimatedRAM < 2) {
      warnings.push('Limited RAM detected - only basic models will be available');
    }

    if (!browser.supportsWebGPU && browser.isDesktop) {
      warnings.push('WebGPU not available - AI processing will be slower');
    }

    if (browser.name === 'Unknown') {
      warnings.push('Unsupported browser - functionality may be limited');
    }

    return warnings;
  }

  private getSuggestions(browser: BrowserInfo): string[] {
    const suggestions: string[] = [];

    if (browser.os === 'iOS') {
      suggestions.push('Pre-written responses provide instant, reliable answers');
      suggestions.push('For AI models, use desktop Chrome, Edge, or Firefox');
    } else if (browser.name === 'Safari' && browser.os !== 'iOS') {
      suggestions.push('Switch to Chrome or Edge for better AI model support');
    }

    if (browser.isMobile && browser.os !== 'iOS') {
      suggestions.push('Try the desktop version for access to all AI models');
      suggestions.push('Pre-written responses work great on mobile devices');
    }

    if (!browser.supportsWebGPU && browser.isDesktop) {
      suggestions.push('Update your browser to enable WebGPU acceleration');
    }

    return suggestions;
  }

  private getCompatibilityMessage(browser: BrowserInfo): string {
    // Check if any AI models are actually supported
    const hasAnyAISupport = this.canRunDistilBERT(browser) || this.canRunQwen(browser) || this.canRunPhi3(browser);
    
    if (browser.os === 'iOS') {
      return `iOS devices cannot run AI models due to Transformers.js v3 compatibility issues. You'll use pre-written responses that are instant and reliable. For live AI processing, please use a desktop browser with Chrome, Edge, or Firefox.`;
    }

    if (browser.isMobile && browser.name === 'Chrome' && browser.os === 'Android') {
      return `Chrome on Android has good compatibility! You can use DistilBERT for quick responses${this.canRunQwen(browser) ? ' and Qwen for conversations' : ''}. For premium AI features, try the desktop version.`;
    }

    if (browser.isMobile && browser.name === 'Firefox') {
      return `Firefox mobile has decent compatibility. You can use DistilBERT for responses. Desktop Firefox offers better performance with more AI models.`;
    }

    if (browser.isMobile && !hasAnyAISupport) {
      return `${browser.name} mobile has limited AI support. You'll receive pre-written responses. Desktop browsers offer much better AI performance and features.`;
    }

    if (browser.isMobile) {
      return `${browser.name} mobile has basic AI support. Desktop browsers offer much better performance and more AI models.`;
    }

    if (browser.isDesktop && (browser.name === 'Chrome' || browser.name === 'Edge')) {
      return `Excellent! ${browser.name} desktop has full compatibility with all AI models including the premium Phi-3 experience.`;
    }

    if (browser.isDesktop && browser.name === 'Firefox') {
      return `Firefox desktop has good compatibility. All AI models work, though Phi-3 may run slower without WebGPU acceleration.`;
    }

    if (browser.isDesktop && browser.name === 'Safari') {
      return `Safari desktop has moderate compatibility. DistilBERT and Qwen should work, but Chrome/Edge offers better performance.`;
    }

    return `Your browser has basic compatibility. Some AI features may be limited.`;
  }
}

// Export singleton instance
export const browserDetector = new BrowserDetector();

// Convenience functions
export function getBrowserInfo(): BrowserInfo {
  return browserDetector.detectBrowser();
}

export function getCompatibilityInfo(): CompatibilityInfo {
  return browserDetector.getCompatibilityInfo();
}

// Specific detection functions (replacements for existing ones)
export function isIOSDevice(): boolean {
  const info = getBrowserInfo();
  return info.os === 'iOS';
}

export function isMobileDevice(): boolean {
  const info = getBrowserInfo();
  return info.isMobile;
}

export function isDesktopDevice(): boolean {
  const info = getBrowserInfo();
  return info.isDesktop;
}

export function supportsAI(): boolean {
  const compat = getCompatibilityInfo();
  return compat.aiSupport.distilbert || compat.aiSupport.qwen || compat.aiSupport.phi3;
}