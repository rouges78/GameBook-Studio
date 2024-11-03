import React, { useState, useRef } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';

interface CreateNewProjectProps {
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library') => void;
  onCreateProject: (project: any) => void;
  isDarkMode: boolean;
  language: 'it' | 'en';
}

const CreateNewProject: React.FC<CreateNewProjectProps> = ({ 
  setCurrentPage, 
  onCreateProject, 
  isDarkMode, 
  language 
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [endings, setEndings] = useState(5);
  const [intermediateNodes, setIntermediateNodes] = useState(5);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const translations = {
    it: {
      backToDashboard: "Torna alla Dashboard",
      createNewProject: "CREA NUOVO PROGETTO",
      bookTitle: "Titolo del Libro",
      author: "Autore",
      endings: "Numero di finali",
      intermediateNodes: "Numero di nodi intermedi",
      bookCover: "Cover Libro",
      noImageUploaded: "Nessuna immagine caricata",
      uploadImage: "Upload immagine",
      cancel: "Annulla",
      createProject: "Crea Progetto",
      titleRequired: "Il titolo del libro è obbligatorio",
      authorRequired: "Il nome dell'autore è obbligatorio",
      coverRequired: "La copertina del libro è obbligatoria"
    },
    en: {
      backToDashboard: "Back to Dashboard",
      createNewProject: "CREATE NEW PROJECT",
      bookTitle: "Book Title",
      author: "Author",
      endings: "Number of endings",
      intermediateNodes: "Number of intermediate nodes",
      bookCover: "Book Cover",
      noImageUploaded: "No image uploaded",
      uploadImage: "Upload image",
      cancel: "Cancel",
      createProject: "Create Project",
      titleRequired: "Book title is required",
      authorRequired: "Author name is required",
      coverRequired: "Book cover is required"
    }
  };

  const t = translations[language];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateInputs = () => {
    if (!title.trim()) {
      setError(t.titleRequired);
      return false;
    }
    if (!author.trim()) {
      setError(t.authorRequired);
      return false;
    }
    if (!coverImage) {
      setError(t.coverRequired);
      return false;
    }
    setError(null);
    return true;
  };

  const handleCreateProject = () => {
    if (validateInputs()) {
      const newProject = {
        bookTitle: title,
        author,
        coverImage,
        endings,
        intermediateNodes,
        lastEdited: new Date().toISOString(),
        paragraphs: [{
          id: 1,
          title: 'Inizio',
          content: '',
          actions: [],
          incomingConnections: [],
          outgoingConnections: [],
          type: 'normale'
        }]
      };
      onCreateProject(newProject);
      setCurrentPage('paragraphEditor');
    }
  };

  return (
    <div className={`h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-brown-50 text-brown-900'}`}>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`mb-4 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}
        >
          <ArrowLeft size={20} className="mr-2" />
          {t.backToDashboard}
        </button>
        <h1 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-brown-200'} py-4 rounded-lg`}>
          {t.createNewProject}
        </h1>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
          {error && (
            <div className="mb-4 p-3 bg-red-500 text-white rounded-lg">{error}</div>
          )}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              {t.bookTitle}
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-brown-50 border-brown-300'} border rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              {t.author}
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-brown-50 border-brown-300'} border rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex mb-6">
            <div className="flex-1 mr-4">
              <div className="mb-6">
                <label htmlFor="endings" className="block text-sm font-medium mb-2">
                  {t.endings}: {endings}
                </label>
                <input
                  type="range"
                  id="endings"
                  min="1"
                  max="10"
                  value={endings}
                  onChange={(e) => setEndings(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="intermediateNodes" className="block text-sm font-medium mb-2">
                  {t.intermediateNodes}: {intermediateNodes}
                </label>
                <input
                  type="range"
                  id="intermediateNodes"
                  min="1"
                  max="10"
                  value={intermediateNodes}
                  onChange={(e) => setIntermediateNodes(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="w-1/3">
              <p className="text-sm font-medium mb-2">{t.bookCover}</p>
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-brown-100'} border ${isDarkMode ? 'border-gray-600' : 'border-brown-300'} rounded-lg p-4 flex flex-col items-center justify-center`} style={{ aspectRatio: '3/4' }}>
                {coverImage ? (
                  <img src={coverImage} alt="Book Cover" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <Upload size={48} className={`mx-auto ${isDarkMode ? 'text-gray-400' : 'text-brown-400'} mb-2`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-brown-500'}`}>{t.noImageUploaded}</p>
                  </div>
                )}
              </div>
              <label htmlFor="coverUpload" className={`mt-2 w-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brown-600 hover:bg-brown-700'} text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center cursor-pointer`}>
                <Upload size={20} className="mr-2" />
                {t.uploadImage}
              </label>
              <input
                type="file"
                id="coverUpload"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-brown-300 hover:bg-brown-400'} text-white font-bold py-2 px-6 rounded-lg`}
            >
              {t.cancel}
            </button>
            <button
              onClick={handleCreateProject}
              className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brown-600 hover:bg-brown-700'} text-white font-bold py-2 px-6 rounded-lg`}
            >
              {t.createProject}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewProject;
