import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { translations } from './translations';
import { buttonClasses } from '../../utils/buttonStyles';

interface SettingsHeaderProps {
  isDarkMode: boolean;
  language: 'it' | 'en';
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help' | 'export' | 'backupManager') => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  isDarkMode,
  language,
  setCurrentPage
}) => {
  const t = translations[language];

  return (
    <div className="flex-none px-6 py-4 flex items-center justify-between">
      <button
        onClick={() => setCurrentPage('dashboard')}
        className={buttonClasses('blue')}
      >
        <ArrowLeft size={18} className="mr-2" />
        {t.backToDashboard}
      </button>
      <h1 className="text-2xl font-bold">{t.settings}</h1>
      <div className="w-8" /> {/* Spacer to balance the layout */}
    </div>
  );
};