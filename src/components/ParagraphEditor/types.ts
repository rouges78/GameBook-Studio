import { PageType, Project as GlobalProject, Paragraph as GlobalParagraph } from '../../types';

// La definizione locale di Project è stata rimossa, si usa GlobalProject importato.
// La definizione locale di Paragraph è stata rimossa, si usa GlobalParagraph importato.
// Se GlobalParagraph non è sufficientemente specifico (es. per 'type'),
// si potrebbe estendere o creare un tipo specifico locale basato su GlobalParagraph.
// Per ora, si assume che GlobalParagraph sia adeguato.

export type Project = GlobalProject;
export type Paragraph = GlobalParagraph;

// La definizione di Action rimane locale se non presente in types.ts globale
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
  onSaveProject: (project: GlobalProject) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  initialParagraphs?: Paragraph[];
  initialMapSettings?: any;
  updateLastBackup: (date: string) => void;
}

export interface ParagraphContentProps {
  selectedParagraph: GlobalParagraph;
  paragraphs: GlobalParagraph[];
  onUpdate: (updatedParagraph: Paragraph) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  onReturnToEditor?: () => void;
}

export interface ParagraphEditorControlsProps {
  selectedParagraph: GlobalParagraph;
  paragraphs: GlobalParagraph[];
  onUpdate: (updatedParagraph: Paragraph) => void;
  onSelectParagraph: (id: number) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  onSave: () => void;
  onShowStoryMap: () => void;
}

export interface FormattingToolbarProps {
  selectedParagraph: GlobalParagraph;
  onUpdate: (updatedParagraph: GlobalParagraph) => void;
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
