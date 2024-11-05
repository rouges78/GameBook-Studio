const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const { BackupManager } = require('./backup');
const { DatabaseManager } = require('./database');
const { telemetryService } = require('./telemetry');

// Configure logging for updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Configure electron logger
log.transports.file.level = 'info';
log.info('Application Starting...');

let mainWindow;
let backupManager;
let databaseManager;

// Set up database path in user data directory
process.env.DATABASE_URL = `file:${path.join(app.getPath('userData'), 'dev.db')}`;
log.info('Database path:', process.env.DATABASE_URL);

async function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      autoHideMenuBar: true, // Hide the menu bar
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Initialize managers
    backupManager = new BackupManager();
    databaseManager = new DatabaseManager();
    log.info('Managers initialized');

    // Load initial backup settings
    await backupManager.loadSettings();
    log.info('Backup settings loaded');

    // In development, load from Vite dev server
    if (process.env.NODE_ENV === 'development') {
      try {
        const port = process.env.VITE_PORT || 5173;
        log.info(`Loading development URL on port ${port}...`);
        await mainWindow.loadURL(`http://localhost:${port}`);
        log.info('Development URL loaded successfully');
      } catch (error) {
        log.error('Failed to load development URL:', error);
        app.quit();
      }
    } else {
      // In production, load the built index.html
      try {
        log.info('Loading production file...');
        await mainWindow.loadFile(path.join(__dirname, '../index.html'));
        log.info('Production file loaded successfully');
      } catch (error) {
        log.error('Failed to load production file:', error);
        app.quit();
      }
    }

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }

    // Handle window close
    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  } catch (error) {
    log.error('Error creating window:', error);
    app.quit();
  }
}

// Rest of the file remains unchanged...
