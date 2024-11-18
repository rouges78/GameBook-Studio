import { PageType } from '../../types/pages';
import { Theme } from '../../contexts/ThemeContext';

export interface ThemeEditorProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}
