import { useEffect, useRef, useState } from 'react';
import type { TelemetryEvent } from '../../../types/electron';
import { convertEventToChartData } from '../types';
import { telemetryCache } from '../../../utils/telemetryCache';
import type { ProcessedTelemetryData, PaginationParams, PaginationMetadata } from '../types';

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
}

const DEFAULT_PAGE_SIZE = 50;

const useDataProcessor = ({
  data,
  categories,
  dateRange,
  pagination = { page: 1, pageSize: DEFAULT_PAGE_SIZE }
}: UseDataProcessorProps): UseDataProcessorResult => {
  const workerRef = useRef<Worker | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedTelemetryData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [totalItems, setTotalItems] = useState(0);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../utils/dataProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = async (event: MessageEvent<ProcessedTelemetryData>) => {
        const paginatedData = event.data;
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalItems / pagination.pageSize);
        const paginationMetadata: PaginationMetadata = {
          currentPage,
          totalPages,
          totalItems,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1
        };

        setProcessedData({
          ...paginatedData,
          pagination: paginationMetadata
        });
        setIsProcessing(false);

        // Cache the processed data with pagination info
        try {
          await telemetryCache.cacheProcessedData(
            { categories, dateRange, pagination: { page: currentPage, pageSize: pagination.pageSize } },
            paginatedData
          );
        } catch (err) {
          console.error('Failed to cache processed data:', err);
        }
      };

      workerRef.current.onerror = (event: ErrorEvent) => {
        setError(new Error(event.message));
        setIsProcessing(false);
      };

      return () => {
        workerRef.current?.terminate();
        workerRef.current = null;
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize worker'));
      return undefined;
    }
  }, []);

  // Process data when inputs change
  useEffect(() => {
    const processDataWithCache = async () => {
      if (!workerRef.current || !data.length) return;

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

        // Cache miss - process data with worker
        const startIndex = (currentPage - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        const formattedData = paginatedData.map(event => convertEventToChartData(event));

        // Cache raw data for future use
        await telemetryCache.cacheRawData(paginatedData);

        workerRef.current.postMessage({
          type: 'PROCESS_DATA',
          payload: {
            data: formattedData,
            categories,
            dateRange,
            pagination: { page: currentPage, pageSize: pagination.pageSize }
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to process data'));
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
    resetPagination
  };
};

export default useDataProcessor;
