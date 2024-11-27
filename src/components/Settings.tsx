import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bell, Database, Clock, ToggleLeft, ToggleRight, 
  Brain, Archive, Settings as SettingsIcon
} from 'lucide-react';
import { saveProject, getProjects } from '../utils/storage';
import { 
  requestNotificationPermission, 
  initializeNotifications, 
  showBrowserNotification,
  getNotificationPermissionState,
  NOTIFICATION_PERMISSION
} from '../utils/notifications';
import Notification from './Notification';

interface SettingsProps {
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help' | 'export' | 'backupManager') => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

type NotificationStyle = 'modern' | 'minimal' | 'standard';
type NotificationPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
type AIProvider = 'anthropic' | 'openai' | 'openrouter';
type SettingsTab = 'general' | 'notifications' | 'database' | 'ai';

const PROVIDER_MODELS = {
  anthropic: [
    'claude-3.5-opus',      // Ultima versione, massima potenza
    'claude-3.5-sonnet',    // Bilanciato per uso generale
    'claude-3.5-haiku',     // Veloce e economico
    'claude-3-opus-20240229',    // Legacy
    'claude-3-sonnet-20240229',  // Legacy
    'claude-3-haiku-20240229',   // Legacy
    'claude-2.1',                // Per compatibilità
  ] as const,
  openai: [
    'gpt-4.5-turbo',           // Ultima versione
    'gpt-4.5-turbo-preview',   // Preview
    'gpt-4-0125-preview',      // Legacy
    'gpt-4-turbo-preview',     // Legacy
    'gpt-4',                   // Stabile
    'gpt-3.5-turbo-0125',      // GPT-3.5 aggiornato
    'gpt-3.5-turbo',           // GPT-3.5 stabile
  ] as const,
  openrouter: [
    // Anthropic Models
    'anthropic/claude-3.5-opus',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
    // OpenAI Models
    'openai/gpt-4.5-turbo',
    'openai/gpt-4.5-turbo-preview',
    // Google Models
    'google/gemini-pro',
    'google/gemini-pro-vision',
    // Mistral Models
    'mistral/mistral-large-latest',
    'mistral/mixtral-8x7b-instruct',
    // Meta Models
    'meta/llama-3-70b-chat',
    'meta/llama-2-70b-chat',
  ] as const
} as const;

type ProviderModels = {
  [K in AIProvider]: typeof PROVIDER_MODELS[K][number];
};

interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

const Settings: React.FC<SettingsProps> = ({ setCurrentPage, isDarkMode, language }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(5);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [notificationStyle, setNotificationStyle] = useState<NotificationStyle>('modern');
  const [notificationPosition, setNotificationPosition] = useState<NotificationPosition>('top-right');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiProvider, setAiProvider] = useState<AIProvider>('anthropic');
  const [aiModel, setAiModel] = useState<ProviderModels[AIProvider]>(PROVIDER_MODELS.anthropic[0]);
  const [apiKey, setApiKey] = useState('');

  const translations = {
    it: {
      backToDashboard: "Torna alla Dashboard",
      settings: "Impostazioni",
      general: "Generale",
      notificationSettings: "Notifiche",
      databaseSettings: "Database",
      aiSettings: "Impostazioni AI",
      notificationStyle: "Tipologia Notifica",
      notificationPosition: "Posizione Notifica",
      modern: "Moderno",
      minimal: "Minimal",
      standard: "Standard",
      topLeft: "In alto a sinistra",
      topCenter: "In alto al centro",
      topRight: "In alto a destra",
      bottomLeft: "In basso a sinistra",
      bottomCenter: "In basso al centro",
      bottomRight: "In basso a destra",
      center: "Centro schermo",
      dataManagement: "Gestione Database",
      exportDatabase: "Esporta database",
      importDatabase: "Importa database",
      backupManager: "Gestione Backup",
      openBackupManager: "Apri Gestione Backup",
      autoSave: "Salvataggio automatico",
      autoSaveInterval: "Intervallo di salvataggio automatico (minuti)",
      databaseExported: "Database esportato con successo",
      databaseImported: "Database importato con successo",
      invalidFile: "File non valido. Seleziona un file JSON valido.",
      settingsSaved: "Impostazioni salvate",
      enableAI: "Abilita AI",
      aiProvider: "Provider AI",
      aiModel: "Modello AI",
      apiKey: "Chiave API",
      anthropic: "Anthropic",
      openai: "OpenAI",
      openrouter: "OpenRouter"
    },
    en: {
      backToDashboard: "Back to Dashboard",
      settings: "Settings",
      general: "General",
      notificationSettings: "Notifications",
      databaseSettings: "Database",
      aiSettings: "AI Settings",
      notificationStyle: "Notification Type",
      notificationPosition: "Notification Position",
      modern: "Modern",
      minimal: "Minimal",
      standard: "Standard",
      topLeft: "Top Left",
      topCenter: "Top Center",
      topRight: "Top Right",
      bottomLeft: "Bottom Left",
      bottomCenter: "Bottom Center",
      bottomRight: "Bottom Right",
      center: "Center Screen",
      dataManagement: "Database Management",
      exportDatabase: "Export database",
      importDatabase: "Import database",
      backupManager: "Backup Manager",
      openBackupManager: "Open Backup Manager",
      autoSave: "Auto-save",
      autoSaveInterval: "Auto-save interval (minutes)",
      databaseExported: "Database exported successfully",
      databaseImported: "Database imported successfully",
      invalidFile: "Invalid file. Please select a valid JSON file.",
      settingsSaved: "Settings saved",
      enableAI: "Enable AI",
      aiProvider: "AI Provider",
      aiModel: "AI Model",
      apiKey: "API Key",
      anthropic: "Anthropic",
      openai: "OpenAI",
      openrouter: "OpenRouter"
    }
  };

