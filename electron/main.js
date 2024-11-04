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

function setupAutoUpdater() {
  // Check for updates immediately
  autoUpdater.checkForUpdatesAndNotify();

  // Check for updates every hour
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 60 * 60 * 1000);

  // Update event handlers
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    telemetryService.logEvents([{
      category: 'auto-update',
      action: 'update-available',
      label: info.version,
      metadata: { version: info.version, releaseNotes: info.releaseNotes },
      timestamp: Date.now()
    }]);
    mainWindow?.webContents.send('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available:', info);
    telemetryService.logEvents([{
      category: 'auto-update',
      action: 'update-not-available',
      label: info.version,
      metadata: { currentVersion: app.getVersion() },
      timestamp: Date.now()
    }]);
  });

  autoUpdater.on('error', (err) => {
    log.error('AutoUpdater error:', err);
    telemetryService.logEvents([{
      category: 'auto-update',
      action: 'error',
      label: err.name,
      metadata: { 
        errorType: err.name,
        errorMessage: err.message,
        stack: err.stack
      },
      timestamp: Date.now()
    }]);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    log.info('Download progress:', progressObj);
    mainWindow?.webContents.send('update-download-progress', progressObj.percent);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    telemetryService.logEvents([{
      category: 'auto-update',
      action: 'update-downloaded',
      label: info.version,
      metadata: { version: info.version },
      timestamp: Date.now()
    }]);
    mainWindow?.webContents.send('update-downloaded');
  });
}

// IPC handlers for telemetry
ipcMain.handle('telemetry-events', async (event, events) => {
  try {
    await telemetryService.logEvents(events);
  } catch (error) {
    log.error('Error logging telemetry events:', error);
  }
});

ipcMain.handle('get-telemetry-data', async () => {
  try {
    log.info('Fetching telemetry data...');
    const data = await telemetryService.getAllTelemetryData();
    log.info(`Retrieved ${data.length} telemetry events`);
    return data;
  } catch (error) {
    log.error('Error fetching telemetry data:', error);
    throw error;
  }
});

ipcMain.handle('telemetry-status', async () => {
  return telemetryService.getTelemetryStatus();
});

ipcMain.handle('telemetry-toggle', async (event, enabled) => {
  telemetryService.setEnabled(enabled);
  mainWindow?.webContents.send('telemetry-status-changed', enabled);
  return enabled;
});

// IPC handlers for database operations
ipcMain.handle('db:getProjects', async () => {
  try {
    log.info('Getting all projects...');
    const projects = await databaseManager.getProjects();
    log.info('Projects retrieved successfully:', projects.length);
    return projects;
  } catch (error) {
    log.error('Error getting projects:', error);
    telemetryService.logEvents([{
      category: 'database',
      action: 'error',
      label: 'get-projects',
      metadata: { 
        errorType: error.name,
        errorMessage: error.message,
        stack: error.stack
      },
      timestamp: Date.now()
    }]);
    throw error;
  }
});

// ... (rest of the database handlers with similar telemetry additions)

// IPC handlers for updates
ipcMain.handle('update:check', async () => {
  try {
    log.info('Manually checking for updates...');
    const checkResult = await autoUpdater.checkForUpdates();
    log.info('Update check result:', checkResult);
    return checkResult;
  } catch (error) {
    log.error('Error checking for updates:', error);
    telemetryService.logEvents([{
      category: 'auto-update',
      action: 'manual-check-error',
      label: error.name,
      metadata: { 
        errorType: error.name,
        errorMessage: error.message,
        stack: error.stack
      },
      timestamp: Date.now()
    }]);
    throw error;
  }
});

// ... (rest of the update handlers with similar telemetry additions)

// App event handlers
app.whenReady().then(async () => {
  try {
    log.info('App is ready, creating window...');
    await createWindow();
    log.info('Window created successfully');
    
    telemetryService.logEvents([{
      category: 'app',
      action: 'start',
      metadata: { 
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch
      },
      timestamp: Date.now()
    }]);
    
    // Setup auto-updater in production
    if (process.env.NODE_ENV !== 'development') {
      setupAutoUpdater();
    }
  } catch (error) {
    log.error('Failed to initialize app:', error);
    telemetryService.logEvents([{
      category: 'app',
      action: 'init-error',
      label: error.name,
      metadata: { 
        errorType: error.name,
        errorMessage: error.message,
        stack: error.stack
      },
      timestamp: Date.now()
    }]);
    app.quit();
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  telemetryService.logEvents([{
    category: 'app',
    action: 'window-all-closed',
    timestamp: Date.now()
  }]);
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup on app quit
app.on('before-quit', async () => {
  try {
    if (databaseManager) {
      await databaseManager.cleanup();
    }
    telemetryService.logEvents([{
      category: 'app',
      action: 'quit',
      timestamp: Date.now()
    }]);
  } catch (error) {
    log.error('Error during cleanup:', error);
    telemetryService.logEvents([{
      category: 'app',
      action: 'cleanup-error',
      label: error.name,
      metadata: { 
        errorType: error.name,
        errorMessage: error.message,
        stack: error.stack
      },
      timestamp: Date.now()
    }]);
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  telemetryService.logEvents([{
    category: 'error',
    action: 'uncaught-exception',
    label: error.name,
    metadata: { 
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack
    },
    timestamp: Date.now()
  }]);
});

process.on('unhandledRejection', (error) => {
  log.error('Unhandled rejection:', error);
  telemetryService.logEvents([{
    category: 'error',
    action: 'unhandled-rejection',
    label: error.name,
    metadata: { 
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack
    },
    timestamp: Date.now()
  }]);
});
