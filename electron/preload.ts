import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    openFile: async () => {
      return await ipcRenderer.invoke('dialog:openFile');
    },
    saveFile: async (content: string) => {
      return await ipcRenderer.invoke('dialog:saveFile', content);
    },
    onUpdateAvailable: (callback: () => void) => {
      const subscription = (_event: IpcRendererEvent) => callback();
      ipcRenderer.on('update-available', subscription);
      return () => ipcRenderer.removeListener('update-available', subscription);
    },
    onUpdateDownloaded: (callback: () => void) => {
      const subscription = (_event: IpcRendererEvent) => callback();
      ipcRenderer.on('update-downloaded', subscription);
      return () => ipcRenderer.removeListener('update-downloaded', subscription);
    }
  }
);

// Ensure the API types match the exposed methods
declare global {
  interface Window {
    electron: {
      openFile: () => Promise<{ path: string; content: string } | null>;
      saveFile: (content: string) => Promise<string | null>;
      onUpdateAvailable: (callback: () => void) => () => void;
      onUpdateDownloaded: (callback: () => void) => () => void;
    };
  }
}

// Export empty object to make this a module
export {};
