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
exports.TimeSeriesChart = void 0;
const react_1 = __importStar(require("react"));
const recharts_1 = require("recharts");
const ChartSkeleton_1 = __importDefault(require("./ChartSkeleton"));
const useChartVirtualization_1 = require("../hooks/useChartVirtualization");
const CATEGORY_COLORS = {
    total: '#8884d8',
    error: '#ff0000',
    navigation: '#00ff00'
};
const POINT_WIDTH = 50; // Width per data point in pixels
const OVERSCAN_COUNT = 5; // Number of extra points to render on each side
const arePropsEqual = (prevProps, nextProps) => {
    // Check data array length and content
    if (prevProps.data.length !== nextProps.data.length)
        return false;
    if (JSON.stringify(prevProps.data) !== JSON.stringify(nextProps.data))
        return false;
    // Check loading state
    if (prevProps.loading !== nextProps.loading)
        return false;
    // Check categories object
    if (JSON.stringify(prevProps.categories) !== JSON.stringify(nextProps.categories))
        return false;
    // Check dimensions
    if (prevProps.width !== nextProps.width || prevProps.height !== nextProps.height)
        return false;
    // Check dark mode
    if (prevProps.isDarkMode !== nextProps.isDarkMode)
        return false;
    // If all checks pass, props are considered equal
    return true;
};
exports.TimeSeriesChart = react_1.default.memo(({ data, loading = false, title, className = '', width = 600, height = 400, xAxisKey = 'date', categories, isDarkMode = false }) => {
    const scrollContainerRef = (0, react_1.useRef)(null);
    const chartContainerRef = (0, react_1.useRef)(null);
    const wheelTimeout = (0, react_1.useRef)();
    const { containerRef, visibleData, totalWidth, scrollLeft, scale, handleScroll, handleZoom } = (0, useChartVirtualization_1.useChartVirtualization)({
        data,
        width,
        pointWidth: POINT_WIDTH,
        overscanCount: OVERSCAN_COUNT
    });
    // Handle wheel events for zooming
    const handleWheel = (event) => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const delta = event.deltaY * -0.01;
            const newScale = scale + delta;
            handleZoom(newScale);
        }
        // Clear existing timeout
        if (wheelTimeout.current) {
            clearTimeout(wheelTimeout.current);
        }
        // Set new timeout
        wheelTimeout.current = setTimeout(() => {
            if (scrollContainerRef.current) {
                handleScroll(scrollContainerRef.current.scrollLeft);
            }
        }, 150);
    };
    // Handle scroll events
    const handleScrollEvent = (event) => {
        handleScroll(event.currentTarget.scrollLeft);
    };
    // Setup event listeners
    (0, react_1.useEffect)(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
            if (wheelTimeout.current) {
                clearTimeout(wheelTimeout.current);
            }
        };
    }, [scale]);
    if (loading) {
        return <ChartSkeleton_1.default width={width} height={height} className={className}/>;
    }
    const activeCategories = Object.entries(categories)
        .filter(([_, isActive]) => isActive)
        .map(([category]) => category);
    // Always show total if no categories are selected
    if (activeCategories.length === 0) {
        activeCategories.push('total');
    }
    return (<div className={`${className}`} style={{ width, height }} ref={containerRef}>
      {title && (<h3 className="text-lg font-semibold mb-4 dark:text-gray-200">{title}</h3>)}
      <div ref={scrollContainerRef} className="overflow-x-auto" style={{
            width: '100%',
            height: height - (title ? 40 : 0),
            overscrollBehavior: 'none'
        }} onScroll={handleScrollEvent}>
        <div ref={chartContainerRef} style={{
            width: `${totalWidth}px`,
            height: '100%'
        }}>
          <recharts_1.ResponsiveContainer width="100%" height="100%">
            <recharts_1.LineChart data={visibleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <clipPath id="chartArea">
                  <rect x="0" y="0" width="100%" height="100%"/>
                </clipPath>
              </defs>
              <recharts_1.CartesianGrid strokeDasharray="3 3" className={isDarkMode ? 'stroke-gray-700' : 'stroke-gray-200'}/>
              <recharts_1.XAxis dataKey={xAxisKey} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} tick={{ fontSize: 12 }} scale="point" interval="preserveStartEnd"/>
              <recharts_1.YAxis className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} tick={{ fontSize: 12 }}/>
              <recharts_1.Tooltip contentStyle={{
            backgroundColor: isDarkMode ? 'rgba(26, 32, 44, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: isDarkMode ? '1px solid #4a5568' : '1px solid #e2e8f0',
            borderRadius: '4px',
            color: isDarkMode ? '#e2e8f0' : '#1a202c'
        }} labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#4a5568' }}/>
              <recharts_1.Legend />
              {activeCategories.map((category) => (<recharts_1.Line key={category} type="monotone" dataKey={category} name={category.charAt(0).toUpperCase() + category.slice(1)} stroke={CATEGORY_COLORS[category] || '#000000'} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} // Disable animations for better performance
         clipPath="url(#chartArea)"/>))}
            </recharts_1.LineChart>
          </recharts_1.ResponsiveContainer>
        </div>
      </div>
    </div>);
}, arePropsEqual);
exports.default = exports.TimeSeriesChart;
