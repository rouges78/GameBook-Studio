import React from 'react';
import { Brain, ToggleLeft, ToggleRight } from 'lucide-react';
import { TabProps, AIProvider, ProviderModels, PROVIDER_MODELS } from './types';
import { translations } from './translations';

interface AITabProps extends TabProps {
  aiEnabled: boolean;
  aiProvider: AIProvider;
  aiModel: ProviderModels[AIProvider];
  apiKey: string;
  setAiEnabled: (enabled: boolean) => void;
  setAiProvider: (provider: AIProvider) => void;
  setAiModel: (model: ProviderModels[AIProvider]) => void;
  setApiKey: (key: string) => void;
  saveSettings: (settings: any) => void;
}

export const AITab: React.FC<AITabProps> = ({
  isDarkMode,
  language,
  aiEnabled,
  aiProvider,
  aiModel,
  apiKey,
  setAiEnabled,
  setAiProvider,
  setAiModel,
  setApiKey,
  saveSettings
}) => {
  const t = translations[language];

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
};