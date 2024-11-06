import { MapSettings, ExtendedParagraph } from '../../types/storymap';

export type Paragraph = ExtendedParagraph & {
  font?: string;
  alignment?: 'left' | 'center' | 'right';
};

export interface Action {
  text: string;
  'N.Par.': string;
}

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

export interface ParagraphContentProps {
  selectedParagraph: Paragraph;
  onUpdate: (updatedParagraph: Paragraph) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
  onShowImageEditor: () => void;
  onShowStoryMap: () => void;
  onDelete: () => void;
  onExport: () => void;
  onSave: () => void;
}

export interface ParagraphEditorControlsProps {
  selectedParagraph: Paragraph;
  paragraphs: Paragraph[];
  onUpdate: (updatedParagraph: Paragraph) => void;
  onSelectParagraph: (id: number) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

export interface ParagraphSidebarProps {
  paragraphs: Paragraph[];
  selectedParagraph: number;
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

export interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  isDarkMode: boolean;
}
