const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const { BackupManager } = require('./backup');
const { DatabaseManager } = require('./database');

let mainWindow;
let backupManager;
let databaseManager;

// Set up database path in user data directory
process.env.DATABASE_URL = `file:${path.join(app.getPath('userData'), 'dev.db')}`;

app.whenReady().then(async () => {
  // Configure logging for updater
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';

  // Configure electron logger
  log.transports.file.level = 'info';
  log.info('Application Starting...');

  log.info('Database path:', process.env.DATABASE_URL);

  await createWindow();
}).catch(error => {
  log.error('Error in app ready handler:', error);
  app.quit();
});

// Register IPC handlers for window operations
ipcMain.handle('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Register IPC handlers for database operations
ipcMain.handle('db:getProjects', async () => {
  try {
    return await databaseManager.getProjects();
  } catch (error) {
    log.error('Error in db:getProjects handler:', error);
    throw error;
  }
});

ipcMain.handle('db:getProject', async (_, bookTitle) => {
  try {
    return await databaseManager.getProject(bookTitle);
  } catch (error) {
    log.error('Error in db:getProject handler:', error);
    throw error;
  }
});

ipcMain.handle('db:saveProject', async (_, project) => {
  try {
    return await databaseManager.saveProject(project);
  } catch (error) {
    log.error('Error in db:saveProject handler:', error);
    throw error;
  }
});

ipcMain.handle('db:deleteProject', async (_, bookTitle) => {
  try {
    return await databaseManager.deleteProject(bookTitle);
  } catch (error) {
    log.error('Error in db:deleteProject handler:', error);
    throw error;
  }
});

ipcMain.handle('db:debugDatabase', async () => {
  try {
    return await databaseManager.debugDatabase();
  } catch (error) {
    log.error('Error in db:debugDatabase handler:', error);
    throw error;
  }
});

// Register IPC handlers for backup operations
ipcMain.handle('backup:create', async (_, projects) => {
  try {
    log.info('Creating backup...');
    const version = await backupManager.createBackup(projects);
    log.info('Backup created successfully:', version);
    return version;
  } catch (error) {
    log.error('Error in backup:create handler:', error);
    throw error;
  }
});

ipcMain.handle('backup:restore', async (_, version) => {
  try {
    log.info('Restoring backup:', version);
    const projects = await backupManager.restoreBackup(version);
    log.info('Backup restored successfully');
    return projects;
  } catch (error) {
    log.error('Error in backup:restore handler:', error);
    throw error;
  }
});

ipcMain.handle('backup:list', async () => {
  try {
    log.info('Listing backups...');
    const backups = await backupManager.listBackups();
    log.info('Backups listed successfully');
    return backups;
  } catch (error) {
    log.error('Error in backup:list handler:', error);
    throw error;
  }
});

ipcMain.handle('backup:getSettings', async () => {
  try {
    log.info('Getting backup settings...');
    const settings = await backupManager.getSettings();
    log.info('Backup settings retrieved successfully');
    return settings;
  } catch (error) {
    log.error('Error in backup:getSettings handler:', error);
    throw error;
  }
});

ipcMain.handle('backup:updateSettings', async (_, settings) => {
  try {
    log.info('Updating backup settings...');
    await backupManager.updateSettings(settings);
    log.info('Backup settings updated successfully');
  } catch (error) {
    log.error('Error in backup:updateSettings handler:', error);
    throw error;
  }
});

async function createWindow() {
  try {
    log.info('Creating main window...');
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false, // Don't show the window until it's ready
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Initialize managers
    try {
      log.info('Initializing managers...');
      backupManager = new BackupManager();
      databaseManager = new DatabaseManager();
      log.info('Managers initialized successfully');
    } catch (error) {
      log.error('Failed to initialize managers:', error);
      throw error;
    }

    // Load initial backup settings
    try {
      log.info('Loading backup settings...');
      await backupManager.loadSettings();
      log.info('Backup settings loaded successfully');
    } catch (error) {
      log.error('Failed to load backup settings:', error);
      throw error;
    }

    // Add error handler for window loading
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load window content:', errorCode, errorDescription);
    });

    // Add console message handler
    mainWindow.webContents.on('console-message', (event, level, message) => {
      log.info('Console message:', level, message);
    });

    // In development, load from Vite dev server
    if (process.env.NODE_ENV === 'development') {
      try {
        const port = process.env.VITE_PORT || 5173;
        const url = `http://localhost:${port}`;
        log.info(`Loading development URL: ${url}`);
        
        // Show window immediately in development
        mainWindow.show();
        
        await mainWindow.loadURL(url);
        log.info('Development URL loaded successfully');
        
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
      } catch (error) {
        log.error('Failed to load development URL:', error);
        throw error;
      }
    } else {
      // In production, load the built index.html
      try {
        log.info('Loading production file...');
        await mainWindow.loadFile(path.join(__dirname, '../index.html'));
        log.info('Production file loaded successfully');
        mainWindow.show();
      } catch (error) {
        log.error('Failed to load production file:', error);
        throw error;
      }
    }

    // Handle window close
    mainWindow.on('closed', () => {
      log.info('Window closed');
      mainWindow = null;
    });

  } catch (error) {
    log.error('Error creating window:', error);
    app.quit();
  }
}

// Handle all windows closed
app.on('window-all-closed', () => {
  log.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app activation
app.on('activate', async () => {
  log.info('App activated');
  if (mainWindow === null) {
    await createWindow();
  }
});

// Handle app quit
app.on('before-quit', async () => {
  log.info('App quitting, cleaning up...');
  if (databaseManager) {
    await databaseManager.cleanup();
  }
});

// Export for testing
module.exports = { createWindow, mainWindow };
