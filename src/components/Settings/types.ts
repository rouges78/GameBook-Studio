import { PageType } from '../../types/pages';

export interface SettingsProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}
