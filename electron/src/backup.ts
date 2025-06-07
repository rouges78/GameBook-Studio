import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createHash } from 'crypto';
import { BackupMetadata, BackupSettings } from './types.js';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

interface BackupData {
    metadata: BackupMetadata;
    projects?: any[]; // Make projects optional since it won't be included in compressed backups
}

const DEFAULT_SETTINGS: BackupSettings = {
    maxBackups: 30,
    retentionPeriod: {
        daily: 7,    // Keep daily backups for 7 days
        weekly: 4,   // Keep weekly backups for 4 weeks
        monthly: 3   // Keep monthly backups for 3 months
    },
    autoCleanup: true,
    compression: true // Enable compression by default
};

const BACKUP_DIR = 'backups';
const SETTINGS_FILE = 'backup-settings.json';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

type RetentionCategory = 'daily' | 'weekly' | 'monthly';

export class BackupManager {
    private backupPath: string;
    private settingsPath: string;
    private settings: BackupSettings;
    private currentDate: Date;

    constructor(testSettings?: BackupSettings) {
        // Initialize settings first
        if (testSettings) {
            console.log('Using test settings:', testSettings);
            this.settings = { ...DEFAULT_SETTINGS, ...testSettings };  // Merge with defaults
        } else {
            console.log('Using default settings:', DEFAULT_SETTINGS);
            this.settings = { ...DEFAULT_SETTINGS };  // Clone default settings
        }

        // Initialize other properties
        this.backupPath = path.join(app.getPath('userData'), BACKUP_DIR);
        this.settingsPath = path.join(app.getPath('userData'), SETTINGS_FILE);
        this.currentDate = new Date();
    }

    private async ensureBackupDir() {
        try {
            await fs.access(this.backupPath);
        } catch {
            await fs.mkdir(this.backupPath, { recursive: true });
        }
    }

    private async generateChecksum(data: string | Buffer): Promise<string> {
        return createHash('sha256').update(data).digest('hex');
    }

    private async compressData(data: string): Promise<Buffer> {
        return gzipAsync(Buffer.from(data));
    }

    private async decompressData(data: Buffer): Promise<string> {
        const decompressed = await gunzipAsync(data);
        return decompressed.toString('utf-8');
    }

    private async getBackupFiles(): Promise<string[]> {
        await this.ensureBackupDir();
        const files = await fs.readdir(this.backupPath);
        return files
            .filter((file: string) => file.endsWith('.json') || file.endsWith('.gz'))
            .sort((a: string, b: string) => b.localeCompare(a)); // Sort by name descending (newest first)
    }

    private determineRetentionCategory(timestamp: string, referenceDate: Date = this.currentDate): RetentionCategory {
        const backupDate = new Date(timestamp);
        
        // Validate that backupDate is a valid date
        if (isNaN(backupDate.getTime())) {
            console.error('Invalid backup timestamp:', timestamp);
            return 'daily'; // Default to daily for invalid dates
        }

        const diffDays = Math.floor((referenceDate.getTime() - backupDate.getTime()) / MS_PER_DAY);

        // Log detailed information about the categorization
        const context = {
            timestamp,
            referenceDate: referenceDate.toISOString(),
            diffDays,
            backupDate: backupDate.toISOString()
        };

        // Handle negative diffDays (future dates) as daily backups
        if (diffDays < 0) {
            console.log('Future backup, categorizing as daily:', context);
            return 'daily';
        }

        // Categorize based on age with explicit boundaries
        // Monthly: 30 days or more
        if (diffDays >= 30) {
            console.log(`Backup is ${diffDays} days old (>= 30), categorizing as monthly:`, context);
            return 'monthly';
        }
        
        // Weekly: 7-29 days (inclusive)
        if (diffDays >= 7) {
            console.log(`Backup is ${diffDays} days old (>= 7), categorizing as weekly:`, context);
            return 'weekly';
        }
        
        // Daily: 0-6 days (inclusive)
        console.log(`Backup is ${diffDays} days old (< 7), categorizing as daily:`, context);
        return 'daily';
    }

    async loadSettings(): Promise<void> {
        try {
            const content = await fs.readFile(this.settingsPath, 'utf-8');
            const loadedSettings = JSON.parse(content);
            // Validate loaded settings structure and merge with defaults
            if (loadedSettings && 
                typeof loadedSettings.maxBackups === 'number' &&
                loadedSettings.retentionPeriod &&
                typeof loadedSettings.retentionPeriod.daily === 'number' &&
                typeof loadedSettings.retentionPeriod.weekly === 'number' &&
                typeof loadedSettings.retentionPeriod.monthly === 'number' &&
                typeof loadedSettings.autoCleanup === 'boolean') {
                this.settings = { ...DEFAULT_SETTINGS, ...loadedSettings };
                console.log('Loaded settings:', this.settings);
            }
        } catch {
            // Keep current settings if file doesn't exist or is invalid
            console.log('Using current settings:', this.settings);
        }
    }

