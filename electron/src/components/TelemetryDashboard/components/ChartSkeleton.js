"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartSkeleton = void 0;
const react_1 = __importDefault(require("react"));
const ChartSkeleton = ({ width = 600, height = 400, className = '', }) => {
    return (<div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} style={{ width, height }}>
      {/* Chart header skeleton */}
      <div className="p-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
      
      {/* Chart area skeleton */}
      <div className="px-4 pb-4">
        {/* Y-axis labels */}
        <div className="absolute left-4 h-full space-y-12 py-4">
          {[...Array(4)].map((_, i) => (<div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>))}
        </div>
        
        {/* Chart bars/lines */}
        <div className="ml-20 grid grid-cols-6 gap-4 h-[300px] items-end">
          {[...Array(6)].map((_, i) => (<div key={i} className="bg-gray-300 dark:bg-gray-600 rounded" style={{ height: `${Math.random() * 80 + 20}%` }}></div>))}
        </div>
        
        {/* X-axis labels */}
        <div className="ml-20 grid grid-cols-6 gap-4 mt-2">
          {[...Array(6)].map((_, i) => (<div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>))}
        </div>
      </div>
    </div>);
};
exports.ChartSkeleton = ChartSkeleton;
exports.default = exports.ChartSkeleton;
