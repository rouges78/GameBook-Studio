"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telemetryCache = void 0;
const idb_1 = require("idb");
const DB_NAME = 'telemetry-cache';
const RAW_STORE = 'raw-data';
const PROCESSED_STORE = 'processed-data';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 100; // Maximum number of cached results
class TelemetryCache {
    constructor() {
        this.db = null;
        this.initPromise = this.initDB();
    }
    async initDB() {
        try {
            this.db = await (0, idb_1.openDB)(DB_NAME, 1, {
                upgrade(db) {
                    // Store for raw telemetry events
                    if (!db.objectStoreNames.contains(RAW_STORE)) {
                        db.createObjectStore(RAW_STORE, { keyPath: 'date' });
                    }
                    // Store for processed results
                    if (!db.objectStoreNames.contains(PROCESSED_STORE)) {
                        db.createObjectStore(PROCESSED_STORE, { keyPath: 'hash' });
                    }
                },
            });
        }
        catch (error) {
            console.error('Failed to initialize cache database:', error);
            this.db = null;
        }
    }
    generateHash(key) {
        const stringified = JSON.stringify({
            dateRange: key.dateRange || null,
            categories: key.categories,
            pagination: key.pagination || null,
        });
        // Simple hash function for cache key
        let hash = 0;
        for (let i = 0; i < stringified.length; i++) {
            const char = stringified.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
    async cacheRawData(events) {
        await this.initPromise;
        if (!this.db)
            return;
        const tx = this.db.transaction(RAW_STORE, 'readwrite');
        const store = tx.objectStore(RAW_STORE);
        for (const event of events) {
            await store.put(event);
        }
    }
    async getRawData(startDate, endDate, pagination) {
        await this.initPromise;
        if (!this.db)
            return [];
        const tx = this.db.transaction(RAW_STORE, 'readonly');
        const store = tx.objectStore(RAW_STORE);
        let events = await store.getAll();
        if (startDate || endDate) {
            events = events.filter(event => {
                const eventDate = new Date(event.date).getTime();
                const start = startDate ? new Date(startDate).getTime() : -Infinity;
                const end = endDate ? new Date(endDate).getTime() : Infinity;
                return eventDate >= start && eventDate <= end;
            });
        }
        if (pagination) {
            const { page, pageSize } = pagination;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            events = events.slice(startIndex, endIndex);
        }
        return events;
    }
    async cacheProcessedData(key, data) {
        await this.initPromise;
        if (!this.db)
            return;
        const hash = this.generateHash(key);
        try {
            const tx = this.db.transaction(PROCESSED_STORE, 'readwrite');
            const store = tx.objectStore(PROCESSED_STORE);
            // Clean up old entries if we exceed max size
            const allEntries = await store.getAll();
            if (allEntries.length >= MAX_CACHE_SIZE) {
                // Sort entries by timestamp and get the oldest ones
                const oldestEntries = allEntries
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .slice(0, allEntries.length - MAX_CACHE_SIZE + 1);
                // Delete old entries
                for (const entry of oldestEntries) {
                    if (entry?.hash) {
                        await store.delete(entry.hash).catch(console.error);
                    }
                }
            }
            // Add new entry
            await store.put({
                hash,
                key,
                data,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            console.error('Error managing cache:', error);
        }
    }
    async getProcessedData(key) {
        await this.initPromise;
        if (!this.db)
            return null;
        try {
            const hash = this.generateHash(key);
            const tx = this.db.transaction(PROCESSED_STORE, 'readonly');
            const store = tx.objectStore(PROCESSED_STORE);
            const result = await store.get(hash);
            if (!result)
                return null;
            // Check if cache is still valid
            if (Date.now() - result.timestamp > CACHE_DURATION) {
                const deleteTx = this.db.transaction(PROCESSED_STORE, 'readwrite');
                const deleteStore = deleteTx.objectStore(PROCESSED_STORE);
                await deleteStore.delete(hash).catch(console.error);
                return null;
            }
            return result.data;
        }
        catch (error) {
            console.error('Error retrieving from cache:', error);
            return null;
        }
    }
    async clearCache() {
        await this.initPromise;
        if (!this.db)
            return;
        try {
            const tx1 = this.db.transaction(RAW_STORE, 'readwrite');
            await tx1.objectStore(RAW_STORE).clear();
            const tx2 = this.db.transaction(PROCESSED_STORE, 'readwrite');
            await tx2.objectStore(PROCESSED_STORE).clear();
        }
        catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
}
exports.telemetryCache = new TelemetryCache();
