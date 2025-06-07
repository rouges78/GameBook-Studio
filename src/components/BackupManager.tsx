import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BackupMetadata, BackupSettings } from '../types/electron';
import { PageType } from '../types';

interface BackupManagerProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

const translations = {
  it: {
    title: "Gestione Backup",
    backToHome: "Torna alla Home",
    settings: {
      title: "Impostazioni Backup",
      maxBackups: "Numero massimo di backup",
      retentionPeriod: {
        title: "Periodo di conservazione",
        daily: "Backup giornalieri da mantenere",
        weekly: "Backup settimanali da mantenere",
        monthly: "Backup mensili da mantenere"
      },
      autoCleanup: "Pulizia automatica",
      compression: "Compressione backup",
      save: "Salva impostazioni"
    },
    backupList: {
      title: "Lista Backup",
      empty: "Nessun backup disponibile",
      version: "Versione",
      date: "Data",
      size: "Dimensione",
      category: {
        title: "Categoria",
        daily: "Giornaliero",
        weekly: "Settimanale",
        monthly: "Mensile"
      },
      compressed: "Compresso",
      actions: "Azioni"
    },
    actions: {
      create: "Crea Backup",
      restore: "Ripristina",
      export: "Esporta",
      import: "Importa",
      delete: "Elimina",
      back: "Indietro",
      backToHome: "Torna alla Home"
    },
    messages: {
      confirmRestore: "Sei sicuro di voler ripristinare questo backup? I dati attuali verranno sovrascritti.",
      confirmDelete: "Sei sicuro di voler eliminare questo backup?",
      backupCreated: "Backup creato con successo",
      backupRestored: "Backup ripristinato con successo",
      backupDeleted: "Backup eliminato con successo",
      settingsSaved: "Impostazioni salvate con successo",
      backupExported: "Backup esportato con successo",
      exportError: "Errore durante l'esportazione del backup"
    }
  },
  en: {
    title: "Backup Manager",
    settings: {
      title: "Backup Settings",
      maxBackups: "Maximum number of backups",
      retentionPeriod: {
        title: "Retention Period",
        daily: "Daily backups to keep",
        weekly: "Weekly backups to keep",
        monthly: "Monthly backups to keep"
      },
      autoCleanup: "Auto Cleanup",
      compression: "Backup Compression",
      save: "Save Settings"
    },
    backupList: {
      title: "Backup List",
      empty: "No backups available",
      version: "Version",
      date: "Date",
      size: "Size",
      category: {
        title: "Category",
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly"
      },
      compressed: "Compressed",
      actions: "Actions"
    },
    actions: {
      create: "Create Backup",
      restore: "Restore",
      export: "Export",
      import: "Import",
      delete: "Delete",
      back: "Back"
    },
    messages: {
      confirmRestore: "Are you sure you want to restore this backup? Current data will be overwritten.",
      confirmDelete: "Are you sure you want to delete this backup?",
      backupCreated: "Backup created successfully",
      backupRestored: "Backup restored successfully",
      backupDeleted: "Backup deleted successfully",
      settingsSaved: "Settings saved successfully",
      backupExported: "Backup exported successfully",
      exportError: "Error exporting backup"
    }
  }
};

