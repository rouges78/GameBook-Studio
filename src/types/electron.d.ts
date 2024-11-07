import type { Project } from '../components/ParagraphEditor/types';

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
  compression: boolean; // Added compression setting
}

interface BackupMetadata {
  version: string;
  timestamp: string;
  checksum: string;
  size: number;
  compressedSize?: number; // Added optional compressed size
  compressed?: boolean; // Added compression flag
  retentionCategory?: 'daily' | 'weekly' | 'monthly';
}

interface DialogResult {
  canceled: boolean;
  filePath?: string;
  filePaths?: string[];
}

interface TelemetryEvent {
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

type UpdateEventCallback = (info: UpdateInfo) => void;
type ProgressEventCallback = (progress: number) => void;
type ErrorEventCallback = (error: { message: string; code: string }) => void;
type GenericEventCallback = () => void;

interface ElectronAPI {
  // Window operations
  closeWindow: () => void;

  // File operations
  'dialog:openFile': () => Promise<{ path: string; content: string; } | null>;
  'dialog:saveFile': (content: string) => Promise<string | null>;
  
  // Update handlers
  'update:check': () => Promise<any>;
  'update:start-download': () => Promise<void>;
  'update:install': () => void;
  
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

  // Dialog handlers
  dialog: {
    showOpenDialog: (options: any) => Promise<DialogResult>;
    showSaveDialog: (options: any) => Promise<DialogResult>;
  };

  // Event listeners
  on(channel: 'update-available', callback: UpdateEventCallback): void;
  on(channel: 'update-download-progress', callback: ProgressEventCallback): void;
  on(channel: 'update-downloaded', callback: GenericEventCallback): void;
  on(channel: 'update-error', callback: ErrorEventCallback): void;
  on(channel: string, callback: (...args: any[]) => void): void;

  off(channel: 'update-available', callback: UpdateEventCallback): void;
  off(channel: 'update-download-progress', callback: ProgressEventCallback): void;
  off(channel: 'update-downloaded', callback: GenericEventCallback): void;
  off(channel: 'update-error', callback: ErrorEventCallback): void;
  off(channel: string, callback: (...args: any[]) => void): void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export { UpdateInfo, BackupMetadata, BackupSettings, DialogResult, TelemetryEvent, ElectronAPI };
