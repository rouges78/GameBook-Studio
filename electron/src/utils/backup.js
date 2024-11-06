"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importBackup = exports.exportBackup = exports.stopAutoBackup = exports.startAutoBackup = exports.restoreBackupVersion = exports.createBackupVersion = exports.getBackupVersions = void 0;
const storage_1 = require("./storage");
const MAX_BACKUPS = 10;
const BACKUP_KEY = 'gamebook_backups';
// Generate checksum for data integrity
const generateChecksum = async (data) => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
// Compress data using built-in compression
const compressData = async (data) => {
    const blob = new Blob([data], { type: 'application/json' });
    const compressedBlob = await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(compressedBlob);
    });
};
// Decompress data
const decompressData = async (compressedData) => {
    const response = await fetch(compressedData);
    const blob = await response.blob();
    const decompressedBlob = await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsText(decompressedBlob);
    });
};
// Get all backup versions
const getBackupVersions = async () => {
    const versions = localStorage.getItem(BACKUP_KEY);
    return versions ? JSON.parse(versions) : [];
};
exports.getBackupVersions = getBackupVersions;
// Create new backup version
const createBackupVersion = async () => {
    try {
        const projects = await (0, storage_1.getProjects)();
        const timestamp = new Date().toISOString();
        const version = `backup_${timestamp}`;
        // Prepare data
        const dataString = JSON.stringify(projects);
        const checksum = await generateChecksum(dataString);
        const compressedData = await compressData(dataString);
        // Create backup metadata
        const metadata = {
            version,
            timestamp,
            checksum,
            size: compressedData.length
        };
        // Get existing backups and add new one
        const backups = await (0, exports.getBackupVersions)();
        backups.push({
            metadata,
            data: projects
        });
        // Keep only recent backups
        while (backups.length > MAX_BACKUPS) {
            backups.shift();
        }
        // Save updated backups
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
        return version;
    }
    catch (error) {
        console.error('Failed to create backup version:', error);
        throw error;
    }
};
exports.createBackupVersion = createBackupVersion;
// Restore from backup version
const restoreBackupVersion = async (version) => {
    try {
        const backups = await (0, exports.getBackupVersions)();
        const backup = backups.find(b => b.metadata.version === version);
        if (!backup) {
            throw new Error('Backup version not found');
        }
        // Verify data integrity
        const dataString = JSON.stringify(backup.data);
        const checksum = await generateChecksum(dataString);
        if (checksum !== backup.metadata.checksum) {
            throw new Error('Backup integrity check failed');
        }
        // Restore projects
        for (const project of backup.data) {
            await (0, storage_1.saveProject)(project);
        }
        return true;
    }
    catch (error) {
        console.error('Failed to restore backup:', error);
        return false;
    }
};
exports.restoreBackupVersion = restoreBackupVersion;
// Start automatic backup
let backupInterval = null;
const startAutoBackup = (intervalMinutes = 5) => {
    if (backupInterval) {
        clearInterval(backupInterval);
    }
    // Check if auto-save is enabled
    const savedSettings = localStorage.getItem('gamebookSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (!settings.autoSaveEnabled) {
            return;
        }
        intervalMinutes = settings.autoSaveInterval || intervalMinutes;
    }
    backupInterval = setInterval(async () => {
        try {
            await (0, exports.createBackupVersion)();
            console.log('Auto backup completed at', new Date().toLocaleString());
        }
        catch (error) {
            console.error('Auto backup failed:', error);
        }
    }, intervalMinutes * 60 * 1000);
    console.log('Auto backup started with interval of', intervalMinutes, 'minutes');
};
exports.startAutoBackup = startAutoBackup;
// Stop automatic backup
const stopAutoBackup = () => {
    if (backupInterval) {
        clearInterval(backupInterval);
        backupInterval = null;
        console.log('Auto backup stopped');
    }
};
exports.stopAutoBackup = stopAutoBackup;
// Export backup to file
const exportBackup = async () => {
    try {
        const projects = await (0, storage_1.getProjects)();
        const backupData = {
            timestamp: new Date().toISOString(),
            projects,
            version: 'export_' + new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gamebook-backup-${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    }
    catch (error) {
        console.error('Failed to export backup:', error);
        return false;
    }
};
exports.exportBackup = exportBackup;
// Import backup from file
const importBackup = async (file) => {
    try {
        const content = await file.text();
        const backupData = JSON.parse(content);
        if (!backupData.projects || !Array.isArray(backupData.projects)) {
            throw new Error('Invalid backup file format');
        }
        // Verify each project before importing
        for (const project of backupData.projects) {
            if (!project.bookTitle || !project.paragraphs) {
                throw new Error('Invalid project format in backup');
            }
        }
        // Import projects
        for (const project of backupData.projects) {
            await (0, storage_1.saveProject)(project);
        }
        return true;
    }
    catch (error) {
        console.error('Failed to import backup:', error);
        return false;
    }
};
exports.importBackup = importBackup;
