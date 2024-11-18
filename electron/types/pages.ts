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

// Type alias for backward compatibility
export type Book = Project;
