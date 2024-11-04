import React, { useState, useEffect } from 'react';
import { Backup, BackupOperation, BackupOperationStatus, BackupSettings, BackupStats } from './types';
import { BackupMetadata } from '../../types/electron';
import { translations } from './translations';

const BackupManager: React.FC = () => {
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

  const handleSettingsSave = async (newSettings: BackupSettings) => {
    setOperationStatus({ operation: 'updateSettings', inProgress: true });
    try {
      await window.electron['backup:updateSettings'](newSettings);
      setSettings(newSettings);
      setShowSettings(false);
      setOperationStatus({
        operation: 'updateSettings',
        inProgress: false,
        message: translations.operations.success
      });
      await loadBackups(); // Reload backups as cleanup might have occurred
    } catch (error) {
      setOperationStatus({
        operation: 'updateSettings',
        inProgress: false,
        error: translations.operations.error.settings.save
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

  const handleOperation = async (operation: BackupOperation, version?: string) => {
    setOperationStatus({ operation, inProgress: true });
    try {
      switch (operation) {
        case 'create':
          await window.electron['backup:create']([]);
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

  const SettingsPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-bold mb-4">{translations.settings.title}</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSettingsSave({
            maxBackups: Number(formData.get('maxBackups')),
            retentionPeriod: {
              daily: Number(formData.get('dailyRetention')),
              weekly: Number(formData.get('weeklyRetention')),
              monthly: Number(formData.get('monthlyRetention'))
            },
            autoCleanup: Boolean(formData.get('autoCleanup'))
          });
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.settings.maxBackups}
              </label>
              <input
                type="number"
                name="maxBackups"
                defaultValue={settings.maxBackups}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{translations.settings.retention.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {translations.settings.retention.daily}
                  </label>
                  <input
                    type="number"
                    name="dailyRetention"
                    defaultValue={settings.retentionPeriod.daily}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {translations.settings.retention.weekly}
                  </label>
                  <input
                    type="number"
                    name="weeklyRetention"
                    defaultValue={settings.retentionPeriod.weekly}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {translations.settings.retention.monthly}
                  </label>
                  <input
                    type="number"
                    name="monthlyRetention"
                    defaultValue={settings.retentionPeriod.monthly}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoCleanup"
                defaultChecked={settings.autoCleanup}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-900">
                {translations.settings.autoCleanup}
              </label>
            </div>

            <div className="text-sm text-gray-500">
              {translations.settings.cleanupHint}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {translations.buttons.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {translations.buttons.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const BackupStats = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{translations.title}</h2>
        <div className="space-x-4">
          <button
            onClick={() => handleOperation('import')}
            disabled={operationStatus?.inProgress}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {translations.buttons.import}
          </button>
          <button
            onClick={() => handleOperation('create')}
            disabled={operationStatus?.inProgress}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {translations.buttons.create}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            disabled={operationStatus?.inProgress}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            {translations.buttons.settings}
          </button>
          <button
            onClick={handleCleanup}
            disabled={operationStatus?.inProgress}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {translations.buttons.cleanup}
          </button>
        </div>
      </div>

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

      <BackupStats />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
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
          <tbody className="bg-white divide-y divide-gray-200">
            {backups.map((backup) => (
              <tr key={backup.version}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    className="text-green-600 hover:text-green-900 disabled:opacity-50"
                  >
                    {translations.buttons.export}
                  </button>
                  <button
                    onClick={() => handleOperation('restore', backup.version)}
                    disabled={operationStatus?.inProgress}
                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
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

      {showSettings && <SettingsPanel />}
    </div>
  );
};

export default BackupManager;
