import { ipcRenderer } from 'electron';

interface TelemetryEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp?: number;
}

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
  private isEnabled: boolean = true;
  private queue: TelemetryEvent[] = [];
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly FLUSH_INTERVAL = 60000; // 1 minute

  private constructor() {
    this.setupFlushInterval();
    this.setupIpcHandlers();
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

  private setupIpcHandlers(): void {
    ipcRenderer.on('telemetry-status-changed', (_, enabled: boolean) => {
      this.isEnabled = enabled;
      if (enabled) {
        this.flush();
      }
    });
  }

  public trackEvent(event: TelemetryEvent): void {
    if (!this.isEnabled) return;

    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.queue.push(enrichedEvent);

    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  public trackUpdateError(error: Error, attemptNumber: number, totalAttempts: number, lastDelay: number): void {
    const errorEvent: UpdateErrorEvent = {
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
    if (!this.isEnabled || this.queue.length === 0) return;

    try {
      const events = [...this.queue];
      this.queue = [];

      await ipcRenderer.invoke('telemetry-events', events);
    } catch (error) {
      console.error('Failed to flush telemetry events:', error);
      // Re-add events to queue if flush fails
      this.queue = [...this.queue, ...this.queue];
      if (this.queue.length > this.MAX_QUEUE_SIZE) {
        this.queue = this.queue.slice(-this.MAX_QUEUE_SIZE);
      }
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      this.flush();
    }
  }

  public istelemetryEnabled(): boolean {
    return this.isEnabled;
  }
}

export const telemetry = TelemetryManager.getInstance();
