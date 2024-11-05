import React, { useRef, useEffect } from 'react';
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
import { useChartVirtualization } from '../hooks/useChartVirtualization';
import type { CategoryFilters } from '../types';

// Import from ProcessedTelemetryData type
interface TimeSeriesData {
  date: string;
  total?: number;
  error?: number;
  navigation?: number;
  [key: string]: string | number | undefined;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
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
} as const;

const POINT_WIDTH = 50; // Width per data point in pixels
const OVERSCAN_COUNT = 5; // Number of extra points to render on each side

const arePropsEqual = (prevProps: TimeSeriesChartProps, nextProps: TimeSeriesChartProps): boolean => {
  // Check data array length and content
  if (prevProps.data.length !== nextProps.data.length) return false;
  if (JSON.stringify(prevProps.data) !== JSON.stringify(nextProps.data)) return false;

  // Check loading state
  if (prevProps.loading !== nextProps.loading) return false;

  // Check categories object
  if (JSON.stringify(prevProps.categories) !== JSON.stringify(nextProps.categories)) return false;

  // Check dimensions
  if (prevProps.width !== nextProps.width || prevProps.height !== nextProps.height) return false;

  // Check dark mode
  if (prevProps.isDarkMode !== nextProps.isDarkMode) return false;

  // If all checks pass, props are considered equal
  return true;
};

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = React.memo(({
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const wheelTimeout = useRef<NodeJS.Timeout>();

  const {
    containerRef,
    visibleData,
    totalWidth,
    scrollLeft,
    scale,
    handleScroll,
    handleZoom
  } = useChartVirtualization({
    data,
    width,
    pointWidth: POINT_WIDTH,
    overscanCount: OVERSCAN_COUNT
  });

  // Handle wheel events for zooming
  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY * -0.01;
      const newScale = scale + delta;
      handleZoom(newScale);
    }

    // Clear existing timeout
    if (wheelTimeout.current) {
      clearTimeout(wheelTimeout.current);
    }

    // Set new timeout
    wheelTimeout.current = setTimeout(() => {
      if (scrollContainerRef.current) {
        handleScroll(scrollContainerRef.current.scrollLeft);
      }
    }, 150);
  };

  // Handle scroll events
  const handleScrollEvent = (event: React.UIEvent<HTMLDivElement>) => {
    handleScroll(event.currentTarget.scrollLeft);
  };

  // Setup event listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }
    };
  }, [scale]);

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
    <div className={`${className}`} style={{ width, height }} ref={containerRef}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">{title}</h3>
      )}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto"
        style={{
          width: '100%',
          height: height - (title ? 40 : 0),
          overscrollBehavior: 'none'
        }}
        onScroll={handleScrollEvent}
      >
        <div
          ref={chartContainerRef}
          style={{
            width: `${totalWidth}px`,
            height: '100%'
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visibleData as TimeSeriesData[]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <clipPath id="chartArea">
                  <rect x="0" y="0" width="100%" height="100%" />
                </clipPath>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className={isDarkMode ? 'stroke-gray-700' : 'stroke-gray-200'}
              />
              <XAxis
                dataKey={xAxisKey}
                className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                tick={{ fontSize: 12 }}
                scale="point"
                interval="preserveStartEnd"
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
                  stroke={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#000000'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false} // Disable animations for better performance
                  clipPath="url(#chartArea)"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}, arePropsEqual);

export default TimeSeriesChart;
