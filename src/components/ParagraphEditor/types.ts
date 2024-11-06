import { MapSettings as StoryMapSettings, ExtendedParagraph as StoryMapParagraph } from '../StoryMap/types';

export type MapSettings = StoryMapSettings;
export type ExtendedParagraph = StoryMapParagraph;
export type Paragraph = ExtendedParagraph;

export interface Project {
  bookTitle: string;
  author: string;
  paragraphs: Paragraph[];
  lastEdited: string;
  coverImage?: string;
  mapSettings?: MapSettings;
}

export interface ImageData {
  bookTitle: string;
  imageData: string;
}

export interface ParagraphEditorProps {
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'export') => void;
  bookTitle: string;
  author: string;
  onSaveProject: (project: Project) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  initialParagraphs?: Paragraph[];
  initialMapSettings?: MapSettings;
  updateLastBackup?: (date: string) => void;
}

export interface NotificationType {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface PopupState {
  visible: boolean;
  isExisting?: boolean;
  paragraphId?: number;
  actionIndex?: number | null;
}
