import { useEffect, useState } from 'react';
import type { TelemetryEvent } from '../../../types/electron';
import { convertEventToChartData } from '../types';
import { telemetryCache } from '../../../utils/telemetryCache';
import { getWorkerPool } from '../utils/workerPool';
import type { ProcessedTelemetryData, PaginationParams, PaginationMetadata, PerformanceData } from '../types';

interface UseDataProcessorProps {
  data: TelemetryEvent[];
  categories: { [key: string]: boolean };
  dateRange?: {
    start: string;
    end: string;
  };
  pagination?: PaginationParams;
}

interface UseDataProcessorResult {
  processedData: ProcessedTelemetryData | null;
  isProcessing: boolean;
  error: Error | null;
  loadNextPage: () => void;
  loadPreviousPage: () => void;
  resetPagination: () => void;
  poolStats: {
    totalWorkers: number;
    activeWorkers: number;
    queuedTasks: number;
  };
}

const DEFAULT_PAGE_SIZE = 50;
const CHUNK_SIZE = 1000; // Number of items to process per worker

const useDataProcessor = ({
  data,
  categories,
  dateRange,
  pagination = { page: 1, pageSize: DEFAULT_PAGE_SIZE }
}: UseDataProcessorProps): UseDataProcessorResult => {
  const [processedData, setProcessedData] = useState<ProcessedTelemetryData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [totalItems, setTotalItems] = useState(0);
  const [poolStats, setPoolStats] = useState({ totalWorkers: 0, activeWorkers: 0, queuedTasks: 0 });

  // Process data when inputs change
  useEffect(() => {
    const processDataWithCache = async () => {
      if (!data.length) return;

      setIsProcessing(true);
      setError(null);

      try {
        // Calculate total items for pagination
        const filteredData = data.filter(event => {
          const eventDate = new Date(event.timestamp).toISOString().split('T')[0];
          return (!dateRange || (eventDate >= dateRange.start && eventDate <= dateRange.end)) &&
                 categories[event.category];
        });
        setTotalItems(filteredData.length);

        // Try to get cached data first
        const cachedData = await telemetryCache.getProcessedData({
          categories,
          dateRange,
          pagination: { page: currentPage, pageSize: pagination.pageSize }
        });

        if (cachedData) {
          const totalPages = Math.ceil(totalItems / pagination.pageSize);
          const paginationMetadata: PaginationMetadata = {
            currentPage,
            totalPages,
            totalItems,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1
          };

          setProcessedData({
            ...cachedData,
            pagination: paginationMetadata
          });
          setIsProcessing(false);
          return;
        }

        // Cache miss - process data with worker pool
        const startIndex = (currentPage - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        const formattedData = paginatedData.map(event => convertEventToChartData(event));

        // Split data into chunks for parallel processing
        const chunks: typeof formattedData[] = [];
        for (let i = 0; i < formattedData.length; i += CHUNK_SIZE) {
          chunks.push(formattedData.slice(i, i + CHUNK_SIZE));
        }

        const workerPool = getWorkerPool();
        setPoolStats(workerPool.getStats());

        // Process chunks in parallel
        const chunkPromises = chunks.map(chunk => 
          workerPool.executeTask<ProcessedTelemetryData>({
            type: 'PROCESS_DATA',
            payload: {
              data: chunk,
              categories,
              dateRange,
              pagination: { page: currentPage, pageSize: pagination.pageSize }
            }
          })
        );

        // Wait for all chunks to be processed
        const results = await Promise.all(chunkPromises);

        // Merge results from all workers
        const mergedResult = results.reduce<ProcessedTelemetryData>((acc, curr) => ({
          filteredData: [...acc.filteredData, ...curr.filteredData],
          metrics: {
            total: acc.metrics.total + curr.metrics.total,
            error: acc.metrics.error + curr.metrics.error,
            navigation: acc.metrics.navigation + curr.metrics.navigation,
            ...Object.keys(curr.metrics)
              .filter(key => !['total', 'error', 'navigation'].includes(key))
              .reduce<Record<string, number>>((metricAcc, key) => ({
                ...metricAcc,
                [key]: (acc.metrics[key] || 0) + curr.metrics[key]
              }), {})
          },
          errorPatterns: {
            correlations: [...acc.errorPatterns.correlations, ...curr.errorPatterns.correlations]
              .sort((a, b) => b.impact - a.impact)
              .slice(0, 5),
            trends: mergeErrorTrends(acc.errorPatterns.trends, curr.errorPatterns.trends)
          },
          updateErrors: {
            total: acc.updateErrors.total + curr.updateErrors.total,
            byType: Object.entries(curr.updateErrors.byType).reduce<Record<string, number>>(
              (typeAcc, [type, count]) => ({
                ...typeAcc,
                [type]: (acc.updateErrors.byType[type] || 0) + count
              }),
              acc.updateErrors.byType
            ),
            averageRetries: (acc.updateErrors.averageRetries + curr.updateErrors.averageRetries) / 2
          },
          systemMetrics: mergeSystemMetrics(acc.systemMetrics, curr.systemMetrics)
        }), results[0]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / pagination.pageSize);
        const paginationMetadata: PaginationMetadata = {
          currentPage,
          totalPages,
          totalItems,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1
        };

        const finalResult = {
          ...mergedResult,
          pagination: paginationMetadata
        };

        setProcessedData(finalResult);
        setPoolStats(workerPool.getStats());

        // Cache the processed data
        await telemetryCache.cacheProcessedData(
          { categories, dateRange, pagination: { page: currentPage, pageSize: pagination.pageSize } },
          finalResult
        );

        // Cache raw data for future use
        await telemetryCache.cacheRawData(paginatedData);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to process data'));
      } finally {
        setIsProcessing(false);
      }
    };

    processDataWithCache();
  }, [data, categories, dateRange, currentPage, pagination.pageSize]);

  const loadNextPage = () => {
    if (processedData?.pagination?.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const loadPreviousPage = () => {
    if (processedData?.pagination?.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    processedData,
    isProcessing,
    error,
    loadNextPage,
    loadPreviousPage,
    resetPagination,
    poolStats
  };
};

// Helper function to merge error trends
const mergeErrorTrends = (
  trends1: Array<{ date: string; errors: number }>,
  trends2: Array<{ date: string; errors: number }>
): Array<{ date: string; errors: number }> => {
  const trendMap = new Map<string, number>();
  
  [...trends1, ...trends2].forEach(trend => {
    trendMap.set(trend.date, (trendMap.get(trend.date) || 0) + trend.errors);
  });

  return Array.from(trendMap.entries())
    .map(([date, errors]) => ({ date, errors }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

// Helper function to merge system metrics
const mergeSystemMetrics = (metrics1: ProcessedTelemetryData['systemMetrics'], metrics2: ProcessedTelemetryData['systemMetrics']): ProcessedTelemetryData['systemMetrics'] => {
  return {
    byPlatform: mergeCounts(metrics1.byPlatform, metrics2.byPlatform),
    byVersion: mergeCounts(metrics1.byVersion, metrics2.byVersion),
    byArch: mergeCounts(metrics1.byArch, metrics2.byArch),
    performance: {
      avgResponseTime: (metrics1.performance.avgResponseTime + metrics2.performance.avgResponseTime) / 2,
      errorRate: (metrics1.performance.errorRate + metrics2.performance.errorRate) / 2,
      totalCrashes: metrics1.performance.totalCrashes + metrics2.performance.totalCrashes,
      detailedMetrics: [
        ...(metrics1.performance.detailedMetrics || []),
        ...(metrics2.performance.detailedMetrics || [])
      ].sort((a, b) => a.timestamp - b.timestamp)
    }
  };
};

// Helper function to merge count objects
const mergeCounts = (obj1: { [key: string]: number }, obj2: { [key: string]: number }): { [key: string]: number } => {
  const result = { ...obj1 };
  Object.entries(obj2).forEach(([key, value]) => {
    result[key] = (result[key] || 0) + value;
  });
  return result;
};

export default useDataProcessor;
