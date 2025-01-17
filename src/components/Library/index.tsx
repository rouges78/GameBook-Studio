import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  AlignLeft,
  User,
  Calendar,
  Grid,
  List
} from 'lucide-react';
import { LibraryProps, Book } from './types';
import { translations } from './translations';

const Library: React.FC<LibraryProps> = ({
  setCurrentPage,
  books,
  isDarkMode,
  onEditBook,
  onDeleteBook,
  onSaveBook,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'date'>('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(books);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  useEffect(() => {
    let filtered = books.filter(
      (book) =>
        book.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    filtered.sort((a, b) => {
      if (sortBy === 'title') return a.bookTitle.localeCompare(b.bookTitle);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
    });
    
    setFilteredBooks(filtered);
  }, [searchTerm, books, sortBy]);

  const handleTitleAuthorChange = (field: 'bookTitle' | 'author', value: string) => {
    if (editingBook) {
      setEditingBook({ ...editingBook, [field]: value });
    }
  };

  const handleSaveTitleAuthor = () => {
    if (editingBook) {
      onSaveBook(editingBook);
      setEditingBook(null);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, book: Book) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create a complete updated book object
        const updatedBook: Book = {
          ...book,
          coverImage: reader.result as string,
          lastEdited: new Date().toISOString()
        };
        
        // Save the complete book data
        onSaveBook(updatedBook);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = (action: string, book: Book) => {
    switch (action) {
      case 'edit':
        onEditBook(book.bookTitle);
        break;
      case 'delete':
        onDeleteBook(book.bookTitle);
        break;
      case 'changeImage':
        if (fileInputRef.current) {
          // Remove any existing event listener
          if (fileInputRef.current.onchange) {
            fileInputRef.current.onchange = null;
          }
          // Add new event listener
          fileInputRef.current.addEventListener('change', (e: Event) => {
            const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
            handleImageChange(event, book);
          }, { once: true }); // Use once: true to automatically remove the listener after use
          fileInputRef.current.click();
        }
        break;
      case 'changeTitle':
        setEditingBook(book);
        break;
      case 'export':
        setCurrentPage('export');
        break;
    }
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-brown-50 text-brown-900'}`}>
      {/* Header */}
      <div className="flex-none h-10 border-b border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}
          >
            <ArrowLeft size={18} className="mr-2" />
            {t.backToHome}
          </button>
          <h1 className="text-lg font-bold">{t.gamebookLibrary}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t.searchByTitleOrAuthor}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-64 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-brown-900 border-brown-300'} border rounded-full py-1 px-4 pl-9 focus:outline-none focus:border-brown-500`}
            />
            <Search className={`absolute left-3 top-2 ${isDarkMode ? 'text-gray-400' : 'text-brown-600'}`} size={16} />
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => setSortBy('title')}
              className={`p-1.5 rounded-full ${sortBy === 'title' ? (isDarkMode ? 'bg-blue-600' : 'bg-brown-500') : (isDarkMode ? 'bg-gray-700' : 'bg-brown-300')}`}
              title={t.sortByTitleAZ}
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => setSortBy('author')}
              className={`p-1.5 rounded-full ${sortBy === 'author' ? (isDarkMode ? 'bg-blue-600' : 'bg-brown-500') : (isDarkMode ? 'bg-gray-700' : 'bg-brown-300')}`}
              title={t.sortByAuthorAZ}
            >
              <User size={16} />
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`p-1.5 rounded-full ${sortBy === 'date' ? (isDarkMode ? 'bg-blue-600' : 'bg-brown-500') : (isDarkMode ? 'bg-gray-700' : 'bg-brown-300')}`}
              title={t.sortByDate}
            >
              <Calendar size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full ${viewMode === 'grid' ? (isDarkMode ? 'bg-blue-600' : 'bg-brown-500') : (isDarkMode ? 'bg-gray-700' : 'bg-brown-300')}`}
              title={t.gridView}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full ${viewMode === 'list' ? (isDarkMode ? 'bg-blue-600' : 'bg-brown-500') : (isDarkMode ? 'bg-gray-700' : 'bg-brown-300')}`}
              title={t.listView}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-4 overflow-auto">
        <div className="max-w-7xl mx-auto h-full">
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4' : 'flex flex-col gap-3'}`}>
            {filteredBooks.map((book) => (
              <div 
                key={book.bookTitle} 
                className={`
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                  rounded-lg shadow-lg 
                  ${viewMode === 'grid' ? 'flex flex-col h-fit' : 'flex flex-row items-center p-2'}
                `}
              >
                {/* Cover Image */}
                <div 
                  className={`
                    relative 
                    ${viewMode === 'grid' ? 'aspect-[3/4] w-full' : 'w-24 h-32 flex-shrink-0'}
                  `}
                >
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.bookTitle} 
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className={`absolute inset-0 flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg`}>
                      <FileText size={32} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`
                  ${viewMode === 'grid' ? 'p-3' : 'flex-1 ml-4'} 
                  flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row items-center justify-between'} 
                  gap-2
                `}>
                  {editingBook && editingBook.bookTitle === book.bookTitle ? (
                    <div className="flex flex-col gap-2 w-full">
                      <input
                        type="text"
                        value={editingBook.bookTitle}
                        onChange={(e) => handleTitleAuthorChange('bookTitle', e.target.value)}
                        className={`w-full p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                      />
                      <input
                        type="text"
                        value={editingBook.author}
                        onChange={(e) => handleTitleAuthorChange('author', e.target.value)}
                        className={`w-full p-2 rounded text-sm ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                      />
                      <div className="flex justify-between">
                        <button
                          onClick={handleSaveTitleAuthor}
                          className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white px-3 py-1 rounded text-sm`}
                        >
                          {t.save}
                        </button>
                        <button
                          onClick={() => setEditingBook(null)}
                          className={`${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-500'} text-white px-3 py-1 rounded text-sm`}
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                        <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-brown-900'}`}>{book.bookTitle}</h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-brown-600'}`}>{t.by} {book.author}</p>
                      </div>
                      <div className={`flex ${viewMode === 'grid' ? 'justify-between' : 'gap-3'}`}>
                        <button onClick={() => handleAction('edit', book)} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'}`} title={t.editBook}>
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleAction('delete', book)} className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`} title={t.deleteBook}>
                          <Trash2 size={16} />
                        </button>
                        <button onClick={() => handleAction('changeImage', book)} className={`${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`} title={t.changeCover}>
                          <ImageIcon size={16} />
                        </button>
                        <button onClick={() => handleAction('changeTitle', book)} className={`${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-700'}`} title={t.changeTitleAuthor}>
                          <FileText size={16} />
                        </button>
                        <button onClick={() => handleAction('export', book)} className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`} title={t.exportBook}>
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none h-8 border-t border-gray-700 flex items-center justify-between px-6">
        <div className="text-gray-400 text-xs">Version: 0.1.0</div>
        <div className="text-gray-400 text-xs">© 2023 GameBook Studio. All Rights Reserved.</div>
      </div>
    </div>
  );
};

export default Library;
