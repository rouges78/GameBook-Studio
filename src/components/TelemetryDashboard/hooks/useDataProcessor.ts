import { useEffect, useCallback, useRef, useState } from 'react';
import type { TelemetryEvent } from '../../../types/electron';
import { convertEventToChartData } from '../types';

interface TelemetryData {
  date: string;
  total?: number;
  error?: number;
  navigation?: number;
  [key: string]: string | number | undefined;
}

interface ProcessedData {
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
    };
  };
}

interface UseDataProcessorProps {
  data: TelemetryEvent[];
  categories: { [key: string]: boolean };
  dateRange?: {
    start: string;
    end: string;
  };
}

interface UseDataProcessorResult {
  processedData: ProcessedData | null;
  isProcessing: boolean;
  error: Error | null;
}

const useDataProcessor = ({
  data,
  categories,
  dateRange
}: UseDataProcessorProps): UseDataProcessorResult => {
  const workerRef = useRef<Worker | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../utils/dataProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event: MessageEvent<ProcessedData>) => {
        setProcessedData(event.data);
        setIsProcessing(false);
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
    if (!workerRef.current || !data.length) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Convert TelemetryEvent[] to TelemetryData[] before sending to worker
      const formattedData = data.map(event => convertEventToChartData(event));

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
  }, [data, categories, dateRange]);

  return {
    processedData,
    isProcessing,
    error
  };
};

export default useDataProcessor;
