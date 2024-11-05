import type { TelemetryEvent } from '../types/electron';

interface UpdateErrorEvent extends TelemetryEvent {
  category: 'auto-update';
  action: 'error';
  metadata: {
    errorType: string;
    errorMessage: string;
    attemptNumber: number;
    totalAttempts: number;
    lastDelay: number;
  };
}

class TelemetryManager {
  private static instance: TelemetryManager;
  private queue: Omit<TelemetryEvent, 'appVersion' | 'platform' | 'arch'>[] = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly FLUSH_INTERVAL = 60000; // 1 minute

  private constructor() {
    this.setupFlushInterval();
  }

  public static getInstance(): TelemetryManager {
    if (!TelemetryManager.instance) {
      TelemetryManager.instance = new TelemetryManager();
    }
    return TelemetryManager.instance;
  }

  private setupFlushInterval(): void {
    setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  public trackEvent(event: Omit<TelemetryEvent, 'appVersion' | 'platform' | 'arch'>): void {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
    };

    this.queue.push(enrichedEvent);

    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  public trackUpdateError(error: Error, attemptNumber: number, totalAttempts: number, lastDelay: number): void {
    const errorEvent: Omit<UpdateErrorEvent, 'appVersion' | 'platform' | 'arch'> = {
      category: 'auto-update',
      action: 'error',
      label: error.name,
      metadata: {
        errorType: error.name,
        errorMessage: error.message,
        attemptNumber,
        totalAttempts,
        lastDelay,
      },
      timestamp: Date.now(),
    };

    this.trackEvent(errorEvent);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    try {
      const events = [...this.queue];
      this.queue = [];

      // The main process will add appVersion, platform, and arch
      await window.electron['telemetry-events'](events as TelemetryEvent[]);
    } catch (error) {
      console.error('Failed to flush telemetry events:', error);
      // Re-add events to queue if flush fails
      this.queue = [...this.queue, ...this.queue];
      if (this.queue.length > this.MAX_QUEUE_SIZE) {
        this.queue = this.queue.slice(-this.MAX_QUEUE_SIZE);
      }
    }
  }
}

export const telemetry = TelemetryManager.getInstance();
