// modules/tourSelection.ts - Tour selection UI for guided vs free exploration

export interface TourChoice {
  type: 'free' | 'guided';
  selected: boolean;
}

class TourSelectionUI {
  private overlay: HTMLDivElement | null = null;
  private isVisible = false;
  private onSelectionCallback: ((choice: TourChoice) => void) | null = null;

  constructor() {
    this.createSelectionUI();
  }

  private createSelectionUI(): void {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'tour-selection-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 20000;
      font-family: 'Courier New', monospace;
      backdrop-filter: blur(5px);
      opacity: 0;
      transition: opacity 0.5s ease;
    `;

    // Create content container
    const content = document.createElement('div');
    content.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      color: white;
      transform: scale(0.8);
      transition: transform 0.5s ease;
    `;

    content.innerHTML = `
      <div style="margin-bottom: 30px;">
        <h1 style="
          margin: 0 0 15px 0;
          font-size: 28px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        ">🎮 Welcome to My Interactive Portfolio</h1>
        <p style="
          margin: 0;
          font-size: 16px;
          opacity: 0.9;
          line-height: 1.4;
        ">Choose how you'd like to explore my professional journey</p>
      </div>

      <div style="
        display: flex;
        gap: 30px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 30px;
      ">
        <button id="guided-tour-btn" style="
          flex: 1;
          min-width: 200px;
          padding: 25px 20px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 15px;
          color: white;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.05)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">
          <div style="font-size: 24px; margin-bottom: 10px;">🗺️</div>
          <div style="font-size: 18px; margin-bottom: 8px;">GUIDED TOUR</div>
          <div style="font-size: 13px; opacity: 0.8; line-height: 1.3;">
            Let me show you around<br>
            <strong>~3 minutes</strong> • Key highlights
          </div>
        </button>

        <button id="free-exploration-btn" style="
          flex: 1;
          min-width: 200px;
          padding: 25px 20px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 15px;
          color: white;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.05)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">
          <div style="font-size: 24px; margin-bottom: 10px;">🆓</div>
          <div style="font-size: 18px; margin-bottom: 8px;">FREE EXPLORATION</div>
          <div style="font-size: 13px; opacity: 0.8; line-height: 1.3;">
            Explore at your own pace<br>
            <strong>Unlimited time</strong> • Full control
          </div>
        </button>
      </div>

      <div style="
        font-size: 12px;
        opacity: 0.7;
        margin-top: 20px;
      ">
        💡 Tip: You can always switch between modes during your visit
      </div>
    `;

    this.overlay.appendChild(content);
    document.body.appendChild(this.overlay);

    // Add event listeners
    const guidedBtn = content.querySelector('#guided-tour-btn');
    const freeBtn = content.querySelector('#free-exploration-btn');

    guidedBtn?.addEventListener('click', () => {
      this.selectTour({ type: 'guided', selected: true });
    });

    freeBtn?.addEventListener('click', () => {
      this.selectTour({ type: 'free', selected: true });
    });

    // ESC key to default to free exploration
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.selectTour({ type: 'free', selected: true });
      }
    });
  }

  public show(onSelection: (choice: TourChoice) => void): void {
    if (!this.overlay) return;

    this.onSelectionCallback = onSelection;
    this.isVisible = true;
    this.overlay.style.display = 'flex';

    // Trigger animations
    requestAnimationFrame(() => {
      if (this.overlay) {
        this.overlay.style.opacity = '1';
        const content = this.overlay.querySelector('div');
        if (content) {
          (content as HTMLElement).style.transform = 'scale(1)';
        }
      }
    });
  }

  private selectTour(choice: TourChoice): void {
    if (!this.overlay || !this.onSelectionCallback) return;

    // Animate out
    this.overlay.style.opacity = '0';
    const content = this.overlay.querySelector('div');
    if (content) {
      (content as HTMLElement).style.transform = 'scale(0.9)';
    }

    // Hide after animation
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
      this.isVisible = false;
      if (this.onSelectionCallback) {
        this.onSelectionCallback(choice);
      }
    }, 500);
  }

  public hide(): void {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    this.isVisible = false;
  }
}

// Export singleton instance
export const tourSelectionUI = new TourSelectionUI();