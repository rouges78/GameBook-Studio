import { jest } from '@jest/globals';
import pako from 'pako';
import type { PerformanceData } from '../src/components/TelemetryDashboard/types';

interface TelemetryData {
  date: string;
  category: string;
  action: string;
  value: number;
  metadata?: Record<string, any>;
}

interface UncompressedProcessedData {
  filteredData: TelemetryData[];
  metrics: {
    total: number;
    error: number;
    navigation: number;
    [key: string]: number;
  };
  errorPatterns: {
    correlations: Array<{
      pattern: string;
      count: number;
      impact: number;
    }>;
    trends: Array<{
      date: string;
      errors: number;
    }>;
  };
  updateErrors: {
    total: number;
    byType: { [key: string]: number };
    averageRetries: number;
  };
  systemMetrics: {
    byPlatform: { [key: string]: number };
    byVersion: { [key: string]: number };
    byArch: { [key: string]: number };
    performance: {
      avgResponseTime: number;
      errorRate: number;
      totalCrashes: number;
      detailedMetrics: PerformanceData[];
    };
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface CompressedProcessedData {
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

describe('Data Processor Worker', () => {
  const mockTelemetryData = [
    {
      date: '2024-01-01T10:00:00Z',
      category: 'error',
      action: 'crash',
      value: 1,
      metadata: {
        type: 'crash',
        severity: 5,
        platform: 'win32',
        appVersion: '1.0.0',
        arch: 'x64',
        responseTime: 100,
        cpuUsage: 50,
        memoryUsage: 1024,
        circuitBreakerState: 'CLOSED'
      }
    },
    {
      date: '2024-01-01T10:05:00Z',
      category: 'navigation',
      action: 'page_view',
      value: 1,
      metadata: {
        platform: 'win32',
        appVersion: '1.0.0',
        arch: 'x64',
        responseTime: 50,
        cpuUsage: 30,
        memoryUsage: 512
      }
    },
    {
      date: '2024-01-01T10:10:00Z',
      category: 'auto-update',
      action: 'error',
      value: 1,
      metadata: {
        errorType: 'download_failed',
        attemptNumber: 2,
        platform: 'win32',
        appVersion: '1.0.0',
        arch: 'x64'
      }
    }
  ];

  beforeEach(() => {
    mockPostMessage.mockClear();
  });

  describe('Message Processing', () => {
    it('should process data and return correct metrics', () => {
      // Get the message handler
      const messageHandler = (self as any).addEventListener.mock.calls[0][1];

      // Call the handler directly with mock data
      messageHandler({
        data: {
          type: 'PROCESS_DATA',
          payload: {
            data: mockTelemetryData,
            categories: { error: true, navigation: true, 'auto-update': true },
            dateRange: {
              start: '2024-01-01T00:00:00Z',
              end: '2024-01-02T00:00:00Z'
            }
          }
        }
      });

      // Get the processed data from the mock
      const processedData = mockPostMessage.mock.calls[0][0] as UncompressedProcessedData;

      // Verify metrics
      expect(processedData.metrics).toEqual({
        total: 3,
        error: 1,
        navigation: 1,
        'auto-update': 1
      });

      // Verify error patterns
      expect(processedData.errorPatterns.correlations).toHaveLength(2);
      expect(processedData.errorPatterns.trends).toHaveLength(1);

      // Verify update errors
      expect(processedData.updateErrors).toEqual({
        total: 1,
        byType: { download_failed: 1 },
        averageRetries: 2
      });

      // Verify system metrics
      expect(processedData.systemMetrics.byPlatform).toEqual({ win32: 3 });
      expect(processedData.systemMetrics.byVersion).toEqual({ '1.0.0': 3 });
      expect(processedData.systemMetrics.byArch).toEqual({ x64: 3 });
      expect(processedData.systemMetrics.performance.totalCrashes).toBe(1);
    });

    it('should handle date range filtering correctly', () => {
      const messageHandler = (self as any).addEventListener.mock.calls[0][1];

      messageHandler({
        data: {
          type: 'PROCESS_DATA',
          payload: {
            data: mockTelemetryData,
            categories: { error: true },
            dateRange: {
              start: '2024-01-01T10:06:00Z',
              end: '2024-01-01T10:15:00Z'
            }
          }
        }
      });

      const processedData = mockPostMessage.mock.calls[0][0] as UncompressedProcessedData;
      expect(processedData.filteredData).toHaveLength(1); // Only auto-update error
    });

    it('should handle category filtering correctly', () => {
      const messageHandler = (self as any).addEventListener.mock.calls[0][1];

      messageHandler({
        data: {
          type: 'PROCESS_DATA',
          payload: {
            data: mockTelemetryData,
            categories: { navigation: true },
            dateRange: {
              start: '2024-01-01T00:00:00Z',
              end: '2024-01-02T00:00:00Z'
            }
          }
        }
      });

      const processedData = mockPostMessage.mock.calls[0][0] as UncompressedProcessedData;
      expect(processedData.filteredData).toHaveLength(1);
      expect(processedData.filteredData[0].category).toBe('navigation');
    });

    it('should handle pagination correctly', () => {
      const messageHandler = (self as any).addEventListener.mock.calls[0][1];

      messageHandler({
        data: {
          type: 'PROCESS_DATA',
          payload: {
            data: mockTelemetryData,
            categories: { error: true, navigation: true, 'auto-update': true },
            pagination: {
              page: 1,
              pageSize: 2
            }
          }
        }
      });

      const processedData = mockPostMessage.mock.calls[0][0] as UncompressedProcessedData;
      expect(processedData.filteredData).toHaveLength(2);
      expect(processedData.pagination).toEqual({
        currentPage: 1,
        totalPages: 2,
        totalItems: 3,
        hasNextPage: true,
        hasPreviousPage: false
      });
    });

    it('should handle data compression for large datasets', () => {
      const messageHandler = (self as any).addEventListener.mock.calls[0][1];

      // Create a large dataset
      const largeData = Array(1000).fill(null).map(() => ({
        ...mockTelemetryData[0],
        date: new Date().toISOString()
      }));

      messageHandler({
        data: {
          type: 'PROCESS_DATA',
          payload: {
            data: largeData,
            categories: { error: true }
          }
        }
      });

      const processedData = mockPostMessage.mock.calls[0][0] as CompressedProcessedData;
      expect(processedData.compressed).toBe(true);
      expect(processedData.data).toBeInstanceOf(Uint8Array);

      // Verify we can decompress the data
      const decompressed = JSON.parse(pako.inflate(processedData.data, { to: 'string' }));
      expect(decompressed.filteredData).toHaveLength(1000);
    });

    it('should calculate performance metrics correctly', () => {
      const messageHandler = (self as any).addEventListener.mock.calls[0][1];

      messageHandler({
        data: {
          type: 'PROCESS_DATA',
          payload: {
            data: mockTelemetryData,
            categories: { error: true, navigation: true }
          }
        }
      });

      const processedData = mockPostMessage.mock.calls[0][0] as UncompressedProcessedData;
      const performance = processedData.systemMetrics.performance;

      expect(performance.avgResponseTime).toBe(75); // Average of 100ms and 50ms
      expect(performance.errorRate).toBeCloseTo(33.33, 2); // 1 error out of 3 events
      expect(performance.totalCrashes).toBe(1);

      // Verify detailed metrics
      const detailedMetrics = performance.detailedMetrics;
      expect(detailedMetrics).toHaveLength(2); // Two 5-minute intervals
      
      // First interval
      expect(detailedMetrics[0]).toMatchObject({
        responseTime: 100,
        cpuUsage: 50,
        memoryUsage: 1024,
        errorRate: 100,
        circuitBreakerState: 'CLOSED'
      });

      // Second interval
      expect(detailedMetrics[1]).toMatchObject({
        responseTime: 50,
        cpuUsage: 30,
        memoryUsage: 512,
        errorRate: 0
      });
    });
  });
});
