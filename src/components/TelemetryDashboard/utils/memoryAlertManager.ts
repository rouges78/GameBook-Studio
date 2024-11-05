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
  memoryPercentage: number;
}

export class MemoryAlertManager {
  private static instance: MemoryAlertManager;
  private alertHistory: MemoryAlert[] = [];
  private readonly MAX_ALERT_HISTORY = 50;
  private alertCallback?: (alert: MemoryAlert) => void;
  private readonly TOTAL_MEMORY = 2 * 1024 * 1024 * 1024; // 2GB as specified in requirements

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
    // Monitor every 15 seconds for more responsive alerts
    setInterval(() => this.checkMemoryStatus(), 15000);
  }

  private checkMemoryStatus(): void {
    const workerPool = getWorkerPool();
    const stats = workerPool.getStats();
    const memoryUsage = stats.performance.currentMemoryUsage;

    if (!memoryUsage) return;

    // Calculate memory usage percentage
    const memoryPercentage = (memoryUsage / this.TOTAL_MEMORY) * 100;

    // Thresholds based on requirements (memory usage < 80%)
    const thresholds = {
      warning: 60,      // 60% - Early warning
      critical: 70,     // 70% - Critical warning
      maximum: 80       // 80% - Maximum allowed
    };

    let alertLevel: MemoryAlertLevel = MemoryAlertLevel.NORMAL;
    let alertMessage = '';

    if (memoryPercentage >= thresholds.maximum) {
      alertLevel = MemoryAlertLevel.MAXIMUM;
      alertMessage = `Memory usage (${memoryPercentage.toFixed(1)}%) has exceeded maximum threshold of ${thresholds.maximum}%. Immediate action required.`;
      
      // Trigger automatic memory optimization
      workerPool.optimizeMemory();
    } else if (memoryPercentage >= thresholds.critical) {
      alertLevel = MemoryAlertLevel.CRITICAL;
      alertMessage = `Critical memory usage: ${memoryPercentage.toFixed(1)}%. Approaching maximum threshold. Initiating preventive measures.`;
      
      // Schedule worker pool maintenance
      workerPool.scheduleMaintenance();
    } else if (memoryPercentage >= thresholds.warning) {
      alertLevel = MemoryAlertLevel.WARNING;
      alertMessage = `Memory usage warning: ${memoryPercentage.toFixed(1)}%. Consider optimizing resource usage.`;
    }

    if (alertLevel !== MemoryAlertLevel.NORMAL) {
      const alert: MemoryAlert = {
        level: alertLevel,
        timestamp: Date.now(),
        message: alertMessage,
        memoryUsage,
        memoryPercentage
      };

      this.recordAlert(alert);
      this.triggerAlertCallback(alert);

      // Log critical alerts for monitoring systems
      if (alertLevel === MemoryAlertLevel.CRITICAL || alertLevel === MemoryAlertLevel.MAXIMUM) {
        console.error(`[MemoryAlert] ${alertMessage}`);
      }
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

  public getCurrentMemoryStatus(): {
    level: MemoryAlertLevel;
    percentage: number;
    usage: number;
  } {
    const workerPool = getWorkerPool();
    const stats = workerPool.getStats();
    const memoryUsage = stats.performance.currentMemoryUsage || 0;
    const memoryPercentage = (memoryUsage / this.TOTAL_MEMORY) * 100;

    let level = MemoryAlertLevel.NORMAL;
    if (memoryPercentage >= 80) level = MemoryAlertLevel.MAXIMUM;
    else if (memoryPercentage >= 70) level = MemoryAlertLevel.CRITICAL;
    else if (memoryPercentage >= 60) level = MemoryAlertLevel.WARNING;

    return {
      level,
      percentage: memoryPercentage,
      usage: memoryUsage
    };
  }

  public getMemoryThresholds(): {
    warning: number;
    critical: number;
    maximum: number;
  } {
    return {
      warning: 60,
      critical: 70,
      maximum: 80
    };
  }
}

// Export a singleton instance
export const memoryAlertManager = MemoryAlertManager.getInstance();
