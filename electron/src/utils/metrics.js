"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMetrics = void 0;
// Nuovo file: utils/metrics.ts
exports.performanceMetrics = {
    renderTime: new Map(),
    interactionTime: new Map(),
    startMeasure: (id) => {
        performance.mark(`${id}-start`);
    },
    endMeasure: (id) => {
        performance.mark(`${id}-end`);
        performance.measure(id, `${id}-start`, `${id}-end`);
        const measures = performance.getEntriesByName(id);
        const latestMeasure = measures[measures.length - 1];
        exports.performanceMetrics.renderTime.set(id, latestMeasure.duration);
        performance.clearMarks();
        performance.clearMeasures();
    }
};
