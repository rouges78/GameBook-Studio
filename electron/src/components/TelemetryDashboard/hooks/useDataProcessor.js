"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const types_1 = require("../types");
const telemetryCache_1 = require("../../../utils/telemetryCache");
const workerPool_1 = require("../utils/workerPool");
const DEFAULT_PAGE_SIZE = 50;
const CHUNK_SIZE = 1000; // Number of items to process per worker
const useDataProcessor = ({ data, categories, dateRange, pagination = { page: 1, pageSize: DEFAULT_PAGE_SIZE } }) => {
    const [processedData, setProcessedData] = (0, react_1.useState)(null);
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(pagination.page);
    const [totalItems, setTotalItems] = (0, react_1.useState)(0);
    const [poolStats, setPoolStats] = (0, react_1.useState)({
        totalWorkers: 0,
        activeWorkers: 0,
        queuedTasks: 0,
        performance: {
            averageExecutionTime: 0,
            successRate: 100
        }
    });
    // Process data when inputs change
    (0, react_1.useEffect)(() => {
        const processDataWithCache = async () => {
            if (!data.length)
                return;
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
                const cachedData = await telemetryCache_1.telemetryCache.getProcessedData({
                    categories,
                    dateRange,
                    pagination: { page: currentPage, pageSize: pagination.pageSize }
                });
                if (cachedData) {
                    const totalPages = Math.ceil(totalItems / pagination.pageSize);
                    const paginationMetadata = {
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
                const formattedData = paginatedData.map(event => (0, types_1.convertEventToChartData)(event));
                // Split data into chunks for parallel processing
                const chunks = [];
                for (let i = 0; i < formattedData.length; i += CHUNK_SIZE) {
                    chunks.push(formattedData.slice(i, i + CHUNK_SIZE));
                }
                const workerPool = (0, workerPool_1.getWorkerPool)();
                const poolStatsData = workerPool.getStats();
                setPoolStats({
                    totalWorkers: poolStatsData.totalWorkers,
                    activeWorkers: poolStatsData.activeWorkers,
                    queuedTasks: poolStatsData.queuedTasks,
                    performance: {
                        currentMemoryUsage: poolStatsData.performance.currentMemoryUsage,
                        currentCpuUsage: poolStatsData.performance.currentCpuUsage,
                        averageExecutionTime: poolStatsData.performance.averageExecutionTime,
                        successRate: poolStatsData.performance.successRate
                    }
                });
                // Process chunks in parallel
                const chunkPromises = chunks.map(chunk => workerPool.executeTask({
                    type: 'PROCESS_DATA',
                    payload: {
                        data: chunk,
                        categories,
                        dateRange,
                        pagination: { page: currentPage, pageSize: pagination.pageSize }
                    }
                }));
                // Wait for all chunks to be processed
                const results = await Promise.all(chunkPromises);
                // Merge results from all workers
                const mergedResult = results.reduce((acc, curr) => ({
                    filteredData: [...acc.filteredData, ...curr.filteredData],
                    metrics: {
                        total: acc.metrics.total + curr.metrics.total,
                        error: acc.metrics.error + curr.metrics.error,
                        navigation: acc.metrics.navigation + curr.metrics.navigation,
                        ...Object.keys(curr.metrics)
                            .filter(key => !['total', 'error', 'navigation'].includes(key))
                            .reduce((metricAcc, key) => ({
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
                        byType: Object.entries(curr.updateErrors.byType).reduce((typeAcc, [type, count]) => ({
                            ...typeAcc,
                            [type]: (acc.updateErrors.byType[type] || 0) + count
                        }), acc.updateErrors.byType),
                        averageRetries: (acc.updateErrors.averageRetries + curr.updateErrors.averageRetries) / 2
                    },
                    systemMetrics: mergeSystemMetrics(acc.systemMetrics, curr.systemMetrics)
                }), results[0]);
                // Calculate pagination metadata
                const totalPages = Math.ceil(totalItems / pagination.pageSize);
                const paginationMetadata = {
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
                // Update pool stats after processing
                const updatedStats = workerPool.getStats();
                setPoolStats({
                    totalWorkers: updatedStats.totalWorkers,
                    activeWorkers: updatedStats.activeWorkers,
                    queuedTasks: updatedStats.queuedTasks,
                    performance: {
                        currentMemoryUsage: updatedStats.performance.currentMemoryUsage,
                        currentCpuUsage: updatedStats.performance.currentCpuUsage,
                        averageExecutionTime: updatedStats.performance.averageExecutionTime,
                        successRate: updatedStats.performance.successRate
                    }
                });
                // Cache the processed data
                await telemetryCache_1.telemetryCache.cacheProcessedData({ categories, dateRange, pagination: { page: currentPage, pageSize: pagination.pageSize } }, finalResult);
                // Cache raw data for future use
                await telemetryCache_1.telemetryCache.cacheRawData(paginatedData);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to process data'));
            }
            finally {
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
const mergeErrorTrends = (trends1, trends2) => {
    const trendMap = new Map();
    [...trends1, ...trends2].forEach(trend => {
        trendMap.set(trend.date, (trendMap.get(trend.date) || 0) + trend.errors);
    });
    return Array.from(trendMap.entries())
        .map(([date, errors]) => ({ date, errors }))
        .sort((a, b) => a.date.localeCompare(b.date));
};
// Helper function to merge system metrics
const mergeSystemMetrics = (metrics1, metrics2) => {
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
const mergeCounts = (obj1, obj2) => {
    const result = { ...obj1 };
    Object.entries(obj2).forEach(([key, value]) => {
        result[key] = (result[key] || 0) + value;
    });
    return result;
};
exports.default = useDataProcessor;
