interface TimerState {
  seconds: number;
  interval: NodeJS.Timeout | null;
  isRunning: boolean;
  overlayElement: HTMLElement | null;
}

class TimeWasteCounter {
  private static readonly OVERLAY_ID = "time-waste-counter-overlay";
  private static readonly NAMESPACE = "_timeWasteCounter";
  private state: TimerState;
  private visibilityHandler: (() => void) | null = null;

  constructor() {
    this.state = {
      seconds: 0,
      interval: null,
      isRunning: false,
      overlayElement: null,
    };

    this.cleanup();
    this.init();
  }

  private cleanup(): void {
    const globalTimer = (window as any)[TimeWasteCounter.NAMESPACE];
    if (globalTimer) {
      globalTimer.destroy();
    }
  }

  private init(): void {
    this.createOverlayElement();
    this.setupVisibilityHandling();
    this.registerGlobalInstance();

    if (document.visibilityState === "visible") {
      this.start();
    }
  }

  private createOverlayElement(): void {
    const existingOverlay = document.getElementById(
      TimeWasteCounter.OVERLAY_ID
    );
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const overlay = document.createElement("div");
    overlay.id = TimeWasteCounter.OVERLAY_ID;

    this.applyOverlayStyles(overlay);
    overlay.textContent = this.formatTime(0);

    document.body.appendChild(overlay);
    this.state.overlayElement = overlay;
  }

  private applyOverlayStyles(element: HTMLElement): void {
    const styles = {
      position: "fixed",
      top: "20px",
      right: "30px",
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      color: "#ffffff",
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "14px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontWeight: "500",
      letterSpacing: "0.5px",
      zIndex: "999999",
      pointerEvents: "none",
      userSelect: "none",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      transition: "opacity 0.2s ease-in-out",
    };

    Object.assign(element.style, styles);
  }

  private formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((unit) => unit.toString().padStart(2, "0"))
      .join(":");
  }

  private updateDisplay(): void {
    if (this.state.overlayElement) {
      this.state.overlayElement.textContent = this.formatTime(
        this.state.seconds
      );
    }
  }

  private start(): void {
    if (this.state.isRunning) return;

    this.state.interval = setInterval(() => {
      this.state.seconds++;
      this.updateDisplay();
    }, 1000);

    this.state.isRunning = true;
  }

  private stop(): void {
    if (!this.state.isRunning) return;

    if (this.state.interval) {
      clearInterval(this.state.interval);
      this.state.interval = null;
    }

    this.state.isRunning = false;
  }

  private setupVisibilityHandling(): void {
    this.visibilityHandler = () => {
      if (document.visibilityState === "visible") {
        this.start();
      } else {
        this.stop();
      }
    };

    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  private registerGlobalInstance(): void {
    (window as any)[TimeWasteCounter.NAMESPACE] = this;
  }

  public reset(): void {
    this.stop();
    this.state.seconds = 0;
    this.updateDisplay();
  }

  public getElapsedTime(): number {
    return this.state.seconds;
  }

  public getFormattedTime(): string {
    return this.formatTime(this.state.seconds);
  }

  public destroy(): void {
    this.stop();

    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }

    if (this.state.overlayElement) {
      this.state.overlayElement.remove();
      this.state.overlayElement = null;
    }

    delete (window as any)[TimeWasteCounter.NAMESPACE];
  }
}

export default TimeWasteCounter;
