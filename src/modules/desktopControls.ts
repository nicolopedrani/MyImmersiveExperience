// modules/desktopControls.ts - Desktop-specific UI enhancements

let controlsVisible = false;
let instructionsShown = false;

// Device detection
function isDesktopDevice(): boolean {
  return window.innerWidth > 768 && window.matchMedia('(pointer: fine)').matches;
}

function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function initializeDesktopControls(): void {
  if (!isDesktopDevice()) {
    console.log("🖥️ Mobile device detected - skipping desktop controls initialization");
    return;
  }

  console.log("🖥️ Desktop device detected - initializing enhanced controls");
  setupControlsToggle();
  setupInitialInstructions();
  
  // Show initial instructions after a short delay
  setTimeout(() => {
    showInitialInstructions();
  }, 1500);
}

function setupControlsToggle(): void {
  const toggleButton = document.getElementById('controls-toggle');
  const controlsArea = document.getElementById('controls-area');
  const gameboy = document.querySelector('#gameboy-container');
  
  if (!toggleButton || !controlsArea) {
    console.warn("Controls toggle elements not found");
    return;
  }

  // Initial state
  updateToggleButton(toggleButton);
  
  // Toggle functionality
  toggleButton.addEventListener('click', () => {
    controlsVisible = !controlsVisible;
    
    if (controlsVisible) {
      controlsArea.classList.add('controls-visible');
      gameboy?.classList.add('controls-visible');
    } else {
      controlsArea.classList.remove('controls-visible');
      gameboy?.classList.remove('controls-visible');
    }
    
    updateToggleButton(toggleButton);
    
    // Log for debugging
    console.log(`🎮 Controls ${controlsVisible ? 'shown' : 'hidden'}`);
  });
}

function updateToggleButton(button: HTMLElement): void {
  if (controlsVisible) {
    button.textContent = '🎮 Hide Controls';
    button.setAttribute('title', 'Hide touch controls to maximize screen space');
  } else {
    button.textContent = '📱 Show Controls';
    button.setAttribute('title', 'Show touch controls for testing or convenience');
  }
}

function setupInitialInstructions(): void {
  const instructions = document.getElementById('initial-instructions');
  
  if (!instructions) {
    console.warn("Initial instructions element not found");
    return;
  }

  // Click anywhere to dismiss
  instructions.addEventListener('click', (e) => {
    e.stopPropagation();
    hideInitialInstructions();
  });

  // Click outside to dismiss  
  document.addEventListener('click', () => {
    if (instructionsShown) {
      hideInitialInstructions();
    }
  });

  // ESC key to dismiss
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && instructionsShown) {
      hideInitialInstructions();
    }
  });

  // Auto-dismiss after movement
  document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
      if (instructionsShown) {
        setTimeout(() => hideInitialInstructions(), 500);
      }
    }
  });
}

function showInitialInstructions(): void {
  if (!isDesktopDevice() || instructionsShown) return;

  const instructions = document.getElementById('initial-instructions');
  if (!instructions) return;

  instructionsShown = true;
  instructions.classList.add('show');
  
  console.log("📖 Showing initial keyboard instructions");
  
  // Auto-dismiss after 8 seconds if not manually dismissed
  setTimeout(() => {
    if (instructionsShown) {
      hideInitialInstructions();
    }
  }, 8000);
}

function hideInitialInstructions(): void {
  const instructions = document.getElementById('initial-instructions');
  if (!instructions || !instructionsShown) return;

  instructions.classList.remove('show');
  instructionsShown = false;
  
  console.log("📖 Hidden initial instructions");
}

// Responsive handling
window.addEventListener('resize', () => {
  const wasDesktop = isDesktopDevice();
  
  if (!wasDesktop && controlsVisible) {
    // Switched to mobile - ensure controls are visible
    const controlsArea = document.getElementById('controls-area');
    controlsArea?.classList.add('controls-visible');
  }
});

// Export for external use
export function toggleControls(): void {
  const toggleButton = document.getElementById('controls-toggle') as HTMLElement;
  if (toggleButton) {
    toggleButton.click();
  }
}

export function areControlsVisible(): boolean {
  return controlsVisible;
}

export function forceShowInstructions(): void {
  instructionsShown = false;
  showInitialInstructions();
}