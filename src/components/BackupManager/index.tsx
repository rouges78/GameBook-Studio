import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { BackupOperation, BackupOperationStatus, BackupSettings, BackupStats } from './types';
import { BackupMetadata } from '../../types/electron';
import { translations } from './translations';

interface BackupManagerProps {
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help' | 'export' | 'backupManager' | 'telemetryDashboard') => void;
  isDarkMode: boolean;
}

const BackupManager: React.FC<BackupManagerProps> = ({ setCurrentPage, isDarkMode }) => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationStatus, setOperationStatus] = useState<BackupOperationStatus | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<BackupSettings>({
    maxBackups: 30,
    retentionPeriod: {
      daily: 7,
      weekly: 4,
      monthly: 3
    },
    autoCleanup: true
  });
  const [stats, setStats] = useState<BackupStats>({
    totalBackups: 0,
    totalSize: 0,
    oldestBackup: '',
    newestBackup: '',
    backupsByCategory: {
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  });

  const updateStats = (backupList: BackupMetadata[]) => {
    if (backupList.length === 0) {
      setStats({
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: '',
        newestBackup: '',
        backupsByCategory: { daily: 0, weekly: 0, monthly: 0 }
      });
      return;
    }

    const categoryCount = {
      daily: 0,
      weekly: 0,
      monthly: 0
    };

    backupList.forEach(backup => {
      if (backup.retentionCategory) {
        categoryCount[backup.retentionCategory]++;
      }
    });

    const sortedBackups = [...backupList].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    setStats({
      totalBackups: backupList.length,
      totalSize: backupList.reduce((sum, backup) => sum + backup.size, 0),
      oldestBackup: sortedBackups[0].timestamp,
      newestBackup: sortedBackups[sortedBackups.length - 1].timestamp,
      backupsByCategory: categoryCount
    });
  };

  const handleOperation = async (operation: BackupOperation, version?: string) => {
    setOperationStatus({ operation, inProgress: true });
    try {
      switch (operation) {
        case 'create':
          await window.electron['backup:create']();
          break;
        case 'restore':
          if (!version) throw new Error(translations.operations.error.versionRequired);
          await window.electron['backup:restore'](version);
          break;
        case 'export':
          if (!version) throw new Error(translations.operations.error.versionRequired);
          const saveResult = await window.electron['dialog:saveFile']('');
          if (saveResult) {
            await window.electron['backup:export'](version, saveResult);
          }
          break;
        case 'import':
          const openResult = await window.electron['dialog:openFile']();
          if (openResult) {
            await window.electron['backup:import'](openResult.path);
          }
          break;
      }

      setOperationStatus({
        operation,
        inProgress: false,
        message: translations.operations.success
      });

      await loadBackups();
    } catch (error) {
      setOperationStatus({
        operation,
        inProgress: false,
        error: getErrorMessage(operation, error instanceof Error ? error : new Error('Operation failed'))
      });
    }
  };

  const handleCleanup = async () => {
    setOperationStatus({ operation: 'cleanup', inProgress: true });
    try {
      await window.electron['backup:runCleanup']();
      setOperationStatus({
        operation: 'cleanup',
        inProgress: false,
        message: translations.operations.success
      });
      await loadBackups();
    } catch (error) {
      setOperationStatus({
        operation: 'cleanup',
        inProgress: false,
        error: translations.operations.error.settings.cleanup
      });
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatSize = (size: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(2)} ${units[unitIndex]}`;
  };

  useEffect(() => {
    loadBackups();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await window.electron['backup:getSettings']();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setOperationStatus({
        operation: 'updateSettings',
        inProgress: false,
        error: translations.operations.error.settings.load
      });
    }
  };

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupList = await window.electron['backup:list']();
      setBackups(backupList);
      updateStats(backupList);
    } catch (error) {
      console.error('Failed to load backups:', error);
      setOperationStatus({
        operation: 'list',
        inProgress: false,
        error: translations.operations.error.load
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (operation: BackupOperation, error: Error): string => {
    if (error.message) return error.message;
    
    switch (operation) {
      case 'create':
        return translations.operations.error.create;
      case 'restore':
        return translations.operations.error.restore;
      case 'export':
        return translations.operations.error.export;
      case 'import':
        return translations.operations.error.import;
      case 'delete':
        return translations.operations.error.delete;
      case 'list':
        return translations.operations.error.load;
      case 'updateSettings':
        return translations.operations.error.settings.save;
      case 'cleanup':
        return translations.operations.error.settings.cleanup;
      default:
        return 'Operation failed';
    }
  };

  const BackupStatsComponent = () => (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-6`}>
      <h3 className="text-lg font-medium mb-4">{translations.stats.title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500">{translations.stats.totalBackups}</p>
          <p className="text-2xl font-semibold">{stats.totalBackups}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{translations.stats.totalSize}</p>
          <p className="text-2xl font-semibold">{formatSize(stats.totalSize)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{translations.stats.oldestBackup}</p>
          <p className="text-lg">{stats.oldestBackup ? formatDate(stats.oldestBackup) : '-'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{translations.stats.newestBackup}</p>
          <p className="text-lg">{stats.newestBackup ? formatDate(stats.newestBackup) : '-'}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">{translations.stats.categories.daily}</p>
          <p className="text-xl font-semibold">{stats.backupsByCategory.daily}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{translations.stats.categories.weekly}</p>
          <p className="text-xl font-semibold">{stats.backupsByCategory.weekly}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">{translations.stats.categories.monthly}</p>
          <p className="text-xl font-semibold">{stats.backupsByCategory.monthly}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <div className="flex-none px-6 py-4">
        <button
          onClick={() => setCurrentPage('settings')}
          className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Settings
        </button>
        <h1 className="text-2xl font-bold text-center mt-2">{translations.title}</h1>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="max-w-6xl mx-auto">
          {operationStatus && (
            <div className={`mb-4 p-4 rounded ${
              operationStatus.error 
                ? 'bg-red-100 text-red-700' 
                : operationStatus.inProgress 
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
            }`}>
              {operationStatus.error || operationStatus.message || translations.operations.inProgress}
            </div>
          )}

          <div className="mb-6 flex justify-end space-x-4">
            <button
              onClick={() => handleOperation('import')}
              disabled={operationStatus?.inProgress}
              className={`px-4 py-2 ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded disabled:opacity-50`}
            >
              {translations.buttons.import}
            </button>
            <button
              onClick={() => handleOperation('create')}
              disabled={operationStatus?.inProgress}
              className={`px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded disabled:opacity-50`}
            >
              {translations.buttons.create}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              disabled={operationStatus?.inProgress}
              className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded disabled:opacity-50`}
            >
              {translations.buttons.settings}
            </button>
            <button
              onClick={handleCleanup}
              disabled={operationStatus?.inProgress}
              className={`px-4 py-2 ${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white rounded disabled:opacity-50`}
            >
              {translations.buttons.cleanup}
            </button>
          </div>

          <BackupStatsComponent />

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
            <table className="min-w-full">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.date}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.version}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.size}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.category}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {translations.table.actions}
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {backups.map((backup) => (
                  <tr key={backup.version}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(backup.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSize(backup.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {backup.retentionCategory ? translations.stats.categories[backup.retentionCategory] : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button
                        onClick={() => handleOperation('export', backup.version)}
                        disabled={operationStatus?.inProgress}
                        className={`text-green-600 hover:text-green-900 disabled:opacity-50 ${isDarkMode ? 'hover:text-green-400' : ''}`}
                      >
                        {translations.buttons.export}
                      </button>
                      <button
                        onClick={() => handleOperation('restore', backup.version)}
                        disabled={operationStatus?.inProgress}
                        className={`text-blue-600 hover:text-blue-900 disabled:opacity-50 ${isDarkMode ? 'hover:text-blue-400' : ''}`}
                      >
                        {translations.buttons.restore}
                      </button>
                    </td>
                  </tr>
                ))}
                {backups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      {translations.table.noBackups}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
