import React, { useState, useEffect, FC } from 'react';
import { Settings as SettingsIcon, Bell, Database, Cpu, ArrowLeft, Save } from 'lucide-react';
import { translations } from '../utils/translations';
import Notification from './Notification';

// Definiamo i tipi per le props del componente
interface SettingsProps {
  setCurrentPage: (page: string) => void;
  isDarkMode: boolean;
  language: 'en' | 'it';
}

// Definiamo i tipi per lo stato delle impostazioni
interface AppSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  notificationStyle: 'toast' | 'banner';
  notificationPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  aiProvider: 'openai' | 'anthropic' | 'openrouter';
  aiModel: string;
  apiKey: string;
}

const AI_MODELS = {
  anthropic: [
    'claude-3.5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
  ],
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  openrouter: ['openrouter/auto'],
} as const;

type AiProvider = keyof typeof AI_MODELS;

const Settings: FC<SettingsProps> = ({ setCurrentPage, isDarkMode, language }) => {
  const t = translations[language].settings;
  const [activeTab, setActiveTab] = useState('general');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    autoSave: true,
    autoSaveInterval: 5,
    notificationStyle: 'toast',
    notificationPosition: 'top-right',
    aiProvider: 'openai',
    aiModel: 'gpt-4o',
    apiKey: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.electron.settings.get();
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        setNotification({ message: t.loadError, type: 'error' });
      }
    };
    loadSettings();
  }, [t.loadError]);

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await window.electron.settings.save(updatedSettings);
      setSettings(updatedSettings);
      setNotification({ message: t.saveSuccess, type: 'success' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setNotification({ message: t.saveError, type: 'error' });
    }
  };

  const handleExportDatabase = async () => {
    try {
      const projects = await window.electron.getProjects();
      const dataStr = JSON.stringify(projects, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'gamebook-studio-db.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setNotification({ message: t.exportSuccess, type: 'success' });
    } catch (error) {
      console.error('Failed to export database:', error);
      setNotification({ message: t.exportError, type: 'error' });
    }
  };

  const handleImportDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const projects = JSON.parse(content);
          // Assumendo che saveProject possa gestire un array di progetti o un singolo progetto
          await window.electron.saveProject(projects);
          setNotification({ message: t.importSuccess, type: 'success' });
        } catch (error) {
          console.error('Failed to import database:', error);
          setNotification({ message: t.importError, type: 'error' });
        }
      };
      reader.readAsText(file);
    }
  };

  const buttonClasses = (isActive: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ` +
    (isActive
      ? 'bg-purple-600 text-white'
      : isDarkMode
        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Save size={20} className="mr-2" />
                {t.autoSaveTitle}
              </h2>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-purple-600 rounded focus:ring-purple-500 bg-gray-700 border-gray-600"
                    checked={settings.autoSave}
                    onChange={(e) => handleSaveSettings({ autoSave: e.target.checked })}
                  />
                  <span>{t.enableAutoSave}</span>
                </label>
                {settings.autoSave && (
                  <div className="flex items-center space-x-2">
                    <span>{t.interval}</span>
                    <input
                      type="number"
                      min="1"
                      className={`w-20 p-1.5 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                      value={settings.autoSaveInterval}
                      onChange={(e) => handleSaveSettings({ autoSaveInterval: parseInt(e.target.value, 10) || 1 })}
                    />
                    <span>{t.minutes}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Bell size={20} className="mr-2" />
                {t.notificationSettings}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">{t.style}</label>
                  <select
                    className={`w-full p-1.5 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                    value={settings.notificationStyle}
                    onChange={(e) => handleSaveSettings({ notificationStyle: e.target.value as 'toast' | 'banner' })}
                  >
                    <option value="toast">{t.toast}</option>
                    <option value="banner">{t.banner}</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t.position}</label>
                  <select
                    className={`w-full p-1.5 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                    value={settings.notificationPosition}
                    onChange={(e) => handleSaveSettings({ notificationPosition: e.target.value as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' })}
                  >
                    <option value="top-right">{t.topRight}</option>
                    <option value="top-left">{t.topLeft}</option>
                    <option value="bottom-right">{t.bottomRight}</option>
                    <option value="bottom-left">{t.bottomLeft}</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        );
      case 'database':
        return (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Database size={20} className="mr-2" />
                {t.dataManagement}
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button onClick={handleExportDatabase} className={`bg-purple-600 hover:bg-purple-700 text-white font-medium py-1.5 px-3 rounded text-sm`}>
                    {t.exportDatabase}
                  </button>
                  <label className={`bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1.5 px-3 rounded cursor-pointer text-sm`}>
                    {t.importDatabase}
                    <input
                      type="file"
                      className="hidden"
                      accept=".json"
                      onChange={handleImportDatabase}
                    />
                  </label>
                </div>
                <div className="pt-4">
                   <button 
                    onClick={() => setCurrentPage('backupManager')}
                    className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded text-sm`}
                  >
                    {t.openBackupManager}
                  </button>
                </div>
              </div>
            </section>
          </div>
        );
      case 'ai':
        return (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Cpu size={20} className="mr-2" />
                {t.aiSettings}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">{t.aiProvider}</label>
                  <select
                    className={`w-full p-1.5 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                    value={settings.aiProvider}
                    onChange={(e) => {
                      const newProvider = e.target.value as AiProvider;
                      const newModel = AI_MODELS[newProvider][0];
                      handleSaveSettings({ aiProvider: newProvider, aiModel: newModel });
                    }}
                  >
                    {Object.keys(AI_MODELS).map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t.aiModel}</label>
                  <select
                    className={`w-full p-1.5 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                    value={settings.aiModel}
                    onChange={(e) => handleSaveSettings({ aiModel: e.target.value })}
                  >
                    {(AI_MODELS[settings.aiProvider] || []).map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t.apiKey}</label>
                  <input
                    type="password"
                    className={`w-full p-1.5 rounded ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border`}
                    placeholder={t.apiKeyPlaceholder}
                    value={settings.apiKey}
                    onChange={(e) => handleSaveSettings({ apiKey: e.target.value })}
                  />
                </div>
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 h-full overflow-y-auto ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          isDarkMode={isDarkMode}
        />
      )}
      <div className="flex items-center mb-6">
        <button onClick={() => setCurrentPage('dashboard')} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold ml-4 flex items-center">
          <SettingsIcon size={28} className="mr-3" />
          {t.title}
        </h1>
      </div>

      <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} mb-6 space-x-1`}>
        <button onClick={() => setActiveTab('general')} className={buttonClasses(activeTab === 'general')}>{t.general}</button>
        <button onClick={() => setActiveTab('notifications')} className={buttonClasses(activeTab === 'notifications')}>{t.notifications}</button>
        <button onClick={() => setActiveTab('database')} className={buttonClasses(activeTab === 'database')}>{t.database}</button>
        <button onClick={() => setActiveTab('ai')} className={buttonClasses(activeTab === 'ai')}>{t.ai}</button>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;
