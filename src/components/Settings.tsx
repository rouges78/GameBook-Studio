import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Bell, Database, Clock, ToggleLeft, ToggleRight, Brain } from 'lucide-react';
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
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help') => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

type NotificationStyle = 'modern' | 'minimal' | 'standard';
type NotificationPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
type AIProvider = 'anthropic' | 'openai' | 'openrouter';

const PROVIDER_MODELS = {
  anthropic: [
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240229',
    'claude-2.1',
    'claude-2.0',
    'claude-instant-1.2'
  ] as const,
  openai: [
    'gpt-4-0125-preview',      // GPT-4 Turbo
    'gpt-4-1106-preview',      // Previous GPT-4 Turbo
    'gpt-4-vision-preview',    // GPT-4 Vision
    'gpt-4',
    'gpt-3.5-turbo-0125',     // Latest GPT-3.5
    'gpt-3.5-turbo'
  ] as const,
  openrouter: [
    'anthropic/claude-3-opus-20240229',
    'anthropic/claude-3-sonnet-20240229',
    'anthropic/claude-3-haiku-20240229',
    'openai/gpt-4-0125-preview',
    'google/gemini-pro',
    'meta/llama-2-70b-chat',
    'mistral/mistral-large-latest',
    'mistral/mixtral-8x7b'
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
      notificationSettings: "Stile Notifiche",
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
      autoSave: "Salvataggio automatico",
      autoSaveInterval: "Intervallo di salvataggio automatico (minuti)",
      saveChanges: "Salva modifiche",
      databaseExported: "Database esportato con successo",
      databaseImported: "Database importato con successo",
      invalidFile: "File non valido. Seleziona un file JSON valido.",
      settingsSaved: "Impostazioni salvate con successo",
      aiSettings: "Impostazioni AI",
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
      notificationSettings: "Notification Style",
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
      autoSave: "Auto-save",
      autoSaveInterval: "Auto-save interval (minutes)",
      saveChanges: "Save changes",
      databaseExported: "Database exported successfully",
      databaseImported: "Database imported successfully",
      invalidFile: "Invalid file. Please select a valid JSON file.",
      settingsSaved: "Settings saved successfully",
      aiSettings: "AI Settings",
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
    // Load settings from localStorage
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

  const handleSaveChanges = () => {
    // Save settings to localStorage
    const settings = {
      autoSaveEnabled,
      autoSaveInterval,
      notificationStyle,
      notificationPosition,
      aiEnabled,
      aiProvider,
      aiModel,
      apiKey
    };
    localStorage.setItem('gamebookSettings', JSON.stringify(settings));

    // Dispatch custom event for auto-save settings change
    window.dispatchEvent(new CustomEvent('autoSaveSettingsChanged', {
      detail: { enabled: autoSaveEnabled, interval: autoSaveInterval }
    }));

    // Show notification
    setNotification({
      message: t.settingsSaved,
      type: 'success'
    });

    // Clear notification after 3 seconds
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
          
          // Validate projects structure
          if (Array.isArray(projects) && projects.every(p => p.bookTitle && p.author)) {
            // Import each project
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

  return (
    <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <div className="flex-none px-6 py-4">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}
        >
          <ArrowLeft size={20} className="mr-2" />
          {t.backToDashboard}
        </button>
        <h1 className="text-2xl font-bold text-center mt-2">{t.settings}</h1>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 space-y-6 mb-20`}>
            {/* Notification Settings */}
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
                    onChange={(e) => setNotificationStyle(e.target.value as NotificationStyle)}
                    className={`w-full p-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
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
                    onChange={(e) => setNotificationPosition(e.target.value as NotificationPosition)}
                    className={`w-full p-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
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

            {/* Database Management */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center">
                <Database size={20} className="mr-2" />
                {t.dataManagement}
              </h2>
              <div className="flex gap-3">
                <button 
                  onClick={handleExportDatabase}
                  className={`${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white font-medium py-1.5 px-3 rounded text-sm`}
                >
                  {t.exportDatabase}
                </button>
                <label className={`${isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white font-medium py-1.5 px-3 rounded cursor-pointer text-sm`}>
                  {t.importDatabase}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportDatabase}
                    className="hidden"
                  />
                </label>
              </div>
            </section>

            {/* Auto Save Settings */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  {t.autoSave}
                </div>
                <button
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className="focus:outline-none"
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
                  <label htmlFor="autoSaveInterval" className="mr-2 text-sm">{t.autoSaveInterval}</label>
                  <input
                    type="number"
                    id="autoSaveInterval"
                    value={autoSaveInterval}
                    onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                    min="1"
                    max="60"
                    className={`w-16 px-2 py-1 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  />
                </div>
              )}
            </section>

            {/* AI Settings */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Brain size={20} className="mr-2" />
                  {t.aiSettings}
                </div>
                <button
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className="focus:outline-none"
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
                        setAiProvider(provider);
                        setAiModel(PROVIDER_MODELS[provider][0]);
                      }}
                      className={`w-full p-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
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
                      onChange={(e) => setAiModel(e.target.value as ProviderModels[AIProvider])}
                      className={`w-full p-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                    >
                      {PROVIDER_MODELS[aiProvider].map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">{t.apiKey}</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className={`w-full p-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                      placeholder="sk-..."
                    />
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-inherit border-t border-gray-700">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleSaveChanges}
            className={`w-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brown-700 hover:bg-brown-800'} text-white font-bold py-2 px-4 rounded flex items-center justify-center`}
          >
            <Save size={20} className="mr-2" />
            {t.saveChanges}
          </button>
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
