import type { TelemetryEvent } from '../../types/electron';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CategoryFilters {
  [category: string]: boolean;
}

export interface SystemMetrics {
  byPlatform: Record<string, number>;
  byVersion: Record<string, number>;
  byArch: Record<string, number>;
  performance: {
    avgResponseTime: number;
    errorRate: number;
    totalCrashes: number;
  };
}

export interface ErrorPatterns {
  correlations: Array<{
    pattern: string;
    count: number;
    impact: number;
  }>;
  trends: Array<{
    date: string;
    errors: number;
  }>;
}

export interface TelemetryStats {
  totalEvents: number;
  eventsByCategory: Record<string, number>;
  updateErrors: {
    total: number;
    byType: Record<string, number>;
    averageRetries: number;
  };
  timeRange: {
    start: number;
    end: number;
  };
  timeSeriesData: Array<{
    date: string;
    total: number;
    [key: string]: number | string;
  }>;
  rawEvents?: TelemetryEvent[];
  systemMetrics: SystemMetrics;
  errorPatterns: ErrorPatterns;
}

export interface DateRangeFiltersProps {
  dateRange: DateRange;
  onDateChange: (type: 'startDate' | 'endDate', value: string) => void;
  onPresetSelect: (days: number) => void;
  minDate?: string;
  maxDate?: string;
  isDarkMode: boolean;
}

export interface CategoryFiltersProps {
  categories: CategoryFilters;
  onToggle: (category: string) => void;
  isDarkMode: boolean;
}

export interface ErrorAnalysisProps {
  errorPatterns: ErrorPatterns;
  updateErrors: {
    total: number;
    byType: Record<string, number>;
    averageRetries: number;
  };
  isDarkMode: boolean;
}

export interface SystemMetricsProps {
  metrics: SystemMetrics;
  isDarkMode: boolean;
}

export interface TimeSeriesChartProps {
  data: Array<{
    date: string;
    total: number;
    [key: string]: number | string;
  }>;
  categories: CategoryFilters;
  isDarkMode: boolean;
}

export const PRESET_RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'All Time', days: 0 }
] as const;

export const CHART_COLORS = {
  'auto-update': '#8884d8',
  'system': '#82ca9d',
  'user-interaction': '#ffc658',
  'error': '#ff7300'
} as const;

export const PIE_CHART_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8'
] as const;