const BackupManager: React.FC<BackupManagerProps> = ({ setCurrentPage, isDarkMode, language = 'it' }) => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [settings, setSettings] = useState<BackupSettings>({
    maxBackups: 30,
    retentionPeriod: {
      daily: 7,
      weekly: 4,
      monthly: 3
    },
    autoCleanup: true,
    compression: true
  });

  const t = translations[language];

  useEffect(() => {
    loadBackups();
    loadSettings();
  }, []);

  const loadBackups = async () => {
    try {
      const backupList = await window.electron['backup:list']();
      setBackups(backupList);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Errore backup:', error.message);
        window.electron.log.error(`Backup error: ${error.message}`);
      }
      console.error('Error loading backups:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const currentSettings = await window.electron['backup:getSettings']();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    const startTime = Date.now();
    try {
      console.timeStamp('Backup started');
      console.log('Initiating backup process...');
      
      console.log('Fetching projects for backup...');
      const projects = await window.electron['db:getProjects']();
      if (!projects || projects.length === 0) {
        throw new Error('Nessun progetto trovato per il backup');
      }

      console.log('Starting backup creation...');
      const backupResult = await window.electron['backup:create'](projects);
      
      if (typeof backupResult === 'string') {
        throw new Error('Risposta inattesa dal servizio di backup');
      }
      
      const newBackup = backupResult as BackupMetadata;
      setBackups(prev => [newBackup, ...prev]);

      console.log('Backup metrics:', {
        duration: Date.now() - startTime,
        memoryUsage: process.memoryUsage(),
        dbSize: newBackup.size
      });

      if (newBackup.size > 100 * 1024 * 1024) {
        alert('Backup completato: L\'operazione ha richiesto più tempo del previsto a causa delle dimensioni del database');
      } else {
        alert(t.messages.backupCreated);
      }

    } catch (error: unknown) {
      console.error('Backup failure:', {
        error: error instanceof Error ? error.stack : error,
        heap: v8.getHeapStatistics(),
        systemMemory: os.totalmem() - os.freemem()
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      alert(`Errore durante il backup: ${errorMessage}`);
      
      window.electron.ipcRenderer.send('save-crash-report', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.stack : error,
        memoryDump: process.memoryUsage(),
        dbSize: backups.reduce((acc, b) => acc + b.size, 0)
      });
      
    } finally {
      setIsCreatingBackup(false);
      console.timeEnd('Backup process');
    }
  };

  const handleRestoreBackup = async (version: string) => {
    if (window.confirm(t.messages.confirmRestore)) {
      try {
        await window.electron['backup:restore'](version);
        alert(t.messages.backupRestored);
      } catch (error: unknown) {
        console.error('Error restoring backup:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`${t.messages.backupRestored}: ${errorMessage}`);
      }
    }
  };

  const [isExportingBackup, setIsExportingBackup] = useState(false);

  const handleExportBackup = async (version: string) => {
    setIsExportingBackup(true);
    try {
      console.log('Showing save dialog...');
      const result = await window.electron.dialog.showSaveDialog({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        title: t.actions.export,
        defaultPath: `backup_${version}.json`
      });
      
      if (!result.canceled && result.filePath) {
        console.log('Exporting backup to:', result.filePath);
        
        // Validate backup version exists
        const backupExists = backups.some(b => b.version === version);
        if (!backupExists) {
          throw new Error(`Backup version ${version} not found`);
        }

        // Export the backup
        await window.electron['backup:export'](version, result.filePath);
        
        console.log('Backup exported successfully');
        alert(t.messages.backupExported);
      }
    } catch (error: unknown) {
      console.error('Backup export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Export failed: ${errorMessage}`);
    } finally {
      setIsExportingBackup(false);
    }
  };

  const [isImportingBackup, setIsImportingBackup] = useState(false);

  const handleImportBackup = async () => {
    setIsImportingBackup(true);
    try {
      console.log('Showing open dialog...');
      const result = await window.electron.dialog.showOpenDialog({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
      });
      
      if (!result.canceled && result.filePaths?.[0]) {
        const filePath = result.filePaths[0];
        
        // Validate file extension
        if (!filePath.toLowerCase().endsWith('.json')) {
          throw new Error('Invalid file type. Please select a JSON file');
        }

        console.log('Importing backup from:', filePath);
        const importResult = await window.electron['backup:import'](filePath);
        if (typeof importResult === 'string') {
          throw new Error('Backup import returned unexpected string');
        }
        const newBackup = importResult as BackupMetadata;
        setBackups(prev => [newBackup, ...prev]);
        
        console.log('Backup imported successfully');
        alert('Backup imported successfully');
      }
    } catch (error: unknown) {
      console.error('Backup import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Import failed: ${errorMessage}`);
    } finally {
      setIsImportingBackup(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await window.electron['backup:updateSettings'](settings);
      alert(t.messages.settingsSaved);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(language === 'it' ? 'it-IT' : 'en-US');
  };

  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const containerClasses = `h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`;
  const cardClasses = `rounded-lg shadow p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`;
  const buttonClasses = (color: string, size: 'normal' | 'small' = 'normal') => {
    const baseClasses = `flex items-center gap-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border ${
      size === 'normal' ? 'px-4 py-2' : 'p-2'
    }`;
  
    const colorClasses = {
      blue: `bg-blue-500 hover:bg-blue-600 text-white border-blue-500/20 hover:border-blue-600/40`,
      purple: `bg-purple-500 hover:bg-purple-600 text-white border-purple-500/20 hover:border-purple-600/40`,
      green: `bg-green-500 hover:bg-green-600 text-white border-green-500/20 hover:border-green-600/40`,
      yellow: `bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500/20 hover:border-yellow-600/40`,
      red: `bg-red-500 hover:bg-red-600 text-white border-red-500/20 hover:border-red-600/40`
    }[color];
  
    return `${baseClasses} ${colorClasses}`;
  };

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-6">
        <div className="flex justify-center items-center mb-4 relative">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 hover:text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:ring-2 hover:ring-blue-500/20 flex items-center gap-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border px-4 py-2 absolute left-6`}
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Torna alla Home</span>
          </button>
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        {/* Settings Section */}
        <div className={cardClasses}>
          <h2 className="text-xl font-semibold mb-4">{t.settings.title}</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">{t.settings.maxBackups}</label>
              <input
                type="number"
                value={settings.maxBackups}
                onChange={(e) => setSettings({...settings, maxBackups: parseInt(e.target.value)})}
                className={`border rounded px-3 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t.settings.retentionPeriod.title}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2">{t.settings.retentionPeriod.daily}</label>
                  <input
                    type="number"
                    value={settings.retentionPeriod.daily}
                    onChange={(e) => setSettings({
                      ...settings,
                      retentionPeriod: {...settings.retentionPeriod, daily: parseInt(e.target.value)}
                    })}
                    className={`border rounded px-3 py-2 w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block mb-2">{t.settings.retentionPeriod.weekly}</label>
                  <input
                    type="number"
                    value={settings.retentionPeriod.weekly}
                    onChange={(e) => setSettings({
                      ...settings,
                      retentionPeriod: {...settings.retentionPeriod, weekly: parseInt(e.target.value)}
                    })}
                    className={`border rounded px-3 py-2 w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block mb-2">{t.settings.retentionPeriod.monthly}</label>
                  <input
                    type="number"
                    value={settings.retentionPeriod.monthly}
                    onChange={(e) => setSettings({
                      ...settings,
                      retentionPeriod: {...settings.retentionPeriod, monthly: parseInt(e.target.value)}
                    })}
                    className={`border rounded px-3 py-2 w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoCleanup}
                  onChange={(e) => setSettings({...settings, autoCleanup: e.target.checked})}
                  className="mr-2"
                />
                {t.settings.autoCleanup}
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.compression}
                  onChange={(e) => setSettings({...settings, compression: e.target.checked})}
                  className="mr-2"
                />
                {t.settings.compression}
              </label>
            </div>

            <button
              onClick={handleSaveSettings}
              className={buttonClasses('blue')}
            >
              {t.settings.save}
            </button>
          </div>
        </div>

        {/* Backup List Section */}
        <div className={`${cardClasses} flex flex-col min-h-0`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t.backupList.title}</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateBackup}
                className={buttonClasses('green')}
              >
                {t.actions.create}
              </button>
              <button
                onClick={handleImportBackup}
                className={buttonClasses('purple')}
              >
                {t.actions.import}
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {backups.length === 0 ? (
              <p className="text-gray-500">{t.backupList.empty}</p>
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-500px)]">
                <table className="min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <th className="px-4 py-2 text-left">{t.backupList.date}</th>
                      <th className="px-4 py-2 text-left">{t.backupList.size}</th>
                      <th className="px-4 py-2 text-left">{t.backupList.category.title}</th>
                      <th className="px-4 py-2 text-left">{t.backupList.compressed}</th>
                      <th className="px-4 py-2 text-left">{t.backupList.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.version} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="px-4 py-2">{formatDate(backup.timestamp)}</td>
                        <td className="px-4 py-2">{formatSize(backup.size)}</td>
                        <td className="px-4 py-2">
                          {backup.retentionCategory && t.backupList.category[backup.retentionCategory]}
                        </td>
                        <td className="px-4 py-2">
                          {backup.compressed ? '✓' : '✗'}
                        </td>
                        <td className="px-4 py-2">
                          <div className="space-x-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRestoreBackup(backup.version)}
                                className={buttonClasses('yellow')}
                              >
                                {t.actions.restore}
                              </button>
                              <button
                                onClick={() => handleExportBackup(backup.version)}
                                className={buttonClasses('blue')}
                              >
                                {t.actions.export}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
