import { PageType } from '../../types/pages';

export interface HelpProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}
