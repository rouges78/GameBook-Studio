import { PageType } from '../../types/pages';

export interface Paragraph {
  id: number;
  title: string;
  content: string;
  actions: any[];
  type: 'normale' | 'nodo' | 'finale';
}

export interface ExportPageProps {
  setCurrentPage: (page: PageType) => void;
  bookTitle: string;
  author: string;
  paragraphs: Paragraph[];
  isDarkMode: boolean;
  language: 'it' | 'en';
}
