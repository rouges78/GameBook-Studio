export type PageType = 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 
                'settings' | 'help' | 'export' | 'backupManager' | 'telemetryDashboard';

export interface Paragraph {
  id: number | string;
  title: string;
  content: string;
  actions: any[];
  incomingConnections?: number[];
  outgoingConnections?: string[];
  type: string;
  tags?: string[];
  x?: number;
  y?: number;
  locked?: boolean;
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  title?: string;
  bookTitle?: string;
  author?: string;
  description?: string;
  paragraphs: Paragraph[];
  created: string;
  modified: string;
  createdAt?: string;
  updatedAt?: string;
  lastEdited?: string;
  language?: 'it' | 'en';
  content?: string;
  mapSettings?: {
    backgroundImage?: string;
    zoomLevel?: number;
    panOffset?: { x: number; y: number };
  };
  coverImage?: string;
  isArchived?: boolean;
  lastSync?: string;
  metadata?: Record<string, any>;
}

export interface ComponentProps {
  setCurrentPage: (page: PageType) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

// Only include the interfaces needed by the electron build
export type Book = Project;