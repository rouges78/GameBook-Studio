import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ErrorAnalysisProps, PIE_CHART_COLORS } from '../types';
import { ErrorInspectionModal } from './ErrorInspectionModal';
import { TelemetryEvent } from '../../../types/electron';

export const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({
  errorPatterns,
  updateErrors,
  rawEvents,
  isDarkMode
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const selectedError = useMemo(() => {
    if (!selectedPattern || !rawEvents) return undefined;
    
    const events = rawEvents.filter(event => 
      event.category === 'error' && 
      event.metadata?.pattern === selectedPattern
    );

    return {
      pattern: selectedPattern,
      events
    };
  }, [selectedPattern, rawEvents]);

  const handlePatternClick = (pattern: string) => {
    setSelectedPattern(pattern);
    setIsModalOpen(true);
  };

  const buttonClasses = `px-2 py-1 text-sm rounded-md transition-colors ${
    isDarkMode 
      ? 'bg-gray-600 hover:bg-gray-500 text-gray-100' 
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Error Trends Chart */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Error Trends</h2>
          <button
            onClick={() => handlePatternClick('time-based')}
            className={buttonClasses}
          >
            Analyze Trends
          </button>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorPatterns.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4a5568' : '#e2e8f0'} />
              <XAxis
                dataKey="date"
                stroke={isDarkMode ? '#e2e8f0' : '#4a5568'}
                tick={{ fill: isDarkMode ? '#e2e8f0' : '#4a5568' }}
              />
              <YAxis
                stroke={isDarkMode ? '#e2e8f0' : '#4a5568'}
                tick={{ fill: isDarkMode ? '#e2e8f0' : '#4a5568' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                  border: '1px solid #cbd5e0',
                  color: isDarkMode ? '#e2e8f0' : '#4a5568'
                }}
              />
              <Bar dataKey="errors" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Impact Analysis */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Error Impact Analysis</h2>
          <button
            onClick={() => handlePatternClick('impact')}
            className={buttonClasses}
          >
            View Details
          </button>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={errorPatterns.correlations}
                dataKey="impact"
                nameKey="pattern"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                onClick={(data) => handlePatternClick(data.pattern)}
                className="cursor-pointer"
              >
                {errorPatterns.correlations.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
                  border: '1px solid #cbd5e0',
                  color: isDarkMode ? '#e2e8f0' : '#4a5568'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Update Errors Summary */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} md:col-span-2`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Update Errors Summary</h2>
          <button
            onClick={() => handlePatternClick('update')}
            className={buttonClasses}
          >
            Analyze Updates
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Total Errors</h3>
            <p className="text-2xl">{updateErrors.total}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Average Retries</h3>
            <p className="text-2xl">{updateErrors.averageRetries.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Error Types</h3>
            <div className="space-y-1">
              {Object.entries(updateErrors.byType).map(([type, count]) => (
                <div 
                  key={type} 
                  className="flex justify-between cursor-pointer hover:bg-opacity-50 rounded px-2 py-1"
                  onClick={() => handlePatternClick(type)}
                >
                  <span>{type}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ErrorInspectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPattern(null);
        }}
        errorPatterns={errorPatterns}
        selectedError={selectedError}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
