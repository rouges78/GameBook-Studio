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

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  language: string;
  isArchived: boolean;
  lastSync: Date | null;
  paragraphs: Paragraph[];
  assets: Asset[];
  settings: Settings | null;
}

export interface Paragraph {
  id: string;
  number: number;
  title: string;
  content: string;
  tags: string | null;
  type: string;
  actions: string;
  incomingConnections: string;
  outgoingConnections: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  x: number | null;
  y: number | null;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  path: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
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