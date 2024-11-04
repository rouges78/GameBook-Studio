import { contextBridge, ipcRenderer } from 'electron';
import type { IpcApi, IpcEvents, IpcEventMap } from './types';

// Expose IPC handlers to the renderer process
contextBridge.exposeInMainWorld('electron', {
    // Update handlers
    'update:check': () => ipcRenderer.invoke('update:check'),
    'update:start-download': () => ipcRenderer.invoke('update:start-download'),
    'update:install': () => ipcRenderer.invoke('update:install'),
    
    // File handlers
    'dialog:openFile': () => ipcRenderer.invoke('dialog:openFile'),
    'dialog:saveFile': (content: string) => ipcRenderer.invoke('dialog:saveFile', content),
    
    // Backup handlers
    'backup:create': () => ipcRenderer.invoke('backup:create'),
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

    // Telemetry handlers
    'telemetry-events': (events: Parameters<IpcApi['telemetry-events']>[0]) => 
        ipcRenderer.invoke('telemetry-events', events),
    'telemetry-status': () => ipcRenderer.invoke('telemetry-status'),
    'telemetry-toggle': (enabled: Parameters<IpcApi['telemetry-toggle']>[0]) => 
        ipcRenderer.invoke('telemetry-toggle', enabled),
    'get-telemetry-data': () => ipcRenderer.invoke('get-telemetry-data'),

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

// Type declaration for TypeScript
declare global {
    interface Window {
        electron: IpcApi & {
            on: <K extends keyof IpcEventMap>(
                channel: K, 
                callback: IpcEvents[K]
            ) => () => void;
            off: <K extends keyof IpcEventMap>(
                channel: K, 
                callback: IpcEvents[K]
            ) => void;
        };
    }
}
