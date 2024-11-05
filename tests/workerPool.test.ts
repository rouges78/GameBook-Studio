import { WorkerPool, getWorkerPool } from '../src/components/TelemetryDashboard/utils/workerPool';

// Mock Worker class
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  
  constructor(public url: string) {}
  
  postMessage(data: any) {
    // Simulate async processing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data: { result: 'processed' } }));
      }
    }, 50);
  }
  
  terminate() {}
}

// Mock error worker class
class ErrorWorker implements Partial<Worker> {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  
  constructor(public url: string) {}
  
  postMessage(data: any) {
    setTimeout(() => {
      if (this.onerror) {
        this.onerror(new ErrorEvent('error', { message: 'Test error' }));
      }
    }, 50);
  }
  
  terminate() {}
}

// Mock performance.now()
const originalPerformanceNow = performance.now;
const mockPerformanceNow = jest.fn(() => Date.now());

describe('WorkerPool', () => {
  beforeAll(() => {
    // @ts-ignore
    global.Worker = MockWorker;
    performance.now = mockPerformanceNow;
  });

  afterAll(() => {
    performance.now = originalPerformanceNow;
  });

  beforeEach(() => {
    mockPerformanceNow.mockClear();
  });

  it('should initialize with correct number of workers', () => {
    const pool = new WorkerPool(4, 'test-worker.js');
    const stats = pool.getStats();
    expect(stats.totalWorkers).toBe(4);
    expect(stats.activeWorkers).toBe(0);
    expect(stats.queuedTasks).toBe(0);
  });

  it('should execute tasks and track timing', async () => {
    const pool = new WorkerPool(2, 'test-worker.js');
    const startTime = Date.now();
    mockPerformanceNow.mockImplementation(() => startTime);

    const task1 = pool.executeTask({ data: 'test1' });
    const task2 = pool.executeTask({ data: 'test2' });

    // Simulate task completion time
    mockPerformanceNow.mockImplementation(() => startTime + 100);

    await Promise.all([task1, task2]);

    const stats = pool.getStats();
    expect(stats.performance.totalTasksProcessed).toBe(2);
    expect(stats.performance.failedTasks).toBe(0);
    expect(stats.performance.successRate).toBe(100);
    expect(stats.performance.averageExecutionTime).toBeGreaterThan(0);
  });

  it('should handle task failures', async () => {
    const pool = new WorkerPool(1, 'test-worker.js');
    
    // Override mock worker to simulate error
    // @ts-ignore
    global.Worker = ErrorWorker;

    try {
      await pool.executeTask({ data: 'test' });
    } catch (error) {
      expect((error as Error).message).toBe('Test error');
    }

    const stats = pool.getStats();
    expect(stats.performance.failedTasks).toBe(1);
    expect(stats.performance.successRate).toBe(0);
  });

  it('should maintain task history with size limit', async () => {
    const pool = new WorkerPool(1, 'test-worker.js');
    const tasks = Array.from({ length: 150 }, (_, i) => pool.executeTask({ data: `test${i}` }));
    
    await Promise.all(tasks);

    const stats = pool.getStats();
    expect(stats.performance.taskHistory.length).toBeLessThanOrEqual(100); // maxHistorySize
    expect(stats.performance.taskHistory[0].status).toBe('completed');
  });

  it('should track memory usage when available', () => {
    // Mock memory API
    const mockMemory = {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000
    };

    // @ts-ignore
    performance.memory = mockMemory;

    const pool = new WorkerPool(1, 'test-worker.js');
    const stats = pool.getStats();

    expect(stats.performance.peakMemoryUsage).toBe(1000000);

    // Cleanup
    // @ts-ignore
    delete performance.memory;
  });

  it('should handle task queuing when all workers are busy', async () => {
    const pool = new WorkerPool(1, 'test-worker.js');
    
    // Start three tasks with only one worker
    const task1 = pool.executeTask({ data: 'test1' });
    const task2 = pool.executeTask({ data: 'test2' });
    const task3 = pool.executeTask({ data: 'test3' });

    const statsBeforeCompletion = pool.getStats();
    expect(statsBeforeCompletion.activeWorkers).toBe(1);
    expect(statsBeforeCompletion.queuedTasks).toBe(2);

    await Promise.all([task1, task2, task3]);

    const statsAfterCompletion = pool.getStats();
    expect(statsAfterCompletion.activeWorkers).toBe(0);
    expect(statsAfterCompletion.queuedTasks).toBe(0);
    expect(statsAfterCompletion.performance.totalTasksProcessed).toBe(3);
  });

  describe('getWorkerPool', () => {
    it('should return singleton instance', () => {
      const pool1 = getWorkerPool();
      const pool2 = getWorkerPool();
      expect(pool1).toBe(pool2);
    });

    it('should use hardware concurrency when available', () => {
      // @ts-ignore
      navigator.hardwareConcurrency = 8;
      const pool = getWorkerPool();
      const stats = pool.getStats();
      expect(stats.totalWorkers).toBe(8);
    });
  });
});
