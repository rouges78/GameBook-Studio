"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangeFilters = void 0;
const react_1 = __importDefault(require("react"));
const FiltersSkeleton_1 = __importDefault(require("./FiltersSkeleton"));
const DateRangeFilters = ({ dateRange, onDateChange, onPresetSelect, minDate, maxDate, loading = false, isDarkMode = false, className = '' }) => {
    if (loading) {
        return <FiltersSkeleton_1.default className={className}/>;
    }
    const handlePresetClick = (days) => {
        if (onPresetSelect) {
            onPresetSelect(days);
        }
    };
    return (<div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold dark:text-gray-200">Date Range</h3>
        {onPresetSelect && (<div className="flex gap-2">
            <button onClick={() => handlePresetClick(7)} className="px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
              Last 7 days
            </button>
            <button onClick={() => handlePresetClick(30)} className="px-2 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
              Last 30 days
            </button>
          </div>)}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input type="date" id="start-date" value={dateRange.startDate} onChange={(e) => onDateChange('startDate', e.target.value)} min={minDate} max={maxDate || dateRange.endDate} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
        </div>
        <div className="flex-1">
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input type="date" id="end-date" value={dateRange.endDate} onChange={(e) => onDateChange('endDate', e.target.value)} min={dateRange.startDate} max={maxDate} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
        </div>
      </div>
    </div>);
};
exports.DateRangeFilters = DateRangeFilters;
exports.default = exports.DateRangeFilters;
