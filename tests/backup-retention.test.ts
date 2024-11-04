import { BackupManager } from '../electron/backup';
import { setupTestEnvironment, cleanupTestEnvironment, cleanupTestFiles, TEST_PATHS } from './setup';
import fs from 'fs/promises';
import path from 'path';

describe('Backup Retention Tests', () => {
    let backupManager: BackupManager;
    const testProjects = [
        { id: 1, name: 'Test Project 1' },
        { id: 2, name: 'Test Project 2' }
    ];

    const TEST_SETTINGS = {
        maxBackups: 3,
        retentionPeriod: {
            daily: 1,
            weekly: 1,
            monthly: 1
        },
        autoCleanup: true,
        compression: false // Default to uncompressed for basic tests
    };

    beforeAll(async () => {
        console.log('Setting up test environment...');
        await cleanupTestEnvironment();
        await setupTestEnvironment();
        console.log('Test environment setup complete');
    });

    afterAll(async () => {
        console.log('Cleaning up test environment...');
        await cleanupTestEnvironment();
        console.log('Test environment cleanup complete');
    });

    beforeEach(async () => {
        console.log('Setting up test case...');
        await setupTestEnvironment();
        backupManager = new BackupManager(TEST_SETTINGS);
        // Verify test settings were applied
        const settings = await backupManager.getSettings();
        console.log('Initial settings:', settings);
        expect(settings).toEqual(TEST_SETTINGS);
        console.log('Test case setup complete');
    });

    afterEach(async () => {
        console.log('Cleaning up test case...');
        await cleanupTestFiles();
        console.log('Test case cleanup complete');
    });

    // Helper function to verify directory exists
    const ensureDirectoryExists = async () => {
        await fs.mkdir(TEST_PATHS.root, { recursive: true });
        await fs.mkdir(TEST_PATHS.backups, { recursive: true });
        const exists = await fs.access(TEST_PATHS.backups)
            .then(() => true)
            .catch(() => false);
        console.log('Backup directory exists:', exists, 'Path:', TEST_PATHS.backups);
        return exists;
    };

    it('creates backup with initial categorization', async () => {
        await ensureDirectoryExists();
        const now = new Date('2024-02-01T00:00:00.000Z');
        backupManager.setCurrentDate(now);
        
        const version = await backupManager.createBackup(testProjects);
        console.log('Created backup with version:', version);
        
        const backups = await backupManager.listBackups();
        console.log('Listed backups:', backups);
        
        const createdBackup = backups.find(b => b.version === version);
        expect(createdBackup).toBeDefined();
        expect(createdBackup?.retentionCategory).toBe('daily');
        expect(createdBackup?.size).toBeGreaterThan(0);
    });

    it('assigns backup retention categories correctly', async () => {
        await ensureDirectoryExists();
        const now = new Date('2024-02-01T00:00:00.000Z');
        const twoDaysAgo = new Date('2024-01-30T00:00:00.000Z');
        const tenDaysAgo = new Date('2024-01-22T00:00:00.000Z');
        const fortyDaysAgo = new Date('2023-12-23T00:00:00.000Z');

        // Create backups with different dates
        backupManager.setCurrentDate(fortyDaysAgo);
        const oldBackup = await backupManager.createBackup(testProjects);
        console.log('Created old backup:', oldBackup);
        
        backupManager.setCurrentDate(tenDaysAgo);
        const weeklyBackup = await backupManager.createBackup(testProjects);
        console.log('Created weekly backup:', weeklyBackup);
        
        backupManager.setCurrentDate(twoDaysAgo);
        const recentBackup = await backupManager.createBackup(testProjects);
        console.log('Created recent backup:', recentBackup);
        
        backupManager.setCurrentDate(now);
        const latestBackup = await backupManager.createBackup(testProjects);
        console.log('Created latest backup:', latestBackup);

        const backups = await backupManager.listBackups();
        console.log('All backups:', backups);
        
        const getBackupByVersion = (version: string) => 
            backups.find(b => b.version === version);

        expect(getBackupByVersion(latestBackup)?.retentionCategory).toBe('daily');
        expect(getBackupByVersion(recentBackup)?.retentionCategory).toBe('daily');
        expect(getBackupByVersion(weeklyBackup)?.retentionCategory).toBe('weekly');
        expect(getBackupByVersion(oldBackup)?.retentionCategory).toBe('monthly');
    });

    it('respects retention periods during cleanup', async () => {
        await ensureDirectoryExists();
        const now = new Date('2024-02-01T00:00:00.000Z');
        backupManager.setCurrentDate(now);
        
        await backupManager.updateSettings({
            maxBackups: 10,
            retentionPeriod: {
                daily: 2,
                weekly: 1,
                monthly: 1
            },
            autoCleanup: true,
            compression: false
        });

        const dates = [
            new Date('2024-01-31T00:00:00.000Z'), // 1 day ago (daily)
            new Date('2024-01-30T00:00:00.000Z'), // 2 days ago (daily)
            new Date('2024-01-29T00:00:00.000Z'), // 3 days ago (should be cleaned)
            new Date('2024-01-22T00:00:00.000Z'), // 10 days ago (weekly)
            new Date('2024-01-15T00:00:00.000Z'), // 17 days ago (should be cleaned)
            new Date('2023-12-01T00:00:00.000Z'), // monthly
            new Date('2023-11-01T00:00:00.000Z'), // should be cleaned
        ];

        for (const date of dates) {
            backupManager.setCurrentDate(date);
            const backup = await backupManager.createBackup(testProjects);
            console.log('Created backup for date:', date.toISOString(), 'Version:', backup);
        }

        backupManager.setCurrentDate(now);
        await backupManager.runCleanup();

        const remainingBackups = await backupManager.listBackups();
        console.log('Remaining backups after cleanup:', remainingBackups);
        
        expect(remainingBackups.length).toBe(4); // Should keep 2 daily, 1 weekly, 1 monthly
        
        const categories = remainingBackups.map(b => b.retentionCategory);
        expect(categories.filter(c => c === 'daily').length).toBe(2);
        expect(categories.filter(c => c === 'weekly').length).toBe(1);
        expect(categories.filter(c => c === 'monthly').length).toBe(1);
    });

    it('creates and restores compressed backups', async () => {
        await ensureDirectoryExists();
        const now = new Date('2024-02-01T00:00:00.000Z');
        backupManager.setCurrentDate(now);

        // Enable compression
        await backupManager.updateSettings({
            ...TEST_SETTINGS,
            compression: true
        });

        const version = await backupManager.createBackup(testProjects);
        console.log('Created compressed backup:', version);

        const backups = await backupManager.listBackups();
        const backup = backups.find(b => b.version === version);
        
        expect(backup).toBeDefined();
        expect(backup?.compressed).toBe(true);
        expect(backup?.compressedSize).toBeDefined();
        
        if (backup?.compressedSize !== undefined) {
            expect(backup.compressedSize).toBeLessThan(backup.size);
        }

        // Verify the backup files
        const backupFile = path.join(TEST_PATHS.backups, `${version}.gz`);
        const metadataFile = path.join(TEST_PATHS.backups, `${version}.meta.json`);
        
        const backupExists = await fs.access(backupFile)
            .then(() => true)
            .catch(() => false);
        const metadataExists = await fs.access(metadataFile)
            .then(() => true)
            .catch(() => false);

        expect(backupExists).toBe(true);
        expect(metadataExists).toBe(true);

        // Restore and verify content
        const restored = await backupManager.restoreBackup(version);
        expect(restored).toEqual(testProjects);
    });

    it('handles mixed compressed and uncompressed backups', async () => {
        await ensureDirectoryExists();
        const now = new Date('2024-02-01T00:00:00.000Z');
        backupManager.setCurrentDate(now);

        // Create uncompressed backup
        const uncompressedVersion = await backupManager.createBackup(testProjects);

        // Enable compression and create compressed backup
        await backupManager.updateSettings({
            ...TEST_SETTINGS,
            compression: true
        });
        const compressedVersion = await backupManager.createBackup(testProjects);

        // List and verify both types exist
        const backups = await backupManager.listBackups();
        const uncompressed = backups.find(b => b.version === uncompressedVersion);
        const compressed = backups.find(b => b.version === compressedVersion);

        expect(uncompressed?.compressed).toBeFalsy();
        expect(compressed?.compressed).toBe(true);

        // Restore both and verify content
        const restoredUncompressed = await backupManager.restoreBackup(uncompressedVersion);
        const restoredCompressed = await backupManager.restoreBackup(compressedVersion);

        expect(restoredUncompressed).toEqual(testProjects);
        expect(restoredCompressed).toEqual(testProjects);
    });

    it('maintains backup integrity after cleanup with compression', async () => {
        await ensureDirectoryExists();
        const now = new Date('2024-02-01T00:00:00.000Z');
        backupManager.setCurrentDate(now);
        
        // Enable compression
        await backupManager.updateSettings({
            ...TEST_SETTINGS,
            compression: true
        });
        
        const version = await backupManager.createBackup(testProjects);
        console.log('Created compressed backup:', version);
        
        await backupManager.runCleanup();
        console.log('Ran cleanup');
        
        const restoredProjects = await backupManager.restoreBackup(version);
        console.log('Restored projects:', restoredProjects);
        
        expect(restoredProjects).toEqual(testProjects);
    });

    it('handles compression settings changes', async () => {
        await ensureDirectoryExists();
        const now = new Date('2024-02-01T00:00:00.000Z');
        backupManager.setCurrentDate(now);

        // Start with compression disabled
        const uncompressedVersion = await backupManager.createBackup(testProjects);

        // Enable compression
        await backupManager.updateSettings({
            ...TEST_SETTINGS,
            compression: true
        });

        // Create new backup with compression
        const compressedVersion = await backupManager.createBackup(testProjects);

        // Disable compression again
        await backupManager.updateSettings({
            ...TEST_SETTINGS,
            compression: false
        });

        // Create another uncompressed backup
        const finalVersion = await backupManager.createBackup(testProjects);

        // Verify all backups can be restored
        const restored1 = await backupManager.restoreBackup(uncompressedVersion);
        const restored2 = await backupManager.restoreBackup(compressedVersion);
        const restored3 = await backupManager.restoreBackup(finalVersion);

        expect(restored1).toEqual(testProjects);
        expect(restored2).toEqual(testProjects);
        expect(restored3).toEqual(testProjects);
    });

    it('exports and imports compressed backups correctly', async () => {
        await ensureDirectoryExists();
        
        // Enable compression
        await backupManager.updateSettings({
            ...TEST_SETTINGS,
            compression: true
        });
        
        const version = await backupManager.createBackup(testProjects);
        
        const exportPath = path.join(TEST_PATHS.root, 'exported-backup.json');
        await backupManager.exportBackup(version, exportPath);
        
        // Import the exported backup
        const importedVersion = await backupManager.importBackup(exportPath);
        const restoredProjects = await backupManager.restoreBackup(importedVersion);
        
        expect(restoredProjects).toEqual(testProjects);
    });
});
