import { WorkerPool, getWorkerPool } from '../src/components/TelemetryDashboard/utils/workerPool';
import pako from 'pako';

// Mock performance.memory
const mockMemory = {
  usedJSHeapSize: 100 * 1024 * 1024, // 100MB
  totalJSHeapSize: 500 * 1024 * 1024,
  jsHeapSizeLimit: 1024 * 1024 * 1024
};

Object.defineProperty(performance, 'memory', {
  get: () => mockMemory
});

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  private static mockData = new Map<string, any>();

  constructor(private url: string) {}

  postMessage(data: any) {
    setTimeout(() => {
      if (this.onmessage) {
        // Simulate processing and compression
        let result;
        if (data.compressed) {
          const decompressed = pako.inflate(data.data, { to: 'string' });
          result = JSON.parse(decompressed);
        } else {
          result = {
            filteredData: [],
            metrics: { total: 0, error: 0, navigation: 0 },
            errorPatterns: { correlations: [], trends: [] },
            updateErrors: { total: 0, byType: {}, averageRetries: 0 },
            systemMetrics: {
              byPlatform: {},
              byVersion: {},
              byArch: {},
              performance: { avgResponseTime: 0, errorRate: 0, totalCrashes: 0 }
            }
          };
        }

        // Compress large results
        if (JSON.stringify(result).length > 50 * 1024) {
          const compressed = pako.deflate(JSON.stringify(result));
          result = { compressed: true, data: compressed };
        }

        this.onmessage(new MessageEvent('message', { data: result }));
      }
    }, 10);
  }

  terminate() {}
}

// Mock window.Worker
(global as any).Worker = MockWorker;

describe('WorkerPool Memory Management', () => {
  let pool: WorkerPool;

  beforeEach(() => {
    pool = getWorkerPool(2);
  });

  afterEach(() => {
    pool.terminate();
  });

  test('handles memory thresholds correctly', async () => {
    // Set memory usage to warning level
    mockMemory.usedJSHeapSize = 160 * 1024 * 1024; // 160MB

    const task = {
      type: 'PROCESS_DATA',
      payload: {
        data: Array(1000).fill(null).map((_, i) => ({
          date: new Date().toISOString(),
          category: 'test',
          action: 'action',
          value: i
        })),
        categories: { test: true }
      }
    };

    const result = await pool.executeTask(task);
    expect(result).toBeDefined();
  });

  test('compresses large payloads', async () => {
    const largeData = Array(10000).fill(null).map((_, i) => ({
      date: new Date().toISOString(),
      category: 'test',
      action: 'action',
      value: i,
      metadata: {
        details: 'Some long string that will be repeated many times ' + i
      }
    }));

    const task = {
      type: 'PROCESS_DATA',
      payload: {
        data: largeData,
        categories: { test: true }
      }
    };

    const result = await pool.executeTask(task);
    expect(result).toBeDefined();
  });

  test('handles critical memory conditions', async () => {
    // Set memory usage to critical level
    mockMemory.usedJSHeapSize = 260 * 1024 * 1024; // 260MB

    const task = {
      type: 'PROCESS_DATA',
      payload: {
        data: Array(100).fill(null).map((_, i) => ({
          date: new Date().toISOString(),
          category: 'test',
          action: 'action',
          value: i
        })),
        categories: { test: true }
      }
    };

    await expect(pool.executeTask(task)).rejects.toThrow('Cannot accept new tasks due to memory constraints');
  });

  test('restarts workers after errors', async () => {
    const errorTask = {
      type: 'PROCESS_DATA',
      payload: {
        data: [{ error: true }], // This will trigger an error in the mock worker
        categories: { test: true }
      }
    };

    // Mock worker error
    MockWorker.prototype.postMessage = function(data: any) {
      setTimeout(() => {
        if (this.onerror) {
          this.onerror(new ErrorEvent('error', { message: 'Test error' }));
        }
      }, 10);
    };

    await expect(pool.executeTask(errorTask)).rejects.toThrow('Test error');
    
    // Verify worker was restarted by executing a valid task
    MockWorker.prototype.postMessage = function(data: any) {
      setTimeout(() => {
        if (this.onmessage) {
          this.onmessage(new MessageEvent('message', { data: { success: true } }));
        }
      }, 10);
    };

    const validTask = {
      type: 'PROCESS_DATA',
      payload: {
        data: [{ valid: true }],
        categories: { test: true }
      }
    };

    const result = await pool.executeTask(validTask);
    expect(result).toBeDefined();
  });

  test('maintains task history within limits', async () => {
    // Execute more tasks than the history limit
    const tasks = Array(150).fill(null).map((_, i) => ({
      type: 'PROCESS_DATA',
      payload: {
        data: [{ id: i }],
        categories: { test: true }
      }
    }));

    for (const task of tasks) {
      await pool.executeTask(task);
    }

    const stats = pool.getStats();
    expect(stats.performance.taskHistory.length).toBeLessThanOrEqual(100);
  });

  test('tracks memory usage in task metrics', async () => {
    const task = {
      type: 'PROCESS_DATA',
      payload: {
        data: Array(100).fill(null).map((_, i) => ({
          date: new Date().toISOString(),
          category: 'test',
          action: 'action',
          value: i
        })),
        categories: { test: true }
      }
    };

    await pool.executeTask(task);
    const stats = pool.getStats();
    
    expect(stats.performance.currentMemoryUsage).toBeDefined();
    expect(stats.performance.peakMemoryUsage).toBeDefined();
  });
});
