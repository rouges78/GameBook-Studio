import React from 'react';
import { CategoryFiltersProps } from '../types';

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  onToggle,
  isDarkMode
}) => {
  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Event Categories</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(categories).map(([category, isEnabled]) => (
          <button
            key={category}
            onClick={() => onToggle(category)}
            className={`px-3 py-1 rounded-full text-sm ${
              isEnabled
                ? isDarkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : isDarkMode
                ? 'bg-gray-600 text-gray-400'
                : 'bg-gray-300 text-gray-600'
            }`}
            title={`${isEnabled ? 'Hide' : 'Show'} ${category} events`}
            aria-pressed={isEnabled}
          >
            <span className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isEnabled ? 'bg-white' : 'bg-gray-400'}`} />
              {category}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Click a category to toggle its visibility in the charts
      </div>
    </div>
  );
};
