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
exports.circuitBreaker = exports.CircuitBreaker = exports.CircuitState = void 0;
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN"; // Testing if system has recovered
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker {
    constructor() {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.stateChangeCallbacks = [];
        this.config = {
            failureThreshold: 5,
            resetTimeout: 30000, // 30 seconds
            monitorInterval: 5000, // 5 seconds
            maxMemoryUsage: 300 * 1024 * 1024, // 300MB
            maxConcurrentTasks: 10
        };
        this.startMonitoring();
    }
    static getInstance() {
        if (!CircuitBreaker.instance) {
            CircuitBreaker.instance = new CircuitBreaker();
        }
        return CircuitBreaker.instance;
    }
    startMonitoring() {
        this.monitorInterval = window.setInterval(() => {
            this.checkHealth();
        }, this.config.monitorInterval);
    }
    async checkHealth() {
        const metrics = await this.getHealthMetrics();
        if (this.state === CircuitState.CLOSED) {
            if (this.shouldTrip(metrics)) {
                this.tripBreaker();
            }
        }
        else if (this.state === CircuitState.HALF_OPEN) {
            if (this.shouldTrip(metrics)) {
                this.tripBreaker();
            }
            else {
                this.closeBreaker();
            }
        }
    }
    async getHealthMetrics() {
        const workerPool = (await Promise.resolve().then(() => __importStar(require('./workerPool')))).getWorkerPool();
        const stats = workerPool.getStats();
        const totalTasks = stats.performance.totalTasksProcessed;
        const failureRate = totalTasks > 0
            ? stats.performance.failedTasks / totalTasks
            : 0;
        return {
            memoryUsage: stats.performance.currentMemoryUsage || 0,
            activeTasks: stats.activeWorkers,
            failureRate,
            lastFailureTime: this.lastFailureTime
        };
    }
    hasRecentFailure(lastFailureTime) {
        if (lastFailureTime === undefined) {
            return false;
        }
        const timeSinceLastFailure = Date.now() - lastFailureTime;
        return timeSinceLastFailure < 5000; // Less than 5 seconds ago
    }
    shouldTrip(metrics) {
        const memoryExceeded = metrics.memoryUsage > this.config.maxMemoryUsage;
        const tooManyTasks = metrics.activeTasks > this.config.maxConcurrentTasks;
        const recentFailures = this.hasRecentFailure(metrics.lastFailureTime);
        const highFailureRate = metrics.failureRate > 0.5;
        return memoryExceeded ||
            tooManyTasks ||
            (highFailureRate && recentFailures);
    }
    tripBreaker() {
        this.state = CircuitState.OPEN;
        this.failures++;
        this.lastFailureTime = Date.now();
        this.notifyStateChange();
        // Schedule reset attempt
        if (this.resetTimer) {
            window.clearTimeout(this.resetTimer);
        }
        this.resetTimer = window.setTimeout(() => {
            this.attemptReset();
        }, this.config.resetTimeout);
    }
    attemptReset() {
        this.state = CircuitState.HALF_OPEN;
        this.notifyStateChange();
    }
    closeBreaker() {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.lastFailureTime = undefined;
        this.notifyStateChange();
    }
    notifyStateChange() {
        this.stateChangeCallbacks.forEach(callback => callback(this.state));
    }
    onStateChange(callback) {
        this.stateChangeCallbacks.push(callback);
    }
    getState() {
        return this.state;
    }
    canExecute() {
        return this.state === CircuitState.CLOSED || this.state === CircuitState.HALF_OPEN;
    }
    recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        this.checkHealth();
    }
    recordSuccess() {
        if (this.state === CircuitState.HALF_OPEN) {
            this.closeBreaker();
        }
        this.failures = Math.max(0, this.failures - 1);
    }
    getMetrics() {
        return {
            state: this.state,
            failures: this.failures,
            lastFailureTime: this.lastFailureTime
        };
    }
    dispose() {
        if (this.monitorInterval) {
            window.clearInterval(this.monitorInterval);
        }
        if (this.resetTimer) {
            window.clearTimeout(this.resetTimer);
        }
        this.stateChangeCallbacks = [];
    }
}
exports.CircuitBreaker = CircuitBreaker;
exports.circuitBreaker = CircuitBreaker.getInstance();
