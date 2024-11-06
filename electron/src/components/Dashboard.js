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
const storage_1 = require("../utils/storage");
const Sidebar = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('./Sidebar'))));
const ProjectBox = react_1.default.memo(({ project, isDarkMode, translations: t, onProjectSelect, index }) => {
    const boxVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
            }
        }
    };
    if (!project) {
        return (<framer_motion_1.motion.div variants={boxVariants} initial="hidden" animate="visible" className="flex flex-col">
        <div className="border-2 rounded-lg overflow-hidden aspect-[3/4] border-gray-600 bg-gray-800">
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-300 text-center">
              {t.noProject}
            </p>
          </div>
        </div>
      </framer_motion_1.motion.div>);
    }
    return (<framer_motion_1.motion.div variants={boxVariants} initial="hidden" animate="visible" className="flex flex-col cursor-pointer h-full group" onClick={() => onProjectSelect(project)}>
      <div className="border-2 rounded-lg overflow-hidden aspect-[3/4] relative transition-all duration-300 hover:border-blue-400 hover:shadow-lg border-gray-600 bg-gray-800 hover:ring-4 hover:ring-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
        {project.coverImage ? (<div className="w-full h-full">
            <img src={project.coverImage} alt={project.bookTitle} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy"/>
          </div>) : (<div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <framer_motion_1.motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
              <lucide_react_1.FileText size={32} className="text-gray-300"/>
            </framer_motion_1.motion.div>
          </div>)}
      </div>
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mt-2">
        <h3 className="text-sm font-bold text-gray-200 mb-0.5 truncate">
          {project.bookTitle}
        </h3>
        <p className="text-xs text-gray-300 truncate">
          {t.by} {project.author}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {t.lastEdit}: {new Date(project.lastEdited).toLocaleDateString()} - {project.paragraphs.length} {t.paragraphs}
        </p>
      </framer_motion_1.motion.div>
    </framer_motion_1.motion.div>);
});
const Dashboard = ({ isDarkMode, setCurrentPage, setIsDarkMode, language, setLanguage, projects, setCurrentProject, onLogout }) => {
    const fileInputRef = (0, react_1.useRef)(null);
    const [recentProjects, setRecentProjects] = (0, react_1.useState)(projects);
    const [logoAnimationComplete, setLogoAnimationComplete] = (0, react_1.useState)(false);
    // Prevent default drag events
    (0, react_1.useEffect)(() => {
        const preventDefault = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        window.addEventListener('dragover', preventDefault);
        window.addEventListener('drop', preventDefault);
        return () => {
            window.removeEventListener('dragover', preventDefault);
            window.removeEventListener('drop', preventDefault);
        };
    }, []);
    const translations = {
        it: {
            createNewProject: "Crea nuovo progetto",
            loadProject: "Carica progetto",
            recentProjects: "PROGETTI RECENTI",
            noProject: "Nessun progetto",
            lastEdit: "Ultima modifica",
            paragraphs: "paragrafi",
            by: "di",
            invalidFile: "File non valido. Seleziona un file JSON valido.",
            projectLoaded: "Progetto caricato con successo"
        },
        en: {
            createNewProject: "Create new project",
            loadProject: "Load project",
            recentProjects: "RECENT PROJECTS",
            noProject: "No project",
            lastEdit: "Last edit",
            paragraphs: "paragraphs",
            by: "by",
            invalidFile: "Invalid file. Please select a valid JSON file.",
            projectLoaded: "Project loaded successfully"
        }
    };
    const t = translations[language];
    (0, react_1.useEffect)(() => {
        const loadProjects = async () => {
            const loadedProjects = await (0, storage_1.getProjects)();
            if (loadedProjects) {
                setRecentProjects(loadedProjects);
            }
        };
        loadProjects();
    }, []);
    const handleProjectSelect = (0, react_1.useCallback)((project) => {
        setCurrentProject(project);
        setCurrentPage('paragraphEditor');
    }, [setCurrentProject, setCurrentPage]);
    const handleCreateNewProject = (0, react_1.useCallback)(() => {
        setCurrentPage('createProject');
    }, [setCurrentPage]);
    const handleLoadProject = (0, react_1.useCallback)(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);
    const handleFileChange = (0, react_1.useCallback)(async (event) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const content = await file.text();
                const project = JSON.parse(content);
                if (project.bookTitle && project.author && Array.isArray(project.paragraphs)) {
                    const updatedProject = {
                        ...project,
                        lastEdited: new Date().toISOString()
                    };
                    await (0, storage_1.saveProject)(updatedProject);
                    setCurrentProject(updatedProject);
                    setRecentProjects(prev => [...prev, updatedProject]);
                    setCurrentPage('paragraphEditor');
                }
                else {
                    alert(t.invalidFile);
                }
            }
            catch (error) {
                console.error('Error loading project:', error);
                alert(t.invalidFile);
            }
        }
    }, [setCurrentProject, setCurrentPage, t]);
    const logoVariants = {
        initial: {
            scale: 0.8,
            opacity: 0,
            filter: "blur(10px)",
            y: 50,
            rotateY: -180
        },
        animate: {
            scale: [0.8, 1.2, 1],
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            rotateY: 0,
            transition: {
                duration: 1.8,
                times: [0, 0.6, 1],
                ease: "easeOut",
                onComplete: () => setLogoAnimationComplete(true)
            }
        }
    };
    const glowVariants = {
        initial: {
            opacity: 0,
            scale: 0.8
        },
        animate: {
            opacity: [0, 0.5, 0],
            scale: [0.8, 1.2, 0.8],
            transition: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        }
    };
    return (<div className="flex h-screen">
      <react_1.Suspense fallback={<div className="w-64 bg-gray-700 animate-pulse"/>}>
        <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} language={language} setLanguage={setLanguage} setCurrentPage={setCurrentPage} onLogout={onLogout}/>
      </react_1.Suspense>

      <div className="flex-1 bg-gray-900 flex flex-col">
        {/* Header */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-none h-12 bg-gray-800 flex items-center px-6"/>

        {/* Main Content */}
        <div className="flex-1 flex p-6">
          {/* Logo Section */}
          <framer_motion_1.motion.div className="flex-1 flex items-center justify-center relative" initial="initial" animate="animate">
            {/* Multiple glow layers for more dynamic effect */}
            <framer_motion_1.motion.div variants={glowVariants} className="absolute inset-0" style={{
            filter: "blur(40px)",
            background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)"
        }}/>
            <framer_motion_1.motion.div variants={glowVariants} custom={1} className="absolute inset-0" style={{
            filter: "blur(60px)",
            background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0) 60%)",
            transform: "scale(1.2)"
        }}/>
            <framer_motion_1.motion.div variants={logoVariants} className="relative z-10" style={{ perspective: "1000px" }}>
              <framer_motion_1.motion.img src="/logo.png" alt="Logo" className="w-full max-w-lg filter drop-shadow-2xl" style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden"
        }} loading="lazy"/>
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>

          {/* Actions Section */}
          <div className="w-[600px] flex flex-col justify-center gap-6 h-full">
            {/* Action Buttons - 40% height */}
            <div className="h-[40%] grid grid-cols-2 gap-6">
              {/* Create New Project Button */}
              <framer_motion_1.motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }} className="p-6 rounded-lg bg-gray-800 shadow-md flex flex-col justify-center border border-gray-700">
                <framer_motion_1.motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                  <lucide_react_1.Plus size={36} className="mx-auto mb-4 text-gray-300"/>
                </framer_motion_1.motion.div>
                <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCreateNewProject} className="w-full bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-3 px-6 rounded-lg transition-colors shadow-md">
                  {t.createNewProject}
                </framer_motion_1.motion.button>
              </framer_motion_1.motion.div>

              {/* Load Project Button */}
              <framer_motion_1.motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.02 }} className="p-6 rounded-lg bg-gray-800 shadow-md flex flex-col justify-center border border-gray-700">
                <framer_motion_1.motion.div whileHover={{ rotate: -30 }} transition={{ duration: 0.3 }}>
                  <lucide_react_1.FolderOpen size={36} className="mx-auto mb-4 text-gray-300"/>
                </framer_motion_1.motion.div>
                <framer_motion_1.motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLoadProject} className="w-full bg-blue-600 hover:bg-blue-700 text-gray-50 font-bold py-3 px-6 rounded-lg transition-colors shadow-md">
                  {t.loadProject}
                </framer_motion_1.motion.button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden"/>
              </framer_motion_1.motion.div>
            </div>

            {/* Recent Projects Section - 60% height */}
            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="h-[60%] p-6 rounded-lg bg-gray-800 shadow-md border border-gray-700 overflow-hidden">
              <framer_motion_1.motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-lg font-bold mb-6 text-gray-100 text-center">
                {t.recentProjects}
              </framer_motion_1.motion.h2>

              <div className="grid grid-cols-3 gap-6 h-[calc(100%-3rem)] overflow-auto">
                <framer_motion_1.AnimatePresence>
                  {[0, 1, 2].map((index) => (<ProjectBox key={recentProjects[index]?.bookTitle || `empty-${index}`} project={recentProjects[index]} isDarkMode={isDarkMode} translations={t} onProjectSelect={handleProjectSelect} index={index}/>))}
                </framer_motion_1.AnimatePresence>
              </div>
            </framer_motion_1.motion.div>
          </div>
        </div>

        {/* Footer */}
        <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex-none h-10 bg-gray-800 text-gray-100 flex items-center justify-end px-6">
          <div className="text-sm">© 2023</div>
        </framer_motion_1.motion.div>
      </div>
    </div>);
};
ProjectBox.displayName = 'ProjectBox';
Dashboard.displayName = 'Dashboard';
exports.default = Dashboard;
