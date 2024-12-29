import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import log from 'electron-log';

interface AppSettings {
  window: {
    fullscreen: boolean;
    width: number;
    height: number;
  };
  general: {
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
  };
  notifications: {
    style: 'modern' | 'minimal' | 'standard';
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
  };
  ai: {
    enabled: boolean;
    provider: 'anthropic' | 'openai' | 'openrouter';
    model: string;
    apiKey: string;
  };
}

const defaultSettings: AppSettings = {
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
  private settingsPath: string;
  private settings: AppSettings;

  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = this.loadSettings();
  }

  private loadSettings(): AppSettings {
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

  private saveSettings(): void {
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
      
      log.info('Settings saved successfully');
    } catch (error) {
      log.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  public getSettings(): AppSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public getWindowSettings() {
    return this.settings.window;
  }

  public updateWindowSettings(settings: Partial<AppSettings['window']>): void {
    this.settings.window = { ...this.settings.window, ...settings };
    this.saveSettings();
  }
}

export { SettingsManager, type AppSettings };
