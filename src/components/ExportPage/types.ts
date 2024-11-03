export interface ExportPageProps {
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'export') => void;
  bookTitle: string;
  author: string;
  paragraphs: Paragraph[];
  isDarkMode: boolean;
  language: 'it' | 'en';
}

export interface Paragraph {
  id: number;
  title: string;
  content: string;
  actions: Action[];
  type?: 'normale' | 'nodo' | 'finale';
  image?: {
    data: string;
    position: 'before' | 'after';
  };
}

export interface Action {
  text: string;
  'N.Par.': string;
}

export interface ProcessedParagraph extends Paragraph {
  pageNumber: number;
}

export interface ExportData {
  title: string;
  author: string;
  paragraphs: ProcessedParagraph[];
  includeMeta?: boolean;
  totalPages?: number;
}

export interface ExportOptions {
  margins: 'narrow' | 'normal' | 'wide';
  orientation: 'portrait' | 'landscape';
  includeImages: boolean;
  includeMeta: boolean;
  pageNumbers: boolean;
  fontSize: number;
  lineSpacing: number;
  fontFamily: string;
}

export type ExportFormat = 'pdf' | 'html' | 'json' | 'docx' | 'txt' | 'xlsx';
export type MarginSize = 'narrow' | 'normal' | 'wide';
export type Orientation = 'portrait' | 'landscape';
