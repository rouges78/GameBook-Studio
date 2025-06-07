import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdate: (callback: (event: any, data: any) => void) => 
    ipcRenderer.on('update', callback)
});
