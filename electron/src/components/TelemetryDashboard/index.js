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
exports.TelemetryDashboard = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const components_1 = require("./components");
const useDataProcessor_1 = __importDefault(require("./hooks/useDataProcessor"));
const DEFAULT_PAGE_SIZE = 50;
const isValidTelemetryEvent = (event) => {
    return (event !== null &&
        typeof event === 'object' &&
        typeof event.category === 'string' &&
        typeof event.action === 'string' &&
        typeof event.timestamp === 'number' &&
        typeof event.appVersion === 'string' &&
        typeof event.platform === 'string' &&
        typeof event.arch === 'string' &&
        (!event.metadata || typeof event.metadata === 'object') &&
        (!event.label || typeof event.label === 'string') &&
        (!event.value || typeof event.value === 'number'));
};
const TelemetryDashboard = ({ isDarkMode }) => {
    const [rawData, setRawData] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dateRange, setDateRange] = (0, react_1.useState)({
        startDate: '',
        endDate: ''
    });
    const [categoryFilters, setCategoryFilters] = (0, react_1.useState)({});
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = (0, react_1.useState)('');
    const [currentPage, setCurrentPage] = (0, react_1.useState)(1);
    // Use the Web Worker for data processing
    const { processedData, isProcessing, error: processingError, loadNextPage, loadPreviousPage, resetPagination } = (0, useDataProcessor_1.default)({
        data: rawData.filter(event => {
            if (!debouncedSearchTerm)
                return true;
            const searchLower = debouncedSearchTerm.toLowerCase();
            return (event.category.toLowerCase().includes(searchLower) ||
                event.action.toLowerCase().includes(searchLower) ||
                (event.metadata && JSON.stringify(event.metadata).toLowerCase().includes(searchLower)));
        }),
        categories: categoryFilters,
        dateRange: dateRange.startDate && dateRange.endDate ? {
            start: dateRange.startDate,
            end: dateRange.endDate
        } : undefined,
        pagination: {
            page: currentPage,
            pageSize: DEFAULT_PAGE_SIZE
        }
    });
    // Debounce search term
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);
    const handlePresetRange = (days) => {
        if (!rawData.length)
            return;
        const end = new Date();
        const start = days === 0
            ? new Date(Math.min(...rawData.map(event => event.timestamp)))
            : new Date(end.getTime() - (days * 24 * 60 * 60 * 1000));
        setDateRange({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        });
        resetPagination();
    };
    const handleDateChange = (type, value) => {
        setDateRange(prev => ({
            ...prev,
            [type]: value
        }));
        resetPagination();
    };
    const handleCategoryToggle = (category) => {
        setCategoryFilters(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
        resetPagination();
    };
    const handleExport = () => {
        if (!processedData)
            return;
        const csvContent = [
            // Headers
            ['Date', ...Object.keys(processedData.metrics), 'Total'].join(','),
            // Data rows
            ...processedData.filteredData.map(entry => {
                const values = [
                    entry.date,
                    ...Object.keys(processedData.metrics).map(category => entry[category] || 0),
                    entry.total || 0
                ];
                return values.join(',');
            })
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `telemetry_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };
    (0, react_1.useEffect)(() => {
        const loadTelemetryData = async () => {
            try {
                setIsLoading(true);
                const events = await window.electron['telemetry:getData']();
                if (!Array.isArray(events)) {
                    throw new Error('Invalid telemetry data format');
                }
                // Filter and validate events
                const validEvents = events.filter(isValidTelemetryEvent);
                // Initialize category filters
                const initialFilters = {};
                const categories = new Set(validEvents.map(event => event.category));
                categories.forEach(category => {
                    initialFilters[category] = true;
                });
                setCategoryFilters(initialFilters);
                setRawData(validEvents);
                // Set initial date range if not set
                if (!dateRange.startDate || !dateRange.endDate) {
                    handlePresetRange(30); // Default to last 30 days
                }
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load telemetry data');
            }
            finally {
                setIsLoading(false);
            }
        };
        loadTelemetryData();
    }, []);
    if (isLoading || isProcessing) {
        return (<div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span>Loading telemetry data...</span>
        </div>
      </div>);
    }
    if (error || processingError) {
        return (<div className="p-6 text-red-500">
        Error: {error || processingError?.message}
      </div>);
    }
    if (!processedData) {
        return (<div className={`p-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        No telemetry data available
      </div>);
    }
    return (<div className={`p-6 ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <react_router_dom_1.Link to="/settings" className={`text-sm ${isDarkMode
            ? 'text-blue-400 hover:text-blue-300'
            : 'text-blue-600 hover:text-blue-500'}`}>
            ← Torna alle impostazioni
          </react_router_dom_1.Link>
          <h1 className="text-2xl font-bold">Telemetry Dashboard</h1>
        </div>
        <button onClick={handleExport} className={`px-4 py-2 rounded-lg ${isDarkMode
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>
          Export CSV
        </button>
      </div>

      {/* Memory Alerts Panel */}
      <div className="mb-6">
        <components_1.MemoryAlertsPanel />
      </div>

      {/* Filters Section */}
      <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h2 className="text-xl font-semibold mb-3">Filters</h2>
        
        <components_1.DateRangeFilters dateRange={dateRange} onDateChange={handleDateChange} onPresetSelect={handlePresetRange} minDate={rawData.length ? new Date(Math.min(...rawData.map(event => event.timestamp))).toISOString().split('T')[0] : undefined} maxDate={rawData.length ? new Date(Math.max(...rawData.map(event => event.timestamp))).toISOString().split('T')[0] : undefined} isDarkMode={isDarkMode}/>

        <components_1.CategoryFilters categories={categoryFilters} onToggle={handleCategoryToggle} isDarkMode={isDarkMode}/>

        {/* Search Input */}
        <div>
          <label className="block mb-2">Search Events</label>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by category, action, or metadata..." className={`w-full p-2 rounded ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-800'}`}/>
        </div>
      </div>

      {/* Time Series Chart */}
      <components_1.TimeSeriesChart data={processedData.filteredData} categories={categoryFilters} isDarkMode={isDarkMode}/>

      {/* Detailed Performance Metrics */}
      {processedData.systemMetrics.performance.detailedMetrics && (<div className="mb-6">
          <components_1.DetailedPerformanceMetrics data={processedData.systemMetrics.performance.detailedMetrics} isDarkMode={isDarkMode}/>
        </div>)}

      {/* Error Analysis */}
      <components_1.ErrorAnalysis errorPatterns={processedData.errorPatterns} updateErrors={processedData.updateErrors} rawEvents={rawData} isDarkMode={isDarkMode}/>

      {/* System Metrics */}
      <components_1.SystemMetrics metrics={processedData.systemMetrics} isDarkMode={isDarkMode}/>

      {/* Virtualized Error Table */}
      <components_1.VirtualizedErrorTable events={rawData} isDarkMode={isDarkMode}/>

      {/* Pagination Controls */}
      {processedData.pagination && (<div className={`mt-6 flex justify-between items-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <button onClick={loadPreviousPage} disabled={!processedData.pagination.hasPreviousPage} className={`px-4 py-2 rounded-lg ${processedData.pagination.hasPreviousPage
                ? isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'} text-white`}>
            Previous
          </button>
          <span>
            Page {processedData.pagination.currentPage} of {processedData.pagination.totalPages}
          </span>
          <button onClick={loadNextPage} disabled={!processedData.pagination.hasNextPage} className={`px-4 py-2 rounded-lg ${processedData.pagination.hasNextPage
                ? isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'} text-white`}>
            Next
          </button>
        </div>)}
    </div>);
};
exports.TelemetryDashboard = TelemetryDashboard;
