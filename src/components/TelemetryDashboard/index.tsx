import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

interface TelemetryEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  appVersion: string;
  platform: string;
  arch: string;
}

interface TelemetryStats {
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
}

export const TelemetryDashboard: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTelemetryData = async () => {
      try {
        setIsLoading(true);
        const events = await ipcRenderer.invoke('get-telemetry-data');
        
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
          }
        };

        let totalRetries = 0;
        let errorCount = 0;

        events.forEach((event: TelemetryEvent) => {
          // Update event categories
          stats.eventsByCategory[event.category] = (stats.eventsByCategory[event.category] || 0) + 1;

          // Track time range
          stats.timeRange.start = Math.min(stats.timeRange.start, event.timestamp);
          stats.timeRange.end = Math.max(stats.timeRange.end, event.timestamp);

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
        });

        // Calculate average retries
        stats.updateErrors.averageRetries = errorCount > 0 ? totalRetries / errorCount : 0;

        setStats(stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load telemetry data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTelemetryData();
  }, []);

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

  if (!stats) {
    return (
      <div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        No telemetry data available
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
      <h1 className="text-2xl font-bold mb-6">Telemetry Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overview Card */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <p>Total Events: {stats.totalEvents}</p>
          <p>Time Range: {new Date(stats.timeRange.start).toLocaleDateString()} - {new Date(stats.timeRange.end).toLocaleDateString()}</p>
        </div>

        {/* Update Errors Card */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-3">Update Errors</h2>
          <p>Total Errors: {stats.updateErrors.total}</p>
          <p>Average Retries: {stats.updateErrors.averageRetries.toFixed(2)}</p>
          <div className="mt-2">
            <h3 className="font-semibold mb-2">Error Types:</h3>
            {Object.entries(stats.updateErrors.byType).map(([type, count]) => (
              <p key={type}>{type}: {count}</p>
            ))}
          </div>
        </div>

        {/* Events by Category Card */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h2 className="text-xl font-semibold mb-3">Events by Category</h2>
          {Object.entries(stats.eventsByCategory).map(([category, count]) => (
            <p key={category}>{category}: {count}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
