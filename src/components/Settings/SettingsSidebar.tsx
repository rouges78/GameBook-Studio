import React from 'react';
import { Bell, Brain, Database, Settings as SettingsIcon } from 'lucide-react';
import { SettingsTab } from './types';
import { translations } from './translations';

interface SettingsSidebarProps {
  isDarkMode: boolean;
  language: 'it' | 'en';
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

interface TabButtonProps {
  tab: SettingsTab;
  icon: React.ReactNode;
  label: string;
  isDarkMode: boolean;
  activeTab: SettingsTab;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  tab,
  icon,
  label,
  isDarkMode,
  activeTab,
  onClick
}) => (
  <button
    onClick={onClick}
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

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isDarkMode,
  language,
  activeTab,
  setActiveTab
}) => {
  const t = translations[language];

  return (
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
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          onClick={() => setActiveTab('general')}
        />
        <TabButton
          tab="notifications"
          icon={<Bell size={20} />}
          label={t.notificationSettings}
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          onClick={() => setActiveTab('notifications')}
        />
        <TabButton
          tab="database"
          icon={<Database size={20} />}
          label={t.databaseSettings}
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          onClick={() => setActiveTab('database')}
        />
        <TabButton
          tab="ai"
          icon={<Brain size={20} />}
          label={t.aiSettings}
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          onClick={() => setActiveTab('ai')}
        />
      </nav>
    </div>
  );
};