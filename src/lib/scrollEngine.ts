export class ScrollEngine {
  private isPlaying: boolean = false;
  private animationId: number | null = null;
  private scrollPosition: number = 0;
  private lastTimestamp: number = 0;
  private element: HTMLElement | null = null;
  private onPositionChange?: (position: number) => void;

  constructor(element: HTMLElement, onPositionChange?: (position: number) => void) {
    this.element = element;
    this.onPositionChange = onPositionChange;
  }

  // Map speed (1-10) to pixels per second using exponential curve
  private getScrollSpeed(speed: number): number {
    // Exponential mapping for fine control at low speeds
    // Speed 1: ~30 px/s, Speed 10: ~400 px/s
    return Math.pow(speed, 1.8) * 8 + 20;
  }

  start(speed: number = 5) {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    
    const animate = (timestamp: number) => {
      if (!this.isPlaying || !this.element) {
        this.animationId = null;
        return;
      }

      const deltaTime = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      // Calculate pixels to move based on speed and time elapsed
      const pixelsPerSecond = this.getScrollSpeed(speed);
      const pixelsDelta = (pixelsPerSecond * deltaTime) / 1000;
      
      this.scrollPosition += pixelsDelta;

      // Apply transform with GPU acceleration
      this.element.style.transform = `translate3d(0, -${this.scrollPosition}px, 0)`;
      this.element.style.willChange = 'transform';

      // Notify position change
      this.onPositionChange?.(this.scrollPosition);

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.element) {
      this.element.style.willChange = 'auto';
    }
  }

  stop() {
    this.pause();
    this.scrollPosition = 0;
    if (this.element) {
      this.element.style.transform = 'translate3d(0, 0, 0)';
    }
    this.onPositionChange?.(0);
  }

  setSpeed(speed: number) {
    // Speed change is handled by restarting with new speed if playing
    if (this.isPlaying) {
      this.pause();
      this.start(speed);
    }
  }

  jumpToPosition(position: number) {
    this.scrollPosition = Math.max(0, position);
    if (this.element) {
      this.element.style.transform = `translate3d(0, -${this.scrollPosition}px, 0)`;
    }
    this.onPositionChange?.(this.scrollPosition);
  }

  jumpToTop() {
    this.jumpToPosition(0);
  }

  jumpToEnd() {
    if (!this.element) return;
    const maxScroll = Math.max(0, this.element.scrollHeight - this.element.clientHeight);
    this.jumpToPosition(maxScroll);
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentPosition(): number {
    return this.scrollPosition;
  }

  destroy() {
    this.pause();
    this.element = null;
    this.onPositionChange = undefined;
  }
}