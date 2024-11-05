import { WorkerPool, getWorkerPool } from '../src/components/TelemetryDashboard/utils/workerPool';
import type { ProcessedTelemetryData } from '../src/components/TelemetryDashboard/types';

// Mock Worker class
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor(public url: string) {}

  postMessage(data: any) {
    // Simulate async processing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: {
            filteredData: data.payload.data,
            metrics: {
              total: data.payload.data.length,
              error: 0,
              navigation: 0
            },
            errorPatterns: {
              correlations: [],
              trends: []
            },
            updateErrors: {
              total: 0,
              byType: {},
              averageRetries: 0
            },
            systemMetrics: {
              byPlatform: {},
              byVersion: {},
              byArch: {},
              performance: {
                avgResponseTime: 0,
                errorRate: 0,
                totalCrashes: 0
              }
            }
          }
        }));
      }
    }, 10);
  }

  terminate() {}
}

// Mock URL
global.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn()
} as any;

// Mock Worker
(global as any).Worker = MockWorker;

describe('WorkerPool', () => {
  let workerPool: WorkerPool;

  beforeEach(() => {
    workerPool = new WorkerPool(2, 'test-worker.js');
  });

  afterEach(() => {
    workerPool.terminate();
  });

  it('should create a worker pool with specified size', () => {
    const stats = workerPool.getStats();
    expect(stats.totalWorkers).toBe(2);
    expect(stats.activeWorkers).toBe(0);
    expect(stats.queuedTasks).toBe(0);
  });

  it('should execute tasks in parallel', async () => {
    const task1 = workerPool.executeTask<ProcessedTelemetryData>({
      type: 'PROCESS_DATA',
      payload: {
        data: [{ id: 1 }],
        categories: {},
        dateRange: undefined
      }
    });

    const task2 = workerPool.executeTask<ProcessedTelemetryData>({
      type: 'PROCESS_DATA',
      payload: {
        data: [{ id: 2 }],
        categories: {},
        dateRange: undefined
      }
    });

    const [result1, result2] = await Promise.all([task1, task2]);

    expect(result1.filteredData).toEqual([{ id: 1 }]);
    expect(result2.filteredData).toEqual([{ id: 2 }]);
  });

  it('should queue tasks when all workers are busy', async () => {
    // Create 3 tasks for 2 workers
    const tasks = Array.from({ length: 3 }, (_, i) => 
      workerPool.executeTask<ProcessedTelemetryData>({
        type: 'PROCESS_DATA',
        payload: {
          data: [{ id: i }],
          categories: {},
          dateRange: undefined
        }
      })
    );

    // Check stats while tasks are processing
    const stats = workerPool.getStats();
    expect(stats.activeWorkers).toBeGreaterThan(0);
    expect(stats.queuedTasks).toBeGreaterThan(0);

    // Wait for all tasks to complete
    const results = await Promise.all(tasks);
    expect(results).toHaveLength(3);
    results.forEach((result, i) => {
      expect(result.filteredData).toEqual([{ id: i }]);
    });
  });

  it('should handle worker errors', async () => {
    // Mock worker error
    const errorWorker = new MockWorker('test-worker.js');
    errorWorker.postMessage = () => {
      setTimeout(() => {
        if (errorWorker.onerror) {
          errorWorker.onerror(new ErrorEvent('error', {
            message: 'Test error'
          }));
        }
      }, 10);
    };

    (global as any).Worker = jest.fn(() => errorWorker);

    const errorPool = new WorkerPool(1, 'test-worker.js');
    
    await expect(errorPool.executeTask({
      type: 'PROCESS_DATA',
      payload: {
        data: [{ id: 1 }],
        categories: {},
        dateRange: undefined
      }
    })).rejects.toThrow('Test error');
  });
});

describe('getWorkerPool', () => {
  it('should return the same instance on multiple calls', () => {
    const pool1 = getWorkerPool();
    const pool2 = getWorkerPool();
    expect(pool1).toBe(pool2);
  });

  it('should use hardware concurrency for pool size when available', () => {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 8,
      configurable: true
    });

    const pool = getWorkerPool();
    const stats = pool.getStats();
    expect(stats.totalWorkers).toBe(8);
  });

  it('should use fallback pool size when hardware concurrency is not available', () => {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: undefined,
      configurable: true
    });

    const pool = getWorkerPool();
    const stats = pool.getStats();
    expect(stats.totalWorkers).toBe(4);
  });
});
