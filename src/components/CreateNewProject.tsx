import React, { useState, useRef } from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const pageTransition = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.645, 0.045, 0.355, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: {
        duration: 0.3
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.97,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const coverVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const inputVariants = {
    focus: { 
      scale: 1.01,
      boxShadow: "0px 0px 8px rgba(var(--primary-rgb), 0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background p-8"
    >
      <div className="max-w-3xl mx-auto">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: -5 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
          onClick={() => setCurrentPage('dashboard')}
          className="mb-6 text-primary hover:text-primary/80 flex items-center transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" strokeWidth={2} />
          {t.backToDashboard}
        </motion.button>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.1
          }}
          className={`text-2xl font-bold text-center mb-8 ${isDarkMode ? 'glass-dark' : 'glass'} py-4 rounded-lg`}
        >
          {t.createNewProject}
        </motion.h1>

        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className={`${isDarkMode ? 'glass-dark' : 'glass'} rounded-lg p-8`}
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
                className="mb-6 p-3 bg-destructive text-destructive-foreground rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              {t.bookTitle}
            </label>
            <motion.input
              variants={inputVariants}
              whileFocus="focus"
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              {t.author}
            </label>
            <motion.input
              variants={inputVariants}
              whileFocus="focus"
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input"
            />
          </motion.div>

          <div className="flex mb-6 gap-8">
            <motion.div variants={itemVariants} className="flex-1">
              <div className="mb-6">
                <label htmlFor="endings" className="block text-sm font-medium mb-2">
                  {t.endings}: {endings}
                </label>
                <motion.input
                  variants={inputVariants}
                  whileFocus="focus"
                  type="range"
                  id="endings"
                  min="1"
                  max="10"
                  value={endings}
                  onChange={(e) => setEndings(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label htmlFor="intermediateNodes" className="block text-sm font-medium mb-2">
                  {t.intermediateNodes}: {intermediateNodes}
                </label>
                <motion.input
                  variants={inputVariants}
                  whileFocus="focus"
                  type="range"
                  id="intermediateNodes"
                  min="1"
                  max="10"
                  value={intermediateNodes}
                  onChange={(e) => setIntermediateNodes(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="w-1/3">
              <p className="text-sm font-medium mb-2">{t.bookCover}</p>
              <motion.div
                variants={coverVariants}
                whileHover="hover"
                className={`${isDarkMode ? 'glass-dark' : 'glass'} rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-200`}
                style={{ aspectRatio: '3/4' }}
              >
                <AnimatePresence mode="wait">
                  {coverImage ? (
                    <motion.img
                      key="cover"
                      initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        rotateY: 0,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        }
                      }}
                      exit={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                      src={coverImage}
                      alt="Book Cover"
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          rotate: {
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                          },
                          scale: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        }}
                      >
                        <Upload size={32} className="mx-auto text-primary/70 mb-2" strokeWidth={1.5} />
                      </motion.div>
                      <p className="text-sm text-muted-foreground">{t.noImageUploaded}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <motion.label
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                htmlFor="coverUpload"
                className="btn btn-primary w-full mt-3 cursor-pointer"
              >
                <Upload size={16} className="mr-2" strokeWidth={2} />
                {t.uploadImage}
              </motion.label>
              <input
                type="file"
                id="coverUpload"
                ref={coverInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex justify-between mt-8 gap-4"
          >
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setCurrentPage('dashboard')}
              className="btn btn-secondary"
            >
              {t.cancel}
            </motion.button>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleCreateProject}
              className="btn btn-primary"
            >
              {t.createProject}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CreateNewProject;
