import { getWorkerPool } from './workerPool';

export enum MemoryAlertLevel {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
  MAXIMUM = 'maximum'
}

export interface MemoryAlert {
  level: MemoryAlertLevel;
  timestamp: number;
  message: string;
  memoryUsage: number;
}

export class MemoryAlertManager {
  private static instance: MemoryAlertManager;
  private alertHistory: MemoryAlert[] = [];
  private readonly MAX_ALERT_HISTORY = 50;
  private alertCallback?: (alert: MemoryAlert) => void;

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): MemoryAlertManager {
    if (!MemoryAlertManager.instance) {
      MemoryAlertManager.instance = new MemoryAlertManager();
    }
    return MemoryAlertManager.instance;
  }

  private startMonitoring(): void {
    // Monitor every 30 seconds, aligned with worker pool's maintenance interval
    setInterval(() => this.checkMemoryStatus(), 30000);
  }

  private checkMemoryStatus(): void {
    const workerPool = getWorkerPool();
    const stats = workerPool.getStats();
    const memoryUsage = stats.performance.currentMemoryUsage;

    if (!memoryUsage) return;

    const thresholds = {
      warning: 150 * 1024 * 1024,    // 150MB
      critical: 250 * 1024 * 1024,   // 250MB
      maximum: 300 * 1024 * 1024     // 300MB
    };

    let alertLevel: MemoryAlertLevel = MemoryAlertLevel.NORMAL;
    let alertMessage = '';

    if (memoryUsage > thresholds.maximum) {
      alertLevel = MemoryAlertLevel.MAXIMUM;
      alertMessage = 'Memory usage has reached maximum threshold. Application performance may be severely impacted.';
    } else if (memoryUsage > thresholds.critical) {
      alertLevel = MemoryAlertLevel.CRITICAL;
      alertMessage = 'Critical memory usage detected. Automatic worker restart and task queue management initiated.';
    } else if (memoryUsage > thresholds.warning) {
      alertLevel = MemoryAlertLevel.WARNING;
      alertMessage = 'Memory usage is approaching critical levels. Performance optimization recommended.';
    }

    if (alertLevel !== MemoryAlertLevel.NORMAL) {
      const alert: MemoryAlert = {
        level: alertLevel,
        timestamp: Date.now(),
        message: alertMessage,
        memoryUsage
      };

      this.recordAlert(alert);
      this.triggerAlertCallback(alert);
    }
  }

  private recordAlert(alert: MemoryAlert): void {
    this.alertHistory.unshift(alert);
    if (this.alertHistory.length > this.MAX_ALERT_HISTORY) {
      this.alertHistory.pop();
    }
  }

  private triggerAlertCallback(alert: MemoryAlert): void {
    if (this.alertCallback) {
      this.alertCallback(alert);
    }
  }

  public setAlertCallback(callback: (alert: MemoryAlert) => void): void {
    this.alertCallback = callback;
  }

  public getAlertHistory(): MemoryAlert[] {
    return [...this.alertHistory];
  }

  public clearAlertHistory(): void {
    this.alertHistory = [];
  }

  public getCurrentMemoryStatus(): MemoryAlertLevel {
    const workerPool = getWorkerPool();
    const stats = workerPool.getStats();
    const memoryUsage = stats.performance.currentMemoryUsage;

    if (!memoryUsage) return MemoryAlertLevel.NORMAL;

    const thresholds = {
      warning: 150 * 1024 * 1024,
      critical: 250 * 1024 * 1024,
      maximum: 300 * 1024 * 1024
    };

    if (memoryUsage > thresholds.maximum) return MemoryAlertLevel.MAXIMUM;
    if (memoryUsage > thresholds.critical) return MemoryAlertLevel.CRITICAL;
    if (memoryUsage > thresholds.warning) return MemoryAlertLevel.WARNING;
    
    return MemoryAlertLevel.NORMAL;
  }
}

// Export a singleton instance
export const memoryAlertManager = MemoryAlertManager.getInstance();
