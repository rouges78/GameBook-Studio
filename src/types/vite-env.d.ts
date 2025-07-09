/// <reference types="vite/client" />

interface Window {
  electron: {
    backup: {
      list: () => Promise<any[]>;
      restore: (fileName: string) => Promise<{ success: boolean; message: string; }>;
    };
    getProjects: () => Promise<any[]>;
    saveProject: (project: any) => Promise<any>;
    settings: {
      get: () => Promise<any>;
      save: (settings: any) => Promise<void>;
    };
    onUpdate: (callback: (event: any, ...args: any[]) => void) => (() => void);
    'window:close': () => void;
  };
}
