interface TelemetryData {
  date: string;
  category: string;
  action: string;
  value: number;
  metadata?: Record<string, any>;
  [key: string]: string | number | Record<string, any> | undefined;
}

type WorkerMessage = {
  type: 'PROCESS_DATA';
  payload: {
    data: TelemetryData[];
    categories: { [key: string]: boolean };
    dateRange?: {
      start: string;
      end: string;
    };
    pagination?: {
      page: number;
      pageSize: number;
    };
  };
};

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
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Helper function to check if a date is within range
const isDateInRange = (date: string, start?: string, end?: string): boolean => {
  if (!start || !end) return true;
  const dateValue = new Date(date).getTime();
  return dateValue >= new Date(start).getTime() && dateValue <= new Date(end).getTime();
};

// Helper function to calculate metrics
const calculateMetrics = (data: TelemetryData[]): ProcessedData['metrics'] => {
  const metrics: ProcessedData['metrics'] = {
    total: 0,
    error: 0,
    navigation: 0
  };

  data.forEach(item => {
    // Update total
    metrics.total += item.value || 0;

    // Update category-specific metrics
    if (item.category === 'error') {
      metrics.error += item.value || 0;
    } else if (item.category === 'navigation') {
      metrics.navigation += item.value || 0;
    }

    // Add other categories dynamically
    if (!metrics[item.category]) {
      metrics[item.category] = 0;
    }
    metrics[item.category] += item.value || 0;
  });

  return metrics;
};

// Helper function to calculate error patterns
const calculateErrorPatterns = (data: TelemetryData[]): ProcessedData['errorPatterns'] => {
  const errorsByDate: { [key: string]: number } = {};
  const patternCounts: { [key: string]: { count: number; impact: number } } = {};

  data.forEach(item => {
    if (item.category === 'error' || item.action === 'error') {
      // Track daily errors
      errorsByDate[item.date] = (errorsByDate[item.date] || 0) + 1;

      // Track error patterns
      const pattern = `${item.category}:${item.action}${item.metadata?.type ? ':' + item.metadata.type : ''}`;
      if (!patternCounts[pattern]) {
        patternCounts[pattern] = { count: 0, impact: 0 };
      }
      patternCounts[pattern].count++;
      patternCounts[pattern].impact += item.metadata?.severity || 1;
    }
  });

  return {
    correlations: Object.entries(patternCounts)
      .map(([pattern, data]) => ({
        pattern,
        count: data.count,
        impact: data.impact / data.count
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5),
    trends: Object.entries(errorsByDate)
      .map(([date, errors]) => ({ date, errors }))
      .sort((a, b) => a.date.localeCompare(b.date))
  };
};

// Helper function to calculate update errors
const calculateUpdateErrors = (data: TelemetryData[]): ProcessedData['updateErrors'] => {
  const updateErrors = {
    total: 0,
    byType: {} as { [key: string]: number },
    averageRetries: 0
  };

  let totalRetries = 0;
  let errorCount = 0;

  data.forEach(item => {
    if (item.category === 'auto-update' && item.action === 'error') {
      updateErrors.total++;
      const errorType = item.metadata?.errorType || 'unknown';
      updateErrors.byType[errorType] = (updateErrors.byType[errorType] || 0) + 1;

      if (item.metadata?.attemptNumber) {
        totalRetries += item.metadata.attemptNumber;
        errorCount++;
      }
    }
  });

  updateErrors.averageRetries = errorCount > 0 ? totalRetries / errorCount : 0;
  return updateErrors;
};

// Helper function to calculate system metrics
const calculateSystemMetrics = (data: TelemetryData[]): ProcessedData['systemMetrics'] => {
  const metrics = {
    byPlatform: {} as { [key: string]: number },
    byVersion: {} as { [key: string]: number },
    byArch: {} as { [key: string]: number },
    performance: {
      avgResponseTime: 0,
      errorRate: 0,
      totalCrashes: 0
    }
  };

  let totalResponseTime = 0;
  let responseTimeCount = 0;
  let errorCount = 0;

  data.forEach(item => {
    // Platform metrics
    if (item.metadata?.platform) {
      metrics.byPlatform[item.metadata.platform] = (metrics.byPlatform[item.metadata.platform] || 0) + 1;
    }
    // Version metrics
    if (item.metadata?.appVersion) {
      metrics.byVersion[item.metadata.appVersion] = (metrics.byVersion[item.metadata.appVersion] || 0) + 1;
    }
    // Architecture metrics
    if (item.metadata?.arch) {
      metrics.byArch[item.metadata.arch] = (metrics.byArch[item.metadata.arch] || 0) + 1;
    }

    // Performance metrics
    if (item.category === 'error' || item.action === 'error') {
      errorCount++;
      if (item.metadata?.type === 'crash') {
        metrics.performance.totalCrashes++;
      }
    }

    if (item.metadata?.responseTime) {
      totalResponseTime += item.metadata.responseTime;
      responseTimeCount++;
    }
  });

  metrics.performance.avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
  metrics.performance.errorRate = data.length > 0 ? (errorCount / data.length) * 100 : 0;

  return metrics;
};

// Process data based on categories, date range, and pagination
const processData = (message: WorkerMessage['payload']): ProcessedData => {
  const { data, categories, dateRange, pagination } = message;

  // Filter data by date range first
  const dateFiltered = data.filter(item => 
    isDateInRange(item.date, dateRange?.start, dateRange?.end)
  );

  // Filter by active categories
  const activeCategories = Object.entries(categories)
    .filter(([_, isActive]) => isActive)
    .map(([category]) => category);

  // If no categories are selected, show total only
  if (activeCategories.length === 0) {
    activeCategories.push('total');
  }

  // Create filtered data with only active categories
  const filteredData = dateFiltered.filter(item => 
    activeCategories.includes(item.category)
  );

  // Apply pagination if provided
  let paginatedData = filteredData;
  let paginationMetadata;

  if (pagination) {
    const { page, pageSize } = pagination;
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    paginatedData = filteredData.slice(startIndex, endIndex);
    paginationMetadata = {
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  return {
    filteredData: paginatedData,
    metrics: calculateMetrics(filteredData), // Calculate metrics from all data
    errorPatterns: calculateErrorPatterns(filteredData), // Calculate patterns from all data
    updateErrors: calculateUpdateErrors(filteredData), // Calculate errors from all data
    systemMetrics: calculateSystemMetrics(filteredData), // Calculate metrics from all data
    pagination: paginationMetadata
  };
};

// Handle messages from the main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type === 'PROCESS_DATA') {
    const result = processData(event.data.payload);
    self.postMessage(result);
  }
});

// Ensure TypeScript recognizes this as a module
export {};
