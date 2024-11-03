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

// This empty export is necessary to make this a module
export {};
