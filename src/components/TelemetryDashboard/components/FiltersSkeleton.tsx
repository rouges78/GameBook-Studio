import React from 'react';

interface FiltersSkeletonProps {
  className?: string;
}

export const FiltersSkeleton: React.FC<FiltersSkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="Loading filters">
      {/* Date range filters skeleton */}
      <div className="mb-6" data-testid="date-range-skeleton">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" data-testid="section-title-skeleton"></div>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" data-testid="date-input-skeleton"></div>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" data-testid="date-input-skeleton"></div>
          </div>
        </div>
      </div>

      {/* Category filters skeleton */}
      <div data-testid="category-filters-skeleton">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-3" data-testid="section-title-skeleton"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div 
                className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" 
                data-testid="category-checkbox-skeleton"
              ></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiltersSkeleton;
