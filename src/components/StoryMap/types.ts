export interface Action {
  'N.Par.'?: string;
  text?: string;
  [key: string]: any;
}

export interface Paragraph {
  id: number;
  title: string;
  type: 'normale' | 'nodo' | 'finale';
  actions: Action[];
  x?: number;
  y?: number;
  locked?: boolean;
}

export interface MapSettings {
  backgroundImage: string | null;
  imageAdjustments: ImageAdjustments;
}

// Extended version that includes ParagraphEditor fields
export interface ExtendedParagraph extends Paragraph {
  content?: string;
  incomingConnections?: number[];
  outgoingConnections?: string[];
  image?: {
    data: string;
    position: 'before' | 'after';
  };
}

export interface StoryMapProps {
  paragraphs: ExtendedParagraph[];
  mapSettings?: MapSettings;
  onClose: () => void;
  isDarkMode: boolean;
  language?: 'it' | 'en';
  onEditParagraph: (id: number) => void;
  onDeleteParagraph: (id: number) => void;
  onAddNote?: (id: number, note: string) => void;
  onAddParagraph?: (parentId?: number) => void;
  onLinkParagraphs?: (sourceId: number, targetId: number) => void;
  onSave?: (nodes: Node[]) => void;
  onUpdateParagraphs?: (paragraphs: ExtendedParagraph[]) => void;
  onUpdateMapSettings?: (settings: MapSettings) => void;
}

export interface Node {
  id: number;
  x: number;
  y: number;
  type: 'normale' | 'nodo' | 'finale';
  title: string;
  locked: boolean;
  actions: Action[];
  outgoingConnections: string[];
}

export interface Link {
  source: number;
  target: number;
  isPaused: boolean;
  isHighlighted?: boolean;
}

export interface ImageAdjustments {
  contrast: number;
  transparency: number;
  blackAndWhite: number;
  sharpness: number;
  brightness: number;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

export interface Translations {
  selected: string;
  zoomIn: string;
  zoomOut: string;
  toggleGrid: string;
  edit: string;
  delete: string;
  lock: string;
  unlock: string;
  uploadBackground: string;
  flowPaused: string;
  flowResumed: string;
  dragMode: string;
  toggleLines: string;
  action: string;
  backup: string;
  autoBackup: string;
  save: string;
  imageControls: {
    contrast: string;
    transparency: string;
    blackAndWhite: string;
    sharpness: string;
    brightness: string;
    dimensions: string;
    maintainRatio: string;
  };
}

export type Language = 'it' | 'en';
