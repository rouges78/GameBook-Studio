import { Theme } from '../contexts/ThemeContext';

export interface SavedTheme {
  id: string;
  name: string;
  description?: string;
  theme: Theme;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeStorage {
  themes: SavedTheme[];
  lastUsedTheme?: string; // ID of the last used theme
}
