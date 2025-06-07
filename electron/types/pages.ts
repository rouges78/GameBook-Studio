export type PageType = 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 
                'settings' | 'help' | 'export' | 'backupManager';

export interface Project {
  id: string;
  name: string;
  bookTitle?: string; // Reso opzionale per allineamento con src/types.Project
  author?: string; // Reso opzionale per allineamento con src/types.Project
  description?: string;
  created: Date | string; // Temporaneamente string | Date
  modified: Date | string; // Temporaneamente string | Date
  lastEdited?: string; // Reso opzionale per allineamento
  paragraphs: any[];
  mapSettings?: any;
}

export interface ComponentProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

// Only include the interfaces needed by the electron build
export type Book = Project;
