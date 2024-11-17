import { Theme } from '../contexts/ThemeContext';
import { SavedTheme, ThemeStorage } from '../types/theme';

const STORAGE_KEY = 'gamebook-themes';

// Generate a unique ID for themes
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Load themes from storage
export const loadThemes = (): ThemeStorage => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading themes:', error);
  }
  return { themes: [] };
};

// Save themes to storage
export const saveThemes = (storage: ThemeStorage): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Error saving themes:', error);
  }
};

// Save a new theme
export const saveTheme = (name: string, theme: Theme, description?: string): SavedTheme => {
  const storage = loadThemes();
  const newTheme: SavedTheme = {
    id: generateId(),
    name,
    description,
    theme,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  storage.themes.push(newTheme);
  saveThemes(storage);
  return newTheme;
};

// Update an existing theme
export const updateTheme = (id: string, updates: Partial<SavedTheme>): SavedTheme | null => {
  const storage = loadThemes();
  const index = storage.themes.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  const theme = storage.themes[index];
  const updatedTheme = {
    ...theme,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  storage.themes[index] = updatedTheme;
  saveThemes(storage);
  return updatedTheme;
};

// Delete a theme
export const deleteTheme = (id: string): boolean => {
  const storage = loadThemes();
  const initialLength = storage.themes.length;
  storage.themes = storage.themes.filter(t => t.id !== id);
  
  if (storage.themes.length !== initialLength) {
    if (storage.lastUsedTheme === id) {
      delete storage.lastUsedTheme;
    }
    saveThemes(storage);
    return true;
  }
  return false;
};

// Set last used theme
export const setLastUsedTheme = (id: string): void => {
  const storage = loadThemes();
  storage.lastUsedTheme = id;
  saveThemes(storage);
};

// Export theme to file
export const exportTheme = async (theme: SavedTheme): Promise<void> => {
  const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import theme from file
export const importTheme = async (file: File): Promise<SavedTheme | null> => {
  try {
    const content = await file.text();
    const imported = JSON.parse(content);
    
    // Validate imported theme structure
    if (!imported.theme || !imported.name) {
      throw new Error('Invalid theme file structure');
    }
    
    // Create new theme from imported data
    const newTheme = saveTheme(
      imported.name,
      imported.theme,
      imported.description
    );
    
    return newTheme;
  } catch (error) {
    console.error('Error importing theme:', error);
    return null;
  }
};
