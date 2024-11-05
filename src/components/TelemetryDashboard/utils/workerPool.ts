type WorkerTask = {
  id: string;
  data: any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  startTime?: number;
  endTime?: number;
};

type TaskMetrics = {
  taskId: string;
  executionTime: number;
  status: 'completed' | 'failed';
  timestamp: number;
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
    taskHistory: TaskMetrics[];
  };
};

export class WorkerPool {
  private workers: Worker[];
  private taskQueue: WorkerTask[];
  private activeWorkers: Map<Worker, WorkerTask | null>;
  private workerUrl: string;
  private taskHistory: TaskMetrics[] = [];
  private readonly maxHistorySize = 100; // Keep last 100 tasks for analysis

  constructor(poolSize: number, workerUrl: string) {
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers = new Map();
    this.workerUrl = workerUrl;

    // Initialize workers
    for (let i = 0; i < poolSize; i++) {
      this.addWorker();
    }
  }

  private addWorker(): void {
    const worker = new Worker(this.workerUrl, { type: 'module' });
    
    worker.onmessage = (event: MessageEvent) => {
      const activeTask = this.activeWorkers.get(worker);
      if (activeTask) {
        activeTask.endTime = performance.now();
        this.recordTaskMetrics(activeTask, 'completed');
        activeTask.resolve(event.data);
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
        this.processNextTask(worker);
      }
    };

    this.workers.push(worker);
    this.activeWorkers.set(worker, null);
  }

  private recordTaskMetrics(task: WorkerTask, status: 'completed' | 'failed'): void {
    if (!task.startTime || !task.endTime) return;

    const metrics: TaskMetrics = {
      taskId: task.id,
      executionTime: task.endTime - task.startTime,
      status,
      timestamp: Date.now()
    };

    this.taskHistory.unshift(metrics);
    if (this.taskHistory.length > this.maxHistorySize) {
      this.taskHistory.pop();
    }
  }

  private processNextTask(worker: Worker): void {
    if (this.taskQueue.length === 0) return;

    const task = this.taskQueue.shift();
    if (task) {
      task.startTime = performance.now();
      this.activeWorkers.set(worker, task);
      worker.postMessage(task.data);
    }
  }

  public async executeTask<T>(taskData: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: Math.random().toString(36).substr(2, 9),
        data: taskData,
        resolve,
        reject,
        startTime: undefined,
        endTime: undefined
      };

      // Find an available worker
      const availableWorker = Array.from(this.activeWorkers.entries()).find(
        ([, activeTask]) => activeTask === null
      )?.[0];

      if (availableWorker) {
        task.startTime = performance.now();
        this.activeWorkers.set(availableWorker, task);
        availableWorker.postMessage(taskData);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  public terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers.clear();
    this.taskHistory = [];
  }

  private calculatePerformanceMetrics() {
    const completedTasks = this.taskHistory.filter(t => t.status === 'completed');
    const failedTasks = this.taskHistory.filter(t => t.status === 'failed');
    
    const totalTasks = this.taskHistory.length;
    const averageExecutionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => sum + task.executionTime, 0) / completedTasks.length
      : 0;

    return {
      averageExecutionTime,
      totalTasksProcessed: totalTasks,
      failedTasks: failedTasks.length,
      successRate: totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 100,
      peakMemoryUsage: this.getMemoryUsage(),
      taskHistory: [...this.taskHistory]
    };
  }

  private getMemoryUsage(): number | undefined {
    if (performance?.memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  // Get pool statistics with performance metrics
  public getStats(): PoolStats {
    return {
      totalWorkers: this.workers.length,
      activeWorkers: Array.from(this.activeWorkers.values()).filter(task => task !== null).length,
      queuedTasks: this.taskQueue.length,
      performance: this.calculatePerformanceMetrics()
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
