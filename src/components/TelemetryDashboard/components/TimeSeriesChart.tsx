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
import ChartSkeleton from './ChartSkeleton';

interface CategoryFilters {
  [key: string]: boolean;
}

interface TimeSeriesChartProps {
  data: Array<{
    [key: string]: string | number;
  }>;
  loading?: boolean;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  xAxisKey?: string;
  categories: CategoryFilters;
  isDarkMode?: boolean;
}

const CATEGORY_COLORS = {
  total: '#8884d8',
  error: '#ff0000',
  navigation: '#00ff00'
};

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  loading = false,
  title,
  className = '',
  width = 600,
  height = 400,
  xAxisKey = 'date',
  categories,
  isDarkMode = false
}) => {
  if (loading) {
    return <ChartSkeleton width={width} height={height} className={className} />;
  }

  const activeCategories = Object.entries(categories)
    .filter(([_, isActive]) => isActive)
    .map(([category]) => category);

  // Always show total if no categories are selected
  if (activeCategories.length === 0) {
    activeCategories.push('total');
  }

  return (
    <div className={`${className}`} style={{ width, height }}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height - (title ? 40 : 0)}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className={isDarkMode ? 'stroke-gray-700' : 'stroke-gray-200'}
          />
          <XAxis
            dataKey={xAxisKey}
            className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? 'rgba(26, 32, 44, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              border: isDarkMode ? '1px solid #4a5568' : '1px solid #e2e8f0',
              borderRadius: '4px',
              color: isDarkMode ? '#e2e8f0' : '#1a202c'
            }}
            labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#4a5568' }}
          />
          <Legend />
          {activeCategories.map((category) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              name={category.charAt(0).toUpperCase() + category.slice(1)}
              stroke={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;
