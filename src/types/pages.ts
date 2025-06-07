import { PageType as GlobalPageType, Project as GlobalProject } from '../types';

// Utilizza i tipi globali rinominandoli per evitare conflitti immediati se necessario,
// o direttamente se non ci sono ambiguità volute.
export type PageType = GlobalPageType;
export type Project = GlobalProject;

export interface ComponentProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

export interface DashboardProps extends ComponentProps {
  setIsDarkMode: (isDark: boolean) => void;
  setLanguage: (lang: 'it' | 'en') => void;
  projects: GlobalProject[]; // Usa GlobalProject
  setCurrentProject: (project: GlobalProject | null) => void; // Usa GlobalProject
  onLogout: () => void;
}

export interface LibraryProps extends ComponentProps {
  books: GlobalProject[]; // Usa GlobalProject
  onEditBook: (bookTitle: string) => void;
  onDeleteBook: (bookTitle: string) => void;
  onSaveBook: (book: GlobalProject) => void; // Usa GlobalProject
}

export interface ParagraphEditorProps extends ComponentProps {
  bookTitle: string; // Questa proprietà potrebbe derivare da GlobalProject.bookTitle se definito
  author: string;    // Questa proprietà potrebbe derivare da GlobalProject.author se definito
  onSaveProject: (project: GlobalProject) => void; // Usa GlobalProject
  initialParagraphs?: any[]; // Potrebbe usare GlobalProject['paragraphs']
  initialMapSettings?: any; // Potrebbe usare GlobalProject['mapSettings']
  updateLastBackup: (date: string) => void;
}

export interface CreateProjectProps extends ComponentProps {
  onCreateProject: (project: GlobalProject) => void; // Usa GlobalProject
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
