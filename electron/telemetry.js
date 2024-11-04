"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telemetryService = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class TelemetryService {
    constructor() {
        this.isEnabled = true;
        this.logPath = path_1.default.join(electron_1.app.getPath('userData'), 'telemetry');
    }
    static getInstance() {
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService();
        }
        return TelemetryService.instance;
    }
    async ensureLogDirectory() {
        try {
            await promises_1.default.access(this.logPath);
        }
        catch {
            await promises_1.default.mkdir(this.logPath, { recursive: true });
        }
    }
    getLogFileName() {
        const date = new Date();
        return `telemetry-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
    }
    async logEvents(events) {
        if (!this.isEnabled || events.length === 0)
            return;
        try {
            await this.ensureLogDirectory();
            const logFile = path_1.default.join(this.logPath, this.getLogFileName());
            const formattedEvents = events.map(event => JSON.stringify({
                ...event,
                appVersion: electron_1.app.getVersion(),
                platform: process.platform,
                arch: process.arch,
            })).join('\n') + '\n';
            await promises_1.default.appendFile(logFile, formattedEvents, 'utf8');
        }
        catch (error) {
            console.error('Failed to log telemetry events:', error);
        }
    }
    async getAllTelemetryData() {
        try {
            await this.ensureLogDirectory();
            const files = await promises_1.default.readdir(this.logPath);
            const logFiles = files.filter(file => file.startsWith('telemetry-') && file.endsWith('.log'));
            const allEvents = [];
            for (const file of logFiles) {
                const content = await promises_1.default.readFile(path_1.default.join(this.logPath, file), 'utf8');
                const lines = content.trim().split('\n');
                for (const line of lines) {
                    try {
                        const event = JSON.parse(line);
                        allEvents.push(event);
                    }
                    catch (e) {
                        console.error(`Failed to parse telemetry event: ${line}`, e);
                    }
                }
            }
            // Sort events by timestamp
            return allEvents.sort((a, b) => a.timestamp - b.timestamp);
        }
        catch (error) {
            console.error('Failed to read telemetry data:', error);
            return [];
        }
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    istelemetryEnabled() {
        return this.isEnabled;
    }
    async getTelemetryStatus() {
        return this.isEnabled;
    }
}
exports.telemetryService = TelemetryService.getInstance();
