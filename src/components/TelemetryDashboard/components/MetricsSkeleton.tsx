import React from 'react';

interface MetricsSkeletonProps {
  className?: string;
}

export const MetricsSkeleton: React.FC<MetricsSkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse ${className}`}
      role="status"
      aria-label="Loading metrics"
    >
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          data-testid="metric-skeleton"
        >
          {/* Metric title */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
          
          {/* Metric value */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
          
          {/* Metric change indicator */}
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsSkeleton;
