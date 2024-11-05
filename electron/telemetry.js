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
exports.telemetryService = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
class TelemetryService {
    constructor() {
        this.isEnabled = true;
        this.logPath = path.join(electron_1.app.getPath('userData'), 'telemetry');
    }
    static getInstance() {
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService();
        }
        return TelemetryService.instance;
    }
    async ensureLogDirectory() {
        try {
            await fs.access(this.logPath);
        }
        catch {
            await fs.mkdir(this.logPath, { recursive: true });
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
            const logFile = path.join(this.logPath, this.getLogFileName());
            const formattedEvents = events.map(event => JSON.stringify({
                ...event,
                appVersion: electron_1.app.getVersion(),
                platform: process.platform,
                arch: process.arch,
            })).join('\n') + '\n';
            await fs.appendFile(logFile, formattedEvents, 'utf8');
        }
        catch (error) {
            console.error('Failed to log telemetry events:', error);
        }
    }
    async getAllTelemetryData() {
        try {
            await this.ensureLogDirectory();
            const files = await fs.readdir(this.logPath);
            const logFiles = files.filter((file) => file.startsWith('telemetry-') && file.endsWith('.log'));
            const allEvents = [];
            for (const file of logFiles) {
                const content = await fs.readFile(path.join(this.logPath, file), 'utf8');
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
