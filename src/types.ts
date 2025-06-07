export interface Paragraph {
  id: number;
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

export type PageType =
  | 'dashboard'
  | 'createProject'
  | 'paragraphEditor'
  | 'library'
  | 'themeEditor'
  | 'settings'
  | 'help'
  | 'export'
  | 'backupManager'
  | 'telemetryDashboard';

export interface Project {
  id: string;
  name: string;
  title: string;
  bookTitle?: string;
  author?: string;
  description?: string;
  paragraphs: Paragraph[];
  created: string;
  modified: string;
  createdAt: string;
  updatedAt: string;
  lastEdited?: string;
  language: 'it' | 'en';
  content: string;
  mapSettings?: {
    backgroundImage?: string;
    zoomLevel: number;
    panOffset: { x: number; y: number };
  };
  coverImage?: string;
  isArchived?: boolean;
  lastSync?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  path: string;
  projectId: string;
  created: string;
  modified: string;
}

export interface Settings {
  id: string;
  theme: string;
  fontSize: number;
  projectId: string;
  autoSave: boolean;
  backupFreq: number;
  lastBackup: Date;
  syncEnabled: boolean;
}