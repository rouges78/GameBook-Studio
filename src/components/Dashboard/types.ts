import { PageType, Project } from '../../types/pages';

export interface DashboardProps {
  isDarkMode: boolean;
  setCurrentPage: (page: PageType) => void;
  setIsDarkMode: (isDark: boolean) => void;
  language: 'it' | 'en';
  setLanguage: (lang: 'it' | 'en') => void;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  onLogout: () => void;
}
