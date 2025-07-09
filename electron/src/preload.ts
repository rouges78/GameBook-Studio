import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Backup
  backup: {
    list: () => ipcRenderer.invoke('backup:list'),
    restore: (fileName: string) => ipcRenderer.invoke('backup:restore', fileName),
  },

  // Progetti
  getProjects: () => ipcRenderer.invoke('get-projects'),
  saveProject: (project: any) => ipcRenderer.invoke('save-project', project),

  // Impostazioni
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings: any) => ipcRenderer.invoke('settings:save', settings),
  },

  // Notifiche
  onUpdate: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.on('update-log', callback);
    // Ritorna una funzione per rimuovere il listener quando il componente si smonta
    return () => {
      ipcRenderer.removeListener('update-log', callback);
    };
  },
});
