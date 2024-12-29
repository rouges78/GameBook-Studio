const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const log = require('electron-log');

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
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
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
    } catch (error) {
      log.error('Error loading settings:', error);
    }
    return defaultSettings;
  }

  saveSettings() {
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      log.error('Error saving settings:', error);
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

module.exports = { SettingsManager };
