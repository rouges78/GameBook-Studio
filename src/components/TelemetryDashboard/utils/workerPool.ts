import pako from 'pako';

type WorkerTask = {
  id: string;
  data: any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  startTime?: number;
  endTime?: number;
  size?: number;
};

type TaskMetrics = {
  taskId: string;
  executionTime: number;
  status: 'completed' | 'failed';
  timestamp: number;
  memoryUsage?: number;
};

type PoolStats = {
  totalWorkers: number;
  activeWorkers: number;
  queuedTasks: number;
  performance: {
    averageExecutionTime: number;
    totalTasksProcessed: number;
    failedTasks: number;
    successRate: number;
    peakMemoryUsage?: number;
    currentMemoryUsage?: number;
    taskHistory: TaskMetrics[];
  };
};

type MemoryThresholds = {
  warning: number;
  critical: number;
  maximum: number;
};

export class WorkerPool {
  private workers: Worker[];
  private taskQueue: WorkerTask[];
  private activeWorkers: Map<Worker, WorkerTask | null>;
  private workerUrl: string;
  private taskHistory: TaskMetrics[] = [];
  private readonly maxHistorySize = 100;
  private memoryThresholds: MemoryThresholds;
  private workerRestartCount: Map<Worker, number>;
  private readonly maxRestarts = 3;
  private compressionThreshold = 50 * 1024; // 50KB
  private gcInterval: number;

  constructor(poolSize: number, workerUrl: string) {
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers = new Map();
    this.workerUrl = workerUrl;
    this.workerRestartCount = new Map();

    // Memory thresholds in bytes
    this.memoryThresholds = {
      warning: 150 * 1024 * 1024,    // 150MB
      critical: 250 * 1024 * 1024,   // 250MB
      maximum: 300 * 1024 * 1024     // 300MB
    };

    // Initialize workers
    for (let i = 0; i < poolSize; i++) {
      this.addWorker();
    }

    // Start periodic garbage collection and monitoring
    this.gcInterval = window.setInterval(() => this.performMemoryMaintenance(), 30000);
  }

  private addWorker(): void {
    const worker = new Worker(this.workerUrl, { type: 'module' });
    
    worker.onmessage = (event: MessageEvent) => {
      const activeTask = this.activeWorkers.get(worker);
      if (activeTask) {
        activeTask.endTime = performance.now();
        this.recordTaskMetrics(activeTask, 'completed');
        
        // Decompress response if needed
        let result = event.data;
        if (result.compressed) {
          const decompressed = pako.inflate(result.data, { to: 'string' });
          result = JSON.parse(decompressed);
        }
        
        activeTask.resolve(result);
        this.activeWorkers.set(worker, null);
        this.processNextTask(worker);
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      const activeTask = this.activeWorkers.get(worker);
      if (activeTask) {
        activeTask.endTime = performance.now();
        this.recordTaskMetrics(activeTask, 'failed');
        activeTask.reject(new Error(event.message));
        this.activeWorkers.set(worker, null);
        
        // Attempt worker restart if needed
        const restartCount = this.workerRestartCount.get(worker) || 0;
        if (restartCount < this.maxRestarts) {
          this.restartWorker(worker);
        }
        
        this.processNextTask(worker);
      }
    };

    this.workers.push(worker);
    this.activeWorkers.set(worker, null);
    this.workerRestartCount.set(worker, 0);
  }

  private async restartWorker(worker: Worker): Promise<void> {
    const index = this.workers.indexOf(worker);
    if (index === -1) return;

    worker.terminate();
    this.workers.splice(index, 1);
    this.activeWorkers.delete(worker);
    
    const restartCount = (this.workerRestartCount.get(worker) || 0) + 1;
    this.workerRestartCount.delete(worker);
    
    if (restartCount < this.maxRestarts) {
      await new Promise(resolve => setTimeout(resolve, 1000 * restartCount)); // Exponential backoff
      this.addWorker();
    }
  }

  private recordTaskMetrics(task: WorkerTask, status: 'completed' | 'failed'): void {
    if (!task.startTime || !task.endTime) return;

    const metrics: TaskMetrics = {
      taskId: task.id,
      executionTime: task.endTime - task.startTime,
      status,
      timestamp: Date.now(),
      memoryUsage: this.getMemoryUsage()
    };

    this.taskHistory.unshift(metrics);
    if (this.taskHistory.length > this.maxHistorySize) {
      this.taskHistory.pop();
    }
  }

  private async processNextTask(worker: Worker): Promise<void> {
    if (this.taskQueue.length === 0) return;

    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage && memoryUsage > this.memoryThresholds.critical) {
      await this.handleCriticalMemory();
      return;
    }

    const task = this.taskQueue.shift();
    if (task) {
      task.startTime = performance.now();
      this.activeWorkers.set(worker, task);

      // Compress large payloads
      if (task.size && task.size > this.compressionThreshold) {
        const compressed = pako.deflate(JSON.stringify(task.data));
        worker.postMessage({ compressed: true, data: compressed });
      } else {
        worker.postMessage(task.data);
      }
    }
  }

