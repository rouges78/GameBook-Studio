import { useEffect, useRef, useState } from 'react';
import type { TelemetryEvent } from '../../../types/electron';
import { convertEventToChartData } from '../types';
import { telemetryCache } from '../../../utils/telemetryCache';
import type { ProcessedTelemetryData } from '../types';

interface UseDataProcessorProps {
  data: TelemetryEvent[];
  categories: { [key: string]: boolean };
  dateRange?: {
    start: string;
    end: string;
  };
}

interface UseDataProcessorResult {
  processedData: ProcessedTelemetryData | null;
  isProcessing: boolean;
  error: Error | null;
}

const useDataProcessor = ({
  data,
  categories,
  dateRange
}: UseDataProcessorProps): UseDataProcessorResult => {
  const workerRef = useRef<Worker | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedTelemetryData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../utils/dataProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = async (event: MessageEvent<ProcessedTelemetryData>) => {
        setProcessedData(event.data);
        setIsProcessing(false);

        // Cache the processed data
        try {
          await telemetryCache.cacheProcessedData(
            { categories, dateRange },
            event.data
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
        // Try to get cached data first
        const cachedData = await telemetryCache.getProcessedData({
          categories,
          dateRange
        });

        if (cachedData) {
          setProcessedData(cachedData);
          setIsProcessing(false);
          return;
        }

        // Cache miss - process data with worker
        const formattedData = data.map(event => convertEventToChartData(event));

        // Cache raw data for future use
        await telemetryCache.cacheRawData(data);

        workerRef.current.postMessage({
          type: 'PROCESS_DATA',
          payload: {
            data: formattedData,
            categories,
            dateRange
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to process data'));
        setIsProcessing(false);
      }
    };

    processDataWithCache();
  }, [data, categories, dateRange]);

  return {
    processedData,
    isProcessing,
    error
  };
};

export default useDataProcessor;
