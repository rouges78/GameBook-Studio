import React, { useState, useCallback, useMemo, Suspense, lazy, useRef, useEffect } from 'react';
import { Plus, FolderOpen, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjects, saveProject } from '../utils/storage';

const Sidebar = lazy(() => import('./Sidebar'));

interface Project {
  bookTitle: string;
  author: string;
  paragraphs: any[];
  lastEdited: string;
  coverImage?: string;
}

interface DashboardProps {
  isDarkMode: boolean;
  setCurrentPage: (page: 'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help' | 'export' | 'backupManager' | 'telemetryDashboard') => void;
  setIsDarkMode: (value: boolean) => void;
  language: 'it' | 'en';
  setLanguage: (value: 'it' | 'en') => void;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  onLogout: () => void;
}

interface ProjectBoxProps {
  project?: Project;
  isDarkMode: boolean;
  translations: {
    noProject: string;
    by: string;
    lastEdit: string;
    paragraphs: string;
  };
  onProjectSelect: (project: Project) => void;
  index: number;
}

const ProjectBox = React.memo<ProjectBoxProps>(({ project, isDarkMode, translations: t, onProjectSelect, index }) => {
  const boxVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  // LED glow animation for the border
  const borderGlowVariants = {
    initial: { 
      pathLength: 0,
      opacity: 0,
      strokeDasharray: "0 1"
    },
    animate: {
      pathLength: 1,
      opacity: [0.3, 0.6, 0.3],
      strokeDasharray: "1 0",
      transition: {
        pathLength: {
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        },
        opacity: {
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        },
        strokeDasharray: {
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }
      }
    }
  };

  if (!project) {
    return (
      <motion.div
        variants={boxVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col"
      >
        <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-lg overflow-hidden aspect-[3/4]`}>
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              {t.noProject}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={boxVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col cursor-pointer h-full group"
      onClick={() => onProjectSelect(project)}
    >
      <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-lg overflow-hidden aspect-[3/4] relative`}>
        {/* LED glow border */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ 
            filter: 'drop-shadow(0 0 4px rgb(59, 130, 246)) drop-shadow(0 0 8px rgb(59, 130, 246))',
            transform: 'translate(-1px, -1px)',
            width: 'calc(100% + 2px)',
            height: 'calc(100% + 2px)'
          }}
        >
          <motion.rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            strokeLinecap="round"
            initial="initial"
            animate="animate"
            variants={borderGlowVariants}
            rx="8"
            ry="8"
          />
        </svg>

        {project.coverImage ? (
          <div className="w-full h-full">
            <img 
              src={project.coverImage} 
              alt={project.bookTitle}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <FileText size={32} className="text-primary" strokeWidth={1.5} />
            </motion.div>
          </div>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mt-3 space-y-1"
      >
        <h3 className="text-sm font-semibold">
          {project.bookTitle}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t.by} {project.author}
        </p>
        <p className="text-xs text-muted-foreground">
          {t.lastEdit}: {new Date(project.lastEdited).toLocaleDateString()} · {project.paragraphs.length} {t.paragraphs}
        </p>
      </motion.div>
    </motion.div>
  );
});

const Dashboard = ({ isDarkMode, setCurrentPage, setIsDarkMode, language, setLanguage, projects, setCurrentProject, onLogout }: DashboardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>(projects);
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(false);

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

  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
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

  useEffect(() => {
    const loadProjects = async () => {
      const loadedProjects = await getProjects();
      if (loadedProjects) {
        setRecentProjects(loadedProjects);
      }
    };
    loadProjects();
  }, []);

  const handleProjectSelect = useCallback((project: Project) => {
    setCurrentProject(project);
    setCurrentPage('paragraphEditor');
  }, [setCurrentProject, setCurrentPage]);

  const handleCreateNewProject = useCallback(() => {
    setCurrentPage('createProject');
  }, [setCurrentPage]);

  const handleLoadProject = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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
          
          await saveProject(updatedProject);
          
          setCurrentProject(updatedProject);
          setRecentProjects(prev => [...prev, updatedProject]);
          setCurrentPage('paragraphEditor');
        } else {
          alert(t.invalidFile);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        alert(t.invalidFile);
      }
    }
  }, [setCurrentProject, setCurrentPage, t]);

  return (
    <div className="flex h-screen">
      <Suspense fallback={<div className="w-64 bg-muted animate-pulse" />}>
        <Sidebar
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          language={language}
          setLanguage={setLanguage}
          setCurrentPage={setCurrentPage}
          onLogout={onLogout}
        />
      </Suspense>

      <div className="flex-1 bg-background flex flex-col">
        <div className="flex-1 flex p-6">
          <div className="flex-1 flex">
            {/* Logo Section */}
            <div className="w-3/5 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                onAnimationComplete={() => setLogoAnimationComplete(true)}
                className="relative"
              >
                {/* Enhanced pulsating glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(59, 130, 246, 0) 70%)',
                    filter: 'blur(25px)',
                    zIndex: 0
                  }}
                />
                <img
                  src="/logo.png"
                  alt="GameBook Studio"
                  className="w-[450px] h-[450px] object-contain relative z-10"
                />
              </motion.div>
            </div>

            {/* Content Section */}
            <div className="w-2/5 flex flex-col justify-center gap-6">
              {/* Top boxes - 40% height */}
              <div className="h-[40%] grid grid-cols-2 gap-6 mb-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-6 rounded-lg flex flex-col justify-center`}
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus size={36} className="mx-auto mb-4 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateNewProject}
                    className="btn btn-primary w-full"
                  >
                    {t.createNewProject}
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-6 rounded-lg flex flex-col justify-center`}
                >
                  <motion.div
                    whileHover={{ rotate: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FolderOpen size={36} className="mx-auto mb-4 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLoadProject}
                    className="btn btn-primary w-full"
                  >
                    {t.loadProject}
                  </motion.button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </motion.div>
              </div>

              {/* Recent projects - 60% height */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} h-[60%] p-6 rounded-lg overflow-hidden`}
              >
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg font-semibold mb-6 text-center"
                >
                  {t.recentProjects}
                </motion.h2>

                <div className="grid grid-cols-3 gap-6 h-[calc(100%-3rem)] overflow-auto">
                  <AnimatePresence>
                    {[0, 1, 2].map((index) => (
                      <ProjectBox
                        key={recentProjects[index]?.bookTitle || `empty-${index}`}
                        project={recentProjects[index]}
                        isDarkMode={isDarkMode}
                        translations={t}
                        onProjectSelect={handleProjectSelect}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProjectBox.displayName = 'ProjectBox';
Dashboard.displayName = 'Dashboard';

export default Dashboard;
