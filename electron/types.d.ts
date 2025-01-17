export interface BackupMetadata {
    version: string;
    timestamp: string;
    checksum: string;
    size: number;
    compressedSize?: number;
    compressed?: boolean;
    retentionCategory?: 'daily' | 'weekly' | 'monthly';
}

export interface BackupSettings {
    maxBackups: number;
    retentionPeriod: {
        daily: number;   // Number of daily backups to keep
        weekly: number;  // Number of weekly backups to keep
        monthly: number; // Number of monthly backups to keep
    };
    autoCleanup: boolean;
    compression?: boolean; // Whether to use compression for new backups
}

export interface Project {
    bookTitle: string;
    author: string;
    lastEdited: string;
    paragraphs: Array<{
        id: string;
        text: string;
        choices: any[];
        x?: number;
        y?: number;
    }>;
    mapSettings: {
        positions: { [key: string]: { x: number; y: number } };
        backgroundImage: string | null;
        imageAdjustments: {
            contrast: number;
            transparency: number;
            blackAndWhite: number;
            sharpness: number;
            brightness: number;
            width: number;
            height: number;
            maintainAspectRatio: boolean;
        };
    };
}

export interface TelemetryEvent {
    category: string;
    action: string;
    label?: string;
    value?: number;
    metadata?: Record<string, any>;
    timestamp: number;
    appVersion?: string;
    platform?: string;
    arch?: string;
}

export interface UpdateInfo {
    version: string;
    releaseNotes: string;
}

export interface IpcApi {
    // Update handlers
    'update:check': () => Promise<any>;
    'update:start-download': () => Promise<void>;
    'update:install': () => void;
    
    // File handlers
    'dialog:openFile': () => Promise<{ path: string; content: string; } | null>;
    'dialog:saveFile': (content: string) => Promise<string | null>;
    
    // Backup handlers
    'backup:create': () => Promise<string>;
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
    'telemetry-events': (events: TelemetryEvent[]) => Promise<void>;
    'telemetry-status': () => Promise<boolean>;
    'telemetry-toggle': (enabled: boolean) => Promise<boolean>;
    'get-telemetry-data': () => Promise<TelemetryEvent[]>;
}

export interface IpcEventMap {
    'update-available': UpdateInfo;
    'update-download-progress': number;
    'update-downloaded': void;
    'telemetry-status-changed': boolean;
}

export type IpcEvents = {
    [K in keyof IpcEventMap]: (data: IpcEventMap[K]) => void;
}
