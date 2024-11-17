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
  List,
  BookOpen,
  Clock
} from 'lucide-react';
import { LibraryProps, Book } from './Library/types';
import { translations } from './Library/translations';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
    if (editingBook && editingBook.bookTitle.trim() && editingBook.author.trim()) {
      onSaveBook(editingBook);
      setEditingBook(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitleAuthor();
    } else if (e.key === 'Escape') {
      setEditingBook(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getBookStats = (book: Book) => {
    const paragraphCount = book.paragraphs.length;
    const wordCount = book.paragraphs.reduce((total, p: any) => {
      return total + (p.content?.split(/\s+/).length || 0);
    }, 0);
    
    return {
      paragraphCount,
      wordCount,
      lastEdited: formatDate(book.lastEdited)
    };
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>, book: Book) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t.imageTooLarge || 'Image too large. Maximum size is 5MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(t.invalidImageType || 'Please select a valid image file.');
        return;
      }

      // Validate image loading
      const isValid = await validateImage(file);
      if (!isValid) {
        alert(t.invalidImage || 'Invalid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setPreviewImage(imageData);
        
        // Auto-save after a brief preview
        setTimeout(() => {
          const updatedBook: Book = {
            ...book,
            coverImage: imageData,
            lastEdited: new Date().toISOString()
          };
          onSaveBook(updatedBook);
          setPreviewImage(null);
        }, 1000);
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
          fileInputRef.current.onchange = (e: Event) => {
            const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
            handleImageChange(event, book);
          };
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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <div className="flex-none h-16 bg-gradient-to-r from-blue-800 to-indigo-800 shadow-lg flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200 shadow-md"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t.backToHome}
          </button>
          <h1 className="text-2xl font-bold text-white">{t.gamebookLibrary}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
            <div className="px-3">
              <Search className="text-white/70" size={18} />
            </div>
            <input
              type="text"
              placeholder={t.searchByTitleOrAuthor}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-transparent text-white py-2 px-2 focus:outline-none placeholder-white/50"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('title')}
              className={`p-2 rounded-lg ${sortBy === 'title' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'} transition-colors duration-200`}
              title={t.sortByTitleAZ}
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => setSortBy('author')}
              className={`p-2 rounded-lg ${sortBy === 'author' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'} transition-colors duration-200`}
              title={t.sortByAuthorAZ}
            >
              <User size={18} />
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`p-2 rounded-lg ${sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'} transition-colors duration-200`}
              title={t.sortByDate}
            >
              <Calendar size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'} transition-colors duration-200`}
              title={t.gridView}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'} transition-colors duration-200`}
              title={t.listView}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto h-full">
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6' : 'flex flex-col gap-4'}`}>
            {filteredBooks.map((book) => {
              const stats = getBookStats(book);
              return (
                <div 
                  key={book.bookTitle} 
                  className={`
                    bg-white/10 backdrop-blur-sm border border-white/20
                    rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200
                    hover:scale-105 hover:bg-white/15
                    ${viewMode === 'grid' ? 'flex flex-col h-fit' : 'flex flex-row items-center p-4'}
                  `}
                >
                  {/* Cover Image */}
                  <div 
                    className={`
                      relative overflow-hidden
                      ${viewMode === 'grid' ? 'aspect-[3/4] w-full' : 'w-24 h-32 flex-shrink-0'}
                    `}
                  >
                    {previewImage && book === editingBook ? (
                      <img 
                        src={previewImage} 
                        alt={book.bookTitle} 
                        className="absolute inset-0 w-full h-full object-cover rounded-t-xl"
                      />
                    ) : book.coverImage ? (
                      <img 
                        src={book.coverImage} 
                        alt={book.bookTitle} 
                        className="absolute inset-0 w-full h-full object-cover rounded-t-xl"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-t-xl">
                        <FileText size={32} className="text-white/50" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`
                    ${viewMode === 'grid' ? 'p-4' : 'flex-1 ml-4'} 
                    flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row items-center justify-between'} 
                    gap-2
                  `}>
                    {editingBook && editingBook.bookTitle === book.bookTitle ? (
                      <div className="flex flex-col gap-2 w-full">
                        <input
                          type="text"
                          value={editingBook.bookTitle}
                          onChange={(e) => handleTitleAuthorChange('bookTitle', e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full p-2 rounded-lg text-sm bg-white/20 text-white border border-white/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-white/50"
                          placeholder={t.enterBookTitle}
                        />
                        <input
                          type="text"
                          value={editingBook.author}
                          onChange={(e) => handleTitleAuthorChange('author', e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full p-2 rounded-lg text-sm bg-white/20 text-white border border-white/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-white/50"
                          placeholder={t.enterAuthorName}
                        />
                        <div className="flex justify-between">
                          <button
                            onClick={handleSaveTitleAuthor}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm transition-colors duration-200"
                          >
                            {t.save}
                          </button>
                          <button
                            onClick={() => setEditingBook(null)}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg text-sm transition-colors duration-200"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                          <h3 className="text-base font-semibold text-white">{book.bookTitle}</h3>
                          <p className="text-xs text-white/70">{t.by} {book.author}</p>
                          
                          {/* Statistics */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-xs text-white/60">
                              <BookOpen size={14} className="mr-1" />
                              <span>{stats.paragraphCount} {t.paragraphs || 'paragraphs'}</span>
                            </div>
                            <div className="flex items-center text-xs text-white/60">
                              <FileText size={14} className="mr-1" />
                              <span>{stats.wordCount} {t.words || 'words'}</span>
                            </div>
                            <div className="flex items-center text-xs text-white/60">
                              <Clock size={14} className="mr-1" />
                              <span>{stats.lastEdited}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`flex ${viewMode === 'grid' ? 'justify-between' : 'gap-3'}`}>
                          <button 
                            onClick={() => handleAction('edit', book)} 
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-blue-500/50 text-white/70 hover:text-white transition-colors duration-200" 
                            title={t.editBook}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction('delete', book)} 
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/70 hover:text-white transition-colors duration-200" 
                            title={t.deleteBook}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction('changeImage', book)} 
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-green-500/50 text-white/70 hover:text-white transition-colors duration-200" 
                            title={t.changeCover}
                          >
                            <ImageIcon size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction('changeTitle', book)} 
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-purple-500/50 text-white/70 hover:text-white transition-colors duration-200" 
                            title={t.changeTitleAuthor}
                          >
                            <FileText size={16} />
                          </button>
                          <button 
                            onClick={() => handleAction('export', book)} 
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-indigo-500/50 text-white/70 hover:text-white transition-colors duration-200" 
                            title={t.exportBook}
                          >
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
