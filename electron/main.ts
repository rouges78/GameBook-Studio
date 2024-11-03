const { app, BrowserWindow } = require('electron');
const path = require('path');

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('Loading development URL...');
      await win.loadURL('http://localhost:5173');
      console.log('Development URL loaded successfully');
    } catch (error) {
      console.error('Failed to load development URL:', error);
      app.quit();
    }
  } else {
    // In production, load the built index.html
    try {
      console.log('Loading production file...');
      await win.loadFile(path.join(__dirname, '../index.html'));
      console.log('Production file loaded successfully');
    } catch (error) {
      console.error('Failed to load production file:', error);
      app.quit();
    }
  }

  // Open DevTools
  win.webContents.openDevTools();
}

app.whenReady().then(async () => {
  try {
    await createWindow();
    console.log('Window created successfully');
  } catch (error) {
    console.error('Failed to create window:', error);
    app.quit();
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