  const t = translations[language];

  useEffect(() => {
    const savedSettings = localStorage.getItem('gamebookSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoSaveEnabled(settings.autoSaveEnabled ?? false);
      setAutoSaveInterval(settings.autoSaveInterval ?? 5);
      setNotificationStyle(settings.notificationStyle || 'modern');
      setNotificationPosition(settings.notificationPosition || 'top-right');
      setAiEnabled(settings.aiEnabled ?? false);
      setAiProvider(settings.aiProvider || 'anthropic');
      setAiModel(settings.aiModel || PROVIDER_MODELS.anthropic[0]);
      setApiKey(settings.apiKey || '');
    }
  }, []);

  const saveSettings = (newSettings: any) => {
    const settings = {
      autoSaveEnabled,
      autoSaveInterval,
      notificationStyle,
      notificationPosition,
      aiEnabled,
      aiProvider,
      aiModel,
      apiKey,
      ...newSettings
    };
    localStorage.setItem('gamebookSettings', JSON.stringify(settings));

    if (newSettings.autoSaveEnabled !== undefined || newSettings.autoSaveInterval !== undefined) {
      window.dispatchEvent(new CustomEvent('autoSaveSettingsChanged', {
        detail: { 
          enabled: newSettings.autoSaveEnabled ?? autoSaveEnabled, 
          interval: newSettings.autoSaveInterval ?? autoSaveInterval 
        }
      }));
    }

    setNotification({
      message: t.settingsSaved,
      type: 'success'
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleExportDatabase = async () => {
    try {
      const projects = await getProjects();
      const dataStr = JSON.stringify(projects, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'gamebook-database.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setNotification({
        message: t.databaseExported,
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error exporting database:', error);
      setNotification({
        message: String(error),
        type: 'error'
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const projects = JSON.parse(content);
          
          if (Array.isArray(projects) && projects.every(p => p.bookTitle && p.author)) {
            for (const project of projects) {
              await saveProject(project);
            }
            setNotification({
              message: t.databaseImported,
              type: 'success'
            });
          } else {
            setNotification({
              message: t.invalidFile,
              type: 'error'
            });
          }
        } catch (error) {
          console.error('Error importing database:', error);
          setNotification({
            message: t.invalidFile,
            type: 'error'
          });
        }
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      };
      reader.readAsText(file);
    }
  };

  const TabButton: React.FC<{
    tab: SettingsTab;
    icon: React.ReactNode;
    label: string;
  }> = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab
          ? isDarkMode
            ? 'bg-blue-600 text-white'
            : 'bg-brown-600 text-white'
          : isDarkMode
          ? 'hover:bg-gray-700'
          : 'hover:bg-gray-200'
      }`}
      aria-selected={activeTab === tab}
      role="tab"
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Auto Save Settings */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  {t.autoSave}
                </div>
                <button
                  onClick={() => {
                    const newValue = !autoSaveEnabled;
                    setAutoSaveEnabled(newValue);
                    saveSettings({ autoSaveEnabled: newValue });
                  }}
                  className="focus:outline-none"
                  aria-label={autoSaveEnabled ? "Disable auto-save" : "Enable auto-save"}
                >
                  {autoSaveEnabled ? (
                    <ToggleRight size={20} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={20} className="text-gray-500" />
                  )}
                </button>
              </h2>
              {autoSaveEnabled && (
                <div className="flex items-center">
                  <label htmlFor="autoSaveInterval" className="mr-2 text-sm">
                    {t.autoSaveInterval}
                  </label>
                  <input
                    type="number"
                    id="autoSaveInterval"
                    value={autoSaveInterval}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value);
                      setAutoSaveInterval(newValue);
                      saveSettings({ autoSaveInterval: newValue });
                    }}
                    min="1"
                    max="60"
                    className={`w-16 px-2 py-1 rounded text-sm ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
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
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm">{t.notificationStyle}</label>
                  <select
                    value={notificationStyle}
                    onChange={(e) => {
                      const newValue = e.target.value as NotificationStyle;
                      setNotificationStyle(newValue);
                      saveSettings({ notificationStyle: newValue });
                    }}
                    className={`w-full p-1.5 rounded text-sm ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    <option value="modern">{t.modern}</option>
                    <option value="minimal">{t.minimal}</option>
                    <option value="standard">{t.standard}</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm">{t.notificationPosition}</label>
                  <select
                    value={notificationPosition}
                    onChange={(e) => {
                      const newValue = e.target.value as NotificationPosition;
                      setNotificationPosition(newValue);
                      saveSettings({ notificationPosition: newValue });
                    }}
                    className={`w-full p-1.5 rounded text-sm ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  >
                    <option value="top-left">{t.topLeft}</option>
                    <option value="top-center">{t.topCenter}</option>
                    <option value="top-right">{t.topRight}</option>
                    <option value="bottom-left">{t.bottomLeft}</option>
                    <option value="bottom-center">{t.bottomCenter}</option>
                    <option value="bottom-right">{t.bottomRight}</option>
                    <option value="center">{t.center}</option>
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
                  <button
                    onClick={handleExportDatabase}
                    className={`${
                      isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
                    } text-white font-medium py-1.5 px-3 rounded text-sm`}
                  >
                    {t.exportDatabase}
                  </button>
                  <label
                    className={`${
                      isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white font-medium py-1.5 px-3 rounded cursor-pointer text-sm`}
                  >
                    {t.importDatabase}
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportDatabase}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <button
                    onClick={() => setCurrentPage('backupManager')}
                    className={`${
                      isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                    } text-white font-medium py-1.5 px-3 rounded text-sm flex items-center`}
                  >
                    <Archive size={16} className="mr-2" />
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
              <h2 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Brain size={20} className="mr-2" />
                  {t.aiSettings}
                </div>
                <button
                  onClick={() => {
                    const newValue = !aiEnabled;
                    setAiEnabled(newValue);
                    saveSettings({ aiEnabled: newValue });
                  }}
                  className="focus:outline-none"
                  aria-label={aiEnabled ? "Disable AI" : "Enable AI"}
                >
                  {aiEnabled ? (
                    <ToggleRight size={20} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={20} className="text-gray-500" />
                  )}
                </button>
              </h2>
              {aiEnabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-sm">{t.aiProvider}</label>
                    <select
                      value={aiProvider}
                      onChange={(e) => {
                        const provider = e.target.value as AIProvider;
                        const newModel = PROVIDER_MODELS[provider][0];
                        setAiProvider(provider);
                        setAiModel(newModel);
                        saveSettings({ aiProvider: provider, aiModel: newModel });
                      }}
                      className={`w-full p-1.5 rounded text-sm ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      <option value="anthropic">{t.anthropic}</option>
                      <option value="openai">{t.openai}</option>
                      <option value="openrouter">{t.openrouter}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t.aiModel}</label>
                    <select
                      value={aiModel}
                      onChange={(e) => {
                        const newValue = e.target.value as ProviderModels[AIProvider];
                        setAiModel(newValue);
                        saveSettings({ aiModel: newValue });
                      }}
                      className={`w-full p-1.5 rounded text-sm ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      {PROVIDER_MODELS[aiProvider].map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t.apiKey}</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setApiKey(newValue);
                        saveSettings({ apiKey: newValue });
                      }}
                      className={`w-full p-1.5 rounded text-sm ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                      placeholder="sk-..."
                    />
                  </div>
                </div>
              )}
            </section>
          </div>
        );
    }
  };

  return (
    <div
      className={`h-screen flex flex-col ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {/* Header */}
      <div className="flex-none px-6 py-4">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`${
            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'
          } flex items-center`}
        >
          <ArrowLeft size={20} className="mr-2" />
          {t.backToDashboard}
        </button>
        <h1 className="text-2xl font-bold text-center mt-2">{t.settings}</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Sidebar */}
          <div
            className={`w-64 p-4 border-r ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}
          >
            <nav className="space-y-2" role="tablist">
              <TabButton
                tab="general"
                icon={<SettingsIcon size={20} />}
                label={t.general}
              />
              <TabButton
                tab="notifications"
                icon={<Bell size={20} />}
                label={t.notificationSettings}
              />
              <TabButton
                tab="database"
                icon={<Database size={20} />}
                label={t.databaseSettings}
              />
              <TabButton
                tab="ai"
                icon={<Brain size={20} />}
                label={t.aiSettings}
              />
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div
              className={`max-w-3xl mx-auto ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-lg p-6`}
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          isDarkMode={isDarkMode}
          style={notificationStyle}
          position={notificationPosition}
        />
      )}
    </div>
  );
};

export default Settings;
