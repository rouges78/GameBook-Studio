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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorAnalysis = void 0;
const react_1 = __importStar(require("react"));
const recharts_1 = require("recharts");
const types_1 = require("../types");
const ErrorInspectionModal_1 = require("./ErrorInspectionModal");
const ErrorAnalysis = ({ errorPatterns, updateErrors, rawEvents, isDarkMode }) => {
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [selectedPattern, setSelectedPattern] = (0, react_1.useState)(null);
    const selectedError = (0, react_1.useMemo)(() => {
        if (!selectedPattern || !rawEvents)
            return undefined;
        const events = rawEvents.filter(event => event.category === 'error' &&
            event.metadata?.pattern === selectedPattern);
        return {
            pattern: selectedPattern,
            events
        };
    }, [selectedPattern, rawEvents]);
    const handlePatternClick = (pattern) => {
        setSelectedPattern(pattern);
        setIsModalOpen(true);
    };
    const buttonClasses = `px-2 py-1 text-sm rounded-md transition-colors ${isDarkMode
        ? 'bg-gray-600 hover:bg-gray-500 text-gray-100'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`;
    return (<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Error Trends Chart */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Error Trends</h2>
          <button onClick={() => handlePatternClick('time-based')} className={buttonClasses}>
            Analyze Trends
          </button>
        </div>
        <div className="h-[300px] w-full">
          <recharts_1.ResponsiveContainer width="100%" height="100%">
            <recharts_1.BarChart data={errorPatterns.trends}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4a5568' : '#e2e8f0'}/>
              <recharts_1.XAxis dataKey="date" stroke={isDarkMode ? '#e2e8f0' : '#4a5568'} tick={{ fill: isDarkMode ? '#e2e8f0' : '#4a5568' }}/>
              <recharts_1.YAxis stroke={isDarkMode ? '#e2e8f0' : '#4a5568'} tick={{ fill: isDarkMode ? '#e2e8f0' : '#4a5568' }}/>
              <recharts_1.Tooltip contentStyle={{
            backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
            border: '1px solid #cbd5e0',
            color: isDarkMode ? '#e2e8f0' : '#4a5568'
        }}/>
              <recharts_1.Bar dataKey="errors" fill="#ff7300"/>
            </recharts_1.BarChart>
          </recharts_1.ResponsiveContainer>
        </div>
      </div>

      {/* Error Impact Analysis */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Error Impact Analysis</h2>
          <button onClick={() => handlePatternClick('impact')} className={buttonClasses}>
            View Details
          </button>
        </div>
        <div className="h-[300px] w-full">
          <recharts_1.ResponsiveContainer width="100%" height="100%">
            <recharts_1.PieChart>
              <recharts_1.Pie data={errorPatterns.correlations} dataKey="impact" nameKey="pattern" cx="50%" cy="50%" outerRadius={80} label onClick={(data) => handlePatternClick(data.pattern)} className="cursor-pointer">
                {errorPatterns.correlations.map((_, index) => (<recharts_1.Cell key={`cell-${index}`} fill={types_1.PIE_CHART_COLORS[index % types_1.PIE_CHART_COLORS.length]}/>))}
              </recharts_1.Pie>
              <recharts_1.Tooltip contentStyle={{
            backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
            border: '1px solid #cbd5e0',
            color: isDarkMode ? '#e2e8f0' : '#4a5568'
        }}/>
              <recharts_1.Legend />
            </recharts_1.PieChart>
          </recharts_1.ResponsiveContainer>
        </div>
      </div>

      {/* Update Errors Summary */}
      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} md:col-span-2`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Update Errors Summary</h2>
          <button onClick={() => handlePatternClick('update')} className={buttonClasses}>
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
              {Object.entries(updateErrors.byType).map(([type, count]) => (<div key={type} className="flex justify-between cursor-pointer hover:bg-opacity-50 rounded px-2 py-1" onClick={() => handlePatternClick(type)}>
                  <span>{type}:</span>
                  <span>{count}</span>
                </div>))}
            </div>
          </div>
        </div>
      </div>

      <ErrorInspectionModal_1.ErrorInspectionModal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            setSelectedPattern(null);
        }} errorPatterns={errorPatterns} selectedError={selectedError} isDarkMode={isDarkMode}/>
    </div>);
};
exports.ErrorAnalysis = ErrorAnalysis;
