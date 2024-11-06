"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const CreateNewProject = ({ setCurrentPage, onCreateProject, isDarkMode, language }) => {
    const [title, setTitle] = (0, react_1.useState)('');
    const [author, setAuthor] = (0, react_1.useState)('');
    const [endings, setEndings] = (0, react_1.useState)(5);
    const [intermediateNodes, setIntermediateNodes] = (0, react_1.useState)(5);
    const [coverImage, setCoverImage] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const coverInputRef = (0, react_1.useRef)(null);
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
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result);
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
    const formVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 }
        }
    };
    const buttonVariants = {
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95 }
    };
    const coverVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25
            }
        }
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-brown-50 text-brown-900'}`}>
      <div className="max-w-3xl mx-auto">
        <framer_motion_1.motion.button initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} whileHover={{ x: -5 }} onClick={() => setCurrentPage('dashboard')} className={`mb-4 ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-brown-600 hover:text-brown-700'} flex items-center`}>
          <lucide_react_1.ArrowLeft size={20} className="mr-2"/>
          {t.backToDashboard}
        </framer_motion_1.motion.button>

        <framer_motion_1.motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-brown-200'} py-4 rounded-lg`}>
          {t.createNewProject}
        </framer_motion_1.motion.h1>

        <framer_motion_1.motion.div variants={formVariants} initial="hidden" animate="visible" className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
          <framer_motion_1.AnimatePresence>
            {error && (<framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-4 p-3 bg-red-500 text-white rounded-lg">
                {error}
              </framer_motion_1.motion.div>)}
          </framer_motion_1.AnimatePresence>

          <framer_motion_1.motion.div variants={itemVariants} className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              {t.bookTitle}
            </label>
            <framer_motion_1.motion.input whileFocus={{ scale: 1.01 }} type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-brown-50 border-brown-300'} border rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}/>
          </framer_motion_1.motion.div>

          <framer_motion_1.motion.div variants={itemVariants} className="mb-6">
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              {t.author}
            </label>
            <framer_motion_1.motion.input whileFocus={{ scale: 1.01 }} type="text" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-brown-50 border-brown-300'} border rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}/>
          </framer_motion_1.motion.div>

          <div className="flex mb-6">
            <framer_motion_1.motion.div variants={itemVariants} className="flex-1 mr-4">
              <div className="mb-6">
                <label htmlFor="endings" className="block text-sm font-medium mb-2">
                  {t.endings}: {endings}
                </label>
                <framer_motion_1.motion.input whileFocus={{ scale: 1.01 }} type="range" id="endings" min="1" max="10" value={endings} onChange={(e) => setEndings(parseInt(e.target.value))} className="w-full"/>
              </div>
              <div>
                <label htmlFor="intermediateNodes" className="block text-sm font-medium mb-2">
                  {t.intermediateNodes}: {intermediateNodes}
                </label>
                <framer_motion_1.motion.input whileFocus={{ scale: 1.01 }} type="range" id="intermediateNodes" min="1" max="10" value={intermediateNodes} onChange={(e) => setIntermediateNodes(parseInt(e.target.value))} className="w-full"/>
              </div>
            </framer_motion_1.motion.div>

            <framer_motion_1.motion.div variants={itemVariants} className="w-1/3">
              <p className="text-sm font-medium mb-2">{t.bookCover}</p>
              <framer_motion_1.motion.div variants={coverVariants} className={`${isDarkMode ? 'bg-gray-700' : 'bg-brown-100'} border ${isDarkMode ? 'border-gray-600' : 'border-brown-300'} rounded-lg p-4 flex flex-col items-center justify-center`} style={{ aspectRatio: '3/4' }}>
                <framer_motion_1.AnimatePresence mode="wait">
                  {coverImage ? (<framer_motion_1.motion.img key="cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} src={coverImage} alt="Book Cover" className="max-w-full max-h-full object-contain"/>) : (<framer_motion_1.motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                      <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                        <lucide_react_1.Upload size={48} className={`mx-auto ${isDarkMode ? 'text-gray-400' : 'text-brown-400'} mb-2`}/>
                      </framer_motion_1.motion.div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-brown-500'}`}>{t.noImageUploaded}</p>
                    </framer_motion_1.motion.div>)}
                </framer_motion_1.AnimatePresence>
              </framer_motion_1.motion.div>
              <framer_motion_1.motion.label variants={buttonVariants} whileHover="hover" whileTap="tap" htmlFor="coverUpload" className={`mt-2 w-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brown-600 hover:bg-brown-700'} text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center cursor-pointer`}>
                <lucide_react_1.Upload size={20} className="mr-2"/>
                {t.uploadImage}
              </framer_motion_1.motion.label>
              <input type="file" id="coverUpload" ref={coverInputRef} accept="image/*" onChange={handleImageUpload} className="hidden"/>
            </framer_motion_1.motion.div>
          </div>

          <framer_motion_1.motion.div variants={itemVariants} className="flex justify-between mt-8">
            <framer_motion_1.motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={() => setCurrentPage('dashboard')} className={`${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-brown-300 hover:bg-brown-400'} text-white font-bold py-2 px-6 rounded-lg`}>
              {t.cancel}
            </framer_motion_1.motion.button>
            <framer_motion_1.motion.button variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={handleCreateProject} className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brown-600 hover:bg-brown-700'} text-white font-bold py-2 px-6 rounded-lg`}>
              {t.createProject}
            </framer_motion_1.motion.button>
          </framer_motion_1.motion.div>
        </framer_motion_1.motion.div>
      </div>
    </framer_motion_1.motion.div>);
};
exports.default = CreateNewProject;
