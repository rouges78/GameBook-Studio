"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telemetry = void 0;
class TelemetryManager {
    constructor() {
        this.queue = [];
        this.MAX_QUEUE_SIZE = 100;
        this.FLUSH_INTERVAL = 60000; // 1 minute
        this.setupFlushInterval();
    }
    static getInstance() {
        if (!TelemetryManager.instance) {
            TelemetryManager.instance = new TelemetryManager();
        }
        return TelemetryManager.instance;
    }
    setupFlushInterval() {
        setInterval(() => {
            this.flush();
        }, this.FLUSH_INTERVAL);
    }
    trackEvent(event) {
        const enrichedEvent = {
            ...event,
            timestamp: event.timestamp || Date.now(),
        };
        this.queue.push(enrichedEvent);
        if (this.queue.length >= this.MAX_QUEUE_SIZE) {
            this.flush();
        }
    }
    trackUpdateError(error, attemptNumber, totalAttempts, lastDelay) {
        const errorEvent = {
            category: 'auto-update',
            action: 'error',
            label: error.name,
            metadata: {
                errorType: error.name,
                errorMessage: error.message,
                attemptNumber,
                totalAttempts,
                lastDelay,
            },
            timestamp: Date.now(),
        };
        this.trackEvent(errorEvent);
    }
    async flush() {
        if (this.queue.length === 0)
            return;
        try {
            const events = [...this.queue];
            this.queue = [];
            // The main process will add appVersion, platform, and arch
            await window.electron['telemetry-events'](events);
        }
        catch (error) {
            console.error('Failed to flush telemetry events:', error);
            // Re-add events to queue if flush fails
            this.queue = [...this.queue, ...this.queue];
            if (this.queue.length > this.MAX_QUEUE_SIZE) {
                this.queue = this.queue.slice(-this.MAX_QUEUE_SIZE);
            }
        }
    }
}
exports.telemetry = TelemetryManager.getInstance();
