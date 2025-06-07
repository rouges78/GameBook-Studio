import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Configure cache paths
app.setPath('userData', path.join(app.getPath('documents'), 'GameBookStudioCache'));
app.setPath('sessionData', path.join(app.getPath('documents'), 'GameBookStudioSessionData'));
// Config
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Electron app setup
async function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true
        }
    });
    // Add CSP header for development
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"]
            }
        });
    });
    if (process.env.NODE_ENV === 'development') {
        const port = process.env.VITE_PORT || 5173;
        await win.loadURL(`http://localhost:${port}`);
        win.webContents.openDevTools();
    }
    else {
        await win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
