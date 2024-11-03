import { BrowserWindow as ElectronBrowserWindow } from 'electron';

declare global {
  interface Window {
    electron: {
      openFile: () => Promise<{ path: string; content: string } | null>;
      saveFile: (content: string) => Promise<string | null>;
      onUpdateAvailable: (callback: () => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
      removeUpdateListeners: () => void;
    };
  }
}

declare module 'electron' {
  interface BrowserWindow extends ElectronBrowserWindow {}
}
