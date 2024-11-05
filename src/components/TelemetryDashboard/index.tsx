import React, { useEffect, useState } from 'react';
import type { TelemetryEvent } from '../../types/electron';
import {
  DateRangeFilters,
  CategoryFilters,
  ErrorAnalysis,
  SystemMetrics,
  TimeSeriesChart
} from './components';
import type { TelemetryStats, DateRange, CategoryFilters as CategoryFiltersType } from './types';

export const TelemetryDashboard: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const [filteredStats, setFilteredStats] = useState<TelemetryStats | null>(null);
  const [categoryFilters, setCategoryFilters] = useState<CategoryFiltersType>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePresetRange = (days: number) => {
    if (!stats) return;
    
    const end = new Date();
    const start = days === 0 
      ? new Date(stats.timeRange.start)
      : new Date(end.getTime() - (days * 24 * 60 * 60 * 1000));

    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setCategoryFilters(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleExport = () => {
    if (!filteredStats) return;

    const csvContent = [
      // Headers
      ['Date', ...Object.keys(filteredStats.eventsByCategory), 'Total'].join(','),
      // Data rows
      ...filteredStats.timeSeriesData.map(entry => {
        const values = [
          entry.date,
          ...Object.keys(filteredStats.eventsByCategory).map(category => entry[category] || 0),
          entry.total
        ];
        return values.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `telemetry_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    const loadTelemetryData = async () => {
      try {
        setIsLoading(true);
        const events = await window.electron['telemetry:getData']();
        
        if (!Array.isArray(events)) {
          throw new Error('Invalid telemetry data format');
        }

        const stats: TelemetryStats = {
          totalEvents: events.length,
          eventsByCategory: {},
          updateErrors: {
            total: 0,
            byType: {},
            averageRetries: 0
          },
          timeRange: {
            start: Number.MAX_SAFE_INTEGER,
            end: 0
          },
          timeSeriesData: [],
          rawEvents: events,
          systemMetrics: {
            byPlatform: {},
            byVersion: {},
            byArch: {},
            performance: {
              avgResponseTime: 0,
              errorRate: 0,
              totalCrashes: 0
            }
          },
          errorPatterns: {
            correlations: [],
            trends: []
          }
        };

        let totalRetries = 0;
        let errorCount = 0;
        let totalResponseTime = 0;
        let responseTimeCount = 0;

        // Create a map to store daily events and errors
        const dailyEvents: Record<string, Record<string, number>> = {};
        const dailyErrors: Record<string, number> = {};

        events.forEach((event: TelemetryEvent) => {
          // Update event categories
          stats.eventsByCategory[event.category] = (stats.eventsByCategory[event.category] || 0) + 1;

          // Track time range
          stats.timeRange.start = Math.min(stats.timeRange.start, event.timestamp);
          stats.timeRange.end = Math.max(stats.timeRange.end, event.timestamp);

          // Update system metrics
          stats.systemMetrics.byPlatform[event.platform] = (stats.systemMetrics.byPlatform[event.platform] || 0) + 1;
          stats.systemMetrics.byVersion[event.appVersion] = (stats.systemMetrics.byVersion[event.appVersion] || 0) + 1;
          stats.systemMetrics.byArch[event.arch] = (stats.systemMetrics.byArch[event.arch] || 0) + 1;

          // Track errors and performance
          if (event.category === 'error' || event.action === 'error') {
            errorCount++;
            const date = new Date(event.timestamp).toISOString().split('T')[0];
            dailyErrors[date] = (dailyErrors[date] || 0) + 1;

            if (event.metadata?.type === 'crash') {
              stats.systemMetrics.performance.totalCrashes++;
            }
          }

          if (event.metadata?.responseTime) {
            totalResponseTime += event.metadata.responseTime;
            responseTimeCount++;
          }

          // Track update errors
          if (event.category === 'auto-update' && event.action === 'error') {
            stats.updateErrors.total++;
            const errorType = event.metadata?.errorType || 'unknown';
            stats.updateErrors.byType[errorType] = (stats.updateErrors.byType[errorType] || 0) + 1;
            
            if (event.metadata?.attemptNumber) {
              totalRetries += event.metadata.attemptNumber;
              errorCount++;
            }
          }

          // Group events by day for time series
          const date = new Date(event.timestamp).toISOString().split('T')[0];
          if (!dailyEvents[date]) {
            dailyEvents[date] = {};
          }
          if (!dailyEvents[date][event.category]) {
            dailyEvents[date][event.category] = 0;
          }
          dailyEvents[date][event.category]++;
        });

        // Calculate performance metrics
        stats.systemMetrics.performance.avgResponseTime = responseTimeCount > 0 
          ? totalResponseTime / responseTimeCount 
          : 0;
        stats.systemMetrics.performance.errorRate = events.length > 0 
          ? (errorCount / events.length) * 100 
          : 0;

        // Convert daily events to time series data
        stats.timeSeriesData = Object.entries(dailyEvents)
          .map(([date, categories]) => ({
            date,
            total: Object.values(categories).reduce((sum, count) => sum + count, 0),
            ...categories
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Convert daily errors to trends
        stats.errorPatterns.trends = Object.entries(dailyErrors)
          .map(([date, count]) => ({
            date,
            errors: count
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Analyze error patterns and correlations
        const patterns = events
          .filter(event => event.category === 'error' || event.action === 'error')
          .reduce((acc: Record<string, { count: number; impact: number }>, event) => {
            const pattern = `${event.category}:${event.action}${event.metadata?.errorType ? ':' + event.metadata.errorType : ''}`;
            if (!acc[pattern]) {
              acc[pattern] = { count: 0, impact: 0 };
            }
            acc[pattern].count++;
            acc[pattern].impact += event.metadata?.severity || 1;
            return acc;
          }, {});

        stats.errorPatterns.correlations = Object.entries(patterns)
          .map(([pattern, data]) => ({
            pattern,
            count: data.count,
            impact: data.impact / data.count
          }))
          .sort((a, b) => b.impact - a.impact)
          .slice(0, 5);

        // Calculate average retries
        stats.updateErrors.averageRetries = errorCount > 0 ? totalRetries / errorCount : 0;

        // Initialize category filters
        const initialFilters: CategoryFiltersType = {};
        Object.keys(stats.eventsByCategory).forEach(category => {
          initialFilters[category] = true;
        });
        setCategoryFilters(initialFilters);

        setStats(stats);
        setFilteredStats(stats);
        
        // Set initial date range if not set
        if (!dateRange.startDate || !dateRange.endDate) {
          handlePresetRange(30); // Default to last 30 days
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load telemetry data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTelemetryData();
  }, []);

  useEffect(() => {
    if (!stats || !dateRange.startDate || !dateRange.endDate) return;

    const startTimestamp = new Date(dateRange.startDate).getTime();
    const endTimestamp = new Date(dateRange.endDate).getTime() + (24 * 60 * 60 * 1000 - 1);

    // Filter events based on search term and date range
    const searchFilteredEvents = stats.rawEvents?.filter(event => {
      const isInDateRange = event.timestamp >= startTimestamp && event.timestamp <= endTimestamp;
      if (!isInDateRange) return false;
      
      if (!debouncedSearchTerm) return true;
      
      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        event.category.toLowerCase().includes(searchLower) ||
        event.action.toLowerCase().includes(searchLower) ||
        (event.metadata && JSON.stringify(event.metadata).toLowerCase().includes(searchLower))
      );
    }) || [];

    // Create filtered stats object
    const filtered: TelemetryStats = {
      ...stats,
      totalEvents: searchFilteredEvents.length,
      eventsByCategory: {},
      timeRange: {
        start: startTimestamp,
        end: endTimestamp
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
      },
      errorPatterns: {
        correlations: [],
        trends: []
      }
    };

    let errorCount = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    const dailyErrors: Record<string, number> = {};

    // Process filtered events
    searchFilteredEvents.forEach(event => {
      if (categoryFilters[event.category]) {
        filtered.eventsByCategory[event.category] = (filtered.eventsByCategory[event.category] || 0) + 1;
        
        filtered.systemMetrics.byPlatform[event.platform] = (filtered.systemMetrics.byPlatform[event.platform] || 0) + 1;
        filtered.systemMetrics.byVersion[event.appVersion] = (filtered.systemMetrics.byVersion[event.appVersion] || 0) + 1;
        filtered.systemMetrics.byArch[event.arch] = (filtered.systemMetrics.byArch[event.arch] || 0) + 1;

        if (event.category === 'error' || event.action === 'error') {
          errorCount++;
          const date = new Date(event.timestamp).toISOString().split('T')[0];
          dailyErrors[date] = (dailyErrors[date] || 0) + 1;

          if (event.metadata?.type === 'crash') {
            filtered.systemMetrics.performance.totalCrashes++;
          }
        }

        if (event.metadata?.responseTime) {
          totalResponseTime += event.metadata.responseTime;
          responseTimeCount++;
        }
      }
    });

    // Calculate filtered performance metrics
    filtered.systemMetrics.performance.avgResponseTime = responseTimeCount > 0 
      ? totalResponseTime / responseTimeCount 
      : 0;
    filtered.systemMetrics.performance.errorRate = searchFilteredEvents.length > 0 
      ? (errorCount / searchFilteredEvents.length) * 100 
      : 0;

    // Convert daily errors to trends
    filtered.errorPatterns.trends = Object.entries(dailyErrors)
      .map(([date, count]) => ({
        date,
        errors: count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Create time series data
    const dailyEvents: Record<string, Record<string, number>> = {};
    searchFilteredEvents.forEach(event => {
      if (categoryFilters[event.category]) {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        if (!dailyEvents[date]) {
          dailyEvents[date] = {};
        }
        if (!dailyEvents[date][event.category]) {
          dailyEvents[date][event.category] = 0;
        }
        dailyEvents[date][event.category]++;
      }
    });

    filtered.timeSeriesData = Object.entries(dailyEvents)
      .map(([date, categories]) => ({
        date,
        total: Object.values(categories).reduce((sum, count) => sum + count, 0),
        ...categories
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setFilteredStats(filtered);
  }, [stats, dateRange, categoryFilters, debouncedSearchTerm]);

  if (isLoading) {
    return (
      <div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Loading telemetry data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!filteredStats) {
    return (
      <div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        No telemetry data available
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Telemetry Dashboard</h1>
        <button
          onClick={handleExport}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Export CSV
        </button>
      </div>

      {/* Filters Section */}
      <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h2 className="text-xl font-semibold mb-3">Filters</h2>
        
        <DateRangeFilters
          dateRange={dateRange}
          onDateChange={handleDateChange}
          onPresetSelect={handlePresetRange}
          minDate={stats ? new Date(stats.timeRange.start).toISOString().split('T')[0] : undefined}
          maxDate={stats ? new Date(stats.timeRange.end).toISOString().split('T')[0] : undefined}
          isDarkMode={isDarkMode}
        />

        <CategoryFilters
          categories={categoryFilters}
          onToggle={handleCategoryToggle}
          isDarkMode={isDarkMode}
        />

        {/* Search Input */}
        <div>
          <label className="block mb-2">Search Events</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by category, action, or metadata..."
            className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-800'}`}
          />
        </div>
      </div>

      {/* Overview Section */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
        <h2 className="text-xl font-semibold mb-3">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-lg">Total Events: {filteredStats.totalEvents}</p>
            <p className="text-lg">
              Time Range: {new Date(filteredStats.timeRange.start).toLocaleDateString()} - {new Date(filteredStats.timeRange.end).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <TimeSeriesChart
        data={filteredStats.timeSeriesData}
        categories={categoryFilters}
        isDarkMode={isDarkMode}
      />

      {/* Error Analysis */}
      <ErrorAnalysis
        errorPatterns={filteredStats.errorPatterns}
        updateErrors={filteredStats.updateErrors}
        isDarkMode={isDarkMode}
      />

      {/* System Metrics */}
      <SystemMetrics
        metrics={filteredStats.systemMetrics}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