  private async handleCriticalMemory(): Promise<void> {
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Terminate and restart workers with high memory usage
    for (const worker of this.workers) {
      const task = this.activeWorkers.get(worker);
      if (task) {
        task.reject(new Error('Worker terminated due to high memory usage'));
        await this.restartWorker(worker);
      }
    }

    // Clear task history
    this.taskHistory = [];
  }

  private async performMemoryMaintenance(): Promise<void> {
    const memoryUsage = this.getMemoryUsage();
    if (!memoryUsage) return;

    if (memoryUsage > this.memoryThresholds.warning) {
      // Clear old task history
      this.taskHistory = this.taskHistory.slice(0, this.maxHistorySize / 2);
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
    }

    if (memoryUsage > this.memoryThresholds.critical) {
      await this.handleCriticalMemory();
    }
  }

  public async executeTask<T>(taskData: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const size = new Blob([JSON.stringify(taskData)]).size;
      
      const task: WorkerTask = {
        id: Math.random().toString(36).substr(2, 9),
        data: taskData,
        resolve,
        reject,
        startTime: undefined,
        endTime: undefined,
        size
      };

      // Check memory usage before adding task
      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage && memoryUsage > this.memoryThresholds.maximum) {
        reject(new Error('Cannot accept new tasks due to memory constraints'));
        return;
      }

      // Find an available worker
      const availableWorker = Array.from(this.activeWorkers.entries()).find(
        ([, activeTask]) => activeTask === null
      )?.[0];

      if (availableWorker) {
        task.startTime = performance.now();
        this.activeWorkers.set(availableWorker, task);
        
        // Compress large payloads
        if (size > this.compressionThreshold) {
          const compressed = pako.deflate(JSON.stringify(taskData));
          availableWorker.postMessage({ compressed: true, data: compressed });
        } else {
          availableWorker.postMessage(taskData);
        }
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  public terminate(): void {
    clearInterval(this.gcInterval);
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers.clear();
    this.taskHistory = [];
    this.workerRestartCount.clear();
  }

  private getMemoryUsage(): number | undefined {
    if (performance?.memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  public getStats(): PoolStats {
    const currentMemoryUsage = this.getMemoryUsage();
    const completedTasks = this.taskHistory.filter(t => t.status === 'completed');
    const failedTasks = this.taskHistory.filter(t => t.status === 'failed');
    
    const totalTasks = this.taskHistory.length;
    const averageExecutionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => sum + task.executionTime, 0) / completedTasks.length
      : 0;

    return {
      totalWorkers: this.workers.length,
      activeWorkers: Array.from(this.activeWorkers.values()).filter(task => task !== null).length,
      queuedTasks: this.taskQueue.length,
      performance: {
        averageExecutionTime,
        totalTasksProcessed: totalTasks,
        failedTasks: failedTasks.length,
        successRate: totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 100,
        peakMemoryUsage: Math.max(...this.taskHistory.map(t => t.memoryUsage || 0)),
        currentMemoryUsage,
        taskHistory: [...this.taskHistory]
      }
    };
  }
}

// Create a singleton instance
let poolInstance: WorkerPool | null = null;

export const getWorkerPool = (poolSize = navigator.hardwareConcurrency || 4) => {
  if (!poolInstance) {
    const workerUrl = new URL('./dataProcessor.worker.ts', import.meta.url);
    poolInstance = new WorkerPool(poolSize, workerUrl.href);
  }
  return poolInstance;
};

// Add type declaration for gc
declare global {
  interface Window {
    gc?: () => void;
  }
}
