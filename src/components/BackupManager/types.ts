export interface Backup {
    version: string;
    timestamp: string;
    size: number;
    checksum: string;
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
}

export interface BackupOperationResult {
    success: boolean;
    message: string;
    error?: string;
}

export interface BackupListResponse {
    backups: Backup[];
    error?: string;
}

export type BackupOperation = 
    | 'create' 
    | 'restore' 
    | 'import' 
    | 'export' 
    | 'delete' 
    | 'list' 
    | 'updateSettings' 
    | 'cleanup';

export interface BackupOperationStatus {
    operation: BackupOperation;
    inProgress: boolean;
    message?: string;
    error?: string;
}

export interface BackupSettingsFormData {
    maxBackups: number;
    dailyRetention: number;
    weeklyRetention: number;
    monthlyRetention: number;
    autoCleanup: boolean;
}

export interface BackupStats {
    totalBackups: number;
    totalSize: number;
    oldestBackup: string;
    newestBackup: string;
    backupsByCategory: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}
