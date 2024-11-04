"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electron', {
    openFile: async () => {
        return await electron_1.ipcRenderer.invoke('dialog:openFile');
    },
    saveFile: async (content) => {
        return await electron_1.ipcRenderer.invoke('dialog:saveFile', content);
    },
    onUpdateAvailable: (callback) => {
        const subscription = (_event, info) => callback(info);
        electron_1.ipcRenderer.on('update-available', subscription);
        return () => electron_1.ipcRenderer.removeListener('update-available', subscription);
    },
    onUpdateDownloaded: (callback) => {
        const subscription = (_event) => callback();
        electron_1.ipcRenderer.on('update-downloaded', subscription);
        return () => electron_1.ipcRenderer.removeListener('update-downloaded', subscription);
    },
    onUpdateDownloadProgress: (callback) => {
        const subscription = (_event, progress) => callback(progress);
        electron_1.ipcRenderer.on('update-download-progress', subscription);
        return () => electron_1.ipcRenderer.removeListener('update-download-progress', subscription);
    },
    startUpdateDownload: async () => {
        return await electron_1.ipcRenderer.invoke('update:start-download');
    },
    installUpdate: () => {
        electron_1.ipcRenderer.invoke('update:install');
    },
    checkForUpdates: async () => {
        return await electron_1.ipcRenderer.invoke('update:check');
    }
});
