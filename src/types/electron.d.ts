import { Project } from '../components/ParagraphEditor/types';

interface UpdateInfo {
  version: string;
  releaseNotes: string;
}

interface BackupSettings {
  maxBackups: number;
  retentionPeriod: {
    daily: number;   // Number of daily backups to keep
    weekly: number;  // Number of weekly backups to keep
    monthly: number; // Number of monthly backups to keep
  };
  autoCleanup: boolean;
}

interface BackupMetadata {
  version: string;
  timestamp: string;
  checksum: string;
  size: number;
  retentionCategory?: 'daily' | 'weekly' | 'monthly';
}

interface DialogResult {
  canceled: boolean;
  filePath?: string;
  filePaths?: string[];
}

interface ElectronAPI {
  // File operations
  'dialog:openFile': () => Promise<{ path: string; content: string; } | null>;
  'dialog:saveFile': (content: string) => Promise<string | null>;
  
  // Update operations
  'update:check': () => Promise<any>;
  'update:start-download': () => Promise<void>;
  'update:install': () => void;
  
  // Backup operations
  'backup:create': (projects: any[]) => Promise<string>;
  'backup:restore': (version: string) => Promise<any[]>;
  'backup:list': () => Promise<BackupMetadata[]>;
  'backup:export': (version: string, exportPath: string) => Promise<void>;
  'backup:import': (importPath: string) => Promise<string>;
  
  // Backup settings operations
  'backup:getSettings': () => Promise<BackupSettings>;
  'backup:updateSettings': (settings: BackupSettings) => Promise<void>;
  'backup:runCleanup': () => Promise<void>;

  // Database operations
  'db:getProjects': () => Promise<Project[]>;
  'db:getProject': (bookTitle: string) => Promise<Project | undefined>;
  'db:saveProject': (project: Project) => Promise<void>;
  'db:deleteProject': (bookTitle: string) => Promise<void>;
  'db:debugDatabase': () => Promise<Project[]>;

  // Dialog operations
  dialog: {
    showOpenDialog: (options: any) => Promise<DialogResult>;
    showSaveDialog: (options: any) => Promise<DialogResult>;
  };

  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export { UpdateInfo, BackupMetadata, BackupSettings, DialogResult, ElectronAPI };
