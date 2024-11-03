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
      const projects = await getProjects();
      for (const project of projects) {
        await saveProject({
          ...project,
          lastEdited: new Date().toISOString(),
        });
      }
      console.log('Auto backup completed at', new Date().toLocaleString());
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
    const backupData = {
      timestamp: new Date().toISOString(),
      projects,
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
    console.error('Failed to create backup:', error);
    return false;
  }
};

export const restoreBackup = async (file: File): Promise<boolean> => {
  try {
    const content = await file.text();
    const backupData = JSON.parse(content);
    
    if (!backupData.projects || !Array.isArray(backupData.projects)) {
      throw new Error('Invalid backup file format');
    }
    
    for (const project of backupData.projects) {
      await saveProject(project);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return false;
  }
};