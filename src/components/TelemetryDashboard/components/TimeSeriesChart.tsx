import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TimeSeriesChartProps, CHART_COLORS } from '../types';

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  categories,
  isDarkMode
}) => {
  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
      <h2 className="text-xl font-semibold mb-3">Events Over Time</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
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
              formatter={(value: number, name: string) => [
                value,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend
              formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            {Object.entries(categories)
              .filter(([_, isEnabled]) => isEnabled)
              .map(([category]) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  name={category}
                  stroke={CHART_COLORS[category as keyof typeof CHART_COLORS] || '#999999'}
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Click legend items to toggle visibility
      </div>
    </div>
  );
};
