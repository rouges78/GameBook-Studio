"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryFilters = void 0;
const react_1 = __importStar(require("react"));
const react_window_1 = require("react-window");
const FiltersSkeleton_1 = __importDefault(require("./FiltersSkeleton"));
const ITEM_HEIGHT = 32; // Height of each category row
const LIST_HEIGHT = 300; // Maximum height of the virtualized list
const LIST_WIDTH = '100%';
const CategoryRow = ({ index, style, data }) => {
    const [category, isChecked] = data.categories[index];
    return (<div style={style} className="flex items-center gap-2 px-1">
      <input type="checkbox" id={`category-${category}`} checked={isChecked} onChange={() => data.handleChange(category)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600"/>
      <label htmlFor={`category-${category}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
        {category}
      </label>
    </div>);
};
const CategoryFilters = ({ categories, onToggle, onCategoryChange, loading = false, isDarkMode = false, className = '' }) => {
    const handleChange = (0, react_1.useCallback)((category) => {
        if (onCategoryChange) {
            onCategoryChange(category);
        }
        if (onToggle) {
            onToggle(category);
        }
    }, [onCategoryChange, onToggle]);
    const categoriesArray = (0, react_1.useMemo)(() => Object.entries(categories), [categories]);
    const itemData = (0, react_1.useMemo)(() => ({
        categories: categoriesArray,
        handleChange,
        isDarkMode
    }), [categoriesArray, handleChange, isDarkMode]);
    if (loading) {
        return <FiltersSkeleton_1.default className={className}/>;
    }
    return (<div className={`space-y-4 ${className}`} role="region" aria-label="Category filters">
      <h3 className="text-lg font-semibold dark:text-gray-200">Categories</h3>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg" style={{ height: LIST_HEIGHT }}>
        <react_window_1.FixedSizeList height={LIST_HEIGHT} width={LIST_WIDTH} itemCount={categoriesArray.length} itemSize={ITEM_HEIGHT} itemData={itemData} className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {CategoryRow}
        </react_window_1.FixedSizeList>
      </div>
    </div>);
};
exports.CategoryFilters = CategoryFilters;
exports.default = react_1.default.memo(exports.CategoryFilters);
