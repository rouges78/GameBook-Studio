import React, { useCallback, useMemo } from 'react';
import { FixedSizeList } from 'react-window';
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

interface ItemData {
  categories: [string, boolean][];
  handleChange: (category: string) => void;
  isDarkMode: boolean;
}

const ITEM_HEIGHT = 32; // Height of each category row
const LIST_HEIGHT = 300; // Maximum height of the virtualized list
const LIST_WIDTH = '100%';

const CategoryRow: React.FC<{
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}> = ({ index, style, data }) => {
  const [category, isChecked] = data.categories[index];
  
  return (
    <div style={style} className="flex items-center gap-2 px-1">
      <input
        type="checkbox"
        id={`category-${category}`}
        checked={isChecked}
        onChange={() => data.handleChange(category)}
        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600"
      />
      <label
        htmlFor={`category-${category}`}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize"
      >
        {category}
      </label>
    </div>
  );
};

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  onToggle,
  onCategoryChange,
  loading = false,
  isDarkMode = false,
  className = ''
}) => {
  const handleChange = useCallback((category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    if (onToggle) {
      onToggle(category);
    }
  }, [onCategoryChange, onToggle]);

  const categoriesArray = useMemo(() => 
    Object.entries(categories), [categories]
  );

  const itemData = useMemo(() => ({
    categories: categoriesArray,
    handleChange,
    isDarkMode
  }), [categoriesArray, handleChange, isDarkMode]);

  if (loading) {
    return <FiltersSkeleton className={className} />;
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Category filters">
      <h3 className="text-lg font-semibold dark:text-gray-200">Categories</h3>
      <div 
        className="border border-gray-200 dark:border-gray-700 rounded-lg"
        style={{ height: LIST_HEIGHT }}
      >
        <FixedSizeList
          height={LIST_HEIGHT}
          width={LIST_WIDTH}
          itemCount={categoriesArray.length}
          itemSize={ITEM_HEIGHT}
          itemData={itemData}
          className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
        >
          {CategoryRow}
        </FixedSizeList>
      </div>
    </div>
  );
};

export default React.memo(CategoryFilters);
