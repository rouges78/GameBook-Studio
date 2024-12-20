"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pako_1 = __importDefault(require("pako"));
// Type guard to check if data is compressed
function isCompressedData(data) {
    return 'compressed' in data && data.compressed === true;
}
// Helper function to check if a date is within range
const isDateInRange = (date, start, end) => {
    if (!start || !end)
        return true;
    const dateValue = new Date(date).getTime();
    return dateValue >= new Date(start).getTime() && dateValue <= new Date(end).getTime();
};
// Helper function to calculate metrics
const calculateMetrics = (data) => {
    const metrics = {
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
        }
        else if (item.category === 'navigation') {
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
const calculateErrorPatterns = (data) => {
    const errorsByDate = {};
    const patternCounts = {};
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
const calculateUpdateErrors = (data) => {
    const updateErrors = {
        total: 0,
        byType: {},
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
const calculateSystemMetrics = (data) => {
    const metrics = {
        byPlatform: {},
        byVersion: {},
        byArch: {},
        performance: {
            avgResponseTime: 0,
            errorRate: 0,
            totalCrashes: 0,
            detailedMetrics: []
        }
    };
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let errorCount = 0;
    // Group performance data by timestamp (5-minute intervals)
    const performanceByTimestamp = new Map();
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
        const timestamp = new Date(item.date).getTime();
        const interval = Math.floor(timestamp / (5 * 60 * 1000)) * (5 * 60 * 1000); // Round to 5-minute intervals
        if (!performanceByTimestamp.has(interval)) {
            performanceByTimestamp.set(interval, {
                responseTime: [],
                cpuUsage: [],
                memoryUsage: [],
                errorCount: 0,
                totalEvents: 0,
                circuitBreakerState: 'CLOSED'
            });
        }
        const intervalData = performanceByTimestamp.get(interval);
        intervalData.totalEvents++;
        if (item.category === 'error' || item.action === 'error') {
            errorCount++;
            intervalData.errorCount++;
            if (item.metadata?.type === 'crash') {
                metrics.performance.totalCrashes++;
            }
        }
        if (item.metadata?.responseTime) {
            totalResponseTime += item.metadata.responseTime;
            responseTimeCount++;
            intervalData.responseTime.push(item.metadata.responseTime);
        }
        if (item.metadata?.cpuUsage) {
            intervalData.cpuUsage.push(item.metadata.cpuUsage);
        }
        if (item.metadata?.memoryUsage) {
            intervalData.memoryUsage.push(item.metadata.memoryUsage);
        }
        if (item.metadata?.circuitBreakerState) {
            intervalData.circuitBreakerState = item.metadata.circuitBreakerState;
        }
    });
    // Calculate overall metrics
    metrics.performance.avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
    metrics.performance.errorRate = data.length > 0 ? (errorCount / data.length) * 100 : 0;
    // Convert interval data to detailed metrics
    metrics.performance.detailedMetrics = Array.from(performanceByTimestamp.entries())
        .map(([timestamp, data]) => ({
        timestamp,
        responseTime: data.responseTime.length > 0
            ? data.responseTime.reduce((a, b) => a + b, 0) / data.responseTime.length
            : 0,
        cpuUsage: data.cpuUsage.length > 0
            ? data.cpuUsage.reduce((a, b) => a + b, 0) / data.cpuUsage.length
            : 0,
        memoryUsage: data.memoryUsage.length > 0
            ? data.memoryUsage.reduce((a, b) => a + b, 0) / data.memoryUsage.length
            : 0,
        errorRate: data.totalEvents > 0 ? (data.errorCount / data.totalEvents) * 100 : 0,
        circuitBreakerState: data.circuitBreakerState
    }))
        .sort((a, b) => a.timestamp - b.timestamp);
    return metrics;
};
// Process data based on categories, date range, and pagination
const processData = (message) => {
    let payload = message.payload;
    // Handle compressed data
    if (message.compressed && typeof message.payload === 'string') {
        const decompressed = pako_1.default.inflate(message.payload, { to: 'string' });
        payload = JSON.parse(decompressed);
    }
    const { data, categories, dateRange, pagination } = payload;
    // Filter data by date range first
    const dateFiltered = data.filter(item => isDateInRange(item.date, dateRange?.start, dateRange?.end));
    // Filter by active categories
    const activeCategories = Object.entries(categories)
        .filter(([_, isActive]) => isActive)
        .map(([category]) => category);
    // If no categories are selected, show total only
    if (activeCategories.length === 0) {
        activeCategories.push('total');
    }
    // Create filtered data with only active categories
    const filteredData = dateFiltered.filter(item => activeCategories.includes(item.category));
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
    const result = {
        filteredData: paginatedData,
        metrics: calculateMetrics(filteredData),
        errorPatterns: calculateErrorPatterns(filteredData),
        updateErrors: calculateUpdateErrors(filteredData),
        systemMetrics: calculateSystemMetrics(filteredData),
        pagination: paginationMetadata
    };
    // Compress large results
    if (JSON.stringify(result).length > 50 * 1024) { // 50KB threshold
        const compressed = pako_1.default.deflate(JSON.stringify(result));
        return { compressed: true, data: compressed };
    }
    return result;
};
// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data.type === 'PROCESS_DATA') {
        const result = processData(event.data);
        self.postMessage(result);
    }
});
