import { PageType } from '../../types/pages';

export interface BackupManagerProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}
