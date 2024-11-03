export interface Book {
  bookTitle: string;
  author: string;
  coverImage?: string;
  lastEdited: string;
  paragraphs: any[];
}

export interface LibraryProps {
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'export') => void;
  books: Book[];
  isDarkMode: boolean;
  onEditBook: (bookTitle: string) => void;
  onDeleteBook: (bookTitle: string) => void;
  onSaveBook: (book: Book) => void;
  language: 'it' | 'en';
}
