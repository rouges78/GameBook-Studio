import React from 'react';
import FiltersSkeleton from './FiltersSkeleton';

interface CategoryFilters {
  [key: string]: boolean;
}

interface CategoryFiltersProps {
  categories: CategoryFilters;
  onToggle?: (category: string) => void;
  onCategoryChange?: (category: string) => void;
  loading?: boolean;
  isDarkMode?: boolean;
  className?: string;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  onToggle,
  onCategoryChange,
  loading = false,
  isDarkMode = false,
  className = ''
}) => {
  const handleChange = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    if (onToggle) {
      onToggle(category);
    }
  };

  if (loading) {
    return <FiltersSkeleton className={className} />;
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Category filters">
      <h3 className="text-lg font-semibold dark:text-gray-200">Categories</h3>
      <div className="space-y-3">
        {Object.entries(categories).map(([category, isChecked]) => (
          <div key={category} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`category-${category}`}
              checked={isChecked}
              onChange={() => handleChange(category)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600"
            />
            <label
              htmlFor={`category-${category}`}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
            >
              {category}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilters;
