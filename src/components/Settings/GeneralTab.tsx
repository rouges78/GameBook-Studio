import React from 'react';
import { Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { TabProps } from './types';
import { translations } from './translations';

interface GeneralTabProps extends TabProps {
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  saveSettings: (settings: any) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  isDarkMode,
  language,
  autoSaveEnabled,
  autoSaveInterval,
  setAutoSaveEnabled,
  setAutoSaveInterval,
  saveSettings
}) => {
  const t = translations[language];

  return (
    <div className="space-y-6">
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
};