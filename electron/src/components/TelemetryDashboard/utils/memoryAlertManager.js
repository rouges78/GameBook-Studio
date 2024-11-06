"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryAlertManager = exports.MemoryAlertManager = exports.MemoryAlertLevel = void 0;
const workerPool_1 = require("./workerPool");
var MemoryAlertLevel;
(function (MemoryAlertLevel) {
    MemoryAlertLevel["NORMAL"] = "normal";
    MemoryAlertLevel["WARNING"] = "warning";
    MemoryAlertLevel["CRITICAL"] = "critical";
    MemoryAlertLevel["MAXIMUM"] = "maximum";
})(MemoryAlertLevel || (exports.MemoryAlertLevel = MemoryAlertLevel = {}));
class MemoryAlertManager {
    constructor() {
        this.alertHistory = [];
        this.MAX_ALERT_HISTORY = 50;
        this.TOTAL_MEMORY = 2 * 1024 * 1024 * 1024; // 2GB as specified in requirements
        this.startMonitoring();
    }
    static getInstance() {
        if (!MemoryAlertManager.instance) {
            MemoryAlertManager.instance = new MemoryAlertManager();
        }
        return MemoryAlertManager.instance;
    }
    startMonitoring() {
        // Monitor every 15 seconds for more responsive alerts
        setInterval(() => this.checkMemoryStatus(), 15000);
    }
    checkMemoryStatus() {
        const workerPool = (0, workerPool_1.getWorkerPool)();
        const stats = workerPool.getStats();
        const memoryUsage = stats.performance.currentMemoryUsage;
        if (!memoryUsage)
            return;
        // Calculate memory usage percentage
        const memoryPercentage = (memoryUsage / this.TOTAL_MEMORY) * 100;
        // Thresholds based on requirements (memory usage < 80%)
        const thresholds = {
            warning: 60, // 60% - Early warning
            critical: 70, // 70% - Critical warning
            maximum: 80 // 80% - Maximum allowed
        };
        let alertLevel = MemoryAlertLevel.NORMAL;
        let alertMessage = '';
        if (memoryPercentage >= thresholds.maximum) {
            alertLevel = MemoryAlertLevel.MAXIMUM;
            alertMessage = `Memory usage (${memoryPercentage.toFixed(1)}%) has exceeded maximum threshold of ${thresholds.maximum}%. Immediate action required.`;
            // Trigger automatic memory optimization
            workerPool.optimizeMemory();
        }
        else if (memoryPercentage >= thresholds.critical) {
            alertLevel = MemoryAlertLevel.CRITICAL;
            alertMessage = `Critical memory usage: ${memoryPercentage.toFixed(1)}%. Approaching maximum threshold. Initiating preventive measures.`;
            // Schedule worker pool maintenance
            workerPool.scheduleMaintenance();
        }
        else if (memoryPercentage >= thresholds.warning) {
            alertLevel = MemoryAlertLevel.WARNING;
            alertMessage = `Memory usage warning: ${memoryPercentage.toFixed(1)}%. Consider optimizing resource usage.`;
        }
        if (alertLevel !== MemoryAlertLevel.NORMAL) {
            const alert = {
                level: alertLevel,
                timestamp: Date.now(),
                message: alertMessage,
                memoryUsage,
                memoryPercentage
            };
            this.recordAlert(alert);
            this.triggerAlertCallback(alert);
            // Log critical alerts for monitoring systems
            if (alertLevel === MemoryAlertLevel.CRITICAL || alertLevel === MemoryAlertLevel.MAXIMUM) {
                console.error(`[MemoryAlert] ${alertMessage}`);
            }
        }
    }
    recordAlert(alert) {
        this.alertHistory.unshift(alert);
        if (this.alertHistory.length > this.MAX_ALERT_HISTORY) {
            this.alertHistory.pop();
        }
    }
    triggerAlertCallback(alert) {
        if (this.alertCallback) {
            this.alertCallback(alert);
        }
    }
    setAlertCallback(callback) {
        this.alertCallback = callback;
    }
    getAlertHistory() {
        return [...this.alertHistory];
    }
    clearAlertHistory() {
        this.alertHistory = [];
    }
    getCurrentMemoryStatus() {
        const workerPool = (0, workerPool_1.getWorkerPool)();
        const stats = workerPool.getStats();
        const memoryUsage = stats.performance.currentMemoryUsage || 0;
        const memoryPercentage = (memoryUsage / this.TOTAL_MEMORY) * 100;
        let level = MemoryAlertLevel.NORMAL;
        if (memoryPercentage >= 80)
            level = MemoryAlertLevel.MAXIMUM;
        else if (memoryPercentage >= 70)
            level = MemoryAlertLevel.CRITICAL;
        else if (memoryPercentage >= 60)
            level = MemoryAlertLevel.WARNING;
        return {
            level,
            percentage: memoryPercentage,
            usage: memoryUsage
        };
    }
    getMemoryThresholds() {
        return {
            warning: 60,
            critical: 70,
            maximum: 80
        };
    }
}
exports.MemoryAlertManager = MemoryAlertManager;
// Export a singleton instance
exports.memoryAlertManager = MemoryAlertManager.getInstance();