    private async saveSettings(): Promise<void> {
        await fs.writeFile(this.settingsPath, JSON.stringify(this.settings, null, 2));
        console.log('Saved settings:', this.settings);
    }

    async getSettings(): Promise<BackupSettings> {
        return { ...this.settings };
    }

    async updateSettings(newSettings: BackupSettings): Promise<void> {
        console.log('Updating settings from:', this.settings, 'to:', newSettings);
        this.settings = { ...DEFAULT_SETTINGS, ...newSettings };
        await this.saveSettings();
        if (this.settings.autoCleanup) {
            await this.runCleanup();
        }
    }

    setCurrentDate(date: Date) {
        this.currentDate = new Date(date.getTime());
    }

    async createBackup(projects: any[]): Promise<BackupMetadata> {
        await this.ensureBackupDir();

        const timestamp = this.currentDate.toISOString();
        const sanitizedTimestamp = timestamp.replace(/[:.]/g, '-');
        const version = `backup_${sanitizedTimestamp}`;
        
        // Prepare data
        const projectsData = JSON.stringify(projects);
        const checksum = await this.generateChecksum(projectsData);
        
        const category = this.determineRetentionCategory(timestamp, this.currentDate);
        console.log('Creating backup with category:', category);

        let finalData: string | Buffer = projectsData;
        let compressedSize: number | undefined;
        let compressed = false;

        // Compress if enabled
        if (this.settings.compression) {
            finalData = await this.compressData(projectsData);
            compressedSize = finalData.length;
            compressed = true;
        }

        const backupData: BackupData = {
            metadata: {
                version,
                timestamp,
                checksum,
                size: projectsData.length,
                compressedSize,
                compressed,
                retentionCategory: category
            },
            projects: compressed ? undefined : projects // Don't include projects in metadata if compressed
        };

        // Save backup
        const extension = compressed ? 'gz' : 'json';
        const backupFile = path.join(this.backupPath, `${version}.${extension}`);

        if (compressed) {
            // Save metadata separately for compressed backups
            const metadataFile = path.join(this.backupPath, `${version}.meta.json`);
            await fs.writeFile(metadataFile, JSON.stringify({ metadata: backupData.metadata }, null, 2));
            await fs.writeFile(backupFile, finalData);
        } else {
            await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
        }

        // Run cleanup if auto-cleanup is enabled
        if (this.settings.autoCleanup) {
            await this.runCleanup();
        }

        return backupData.metadata;
    }

    async runCleanup(): Promise<void> {
        console.log('Running cleanup with settings:', this.settings);
        const backups = await this.listBackups();

        // Sort backups by date (newest first)
        backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Group backups by retention category
        const categorizedBackups = {
            daily: [] as BackupMetadata[],
            weekly: [] as BackupMetadata[],
            monthly: [] as BackupMetadata[]
        };

        // First pass: categorize backups based on their age
        backups.forEach(backup => {
            const category = this.determineRetentionCategory(backup.timestamp, this.currentDate);
            backup.retentionCategory = category;
            categorizedBackups[category].push(backup);
        });

        console.log('Initial categorization:', {
            daily: categorizedBackups.daily.map(b => ({ version: b.version, timestamp: b.timestamp })),
            weekly: categorizedBackups.weekly.map(b => ({ version: b.version, timestamp: b.timestamp })),
            monthly: categorizedBackups.monthly.map(b => ({ version: b.version, timestamp: b.timestamp }))
        });

        // Keep the most recent backups according to retention settings
        const toKeep = new Set<string>();

        // Keep daily backups (most recent first)
        const keepDaily = categorizedBackups.daily
            .slice(0, Math.max(this.settings.retentionPeriod.daily, 1))
            .map(backup => ({ ...backup, retentionCategory: 'daily' as RetentionCategory }));

        // Keep weekly backups (most recent first)
        const keepWeekly = categorizedBackups.weekly
            .slice(0, Math.max(this.settings.retentionPeriod.weekly, 1))
            .map(backup => ({ ...backup, retentionCategory: 'weekly' as RetentionCategory }));

        // Keep monthly backups (most recent first)
        const keepMonthly = categorizedBackups.monthly
            .slice(0, Math.max(this.settings.retentionPeriod.monthly, 1))
            .map(backup => ({ ...backup, retentionCategory: 'monthly' as RetentionCategory }));

        // Add all kept backups to the Set
        [...keepDaily, ...keepWeekly, ...keepMonthly].forEach(backup => {
            toKeep.add(backup.version);
        });

        console.log('Keeping backups:', {
            total: toKeep.size,
            daily: keepDaily.map(b => ({ version: b.version, timestamp: b.timestamp })),
            weekly: keepWeekly.map(b => ({ version: b.version, timestamp: b.timestamp })),
            monthly: keepMonthly.map(b => ({ version: b.version, timestamp: b.timestamp }))
        });

        // Update metadata for kept backups
        for (const backup of [...keepDaily, ...keepWeekly, ...keepMonthly]) {
            const isCompressed = backup.compressed;
            const extension = isCompressed ? 'gz' : 'json';
            const backupFile = path.join(this.backupPath, `${backup.version}.${extension}`);
            const metadataFile = path.join(this.backupPath, `${backup.version}.meta.json`);

            try {
                if (isCompressed) {
                    const metadata = {
                        metadata: { ...backup }
                    };
                    await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
                } else {
                    const content = await fs.readFile(backupFile, 'utf-8');
                    const backupData: BackupData = JSON.parse(content);
                    backupData.metadata.retentionCategory = backup.retentionCategory;
                    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
                }
            } catch (error) {
                console.error(`Failed to update backup metadata for ${backup.version}:`, error);
            }
        }

        // Delete backups not in the keep set
        const toDelete = backups.filter(backup => !toKeep.has(backup.version));
        console.log('Deleting backups:', toDelete.map(b => ({ 
            version: b.version, 
            timestamp: b.timestamp,
            category: b.retentionCategory 
        })));

        // Delete files
        await Promise.all(
            toDelete.map(async backup => {
                const isCompressed = backup.compressed;
                const extension = isCompressed ? 'gz' : 'json';
                const backupFile = path.join(this.backupPath, `${backup.version}.${extension}`);
                const metadataFile = path.join(this.backupPath, `${backup.version}.meta.json`);

                try {
                    await fs.unlink(backupFile);
                    if (isCompressed) {
                        await fs.unlink(metadataFile).catch(() => {}); // Ignore if metadata file doesn't exist
                    }
                } catch (err) {
                    console.error(`Failed to delete backup ${backup.version}:`, err);
                }
            })
        );
    }

