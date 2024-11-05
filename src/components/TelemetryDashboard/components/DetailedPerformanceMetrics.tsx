import React, { useMemo } from 'react';
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
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

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

interface PerformanceData {
  timestamp: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

interface DetailedPerformanceMetricsProps {
  data: PerformanceData[];
  isDarkMode: boolean;
}

interface TrendAnalysis {
  metric: string;
  current: number;
  trend: 'up' | 'down' | 'stable';
  prediction: number;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
}

const calculateTrend = (values: number[]): 'up' | 'down' | 'stable' => {
  if (values.length < 2) return 'stable';
  const recentValues = values.slice(-5);
  const avgChange = recentValues.slice(1).reduce((acc, curr, idx) => 
    acc + (curr - recentValues[idx]), 0) / (recentValues.length - 1);
  
  if (Math.abs(avgChange) < 0.05) return 'stable';
  return avgChange > 0 ? 'up' : 'down';
};

const predictNextValue = (values: number[]): number => {
  if (values.length < 2) return values[values.length - 1] || 0;
  const recentValues = values.slice(-5);
  const avgChange = recentValues.slice(1).reduce((acc, curr, idx) => 
    acc + (curr - recentValues[idx]), 0) / (recentValues.length - 1);
  return recentValues[recentValues.length - 1] + avgChange;
};

const getMetricStatus = (current: number, threshold: number, isInverse: boolean = false): 'healthy' | 'warning' | 'critical' => {
  const percentage = isInverse ? (threshold - current) / threshold : current / threshold;
  if (percentage < 0.7) return 'healthy';
  if (percentage < 0.9) return 'warning';
  return 'critical';
};

export const DetailedPerformanceMetrics: React.FC<DetailedPerformanceMetricsProps> = ({
  data,
  isDarkMode
}) => {
  const trendAnalysis = useMemo((): TrendAnalysis[] => {
    if (!data.length) return [];

    const responseTimeValues = data.map(d => d.responseTime);
    const cpuValues = data.map(d => d.cpuUsage);
    const memoryValues = data.map(d => d.memoryUsage);
    const errorRateValues = data.map(d => d.errorRate);

    return [
      {
        metric: 'Response Time',
        current: responseTimeValues[responseTimeValues.length - 1],
        trend: calculateTrend(responseTimeValues),
        prediction: predictNextValue(responseTimeValues),
        threshold: 1000, // 1 second
        status: getMetricStatus(responseTimeValues[responseTimeValues.length - 1], 1000)
      },
      {
        metric: 'CPU Usage',
        current: cpuValues[cpuValues.length - 1],
        trend: calculateTrend(cpuValues),
        prediction: predictNextValue(cpuValues),
        threshold: 90, // 90%
        status: getMetricStatus(cpuValues[cpuValues.length - 1], 90)
      },
      {
        metric: 'Memory Usage',
        current: memoryValues[memoryValues.length - 1],
        trend: calculateTrend(memoryValues),
        prediction: predictNextValue(memoryValues),
        threshold: 85, // 85%
        status: getMetricStatus(memoryValues[memoryValues.length - 1], 85)
      },
      {
        metric: 'Error Rate',
        current: errorRateValues[errorRateValues.length - 1],
        trend: calculateTrend(errorRateValues),
        prediction: predictNextValue(errorRateValues),
        threshold: 5, // 5%
        status: getMetricStatus(errorRateValues[errorRateValues.length - 1], 5)
      }
    ];
  }, [data]);

  const chartData = useMemo(() => {
    const labels = data.map(d => new Date(d.timestamp).toLocaleTimeString());
    return {
      labels,
      datasets: [
        {
          label: 'Response Time (ms)',
          data: data.map(d => d.responseTime),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        },
        {
          label: 'CPU Usage (%)',
          data: data.map(d => d.cpuUsage),
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Memory Usage (%)',
          data: data.map(d => d.memoryUsage),
          borderColor: 'rgb(153, 102, 255)',
          tension: 0.1
        },
        {
          label: 'Error Rate (%)',
          data: data.map(d => d.errorRate),
          borderColor: 'rgb(255, 159, 64)',
          tension: 0.1
        }
      ]
    };
  }, [data]);

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#666'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#666'
        }
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#666'
        }
      }
    }
  };

  const circuitBreakerState = data[data.length - 1]?.circuitBreakerState || 'CLOSED';

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Detailed Performance Metrics
      </h2>

      {/* Circuit Breaker Status */}
      <div className={`mb-6 p-4 rounded-lg ${
        circuitBreakerState === 'CLOSED' ? 'bg-green-100 dark:bg-green-900' :
        circuitBreakerState === 'HALF_OPEN' ? 'bg-yellow-100 dark:bg-yellow-900' :
        'bg-red-100 dark:bg-red-900'
      }`}>
        <h3 className="text-lg font-medium mb-2">Circuit Breaker Status: {circuitBreakerState}</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {circuitBreakerState === 'CLOSED' ? 'System is operating normally' :
           circuitBreakerState === 'HALF_OPEN' ? 'System is testing recovery' :
           'System is preventing cascading failures'}
        </p>
      </div>

      {/* Trend Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {trendAnalysis.map((analysis) => (
          <div
            key={analysis.metric}
            className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {analysis.metric}
              </h3>
              {analysis.status === 'critical' && (
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className={`text-2xl font-bold mb-2 ${
              analysis.status === 'healthy' ? 'text-green-500' :
              analysis.status === 'warning' ? 'text-yellow-500' :
              'text-red-500'
            }`}>
              {analysis.current.toFixed(1)}
            </div>
            <div className="flex items-center space-x-2">
              {analysis.trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
              ) : analysis.trend === 'down' ? (
                <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
              ) : null}
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Predicted: {analysis.prediction.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default DetailedPerformanceMetrics;
