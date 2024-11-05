import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { SystemMetricsProps, PIE_CHART_COLORS } from '../types';

export const SystemMetrics: React.FC<SystemMetricsProps> = ({
  metrics,
  isDarkMode
}) => {
  const formatDistributionData = (data: Record<string, number>) =>
    Object.entries(data).map(([name, value]) => ({
      name,
      value
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Performance Metrics Card */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h2 className="text-xl font-semibold mb-3">Performance Metrics</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Response Time</h3>
            <p className="text-2xl">
              {metrics.performance.avgResponseTime.toFixed(2)}
              <span className="text-sm ml-1">ms</span>
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Error Rate</h3>
            <p className="text-2xl">
              {metrics.performance.errorRate.toFixed(2)}
              <span className="text-sm ml-1">%</span>
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Total Crashes</h3>
            <p className="text-2xl">{metrics.performance.totalCrashes}</p>
          </div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h2 className="text-xl font-semibold mb-3">Platform Distribution</h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatDistributionData(metrics.byPlatform)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {formatDistributionData(metrics.byPlatform).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                  border: '1px solid #cbd5e0',
                  color: isDarkMode ? '#e2e8f0' : '#4a5568'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Version Distribution */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h2 className="text-xl font-semibold mb-3">Version Distribution</h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formatDistributionData(metrics.byVersion)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {formatDistributionData(metrics.byVersion).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                  border: '1px solid #cbd5e0',
                  color: isDarkMode ? '#e2e8f0' : '#4a5568'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Architecture Distribution */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} md:col-span-3`}>
        <h2 className="text-xl font-semibold mb-3">Architecture Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {formatDistributionData(metrics.byArch).map(({ name, value }, index) => (
            <div
              key={name}
              className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
              style={{ borderLeft: `4px solid ${PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}` }}
            >
              <h3 className="font-semibold mb-2">{name}</h3>
              <p className="text-2xl">{value}</p>
              <p className="text-sm text-gray-500">
                {((value / Object.values(metrics.byArch).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