    async restoreBackup(version: string): Promise<any[]> {
        // Try both compressed and uncompressed extensions
        const possibleExtensions = ['gz', 'json'];
        let backupData: BackupData | null = null;
        let compressedData: Buffer | null = null;

        for (const ext of possibleExtensions) {
            const backupFile = path.join(this.backupPath, `${version}.${ext}`);
            const metadataFile = path.join(this.backupPath, `${version}.meta.json`);

            try {
                if (ext === 'gz') {
                    // Read metadata first for compressed backups
                    const metadataContent = await fs.readFile(metadataFile, 'utf-8');
                    backupData = JSON.parse(metadataContent);
                    compressedData = await fs.readFile(backupFile);
                    break;
                } else {
                    const content = await fs.readFile(backupFile, 'utf-8');
                    backupData = JSON.parse(content);
                    break;
                }
            } catch (error) {
                continue; // Try next extension
            }
        }

        if (!backupData) {
            throw new Error(`Backup ${version} not found`);
        }

        try {
            let projectsData: string;
            if (backupData.metadata.compressed && compressedData) {
                projectsData = await this.decompressData(compressedData);
            } else if (backupData.projects) {
                projectsData = JSON.stringify(backupData.projects);
            } else {
                throw new Error('Invalid backup data: no projects found');
            }

            // Verify checksum
            const checksum = await this.generateChecksum(projectsData);
            if (checksum !== backupData.metadata.checksum) {
                throw new Error('Backup integrity check failed');
            }

            return JSON.parse(projectsData);
        } catch (error) {
            console.error('Failed to restore backup:', error);
            throw error;
        }
    }

    async listBackups(): Promise<BackupMetadata[]> {
        const backupFiles = await this.getBackupFiles();
        const backups: BackupMetadata[] = [];

        for (const file of backupFiles) {
            try {
                const isCompressed = file.endsWith('.gz');
                const version = file.replace(/\.(json|gz|meta\.json)$/, '');
                
                if (file.endsWith('.meta.json')) {
                    continue; // Skip metadata files, they'll be handled with their .gz files
                }

                let backupData: BackupData;
                if (isCompressed) {
                    const metadataFile = path.join(this.backupPath, `${version}.meta.json`);
                    const content = await fs.readFile(metadataFile, 'utf-8');
                    backupData = JSON.parse(content);
                } else {
                    const content = await fs.readFile(path.join(this.backupPath, file), 'utf-8');
                    backupData = JSON.parse(content);
                }
                
                // Update retention category based on current date
                const category = this.determineRetentionCategory(backupData.metadata.timestamp, this.currentDate);
                backupData.metadata.retentionCategory = category;
                
                backups.push(backupData.metadata);
            } catch (error) {
                console.error(`Failed to read backup file ${file}:`, error);
            }
        }

        return backups;
    }

    async exportBackup(version: string, exportPath: string): Promise<void> {
        const backup = await this.restoreBackup(version);
        const backupData = {
            metadata: (await this.listBackups()).find(b => b.version === version),
            projects: backup
        };
        await fs.writeFile(exportPath, JSON.stringify(backupData, null, 2));
    }

    async importBackup(importPath: string): Promise<BackupMetadata> {
        const content = await fs.readFile(importPath, 'utf-8');
        const backupData: BackupData = JSON.parse(content);

        // Validate backup data
        if (!backupData.projects || !Array.isArray(backupData.projects)) {
            throw new Error('Invalid backup file format');
        }

        // Create a new backup with the imported data
        return this.createBackup(backupData.projects);
    }
}
