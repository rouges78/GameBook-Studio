import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ErrorAnalysisProps, PIE_CHART_COLORS } from '../types';

export const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({
  errorPatterns,
  updateErrors,
  isDarkMode
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Error Trends Chart */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h2 className="text-xl font-semibold mb-3">Error Trends</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorPatterns.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4a5568' : '#e2e8f0'} />
              <XAxis
                dataKey="date"
                stroke={isDarkMode ? '#e2e8f0' : '#4a5568'}
                tick={{ fill: isDarkMode ? '#e2e8f0' : '#4a5568' }}
              />
              <YAxis
                stroke={isDarkMode ? '#e2e8f0' : '#4a5568'}
                tick={{ fill: isDarkMode ? '#e2e8f0' : '#4a5568' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                  border: '1px solid #cbd5e0',
                  color: isDarkMode ? '#e2e8f0' : '#4a5568'
                }}
              />
              <Bar dataKey="errors" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Impact Analysis */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h2 className="text-xl font-semibold mb-3">Error Impact Analysis</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={errorPatterns.correlations}
                dataKey="impact"
                nameKey="pattern"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {errorPatterns.correlations.map((_, index) => (
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

      {/* Update Errors Summary */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} md:col-span-2`}>
        <h2 className="text-xl font-semibold mb-3">Update Errors Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Total Errors</h3>
            <p className="text-2xl">{updateErrors.total}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Average Retries</h3>
            <p className="text-2xl">{updateErrors.averageRetries.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Error Types</h3>
            <div className="space-y-1">
              {Object.entries(updateErrors.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
