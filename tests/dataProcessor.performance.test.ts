import { jest } from '@jest/globals';
import pako from 'pako';
import type { PerformanceData } from '../src/components/TelemetryDashboard/types';

interface ProcessedDataBase {
  compressed?: boolean;
}

interface UncompressedProcessedData extends ProcessedDataBase {
  compressed?: false;
  filteredData: any[];
  metrics: {
    total: number;
    error: number;
    navigation: number;
    [key: string]: number;
  };
}

interface CompressedProcessedData extends ProcessedDataBase {
  compressed: true;
  data: Uint8Array;
}

type ProcessedData = UncompressedProcessedData | CompressedProcessedData;

// Mock the self (worker) context
const mockPostMessage = jest.fn();
(global as any).self = {
  postMessage: mockPostMessage,
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};

// Import the worker (this will execute the code)
import '../src/components/TelemetryDashboard/utils/dataProcessor.worker';

describe('Data Processor Performance Tests', () => {
  // Helper function to generate test data
  const generateTestData = (count: number) => {
    return Array(count).fill(null).map((_, index) => ({
      date: new Date(Date.now() + index * 60000).toISOString(), // 1-minute intervals
      category: index % 3 === 0 ? 'error' : index % 2 === 0 ? 'navigation' : 'system',
      action: index % 3 === 0 ? 'crash' : 'event',
      value: Math.random() * 100,
      metadata: {
        type: index % 3 === 0 ? 'crash' : 'info',
        severity: Math.floor(Math.random() * 5) + 1,
        platform: 'win32',
        appVersion: '1.0.0',
        arch: 'x64',
        responseTime: Math.random() * 1000,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 8192,
        circuitBreakerState: index % 5 === 0 ? 'OPEN' : index % 3 === 0 ? 'HALF_OPEN' : 'CLOSED'
      }
    }));
  };

  // Helper function to measure execution time
  const measureExecutionTime = (fn: () => void): number => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  };

  beforeEach(() => {
    mockPostMessage.mockClear();
    jest.clearAllMocks();
  });

  describe('Processing Time Benchmarks', () => {
    const dataSizes = [100, 1000, 10000];
    const messageHandler = (self as any).addEventListener.mock.calls[0][1];

    test.each(dataSizes)('should process %d records within performance budget', (size) => {
      const testData = generateTestData(size);
      const executionTime = measureExecutionTime(() => {
        messageHandler({
          data: {
            type: 'PROCESS_DATA',
            payload: {
              data: testData,
              categories: { error: true, navigation: true, system: true }
            }
          }
        });
      });

      // Performance budgets based on data size
      const budget = size <= 100 ? 50 : // 50ms for small datasets
                    size <= 1000 ? 200 : // 200ms for medium datasets
                    1000; // 1000ms for large datasets

      expect(executionTime).toBeLessThan(budget);
    });

    it('should maintain performance with complex filtering', () => {
      const testData = generateTestData(5000);
      const executionTime = measureExecutionTime(() => {
        messageHandler({
          data: {
            type: 'PROCESS_DATA',
            payload: {
              data: testData,
              categories: { error: true },
              dateRange: {
                start: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                end: new Date().toISOString()
              }
            }
          }
        });
      });

      expect(executionTime).toBeLessThan(500); // 500ms budget for filtered processing
    });

    it('should efficiently handle data compression', () => {
      const testData = generateTestData(20000); // Large dataset to trigger compression
      const executionTime = measureExecutionTime(() => {
        messageHandler({
          data: {
            type: 'PROCESS_DATA',
            payload: {
              data: testData,
              categories: { error: true, navigation: true, system: true }
            }
          }
        });
      });

      const processedData = mockPostMessage.mock.calls[0][0] as ProcessedData;
      expect(processedData.compressed).toBe(true);
      expect(executionTime).toBeLessThan(2000); // 2s budget for large dataset with compression
    });
  });

  describe('Memory Usage Benchmarks', () => {
    const messageHandler = (self as any).addEventListener.mock.calls[0][1];

    it('should maintain reasonable memory usage for large datasets', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const testData = generateTestData(50000);
      
      messageHandler({
        data: {
          type: 'PROCESS_DATA',
          payload: {
            data: testData,
            categories: { error: true, navigation: true, system: true }
          }
        }
      });

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // Convert to MB

      expect(memoryIncrease).toBeLessThan(100); // Memory increase should be less than 100MB
    });

    it('should efficiently handle memory during data aggregation', () => {
      const testData = generateTestData(10000);
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Process data multiple times to simulate heavy usage
      for (let i = 0; i < 5; i++) {
        messageHandler({
          data: {
            type: 'PROCESS_DATA',
            payload: {
              data: testData,
              categories: { error: true, navigation: true, system: true },
              dateRange: {
                start: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
                end: new Date().toISOString()
              }
            }
          }
        });
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // Convert to MB

      expect(memoryIncrease).toBeLessThan(200); // Memory increase should be less than 200MB for repeated processing
    });
  });

  describe('Stress Testing', () => {
    const messageHandler = (self as any).addEventListener.mock.calls[0][1];

    it('should handle rapid consecutive processing requests', async () => {
      const testData = generateTestData(1000);
      const iterations = 10;
      const results: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const executionTime = measureExecutionTime(() => {
          messageHandler({
            data: {
              type: 'PROCESS_DATA',
              payload: {
                data: testData,
                categories: { error: true, navigation: true, system: true }
              }
            }
          });
        });
        results.push(executionTime);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
      }

      // Calculate performance degradation
      const firstExecution = results[0];
      const lastExecution = results[results.length - 1];
      const degradation = ((lastExecution - firstExecution) / firstExecution) * 100;

      expect(degradation).toBeLessThan(50); // Performance shouldn't degrade more than 50%
    });

    it('should maintain performance with varying data patterns', () => {
      const patterns = [
        { errorRate: 0.8, navigationRate: 0.1, systemRate: 0.1 }, // High error rate
        { errorRate: 0.1, navigationRate: 0.8, systemRate: 0.1 }, // High navigation rate
        { errorRate: 0.1, navigationRate: 0.1, systemRate: 0.8 }  // High system rate
      ];

      const executionTimes = patterns.map(pattern => {
        const testData = generateTestData(5000).map(item => ({
          ...item,
          category: Math.random() < pattern.errorRate ? 'error' :
                   Math.random() < pattern.navigationRate ? 'navigation' : 'system'
        }));

        return measureExecutionTime(() => {
          messageHandler({
            data: {
              type: 'PROCESS_DATA',
              payload: {
                data: testData,
                categories: { error: true, navigation: true, system: true }
              }
            }
          });
        });
      });

      // Calculate variance in execution times
      const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const variance = executionTimes.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / executionTimes.length;

      expect(variance).toBeLessThan(10000); // Variance should be less than 10000ms²
    });
  });
});
