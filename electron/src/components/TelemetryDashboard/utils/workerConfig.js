"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerUrl = void 0;
// Import the worker directly using the new URL pattern
const workerUrl = new URL('./dataProcessor.worker.ts', import.meta.url);
const getWorkerUrl = () => {
    // In test environment, return mock URL
    if (process.env.NODE_ENV === 'test') {
        return 'mock-worker-url';
    }
    // In development/production, use the worker URL
    return workerUrl.href;
};
exports.getWorkerUrl = getWorkerUrl;
