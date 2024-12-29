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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsManager = void 0;
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_log_1 = __importDefault(require("electron-log"));
const defaultSettings = {
    window: {
        fullscreen: true,
        width: 1200,
        height: 800
    },
    general: {
        autoSaveEnabled: true,
        autoSaveInterval: 5
    },
    notifications: {
        style: 'modern',
        position: 'top-right'
    },
    ai: {
        enabled: false,
        provider: 'anthropic',
        model: 'claude-3-opus',
        apiKey: ''
    }
};
class SettingsManager {
    constructor() {
        this.settingsPath = path.join(electron_1.app.getPath('userData'), 'settings.json');
        this.settings = this.loadSettings();
    }
    loadSettings() {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = fs.readFileSync(this.settingsPath, 'utf8');
                const loadedSettings = JSON.parse(data);
                // Merge con le impostazioni predefinite per assicurarsi che tutte le proprietà esistano
                return { ...defaultSettings, ...loadedSettings };
            }
        }
        catch (error) {
            electron_log_1.default.error('Error loading settings:', error);
        }
        return defaultSettings;
    }
    saveSettings() {
        try {
            // Crea la directory se non esiste
            const dir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Scrive il file temporaneo
            const tempPath = `${this.settingsPath}.tmp`;
            fs.writeFileSync(tempPath, JSON.stringify(this.settings, null, 2));
            // Rinomina il file temporaneo
            fs.renameSync(tempPath, this.settingsPath);
            electron_log_1.default.info('Settings saved successfully');
        }
        catch (error) {
            electron_log_1.default.error('Error saving settings:', error);
            throw new Error('Failed to save settings');
        }
    }
    getSettings() {
        return this.settings;
    }
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }
    getWindowSettings() {
        return this.settings.window;
    }
    updateWindowSettings(settings) {
        this.settings.window = { ...this.settings.window, ...settings };
        this.saveSettings();
    }
}
exports.SettingsManager = SettingsManager;
