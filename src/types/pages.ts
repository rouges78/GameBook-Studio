export type PageType = 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 
                'settings' | 'help' | 'export' | 'backupManager' | 'telemetryDashboard';

export interface Project {
  id: string;
  name: string;
  bookTitle: string;
  author: string;
  description?: string;
  created: Date;
  modified: Date;
  lastEdited: string;
  paragraphs: any[];
  mapSettings?: any;
}

export interface ComponentProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

export interface DashboardProps extends ComponentProps {
  setIsDarkMode: (isDark: boolean) => void;
  setLanguage: (lang: 'it' | 'en') => void;
  projects: Project[];
  setCurrentProject: (project: Project | null) => void;
  onLogout: () => void;
}

export interface LibraryProps extends ComponentProps {
  books: Project[];
  onEditBook: (bookTitle: string) => void;
  onDeleteBook: (bookTitle: string) => void;
  onSaveBook: (book: Project) => void;
}

export interface ParagraphEditorProps extends ComponentProps {
  bookTitle: string;
  author: string;
  onSaveProject: (project: Project) => void;
  initialParagraphs?: any[];
  initialMapSettings?: any;
  updateLastBackup: (date: string) => void;
}

export interface CreateProjectProps extends ComponentProps {
  onCreateProject: (project: Project) => void;
}

export interface ThemeEditorProps extends ComponentProps {
  currentTheme: any;
  onThemeChange: (theme: any) => void;
}

export interface SettingsProps extends ComponentProps {}

export interface HelpProps extends ComponentProps {}

export interface BackupManagerProps extends ComponentProps {}

export interface ExportPageProps extends ComponentProps {
  bookTitle: string;
  author: string;
  paragraphs: any[];
}

// Type alias for backward compatibility
export type Book = Project;

// Utility type for page navigation
export type SetPageFn = (page: PageType) => void;
