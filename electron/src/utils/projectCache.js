"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedProject = exports.cacheProject = void 0;
// Nuovo file: utils/projectCache.ts
const projectCache = new Map();
const cacheProject = (key, data) => {
    projectCache.set(key, {
        data,
        timestamp: Date.now()
    });
};
exports.cacheProject = cacheProject;
const getCachedProject = (key) => {
    const cached = projectCache.get(key);
    if (cached && Date.now() - cached.timestamp < 1000 * 60 * 5) { // 5 minuti
        return cached.data;
    }
    return null;
};
exports.getCachedProject = getCachedProject;
