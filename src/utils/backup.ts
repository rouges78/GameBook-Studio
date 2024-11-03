import { saveProject, getProjects } from './storage';
import { Project } from '../components/ParagraphEditor/types';

interface BackupMetadata {
  version: string;
  timestamp: string;
  checksum: string;
  size: number;
}

interface BackupVersion {
  metadata: BackupMetadata;
  data: Project[];
}

const MAX_BACKUPS = 10;
const BACKUP_KEY = 'gamebook_backups';

// Generate checksum for data integrity
const generateChecksum = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Compress data using built-in compression
const compressData = async (data: string): Promise<string> => {
  const blob = new Blob([data], { type: 'application/json' });
  const compressedBlob = await new Response(blob.stream().pipeThrough(new CompressionStream('gzip'))).blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(compressedBlob);
  });
};

// Decompress data
const decompressData = async (compressedData: string): Promise<string> => {
  const response = await fetch(compressedData);
  const blob = await response.blob();
  const decompressedBlob = await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsText(decompressedBlob);
  });
};

// Get all backup versions
export const getBackupVersions = async (): Promise<BackupVersion[]> => {
  const versions = localStorage.getItem(BACKUP_KEY);
  return versions ? JSON.parse(versions) : [];
};

// Create new backup version
export const createBackupVersion = async (): Promise<string> => {
  try {
    const projects = await getProjects();
    const timestamp = new Date().toISOString();
    const version = `backup_${timestamp}`;
    
    // Prepare data
    const dataString = JSON.stringify(projects);
    const checksum = await generateChecksum(dataString);
    const compressedData = await compressData(dataString);
    
    // Create backup metadata
    const metadata: BackupMetadata = {
      version,
      timestamp,
      checksum,
      size: compressedData.length
    };
    
    // Get existing backups and add new one
    const backups = await getBackupVersions();
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
  } catch (error) {
    console.error('Failed to create backup version:', error);
    throw error;
  }
};

// Restore from backup version
export const restoreBackupVersion = async (version: string): Promise<boolean> => {
  try {
    const backups = await getBackupVersions();
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
      await saveProject(project);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
};

// Start automatic backup
let backupInterval: NodeJS.Timeout | null = null;

export const startAutoBackup = (intervalMinutes: number = 5) => {
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
      await createBackupVersion();
      console.log('Auto backup completed at', new Date().toLocaleString());
    } catch (error) {
      console.error('Auto backup failed:', error);
    }
  }, intervalMinutes * 60 * 1000);

  console.log('Auto backup started with interval of', intervalMinutes, 'minutes');
};

// Stop automatic backup
export const stopAutoBackup = () => {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    console.log('Auto backup stopped');
  }
};

// Export backup to file
export const exportBackup = async (): Promise<boolean> => {
  try {
    const projects = await getProjects();
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
  } catch (error) {
    console.error('Failed to export backup:', error);
    return false;
  }
};

// Import backup from file
export const importBackup = async (file: File): Promise<boolean> => {
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
      await saveProject(project);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import backup:', error);
    return false;
  }
};
