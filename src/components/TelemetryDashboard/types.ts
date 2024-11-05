import type { TelemetryEvent } from '../../types/electron';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CategoryFilters {
  [key: string]: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ErrorPattern {
  pattern: string;
  count: number;
  impact: number;
}

export interface ErrorTrend {
  date: string;
  errors: number;
}

export interface ErrorPatterns {
  correlations: ErrorPattern[];
  trends: ErrorTrend[];
}

export interface UpdateErrors {
  total: number;
  byType: { [key: string]: number };
  averageRetries: number;
}

export interface SystemMetrics {
  byPlatform: { [key: string]: number };
  byVersion: { [key: string]: number };
  byArch: { [key: string]: number };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    totalCrashes: number;
  };
}

export interface ProcessedTelemetryData {
  filteredData: Array<{
    date: string;
    total?: number;
    error?: number;
    navigation?: number;
    [key: string]: string | number | undefined;
  }>;
  metrics: {
    total: number;
    error: number;
    navigation: number;
    [key: string]: number;
  };
  errorPatterns: ErrorPatterns;
  updateErrors: UpdateErrors;
  systemMetrics: SystemMetrics;
  pagination?: PaginationMetadata;
}

export interface VirtualizationConfig {
  itemHeight: number;
  overscan: number;
  containerHeight: number;
  totalItems: number;
}

export interface VirtualizedItem {
  index: number;
  style: {
    position: 'absolute';
    top: number;
    left: 0;
    width: '100%';
    height: number;
  };
}

export interface TelemetryStats {
  totalEvents: number;
  eventsByCategory: { [key: string]: number };
  updateErrors: UpdateErrors;
  timeRange: {
    start: number;
    end: number;
  };
  timeSeriesData: Array<{
    date: string;
    total: number;
    [key: string]: string | number;
  }>;
  rawEvents: TelemetryEvent[];
  systemMetrics: SystemMetrics;
  errorPatterns: ErrorPatterns;
}

export interface ChartExportOptions {
  format: 'PNG' | 'SVG';
  filename?: string;
  width?: number;
  height?: number;
  quality?: number;
}

export interface ErrorAnalysisProps {
  errorPatterns: ErrorPatterns;
  updateErrors: UpdateErrors;
  rawEvents: TelemetryEvent[];
  isDarkMode: boolean;
}

export interface ErrorInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorPatterns: ErrorPatterns;
  selectedError?: {
    pattern: string;
    events: TelemetryEvent[];
  };
  isDarkMode: boolean;
}

export const PIE_CHART_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#C9CBCF'
];

// Helper function to convert TelemetryEvent to chart data format
export const convertEventToChartData = (event: TelemetryEvent) => ({
  date: new Date(event.timestamp).toISOString().split('T')[0],
  category: event.category,
  action: event.action,
  value: event.value || 1,
  metadata: event.metadata
});
