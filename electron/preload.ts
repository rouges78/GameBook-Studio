import { contextBridge, ipcRenderer } from 'electron';
import type { IpcApi, IpcEvents, IpcEventMap } from './types';

// Expose IPC handlers to the renderer process
contextBridge.exposeInMainWorld('electron', {
    // Window operations
    'window:close': () => ipcRenderer.invoke('window:close'),

    // Update handlers
    'update:check': () => ipcRenderer.invoke('update:check'),
    'update:start-download': () => ipcRenderer.invoke('update:start-download'),
    'update:install': () => ipcRenderer.invoke('update:install'),
    
    // File handlers
    'dialog:openFile': () => ipcRenderer.invoke('dialog:openFile'),
    'dialog:saveFile': (content: string) => ipcRenderer.invoke('dialog:saveFile', content),
    
    // Backup handlers
    'backup:create': (projects: any[]) => ipcRenderer.invoke('backup:create', projects),
    'backup:restore': (version: string) => ipcRenderer.invoke('backup:restore', version),
    'backup:list': () => ipcRenderer.invoke('backup:list'),
    'backup:export': (version: string, exportPath: string) => 
        ipcRenderer.invoke('backup:export', version, exportPath),
    'backup:import': (importPath: string) => 
        ipcRenderer.invoke('backup:import', importPath),
    
    // Backup settings handlers
    'backup:getSettings': () => ipcRenderer.invoke('backup:getSettings'),
    'backup:updateSettings': (settings: Parameters<IpcApi['backup:updateSettings']>[0]) =>
        ipcRenderer.invoke('backup:updateSettings', settings),
    'backup:runCleanup': () => ipcRenderer.invoke('backup:runCleanup'),

    // Database handlers
    'db:getProjects': () => ipcRenderer.invoke('db:getProjects'),
    'db:getProject': (bookTitle: string) => ipcRenderer.invoke('db:getProject', bookTitle),
    'db:saveProject': (project: Parameters<IpcApi['db:saveProject']>[0]) => 
        ipcRenderer.invoke('db:saveProject', project),
    'db:deleteProject': (bookTitle: string) => ipcRenderer.invoke('db:deleteProject', bookTitle),
    'db:debugDatabase': () => ipcRenderer.invoke('db:debugDatabase'),

    // Dialog handlers
    dialog: {
        showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:showOpenDialog', options),
        showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:showSaveDialog', options)
    },

    // Event listeners
    on: <K extends keyof IpcEventMap>(channel: K, callback: IpcEvents[K]) => {
        const subscription = (_event: Electron.IpcRendererEvent, data: IpcEventMap[K]) => {
            callback(data);
        };
        ipcRenderer.on(channel, subscription);
        return () => {
            ipcRenderer.removeListener(channel, subscription);
        };
    },
    
    off: <K extends keyof IpcEventMap>(channel: K, callback: IpcEvents[K]) => {
        const subscription = (_event: Electron.IpcRendererEvent, data: IpcEventMap[K]) => {
            callback(data);
        };
        ipcRenderer.removeListener(channel, subscription);
    }
});
