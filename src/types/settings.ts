export interface AppSettings {
  window: {
    fullscreen: boolean;
    width: number;
    height: number;
  };
  general: {
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
  };
  notifications: {
    style: 'modern' | 'minimal' | 'standard';
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
  };
  ai: {
    enabled: boolean;
    provider: 'anthropic' | 'openai' | 'openrouter';
    model: string;
    apiKey: string;
  };
}

export type NotificationStyle = 'modern' | 'minimal' | 'standard';
export type NotificationPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
export type AIProvider = 'anthropic' | 'openai' | 'openrouter';
export type SettingsTab = 'general' | 'notifications' | 'database' | 'ai';
export type AIModel = 
  | 'claude-3-opus' 
  | 'claude-3-sonnet' 
  | 'claude-3-haiku'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'anthropic/claude-3'
  | 'openai/gpt-4';

export const PROVIDER_MODELS = {
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] as const,
  openai: ['gpt-4', 'gpt-3.5-turbo'] as const,
  openrouter: ['anthropic/claude-3', 'openai/gpt-4'] as const
};

export type ProviderModels = {
  [K in AIProvider]: typeof PROVIDER_MODELS[K][number];
};
