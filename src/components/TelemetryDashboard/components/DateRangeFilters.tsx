import React from 'react';
import { DateRangeFiltersProps, PRESET_RANGES } from '../types';

export const DateRangeFilters: React.FC<DateRangeFiltersProps> = ({
  dateRange,
  onDateChange,
  onPresetSelect,
  minDate,
  maxDate,
  isDarkMode
}) => {
  return (
    <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
      <h2 className="text-xl font-semibold mb-3">Date Range</h2>
      
      {/* Preset Date Ranges */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Quick Ranges</h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_RANGES.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => onPresetSelect(days)}
              className={`px-3 py-1 rounded-full text-sm ${
                isDarkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateChange('startDate', e.target.value)}
            min={minDate}
            max={dateRange.endDate || maxDate}
            className={`w-full p-2 rounded ${
              isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-800'
            }`}
          />
        </div>
        <div>
          <label className="block mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateChange('endDate', e.target.value)}
            min={dateRange.startDate || minDate}
            max={maxDate}
            className={`w-full p-2 rounded ${
              isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-800'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
