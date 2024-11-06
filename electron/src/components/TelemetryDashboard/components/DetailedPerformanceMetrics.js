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
exports.DetailedPerformanceMetrics = void 0;
const react_1 = __importStar(require("react"));
const react_chartjs_2_1 = require("react-chartjs-2");
const chart_js_1 = require("chart.js");
const solid_1 = require("@heroicons/react/24/solid");
// Register ChartJS components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
const calculateTrend = (values) => {
    if (values.length < 2)
        return 'stable';
    const recentValues = values.slice(-5);
    const avgChange = recentValues.slice(1).reduce((acc, curr, idx) => acc + (curr - recentValues[idx]), 0) / (recentValues.length - 1);
    if (Math.abs(avgChange) < 0.05)
        return 'stable';
    return avgChange > 0 ? 'up' : 'down';
};
const predictNextValue = (values) => {
    if (values.length < 2)
        return values[values.length - 1] || 0;
    const recentValues = values.slice(-5);
    const avgChange = recentValues.slice(1).reduce((acc, curr, idx) => acc + (curr - recentValues[idx]), 0) / (recentValues.length - 1);
    return recentValues[recentValues.length - 1] + avgChange;
};
const getMetricStatus = (current, threshold, isInverse = false) => {
    const percentage = isInverse ? (threshold - current) / threshold : current / threshold;
    if (percentage < 0.7)
        return 'healthy';
    if (percentage < 0.9)
        return 'warning';
    return 'critical';
};
const DetailedPerformanceMetrics = ({ data, isDarkMode }) => {
    const trendAnalysis = (0, react_1.useMemo)(() => {
        if (!data.length)
            return [];
        const responseTimeValues = data.map(d => d.responseTime);
        const cpuValues = data.map(d => d.cpuUsage);
        const memoryValues = data.map(d => d.memoryUsage);
        const errorRateValues = data.map(d => d.errorRate);
        return [
            {
                metric: 'Response Time',
                current: responseTimeValues[responseTimeValues.length - 1],
                trend: calculateTrend(responseTimeValues),
                prediction: predictNextValue(responseTimeValues),
                threshold: 1000, // 1 second
                status: getMetricStatus(responseTimeValues[responseTimeValues.length - 1], 1000)
            },
            {
                metric: 'CPU Usage',
                current: cpuValues[cpuValues.length - 1],
                trend: calculateTrend(cpuValues),
                prediction: predictNextValue(cpuValues),
                threshold: 90, // 90%
                status: getMetricStatus(cpuValues[cpuValues.length - 1], 90)
            },
            {
                metric: 'Memory Usage',
                current: memoryValues[memoryValues.length - 1],
                trend: calculateTrend(memoryValues),
                prediction: predictNextValue(memoryValues),
                threshold: 85, // 85%
                status: getMetricStatus(memoryValues[memoryValues.length - 1], 85)
            },
            {
                metric: 'Error Rate',
                current: errorRateValues[errorRateValues.length - 1],
                trend: calculateTrend(errorRateValues),
                prediction: predictNextValue(errorRateValues),
                threshold: 5, // 5%
                status: getMetricStatus(errorRateValues[errorRateValues.length - 1], 5)
            }
        ];
    }, [data]);
    const chartData = (0, react_1.useMemo)(() => {
        const labels = data.map(d => new Date(d.timestamp).toLocaleTimeString());
        return {
            labels,
            datasets: [
                {
                    label: 'Response Time (ms)',
                    data: data.map(d => d.responseTime),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'CPU Usage (%)',
                    data: data.map(d => d.cpuUsage),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                },
                {
                    label: 'Memory Usage (%)',
                    data: data.map(d => d.memoryUsage),
                    borderColor: 'rgb(153, 102, 255)',
                    tension: 0.1
                },
                {
                    label: 'Error Rate (%)',
                    data: data.map(d => d.errorRate),
                    borderColor: 'rgb(255, 159, 64)',
                    tension: 0.1
                }
            ]
        };
    }, [data]);
    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDarkMode ? '#fff' : '#666'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: isDarkMode ? '#fff' : '#666'
                }
            },
            y: {
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: isDarkMode ? '#fff' : '#666'
                }
            }
        }
    };
    const circuitBreakerState = data[data.length - 1]?.circuitBreakerState || 'CLOSED';
    return (<div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
      <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Detailed Performance Metrics
      </h2>

      {/* Circuit Breaker Status */}
      <div className={`mb-6 p-4 rounded-lg ${circuitBreakerState === 'CLOSED' ? 'bg-green-100 dark:bg-green-900' :
            circuitBreakerState === 'HALF_OPEN' ? 'bg-yellow-100 dark:bg-yellow-900' :
                'bg-red-100 dark:bg-red-900'}`}>
        <h3 className="text-lg font-medium mb-2">Circuit Breaker Status: {circuitBreakerState}</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {circuitBreakerState === 'CLOSED' ? 'System is operating normally' :
            circuitBreakerState === 'HALF_OPEN' ? 'System is testing recovery' :
                'System is preventing cascading failures'}
        </p>
      </div>

      {/* Trend Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {trendAnalysis.map((analysis) => (<div key={analysis.metric} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {analysis.metric}
              </h3>
              {analysis.status === 'critical' && (<solid_1.ExclamationTriangleIcon className="w-5 h-5 text-red-500"/>)}
            </div>
            <div className={`text-2xl font-bold mb-2 ${analysis.status === 'healthy' ? 'text-green-500' :
                analysis.status === 'warning' ? 'text-yellow-500' :
                    'text-red-500'}`}>
              {analysis.current.toFixed(1)}
            </div>
            <div className="flex items-center space-x-2">
              {analysis.trend === 'up' ? (<solid_1.ArrowTrendingUpIcon className="w-4 h-4 text-red-500"/>) : analysis.trend === 'down' ? (<solid_1.ArrowTrendingDownIcon className="w-4 h-4 text-green-500"/>) : null}
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Predicted: {analysis.prediction.toFixed(1)}
              </span>
            </div>
          </div>))}
      </div>

      {/* Performance Chart */}
      <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <react_chartjs_2_1.Line data={chartData} options={chartOptions}/>
      </div>
    </div>);
};
exports.DetailedPerformanceMetrics = DetailedPerformanceMetrics;
exports.default = exports.DetailedPerformanceMetrics;
