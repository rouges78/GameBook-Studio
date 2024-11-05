export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',        // Failing, not accepting requests
  HALF_OPEN = 'HALF_OPEN' // Testing if system has recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;     // Number of failures before opening
  resetTimeout: number;         // Time in ms before attempting reset
  monitorInterval: number;      // Time in ms between health checks
  maxMemoryUsage: number;       // Memory threshold in bytes
  maxConcurrentTasks: number;   // Maximum concurrent tasks
}

interface HealthMetrics {
  memoryUsage: number;
  activeTasks: number;
  failureRate: number;
  lastFailureTime?: number;
}

export class CircuitBreaker {
  private static instance: CircuitBreaker;
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private lastFailureTime?: number;
  private resetTimer?: number;
  private monitorInterval?: number;
  private readonly config: CircuitBreakerConfig;
  private stateChangeCallbacks: ((state: CircuitState) => void)[] = [];

  private constructor() {
    this.config = {
      failureThreshold: 5,
      resetTimeout: 30000,        // 30 seconds
      monitorInterval: 5000,      // 5 seconds
      maxMemoryUsage: 300 * 1024 * 1024, // 300MB
      maxConcurrentTasks: 10
    };

    this.startMonitoring();
  }

  public static getInstance(): CircuitBreaker {
    if (!CircuitBreaker.instance) {
      CircuitBreaker.instance = new CircuitBreaker();
    }
    return CircuitBreaker.instance;
  }

  private startMonitoring(): void {
    this.monitorInterval = window.setInterval(() => {
      this.checkHealth();
    }, this.config.monitorInterval);
  }

  private async checkHealth(): Promise<void> {
    const metrics = await this.getHealthMetrics();

    if (this.state === CircuitState.CLOSED) {
      if (this.shouldTrip(metrics)) {
        this.tripBreaker();
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      if (this.shouldTrip(metrics)) {
        this.tripBreaker();
      } else {
        this.closeBreaker();
      }
    }
  }

  private async getHealthMetrics(): Promise<HealthMetrics> {
    const workerPool = (await import('./workerPool')).getWorkerPool();
    const stats = workerPool.getStats();
    
    const totalTasks = stats.performance.totalTasksProcessed;
    const failureRate = totalTasks > 0 
      ? stats.performance.failedTasks / totalTasks 
      : 0;

    return {
      memoryUsage: stats.performance.currentMemoryUsage || 0,
      activeTasks: stats.activeWorkers,
      failureRate,
      lastFailureTime: this.lastFailureTime
    };
  }

  private hasRecentFailure(lastFailureTime?: number): boolean {
    if (lastFailureTime === undefined) {
      return false;
    }
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    return timeSinceLastFailure < 5000; // Less than 5 seconds ago
  }

  private shouldTrip(metrics: HealthMetrics): boolean {
    const memoryExceeded = metrics.memoryUsage > this.config.maxMemoryUsage;
    const tooManyTasks = metrics.activeTasks > this.config.maxConcurrentTasks;
    const recentFailures = this.hasRecentFailure(metrics.lastFailureTime);
    const highFailureRate = metrics.failureRate > 0.5;

    return memoryExceeded || 
           tooManyTasks || 
           (highFailureRate && recentFailures);
  }

  private tripBreaker(): void {
    this.state = CircuitState.OPEN;
    this.failures++;
    this.lastFailureTime = Date.now();
    this.notifyStateChange();

    // Schedule reset attempt
    if (this.resetTimer) {
      window.clearTimeout(this.resetTimer);
    }
    this.resetTimer = window.setTimeout(() => {
      this.attemptReset();
    }, this.config.resetTimeout);
  }

  private attemptReset(): void {
    this.state = CircuitState.HALF_OPEN;
    this.notifyStateChange();
  }

  private closeBreaker(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.lastFailureTime = undefined;
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach(callback => callback(this.state));
  }

  public onStateChange(callback: (state: CircuitState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  public getState(): CircuitState {
    return this.state;
  }

  public canExecute(): boolean {
    return this.state === CircuitState.CLOSED || this.state === CircuitState.HALF_OPEN;
  }

  public recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    this.checkHealth();
  }

  public recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.closeBreaker();
    }
    this.failures = Math.max(0, this.failures - 1);
  }

  public getMetrics(): { state: CircuitState; failures: number; lastFailureTime?: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }

  public dispose(): void {
    if (this.monitorInterval) {
      window.clearInterval(this.monitorInterval);
    }
    if (this.resetTimer) {
      window.clearTimeout(this.resetTimer);
    }
    this.stateChangeCallbacks = [];
  }
}

export const circuitBreaker = CircuitBreaker.getInstance();
