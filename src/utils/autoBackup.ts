import { saveProject, getProjects } from './storage';

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
      // First save all projects to the database
      const projects = await getProjects();
      for (const project of projects) {
        await saveProject({
          ...project,
          lastEdited: new Date().toISOString(),
        });
      }

      // Then create a backup using the Electron IPC
      const version = await window.electron['backup:create'](projects);
      console.log('Auto backup completed at', new Date().toLocaleString(), 'Version:', version);
    } catch (error) {
      console.error('Auto backup failed:', error);
    }
  }, intervalMinutes * 60 * 1000);

  console.log('Auto backup started with interval of', intervalMinutes, 'minutes');
};

export const stopAutoBackup = () => {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    console.log('Auto backup stopped');
  }
};

export const createBackup = async () => {
  try {
    const projects = await getProjects();
    const version = await window.electron['backup:create'](projects);
    console.log('Manual backup created:', version);
    return true;
  } catch (error) {
    console.error('Failed to create backup:', error);
    return false;
  }
};

export const restoreBackup = async (version: string): Promise<boolean> => {
  try {
    const projects = await window.electron['backup:restore'](version);
    
    // Save restored projects to database
    for (const project of projects) {
      await saveProject(project);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
};

export const listBackups = async () => {
  try {
    return await window.electron['backup:list']();
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
};

export const exportBackup = async (version: string): Promise<boolean> => {
  try {
    const result = await window.electron.dialog.showSaveDialog({
      defaultPath: `gamebook-backup-${version}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      await window.electron['backup:export'](version, result.filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to export backup:', error);
    return false;
  }
};

export const importBackup = async (): Promise<boolean> => {
  try {
    const result = await window.electron.dialog.showOpenDialog({
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
      const version = await window.electron['backup:import'](result.filePaths[0]);
      console.log('Backup imported:', version);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to import backup:', error);
    return false;
  }
};
