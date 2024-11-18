import type { Project } from './types/pages';

export interface UpdateInfo {
  version: string;
  releaseNotes: string;
}

export interface BackupSettings {
  maxBackups: number;
  retentionPeriod: {
    daily: number;   // Number of daily backups to keep
    weekly: number;  // Number of weekly backups to keep
    monthly: number; // Number of monthly backups to keep
  };
  autoCleanup: boolean;
  compression: boolean;
}

export interface BackupMetadata {
  version: string;
  timestamp: string;
  checksum: string;
  size: number;
  compressedSize?: number;
  compressed?: boolean;
  retentionCategory?: 'daily' | 'weekly' | 'monthly';
}

export interface DialogResult {
  canceled: boolean;
  filePath?: string;
  filePaths?: string[];
}

export interface TelemetryEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  appVersion: string;
  platform: string;
  arch: string;
}

export interface IpcApi {
    // Window operations
    'window:close': () => void;

    // Update handlers
    'update:check': () => Promise<any>;
    'update:start-download': () => Promise<void>;
    'update:install': () => void;
    
    // File handlers
    'dialog:openFile': () => Promise<{ path: string; content: string; } | null>;
    'dialog:saveFile': (content: string) => Promise<string | null>;
    
    // Backup handlers
    'backup:create': (projects: Project[]) => Promise<string>;
    'backup:restore': (version: string) => Promise<any[]>;
    'backup:list': () => Promise<BackupMetadata[]>;
    'backup:export': (version: string, exportPath: string) => Promise<void>;
    'backup:import': (importPath: string) => Promise<string>;
    
    // Backup settings handlers
    'backup:getSettings': () => Promise<BackupSettings>;
    'backup:updateSettings': (settings: BackupSettings) => Promise<void>;
    'backup:runCleanup': () => Promise<void>;

    // Database handlers
    'db:getProjects': () => Promise<Project[]>;
    'db:getProject': (bookTitle: string) => Promise<Project | undefined>;
    'db:saveProject': (project: Project) => Promise<void>;
    'db:deleteProject': (bookTitle: string) => Promise<void>;
    'db:debugDatabase': () => Promise<Project[]>;

    // Telemetry handlers
    'telemetry:getData': () => Promise<TelemetryEvent[]>;
    'telemetry-events': (events: TelemetryEvent[]) => Promise<void>;
    'telemetry-status': () => Promise<boolean>;
    'telemetry-toggle': (enabled: boolean) => Promise<boolean>;
}

export interface IpcEventMap {
    'update-available': UpdateInfo;
    'update-download-progress': number;
    'update-downloaded': void;
    'update-error': { message: string; code: string };
    'telemetry-status-changed': boolean;
}

export type IpcEvents = {
    [K in keyof IpcEventMap]: (data: IpcEventMap[K]) => void;
};
