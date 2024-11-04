"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose IPC handlers to the renderer process
electron_1.contextBridge.exposeInMainWorld('electron', {
    // Update handlers
    'update:check': () => electron_1.ipcRenderer.invoke('update:check'),
    'update:start-download': () => electron_1.ipcRenderer.invoke('update:start-download'),
    'update:install': () => electron_1.ipcRenderer.invoke('update:install'),
    // File handlers
    'dialog:openFile': () => electron_1.ipcRenderer.invoke('dialog:openFile'),
    'dialog:saveFile': (content) => electron_1.ipcRenderer.invoke('dialog:saveFile', content),
    // Backup handlers
    'backup:create': () => electron_1.ipcRenderer.invoke('backup:create'),
    'backup:restore': (version) => electron_1.ipcRenderer.invoke('backup:restore', version),
    'backup:list': () => electron_1.ipcRenderer.invoke('backup:list'),
    'backup:export': (version, exportPath) => electron_1.ipcRenderer.invoke('backup:export', version, exportPath),
    'backup:import': (importPath) => electron_1.ipcRenderer.invoke('backup:import', importPath),
    // Backup settings handlers
    'backup:getSettings': () => electron_1.ipcRenderer.invoke('backup:getSettings'),
    'backup:updateSettings': (settings) => electron_1.ipcRenderer.invoke('backup:updateSettings', settings),
    'backup:runCleanup': () => electron_1.ipcRenderer.invoke('backup:runCleanup'),
    // Database handlers
    'db:getProjects': () => electron_1.ipcRenderer.invoke('db:getProjects'),
    'db:getProject': (bookTitle) => electron_1.ipcRenderer.invoke('db:getProject', bookTitle),
    'db:saveProject': (project) => electron_1.ipcRenderer.invoke('db:saveProject', project),
    'db:deleteProject': (bookTitle) => electron_1.ipcRenderer.invoke('db:deleteProject', bookTitle),
    'db:debugDatabase': () => electron_1.ipcRenderer.invoke('db:debugDatabase'),
    // Event listeners
    on: (channel, callback) => {
        const subscription = (_event, data) => callback(data);
        electron_1.ipcRenderer.on(channel, subscription);
        return () => electron_1.ipcRenderer.off(channel, subscription);
    },
    off: (channel, callback) => {
        const subscription = (_event, data) => callback(data);
        electron_1.ipcRenderer.off(channel, subscription);
    }
});
