import { PageType, Project } from '../../types/pages';

export interface LibraryProps {
  setCurrentPage: (page: PageType) => void;
  books: Project[];
  isDarkMode: boolean;
  onEditBook: (bookTitle: string) => void;
  onDeleteBook: (bookTitle: string) => void;
  onSaveBook: (book: Project) => Promise<void>;
  language: 'it' | 'en';
}

// Re-export Project type as Book for backward compatibility
export type Book = Project;
