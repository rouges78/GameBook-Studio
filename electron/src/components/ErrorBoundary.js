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
exports.ErrorBoundary = void 0;
const react_1 = __importStar(require("react"));
const storage_1 = require("../utils/storage");
const autoBackup_1 = require("../utils/autoBackup");
class ErrorBoundary extends react_1.Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
        this.handleReset = () => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null
            });
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error, errorInfo: null };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });
        // Log error
        console.error('Error caught by boundary:', error, errorInfo);
        // Attempt to save current state
        this.saveCurrentState();
        // Call error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }
    async saveCurrentState() {
        try {
            // Get current projects
            const projects = await (0, storage_1.getProjects)();
            // Create emergency backup
            await (0, autoBackup_1.createBackup)();
            // Save each project with error flag
            for (const project of projects) {
                await (0, storage_1.saveProject)({
                    ...project,
                    lastError: {
                        timestamp: new Date().toISOString(),
                        message: this.state.error?.message || 'Unknown error',
                        stack: this.state.error?.stack || '',
                        componentStack: this.state.errorInfo?.componentStack || ''
                    }
                });
            }
        }
        catch (backupError) {
            console.error('Failed to save error state:', backupError);
        }
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (<div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h2>
            <div className="mb-4 text-gray-700 dark:text-gray-300">
              <p>An error occurred in the application. Your work has been automatically saved.</p>
              <p className="mt-2">Error details:</p>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-sm">
                {this.state.error?.message}
              </pre>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Reload Page
              </button>
              <button onClick={this.handleReset} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Try Again
              </button>
            </div>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
exports.default = ErrorBoundary;
