import { renderHook, act } from '@testing-library/react';
import useDataProcessor from '../src/components/TelemetryDashboard/hooks/useDataProcessor';
import { telemetryCache } from '../src/utils/telemetryCache';
import type { TelemetryEvent } from '../src/types/electron';
import type { ProcessedTelemetryData } from '../src/components/TelemetryDashboard/types';

// Mock telemetryCache
jest.mock('../src/utils/telemetryCache', () => ({
  telemetryCache: {
    cacheRawData: jest.fn(),
    cacheProcessedData: jest.fn(),
    getProcessedData: jest.fn(),
    clearCache: jest.fn(),
  }
}));

// Mock data
const mockTelemetryEvents: TelemetryEvent[] = [
  {
    category: 'performance',
    action: 'metric',
    timestamp: new Date('2024-01-01').getTime(),
    appVersion: '1.0.0',
    platform: 'win32',
    arch: 'x64',
    value: 100,
    metadata: { type: 'total' }
  },
  {
    category: 'error',
    action: 'error',
    timestamp: new Date('2024-01-02').getTime(),
    appVersion: '1.0.0',
    platform: 'win32',
    arch: 'x64',
    value: 30,
    metadata: { type: 'validation' }
  },
  {
    category: 'navigation',
    action: 'page_view',
    timestamp: new Date('2024-01-03').getTime(),
    appVersion: '1.0.0',
    platform: 'win32',
    arch: 'x64',
    value: 160,
    metadata: { page: 'home' }
  }
];

const mockProcessedData: ProcessedTelemetryData = {
  filteredData: mockTelemetryEvents.map(event => ({
    date: new Date(event.timestamp).toISOString().split('T')[0],
    total: event.category === 'performance' ? event.value : undefined,
    error: event.category === 'error' ? event.value : undefined,
    navigation: event.category === 'navigation' ? event.value : undefined,
    [event.category]: event.value
  })),
  metrics: {
    total: 450,
    error: 90,
    navigation: 360
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
};

const mockCategories = {
  error: true,
  navigation: true
};

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  
  constructor(stringUrl: string) {
    // Constructor implementation
  }

  postMessage(data: any) {
    // Simulate worker processing
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: mockProcessedData
        }));
      }
    }, 0);
  }

  terminate() {
    // Cleanup implementation
  }
}

// Mock URL
const mockUrl = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn(),
};

describe('useDataProcessor', () => {
  beforeAll(() => {
    // Setup global mocks
    global.URL = mockUrl as any;
    global.Worker = MockWorker as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (telemetryCache.getProcessedData as jest.Mock).mockResolvedValue(null);
  });

  it('uses cached data when available', async () => {
    (telemetryCache.getProcessedData as jest.Mock).mockResolvedValue(mockProcessedData);

    const { result } = renderHook(() => useDataProcessor({
      data: mockTelemetryEvents,
      categories: mockCategories
    }));

    // Initial state
    expect(result.current.isProcessing).toBe(true);

    // Wait for cache check
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should use cached data
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processedData).toEqual(mockProcessedData);
    expect(telemetryCache.getProcessedData).toHaveBeenCalledWith({
      categories: mockCategories,
      dateRange: undefined
    });
  });

  it('processes data and caches result on cache miss', async () => {
    const { result } = renderHook(() => useDataProcessor({
      data: mockTelemetryEvents,
      categories: mockCategories
    }));

    // Initial state
    expect(result.current.isProcessing).toBe(true);

    // Wait for processing
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should process and cache data
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processedData).toBeTruthy();
    expect(telemetryCache.cacheRawData).toHaveBeenCalledWith(mockTelemetryEvents);
    expect(telemetryCache.cacheProcessedData).toHaveBeenCalledWith(
      { categories: mockCategories, dateRange: undefined },
      expect.any(Object)
    );
  });

  it('handles worker errors and does not cache failed results', async () => {
    // Override worker implementation to simulate error
    const ErrorWorker = class extends MockWorker {
      postMessage() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new ErrorEvent('error', {
              message: 'Worker error',
              error: new Error('Worker error')
            }));
          }
        }, 0);
      }
    };

    global.Worker = ErrorWorker as any;

    const { result } = renderHook(() => useDataProcessor({
      data: mockTelemetryEvents,
      categories: mockCategories
    }));

    // Wait for error to be processed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(telemetryCache.cacheProcessedData).not.toHaveBeenCalled();
  });

  it('reprocesses data when inputs change', async () => {
    const { result, rerender } = renderHook(
      (props) => useDataProcessor(props),
      {
        initialProps: {
          data: mockTelemetryEvents,
          categories: mockCategories
        }
      }
    );

    // Wait for initial processing
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Update props with new data
    const newData = [
      ...mockTelemetryEvents,
      {
        category: 'performance',
        action: 'metric',
        timestamp: new Date('2024-01-04').getTime(),
        appVersion: '1.0.0',
        platform: 'win32',
        arch: 'x64',
        value: 250,
        metadata: { type: 'total' }
      }
    ];
    
    rerender({
      data: newData,
      categories: mockCategories
    });

    // Should check cache again
    expect(result.current.isProcessing).toBe(true);
    expect(telemetryCache.getProcessedData).toHaveBeenCalledTimes(2);

    // Wait for reprocessing
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processedData).toBeTruthy();
  });

  it('cleans up worker on unmount', () => {
    const terminateSpy = jest.spyOn(MockWorker.prototype, 'terminate');
    
    const { unmount } = renderHook(() => useDataProcessor({
      data: mockTelemetryEvents,
      categories: mockCategories
    }));

    unmount();

    expect(terminateSpy).toHaveBeenCalled();
  });

  it('handles empty data array', async () => {
    const { result } = renderHook(() => useDataProcessor({
      data: [],
      categories: mockCategories
    }));

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processedData).toBeNull();
    expect(result.current.error).toBeNull();
    expect(telemetryCache.getProcessedData).not.toHaveBeenCalled();
  });

  it('processes data with date range filter', async () => {
    const dateRange = {
      start: '2024-01-01',
      end: '2024-01-02'
    };

    const { result } = renderHook(() => useDataProcessor({
      data: mockTelemetryEvents,
      categories: mockCategories,
      dateRange
    }));

    // Wait for processing
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processedData).toBeTruthy();
    expect(telemetryCache.getProcessedData).toHaveBeenCalledWith({
      categories: mockCategories,
      dateRange
    });
  });

  it('handles cache errors gracefully', async () => {
    (telemetryCache.getProcessedData as jest.Mock).mockRejectedValue(new Error('Cache error'));

    const { result } = renderHook(() => useDataProcessor({
      data: mockTelemetryEvents,
      categories: mockCategories
    }));

    // Wait for processing
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should fall back to processing data
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.processedData).toBeTruthy();
    expect(result.current.error).toBeNull();
  });
});
