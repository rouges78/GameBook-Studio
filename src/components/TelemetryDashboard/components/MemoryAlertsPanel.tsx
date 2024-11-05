import React, { useEffect, useState, useMemo } from 'react';
import { useMemoryAlerts } from '../hooks/useMemoryAlerts';
import { MemoryAlertLevel } from '../utils/memoryAlertManager';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MAX_MEMORY_POINTS = 20;

export const MemoryAlertsPanel: React.FC = () => {
  const { alerts, currentMemoryStatus, thresholds, clearAlertHistory } = useMemoryAlerts();
  const [memoryHistory, setMemoryHistory] = useState<{ timestamp: number; usage: number; percentage: number }[]>([]);
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false);

  useEffect(() => {
    // Update memory history when new alerts come in
    if (alerts.length > 0) {
      const latestAlert = alerts[0];
      setMemoryHistory(prev => {
        const newHistory = [...prev, {
          timestamp: latestAlert.timestamp,
          usage: latestAlert.memoryUsage,
          percentage: latestAlert.memoryPercentage
        }];
        return newHistory.slice(-MAX_MEMORY_POINTS);
      });
    }
  }, [alerts]);

  const getAlertLevelColor = (level: MemoryAlertLevel) => {
    switch (level) {
      case MemoryAlertLevel.NORMAL: return 'bg-green-100 text-green-800';
      case MemoryAlertLevel.WARNING: return 'bg-yellow-100 text-yellow-800';
      case MemoryAlertLevel.CRITICAL: return 'bg-orange-100 text-orange-800';
      case MemoryAlertLevel.MAXIMUM: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMemoryUsage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate memory usage trend
  const trendAnalysis = useMemo(() => {
    if (memoryHistory.length < 2) return null;

    const recentPoints = memoryHistory.slice(-5);
    const firstPoint = recentPoints[0].percentage;
    const lastPoint = recentPoints[recentPoints.length - 1].percentage;
    const trend = lastPoint - firstPoint;

    return {
      percentage: trend.toFixed(1),
      direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      color: trend > 5 ? 'text-red-500' : trend < -5 ? 'text-green-500' : 'text-yellow-500'
    };
  }, [memoryHistory]);

  // Chart data
  const chartData = {
    labels: memoryHistory.map(point => new Date(point.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Memory Usage (%)',
        data: memoryHistory.map(point => point.percentage),
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Memory: ${context.raw.toFixed(1)}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Memory Usage (%)'
        }
      }
    },
    animation: {
      duration: 0
    }
  };

  return (
    <div className="memory-alerts-panel p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Memory Alerts</h2>
        <div className={`px-3 py-1 rounded-full text-sm ${getAlertLevelColor(currentMemoryStatus.level)}`}>
          {currentMemoryStatus.percentage.toFixed(1)}% Used
        </div>
      </div>

      {/* Threshold Indicators */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="text-sm text-yellow-700">Warning</div>
          <div className="font-bold text-yellow-800">{thresholds.warning}%</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded">
          <div className="text-sm text-orange-700">Critical</div>
          <div className="font-bold text-orange-800">{thresholds.critical}%</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-sm text-red-700">Maximum</div>
          <div className="font-bold text-red-800">{thresholds.maximum}%</div>
        </div>
      </div>

      {/* Memory Usage Chart */}
      {memoryHistory.length > 0 && (
        <div className="mb-4">
          <div className="h-48">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          {/* Trend Analysis */}
          {trendAnalysis && (
            <div className="mt-2 text-sm">
              <button
                onClick={() => setShowTrendAnalysis(!showTrendAnalysis)}
                className="text-blue-500 hover:text-blue-700 underline"
                data-testid="trend-analysis-button"
              >
                {showTrendAnalysis ? 'Hide Trend Analysis' : 'Show Trend Analysis'}
              </button>
              
              {showTrendAnalysis && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p>
                    Memory usage is{' '}
                    <span className={trendAnalysis.color}>
                      {trendAnalysis.direction} ({trendAnalysis.percentage}%)
                    </span>
                  </p>
                  {Math.abs(parseFloat(trendAnalysis.percentage)) > 5 && (
                    <p className="mt-1 text-gray-600">
                      {parseFloat(trendAnalysis.percentage) > 5
                        ? 'Consider investigating high memory usage'
                        : 'Memory usage is improving'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center">No memory alerts</p>
      ) : (
        <>
          <div className="max-h-64 overflow-y-auto">
            {alerts.map((alert, index) => (
              <div 
                key={index} 
                className={`mb-2 p-3 rounded-lg ${getAlertLevelColor(alert.level)}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{alert.message}</span>
                  <span className="text-sm text-gray-600">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
                <div className="text-sm mt-1">
                  Memory Usage: {formatMemoryUsage(alert.memoryUsage)} ({alert.memoryPercentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={clearAlertHistory}
            className="mt-4 w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg transition-colors"
            aria-label="Clear Alert History"
          >
            Clear Alert History
          </button>
        </>
      )}
    </div>
  );
};
