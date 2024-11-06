"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMetrics = void 0;
const react_1 = __importDefault(require("react"));
const solid_1 = require("@heroicons/react/24/solid");
const MetricsSkeleton_1 = __importDefault(require("./MetricsSkeleton"));
const transformMetricsObject = (metricsObj) => {
    const transformedMetrics = [];
    if (metricsObj.performance) {
        transformedMetrics.push({
            title: 'Average Response Time',
            value: metricsObj.performance.avgResponseTime,
            change: 0,
            unit: 'ms'
        }, {
            title: 'Error Rate',
            value: metricsObj.performance.errorRate,
            change: 0,
            unit: '%'
        }, {
            title: 'Total Crashes',
            value: metricsObj.performance.totalCrashes,
            change: 0
        });
    }
    if (metricsObj.byPlatform) {
        Object.entries(metricsObj.byPlatform).forEach(([platform, value]) => {
            transformedMetrics.push({
                title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Usage`,
                value,
                change: 0,
                unit: '%'
            });
        });
    }
    if (metricsObj.byVersion) {
        Object.entries(metricsObj.byVersion).forEach(([version, value]) => {
            transformedMetrics.push({
                title: `Version ${version}`,
                value,
                change: 0,
                unit: '%'
            });
        });
    }
    if (metricsObj.byArch) {
        Object.entries(metricsObj.byArch).forEach(([arch, value]) => {
            transformedMetrics.push({
                title: `${arch.toUpperCase()} Architecture`,
                value,
                change: 0,
                unit: '%'
            });
        });
    }
    return transformedMetrics;
};
const SystemMetrics = ({ metrics, loading = false, isDarkMode = false, className = '' }) => {
    if (loading) {
        return <MetricsSkeleton_1.default className={className}/>;
    }
    const metricsArray = Array.isArray(metrics) ? metrics : transformMetricsObject(metrics);
    return (<div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`} role="region" aria-label="System metrics">
      {metricsArray.map((metric, index) => (<div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm" data-testid="metric-card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {metric.title}
          </h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {metric.value}
              {metric.unit && (<span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {metric.unit}
                </span>)}
            </p>
          </div>
          {metric.change !== 0 && (<div className="mt-2 flex items-center">
              {metric.change > 0 ? (<solid_1.ArrowUpIcon className="w-4 h-4 text-green-500" aria-hidden="true"/>) : (<solid_1.ArrowDownIcon className="w-4 h-4 text-red-500" aria-hidden="true"/>)}
              <span className={`text-sm font-medium ml-1 ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(metric.change)}%
              </span>
            </div>)}
        </div>))}
    </div>);
};
exports.SystemMetrics = SystemMetrics;
exports.default = exports.SystemMetrics;
