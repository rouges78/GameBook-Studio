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
exports.MemoryAlertsPanel = void 0;
const react_1 = __importStar(require("react"));
const useMemoryAlerts_1 = require("../hooks/useMemoryAlerts");
const memoryAlertManager_1 = require("../utils/memoryAlertManager");
const react_chartjs_2_1 = require("react-chartjs-2");
const chart_js_1 = require("chart.js");
// Register ChartJS components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.Filler);
const MAX_MEMORY_POINTS = 20;
const MemoryAlertsPanel = () => {
    const { alerts, currentMemoryStatus, thresholds, clearAlertHistory } = (0, useMemoryAlerts_1.useMemoryAlerts)();
    const [memoryHistory, setMemoryHistory] = (0, react_1.useState)([]);
    const [showTrendAnalysis, setShowTrendAnalysis] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // Update memory history when new alerts come in
        if (alerts.length > 0) {
            const latestAlert = alerts[0];
            setMemoryHistory(prev => {
                const newHistory = [...prev, {
                        timestamp: latestAlert.timestamp,
                        usage: latestAlert.memoryUsage,
                        percentage: latestAlert.memoryPercentage
                    }];
                return newHistory.slice(-MAX_MEMORY_POINTS);
            });
        }
    }, [alerts]);
    const getAlertLevelColor = (level) => {
        switch (level) {
            case memoryAlertManager_1.MemoryAlertLevel.NORMAL: return 'bg-green-100 text-green-800';
            case memoryAlertManager_1.MemoryAlertLevel.WARNING: return 'bg-yellow-100 text-yellow-800';
            case memoryAlertManager_1.MemoryAlertLevel.CRITICAL: return 'bg-orange-100 text-orange-800';
            case memoryAlertManager_1.MemoryAlertLevel.MAXIMUM: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const formatMemoryUsage = (bytes) => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };
    // Calculate memory usage trend
    const trendAnalysis = (0, react_1.useMemo)(() => {
        if (memoryHistory.length < 2)
            return null;
        const recentPoints = memoryHistory.slice(-5);
        const firstPoint = recentPoints[0].percentage;
        const lastPoint = recentPoints[recentPoints.length - 1].percentage;
        const trend = lastPoint - firstPoint;
        return {
            percentage: trend.toFixed(1),
            direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
            color: trend > 5 ? 'text-red-500' : trend < -5 ? 'text-green-500' : 'text-yellow-500'
        };
    }, [memoryHistory]);
    // Chart data
    const chartData = {
        labels: memoryHistory.map(point => new Date(point.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'Memory Usage (%)',
                data: memoryHistory.map(point => point.percentage),
                fill: true,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }
        ]
    };
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => `Memory: ${context.raw.toFixed(1)}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Memory Usage (%)'
                }
            }
        },
        animation: {
            duration: 0
        }
    };
    return (<div className="memory-alerts-panel p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Memory Alerts</h2>
        <div className={`px-3 py-1 rounded-full text-sm ${getAlertLevelColor(currentMemoryStatus.level)}`}>
          {currentMemoryStatus.percentage.toFixed(1)}% Used
        </div>
      </div>

      {/* Threshold Indicators */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="text-sm text-yellow-700">Warning</div>
          <div className="font-bold text-yellow-800">{thresholds.warning}%</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded">
          <div className="text-sm text-orange-700">Critical</div>
          <div className="font-bold text-orange-800">{thresholds.critical}%</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-sm text-red-700">Maximum</div>
          <div className="font-bold text-red-800">{thresholds.maximum}%</div>
        </div>
      </div>

      {/* Memory Usage Chart */}
      {memoryHistory.length > 0 && (<div className="mb-4">
          <div className="h-48">
            <react_chartjs_2_1.Line data={chartData} options={chartOptions}/>
          </div>
          
          {/* Trend Analysis */}
          {trendAnalysis && (<div className="mt-2 text-sm">
              <button onClick={() => setShowTrendAnalysis(!showTrendAnalysis)} className="text-blue-500 hover:text-blue-700 underline" data-testid="trend-analysis-button">
                {showTrendAnalysis ? 'Hide Trend Analysis' : 'Show Trend Analysis'}
              </button>
              
              {showTrendAnalysis && (<div className="mt-2 p-2 bg-gray-50 rounded">
                  <p>
                    Memory usage is{' '}
                    <span className={trendAnalysis.color}>
                      {trendAnalysis.direction} ({trendAnalysis.percentage}%)
                    </span>
                  </p>
                  {Math.abs(parseFloat(trendAnalysis.percentage)) > 5 && (<p className="mt-1 text-gray-600">
                      {parseFloat(trendAnalysis.percentage) > 5
                            ? 'Consider investigating high memory usage'
                            : 'Memory usage is improving'}
                    </p>)}
                </div>)}
            </div>)}
        </div>)}

      {alerts.length === 0 ? (<p className="text-gray-500 text-center">No memory alerts</p>) : (<>
          <div className="max-h-64 overflow-y-auto">
            {alerts.map((alert, index) => (<div key={index} className={`mb-2 p-3 rounded-lg ${getAlertLevelColor(alert.level)}`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{alert.message}</span>
                  <span className="text-sm text-gray-600">
                    {formatTimestamp(alert.timestamp)}
                  </span>
                </div>
                <div className="text-sm mt-1">
                  Memory Usage: {formatMemoryUsage(alert.memoryUsage)} ({alert.memoryPercentage.toFixed(1)}%)
                </div>
              </div>))}
          </div>
          <button onClick={clearAlertHistory} className="mt-4 w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg transition-colors" aria-label="Clear Alert History">
            Clear Alert History
          </button>
        </>)}
    </div>);
};
exports.MemoryAlertsPanel = MemoryAlertsPanel;
