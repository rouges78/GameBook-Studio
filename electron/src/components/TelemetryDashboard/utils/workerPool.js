"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerPool = exports.WorkerPool = void 0;
const pako_1 = __importDefault(require("pako"));
const workerConfig_1 = require("./workerConfig");
const circuitBreaker_1 = require("./circuitBreaker");
class WorkerPool {
    constructor(poolSize, workerUrl) {
        this.taskHistory = [];
        this.maxHistorySize = 100;
        this.maxRestarts = 3;
        this.compressionThreshold = 50 * 1024; // 50KB
        this.TOTAL_MEMORY = 2 * 1024 * 1024 * 1024; // 2GB as specified in requirements
        this.cpuUsageHistory = [];
        this.CPU_HISTORY_SIZE = 10;
        this.workers = [];
        this.taskQueue = [];
        this.activeWorkers = new Map();
        this.workerUrl = workerUrl;
        this.workerRestartCount = new Map();
        // Memory thresholds based on percentage of total memory (2GB)
        this.memoryThresholds = {
            warning: this.TOTAL_MEMORY * 0.6, // 60%
            critical: this.TOTAL_MEMORY * 0.7, // 70%
            maximum: this.TOTAL_MEMORY * 0.8 // 80%
        };
        // Initialize workers
        for (let i = 0; i < poolSize; i++) {
            this.addWorker();
        }
        // Start periodic garbage collection and monitoring
        this.gcInterval = window.setInterval(() => this.performMemoryMaintenance(), 30000);
        this.maintenanceInterval = window.setInterval(() => this.performSystemMaintenance(), 5000);
    }
    addWorker() {
        const worker = new Worker(this.workerUrl, { type: 'module' });
        worker.onmessage = (event) => {
            const activeTask = this.activeWorkers.get(worker);
            if (activeTask) {
                activeTask.endTime = performance.now();
                this.recordTaskMetrics(activeTask, 'completed');
                circuitBreaker_1.circuitBreaker.recordSuccess();
                // Decompress response if needed
                let result = event.data;
                if (result.compressed) {
                    const decompressed = pako_1.default.inflate(result.data, { to: 'string' });
                    result = JSON.parse(decompressed);
                }
                activeTask.resolve(result);
                this.activeWorkers.set(worker, null);
                this.processNextTask(worker);
            }
        };
        worker.onerror = (event) => {
            const activeTask = this.activeWorkers.get(worker);
            if (activeTask) {
                activeTask.endTime = performance.now();
                this.recordTaskMetrics(activeTask, 'failed');
                circuitBreaker_1.circuitBreaker.recordFailure();
                activeTask.reject(new Error(event.message));
                this.activeWorkers.set(worker, null);
                // Attempt worker restart if needed
                const restartCount = this.workerRestartCount.get(worker) || 0;
                if (restartCount < this.maxRestarts) {
                    this.restartWorker(worker);
                }
                this.processNextTask(worker);
            }
        };
        this.workers.push(worker);
        this.activeWorkers.set(worker, null);
        this.workerRestartCount.set(worker, 0);
    }
    async restartWorker(worker) {
        const index = this.workers.indexOf(worker);
        if (index === -1)
            return;
        worker.terminate();
        this.workers.splice(index, 1);
        this.activeWorkers.delete(worker);
        const restartCount = (this.workerRestartCount.get(worker) || 0) + 1;
        this.workerRestartCount.delete(worker);
        if (restartCount < this.maxRestarts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * restartCount)); // Exponential backoff
            this.addWorker();
        }
    }
    async processNextTask(worker) {
        if (this.taskQueue.length === 0 || !circuitBreaker_1.circuitBreaker.canExecute())
            return;
        const memoryUsage = this.getMemoryUsage();
        if (memoryUsage && memoryUsage > this.memoryThresholds.critical) {
            await this.handleCriticalMemory();
            return;
        }
        const task = this.taskQueue.shift();
        if (task) {
            task.startTime = performance.now();
            this.activeWorkers.set(worker, task);
            // Compress large payloads
            if (task.size && task.size > this.compressionThreshold) {
                const compressed = pako_1.default.deflate(JSON.stringify(task.data));
                worker.postMessage({ compressed: true, data: compressed });
            }
            else {
                worker.postMessage(task.data);
            }
        }
    }
    async executeTask(taskData) {
        return new Promise((resolve, reject) => {
            if (!circuitBreaker_1.circuitBreaker.canExecute()) {
                reject(new Error('Circuit breaker is open, task execution prevented'));
                return;
            }
            const size = new Blob([JSON.stringify(taskData)]).size;
            const task = {
                id: Math.random().toString(36).substr(2, 9),
                data: taskData,
                resolve,
                reject,
                startTime: undefined,
                endTime: undefined,
                size
            };
            // Check memory usage before adding task
            const memoryUsage = this.getMemoryUsage();
            if (memoryUsage && memoryUsage > this.memoryThresholds.maximum) {
                reject(new Error('Cannot accept new tasks due to memory constraints'));
                return;
            }
            // Find an available worker
            const availableWorker = Array.from(this.activeWorkers.entries()).find(([, activeTask]) => activeTask === null)?.[0];
            if (availableWorker) {
                task.startTime = performance.now();
                this.activeWorkers.set(availableWorker, task);
                // Compress large payloads
                if (size > this.compressionThreshold) {
                    const compressed = pako_1.default.deflate(JSON.stringify(taskData));
                    availableWorker.postMessage({ compressed: true, data: compressed });
                }
                else {
                    availableWorker.postMessage(taskData);
                }
            }
            else {
                this.taskQueue.push(task);
            }
        });
    }
    recordTaskMetrics(task, status) {
        if (!task.startTime || !task.endTime)
            return;
        const metrics = {
            taskId: task.id,
            executionTime: task.endTime - task.startTime,
            status,
            timestamp: Date.now(),
            memoryUsage: this.getMemoryUsage(),
            cpuUsage: this.cpuUsageHistory[this.cpuUsageHistory.length - 1]
        };
        this.taskHistory.unshift(metrics);
        if (this.taskHistory.length > this.maxHistorySize) {
            this.taskHistory.pop();
        }
    }
    async handleCriticalMemory() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        // Terminate and restart workers with high memory usage
        const promises = this.workers.map(async (worker) => {
            const task = this.activeWorkers.get(worker);
            if (task) {
                task.reject(new Error('Worker terminated due to high memory usage'));
                await this.restartWorker(worker);
            }
        });
        await Promise.all(promises);
        // Clear task queue if memory usage is still high
        if (this.getMemoryUsage() && this.getMemoryUsage() > this.memoryThresholds.critical) {
            this.taskQueue = [];
        }
    }
    async performMemoryMaintenance() {
        const memoryUsage = this.getMemoryUsage();
        if (!memoryUsage)
            return;
        if (memoryUsage > this.memoryThresholds.warning) {
            // Clear old task history
            this.taskHistory = this.taskHistory.slice(0, this.maxHistorySize / 2);
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
        }
        if (memoryUsage > this.memoryThresholds.critical) {
            await this.handleCriticalMemory();
        }
    }
    async optimizeMemory() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        // Clear task history
        this.taskHistory = [];
        // Terminate and restart workers with high memory usage
        const promises = this.workers.map(async (worker) => {
            const task = this.activeWorkers.get(worker);
            if (task) {
                task.reject(new Error('Worker terminated for memory optimization'));
                await this.restartWorker(worker);
            }
        });
        await Promise.all(promises);
        // Clear task queue if memory usage is still high
        if (this.getMemoryUsage() && this.getMemoryUsage() > this.memoryThresholds.critical) {
            this.taskQueue = [];
        }
    }
    async scheduleMaintenance() {
        // Schedule maintenance for next idle period
        setTimeout(async () => {
            const memoryUsage = this.getMemoryUsage();
            if (!memoryUsage || memoryUsage < this.memoryThresholds.warning)
                return;
            // Perform maintenance tasks
            await this.performMemoryMaintenance();
            // Restart workers if needed
            if (memoryUsage > this.memoryThresholds.critical) {
                await this.optimizeMemory();
            }
        }, 1000);
    }
    async performSystemMaintenance() {
        // Monitor CPU usage
        const cpuUsage = await this.getCpuUsage();
        if (cpuUsage) {
            this.cpuUsageHistory.push(cpuUsage);
            if (this.cpuUsageHistory.length > this.CPU_HISTORY_SIZE) {
                this.cpuUsageHistory.shift();
            }
            // If CPU usage is consistently high (>70%), reduce worker count
            const avgCpuUsage = this.cpuUsageHistory.reduce((a, b) => a + b, 0) / this.cpuUsageHistory.length;
            if (avgCpuUsage > 70 && this.workers.length > 1) {
                const worker = this.workers[this.workers.length - 1];
                const task = this.activeWorkers.get(worker);
                if (task) {
                    task.reject(new Error('Worker terminated due to high CPU usage'));
                }
                worker.terminate();
                this.workers.pop();
                this.activeWorkers.delete(worker);
            }
        }
        // Check memory usage
        const memoryUsage = this.getMemoryUsage();
        if (memoryUsage && memoryUsage > this.memoryThresholds.warning) {
            await this.scheduleMaintenance();
        }
    }
    async getCpuUsage() {
        if (!window.performance || !window.performance.now)
            return undefined;
        const start = performance.now();
        const startCpu = await this.getCpuTime();
        await new Promise(resolve => setTimeout(resolve, 100));
        const end = performance.now();
        const endCpu = await this.getCpuTime();
        if (!startCpu || !endCpu)
            return undefined;
        const cpuUsage = ((endCpu - startCpu) / (end - start)) * 100;
        return Math.min(100, Math.max(0, cpuUsage));
    }
    async getCpuTime() {
        if (!window.performance || !performance.now)
            return undefined;
        return performance.now();
    }
    terminate() {
        clearInterval(this.gcInterval);
        clearInterval(this.maintenanceInterval);
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        this.taskQueue = [];
        this.activeWorkers.clear();
        this.taskHistory = [];
        this.workerRestartCount.clear();
        this.cpuUsageHistory = [];
    }
    getMemoryUsage() {
        if (performance?.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return undefined;
    }
    getStats() {
        const currentMemoryUsage = this.getMemoryUsage();
        const currentCpuUsage = this.cpuUsageHistory.length > 0
            ? this.cpuUsageHistory[this.cpuUsageHistory.length - 1]
            : undefined;
        const completedTasks = this.taskHistory.filter(t => t.status === 'completed');
        const failedTasks = this.taskHistory.filter(t => t.status === 'failed');
        const totalTasks = this.taskHistory.length;
        const averageExecutionTime = completedTasks.length > 0
            ? completedTasks.reduce((sum, task) => sum + task.executionTime, 0) / completedTasks.length
            : 0;
        return {
            totalWorkers: this.workers.length,
            activeWorkers: Array.from(this.activeWorkers.values()).filter(task => task !== null).length,
            queuedTasks: this.taskQueue.length,
            performance: {
                averageExecutionTime,
                totalTasksProcessed: totalTasks,
                failedTasks: failedTasks.length,
                successRate: totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 100,
                peakMemoryUsage: Math.max(...this.taskHistory.map(t => t.memoryUsage || 0)),
                currentMemoryUsage,
                currentCpuUsage,
                taskHistory: [...this.taskHistory]
            }
        };
    }
}
exports.WorkerPool = WorkerPool;
// Create a singleton instance
let poolInstance = null;
const getWorkerPool = (poolSize = navigator.hardwareConcurrency || 4) => {
    if (!poolInstance) {
        poolInstance = new WorkerPool(poolSize, (0, workerConfig_1.getWorkerUrl)());
    }
    return poolInstance;
};
exports.getWorkerPool = getWorkerPool;
