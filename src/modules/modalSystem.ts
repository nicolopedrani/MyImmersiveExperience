// modules/modalSystem.ts - Reusable modal system for tile interactions

export interface ModalContent {
  title: string;
  content: string;
  icon?: string;
  category?: string;
}

class ModalSystem {
  private overlay: HTMLDivElement | null = null;
  private modal: HTMLDivElement | null = null;
  private isOpen = false;

  constructor() {
    this.createModalElements();
  }

  private createModalElements(): void {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'tile-modal-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(3px);
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create modal container
    this.modal = document.createElement('div');
    this.modal.id = 'tile-modal';
    this.modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      font-family: 'Courier New', monospace;
      transform: scale(0.9);
      transition: transform 0.3s ease;
      position: relative;
    `;

    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);

    // Add click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Add escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  public show(content: ModalContent): void {
    if (!this.overlay || !this.modal || this.isOpen) return;

    this.isOpen = true;

    // Populate modal content
    this.modal.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        ${content.icon ? `<span style="font-size: 32px; margin-right: 15px;">${content.icon}</span>` : ''}
        <div>
          <h2 style="margin: 0; color: #333; font-size: 24px;">${content.title}</h2>
          ${content.category ? `<p style="margin: 5px 0 0 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">${content.category}</p>` : ''}
        </div>
      </div>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; line-height: 1.6; color: #333;">
        ${this.formatContent(content.content)}
      </div>

      <div style="text-align: center;">
        <button id="modal-close-btn" style="
          padding: 12px 24px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          font-size: 14px;
          transition: background-color 0.2s;
        ">Got it! 👍</button>
      </div>
    `;

    // Add close button functionality
    const closeBtn = this.modal.querySelector('#modal-close-btn') as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = '#0056b3';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = '#007bff';
      });
    }

    // Show modal with animation
    this.overlay.style.display = 'flex';
    
    // Trigger animations
    requestAnimationFrame(() => {
      if (this.overlay && this.modal) {
        this.overlay.style.opacity = '1';
        this.modal.style.transform = 'scale(1)';
      }
    });
  }

  public close(): void {
    if (!this.overlay || !this.modal || !this.isOpen) return;

    this.isOpen = false;

    // Animate out
    this.overlay.style.opacity = '0';
    this.modal.style.transform = 'scale(0.9)';

    // Hide after animation
    setTimeout(() => {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
    }, 300);
  }

  private formatContent(content: string): string {
    // Convert line breaks and add better formatting
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p style="margin: 0 0 12px 0;">${line}</p>`)
      .join('');
  }

  public isModalOpen(): boolean {
    return this.isOpen;
  }
}

// Create and export singleton instance
export const modalSystem = new ModalSystem();

// Convenience function for quick modal display
export function showTileModal(content: ModalContent): void {
  modalSystem.show(content);
}

export function closeTileModal(): void {
  modalSystem.close();
}

export function isTileModalOpen(): boolean {
  return modalSystem.isModalOpen();
}