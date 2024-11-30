import { PageType } from '../../types/pages';

export interface Project {
  id: string;
  name: string;
  bookTitle: string;
  author: string;
  description?: string;
  created: Date;
  modified: Date;
  lastEdited: string;
  paragraphs: Paragraph[];
  mapSettings?: any;
}

export interface Paragraph {
  id: number;
  title: string;
  content: string;
  actions: Action[];
  incomingConnections: number[];
  outgoingConnections: string[];
  type: 'normale' | 'nodo' | 'finale';
  tags: string[];
  font?: string;
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
  image?: { 
    data: string;
    position: 'before' | 'after';
  };
  note?: string;
  x?: number;
  y?: number;
  locked?: boolean;
}

export interface Action {
  text: string;
  'N.Par.': string;
}

export interface ParagraphSidebarProps {
  paragraphs: Paragraph[];
  selectedParagraph: number | null;
  isDarkMode: boolean;
  showSearch: boolean;
  searchTerm: string;
  showConnections: number | null;
  language: 'it' | 'en';
  onAddParagraph: () => void;
  onSelectParagraph: (id: number) => void;
  onToggleSearch: () => void;
  onSearchChange: (term: string) => void;
  onToggleConnections: (id: number | null) => void;
  onImageEdit: (id: number) => void;
}

export interface ParagraphEditorProps {
  setCurrentPage: (page: PageType) => void;
  bookTitle: string;
  author: string;
  onSaveProject: (project: Project) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  initialParagraphs?: Paragraph[];
  initialMapSettings?: any;
  updateLastBackup: (date: string) => void;
}

export interface ParagraphContentProps {
  selectedParagraph: Paragraph;
  paragraphs: Paragraph[];
  onUpdate: (updatedParagraph: Paragraph) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  onReturnToEditor?: () => void;
}

export interface ParagraphEditorControlsProps {
  selectedParagraph: Paragraph;
  paragraphs: Paragraph[];
  onUpdate: (updatedParagraph: Paragraph) => void;
  onSelectParagraph: (id: number) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  onSave: () => void;
  onShowStoryMap: () => void;
}

export interface FormattingToolbarProps {
  selectedParagraph: Paragraph;
  onUpdate: (updatedParagraph: Paragraph) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

export interface NotificationType {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface PopupState {
  visible: boolean;
  actionIndex: number | null;
  isExisting?: boolean;
  paragraphId?: number;
}

// Alias per compatibilità
export type Book = Project;
