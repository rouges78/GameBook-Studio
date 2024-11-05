type WorkerTask = {
  id: string;
  data: any;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
};

export class WorkerPool {
  private workers: Worker[];
  private taskQueue: WorkerTask[];
  private activeWorkers: Map<Worker, WorkerTask | null>;
  private workerUrl: string;

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
        activeTask.resolve(event.data);
        this.activeWorkers.set(worker, null);
        this.processNextTask(worker);
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      const activeTask = this.activeWorkers.get(worker);
      if (activeTask) {
        activeTask.reject(new Error(event.message));
        this.activeWorkers.set(worker, null);
        this.processNextTask(worker);
      }
    };

    this.workers.push(worker);
    this.activeWorkers.set(worker, null);
  }

  private processNextTask(worker: Worker): void {
    if (this.taskQueue.length === 0) return;

    const task = this.taskQueue.shift();
    if (task) {
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
        reject
      };

      // Find an available worker
      const availableWorker = Array.from(this.activeWorkers.entries()).find(
        ([, activeTask]) => activeTask === null
      )?.[0];

      if (availableWorker) {
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
  }

  // Get pool statistics
  public getStats() {
    return {
      totalWorkers: this.workers.length,
      activeWorkers: Array.from(this.activeWorkers.values()).filter(task => task !== null).length,
      queuedTasks: this.taskQueue.length
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
