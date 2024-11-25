import React, { useState, useCallback, useMemo, Suspense, lazy, useRef, useEffect } from 'react';
import { Plus, FolderOpen, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProjects, saveProject } from '../utils/storage';
import { projectCache } from '../utils/projectCache';
import ChangelogModal from './ChangelogModal';
import '../styles/glow.css';

const Sidebar = lazy(() => import('./Sidebar'));

interface Project {
  id: string;
  bookTitle: string;
  author: string;
  paragraphs: any[];
  lastEdited: string;
  coverImage?: string;
}

// Mock data for browser testing
const mockProjects: Project[] = [
  {
    id: "mock-project-1",
    bookTitle: "Sample Project 1",
    author: "Author One",
    paragraphs: [],
    lastEdited: new Date().toISOString(),
    created: new Date(),
    modified: new Date(),
    name: "Sample Project 1"
  },
  {
    id: "mock-project-2",
    bookTitle: "Sample Project 2",
    author: "Author Two",
    paragraphs: [],
    lastEdited: new Date().toISOString(),
    created: new Date(),
    modified: new Date(),
    name: "Sample Project 2"
  },
  {
    id: "mock-project-3",
    bookTitle: "Sample Project 3",
    author: "Author Three",
    paragraphs: [],
    lastEdited: new Date().toISOString(),
    created: new Date(),
    modified: new Date(),
    name: "Sample Project 3"
  }
];

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
  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
7        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        className="flex flex-col"
      >
        <div className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-lg overflow-hidden aspect-[3/4] backdrop-blur-sm bg-opacity-50`}>
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground">
              {t.noProject}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!project) return;

    // Generate a new ID if missing
    if (!project.id) {
      console.log('Project missing ID, generating new one');
      project.id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Save the project with the new ID
      saveProject(project).catch(error => {
        console.error('Error saving project with new ID:', error);
      });
    }

    onProjectSelect(project);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (project) {
        handleClick(e as unknown as React.MouseEvent);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Cover container with glow effects */}
      <motion.div 
        className="relative mb-2 group hover:scale-[1.02] transition-transform duration-200"
      >
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-2 rounded-lg transition-all duration-300 group-hover:bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.7)_0%,transparent_70%)] group-hover:opacity-100"
          animate={{
            rotate: 360,
            background: [
              "radial-gradient(circle at center, rgba(59, 130, 246, 0.5) 0%, transparent 70%)",
              "radial-gradient(circle at center, rgba(99, 102, 241, 0.5) 0%, transparent 70%)",
              "radial-gradient(circle at center, rgba(59, 130, 246, 0.5) 0%, transparent 70%)"
            ]
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            },
            background: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{
            opacity: 0.75
          }}
        />
        
        {/* Card content */}
        <div
          className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} rounded-lg overflow-hidden aspect-[3/4] relative backdrop-blur-sm bg-opacity-50 z-10 transition-all duration-300 ${project ? 'animate-glow' : ''}`}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyPress={handleKeyDown}
        >
          {project.coverImage ? (
            <div className="w-full h-full pointer-events-none">
              <img 
                src={project.coverImage} 
                alt={project.bookTitle}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <FileText size={32} className="text-primary" strokeWidth={1.5} />
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Text content in exactly 4 lines */}
      <div className="text-center flex flex-col gap-0.5">
        {/* Line 1: Title */}
        <h3 className="text-xs font-semibold truncate">
          {project.bookTitle}
        </h3>
        {/* Line 2: Author */}
        <p className="text-[10px] text-muted-foreground">
          {t.by} {project.author}
        </p>
        {/* Line 3: Last edit date */}
        <p className="text-[10px] text-muted-foreground">
          {t.lastEdit}: {new Date(project.lastEdited).toLocaleDateString()}
        </p>
        {/* Line 4: Paragraph count */}
        <p className="text-[10px] text-muted-foreground">
          {project.paragraphs.length} {t.paragraphs}
        </p>
      </div>
    </motion.div>
  );
});

const ActionBox: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isDarkMode: boolean;
}> = ({ icon, title, onClick, isDarkMode }) => (
  <motion.div
    whileHover={{
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} p-8 rounded-2xl cursor-pointer flex flex-col items-center gap-4 backdrop-blur-sm hover:bg-opacity-100 transition-all duration-200 shadow-xl hover:shadow-2xl w-72 h-72 border border-blue-500/30 hover:border-blue-500/50`}
  >
    <motion.div 
      className="text-white w-32 h-32 flex items-center justify-center bg-blue-500 rounded-full shadow-lg"
      whileHover={{
        rotate: [0, -10, 10, -10, 10, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut"
        }
      }}
    >
      {icon}
    </motion.div>
    <span className="text-2xl font-medium text-center">{title}</span>
  </motion.div>
);

const Dashboard: React.FC<DashboardProps> = ({ isDarkMode, setCurrentPage, setIsDarkMode, language, setLanguage, projects, setCurrentProject, onLogout }) => {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>(projects || []);
  const isElectron = !!(window as any).electron;

  const handleProjectSelect = useCallback(async (project: Project) => {
    if (!project?.id) {
      console.error('Cannot select project without id:', project);
      return;
    }
    
    setCurrentProject(project);
    setCurrentPage('paragraphEditor');
    
    // Prefetch progetti correlati in background
    await projectCache.prefetchProjects(project.id);
  }, [setCurrentProject, setCurrentPage]);

  useEffect(() => {
    const loadProjects = async () => {
      if (isElectron) {
        try {
          // Load projects from database
          const loadedProjects = await getProjects();
          if (loadedProjects && loadedProjects.length > 0) {
            // Ensure all projects have required fields
            const validProjects = loadedProjects.map(project => {
              if (!project.id) {
                project.id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              }
              if (!project.created) {
                project.created = new Date();
              }
              if (!project.modified) {
                project.modified = new Date();
              }
              if (!project.lastEdited) {
                project.lastEdited = new Date().toISOString();
              }
              if (!project.name) {
                project.name = project.bookTitle;
              }
              if (!project.paragraphs) {
                project.paragraphs = [];
              }
              return project;
            });

            // Save any projects that were updated with missing fields
            await Promise.all(
              validProjects.map(project => 
                saveProject(project).catch(error => 
                  console.error('Error saving project:', error)
                )
              )
            );

            setRecentProjects(validProjects);
            
            // Update cache with the valid projects
            await Promise.all(
              validProjects.map(project => 
                projectCache.cacheProject(project.id, project)
              )
            );
          }
        } catch (error) {
          console.error('Failed to load projects:', error);
        }
      }
    };

    loadProjects();
  }, [isElectron]);

  // Update recentProjects when projects change
  useEffect(() => {
    if (projects && projects.length > 0) {
      // Ensure all projects have required fields
      const validProjects = projects.map(project => {
        if (!project.id) {
          project.id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        if (!project.created) {
          project.created = new Date();
        }
        if (!project.modified) {
          project.modified = new Date();
        }
        if (!project.lastEdited) {
          project.lastEdited = new Date().toISOString();
        }
        if (!project.name) {
          project.name = project.bookTitle;
        }
        if (!project.paragraphs) {
          project.paragraphs = [];
        }
        return project;
      });
      setRecentProjects(validProjects);
    }
  }, [projects]);

  const translations = {
    it: {
      createNewProject: "Crea nuovo progetto",
      loadProject: "Carica progetto esistente",
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
      loadProject: "Load existing project",
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
        
        if (project.id && project.bookTitle && project.author && Array.isArray(project.paragraphs)) {
          const updatedProject = {
            ...project,
            lastEdited: new Date().toISOString()
          };
          
          if (isElectron) {
            await saveProject(updatedProject);
          }
          
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
  }, [setCurrentProject, setCurrentPage, t, isElectron]);

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

      <div className="flex-1 bg-background">
        {/* Version Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsChangelogOpen(true)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            v0.1.1
          </button>
        </div>

        {/* Changelog Modal */}
        <AnimatePresence>
          {isChangelogOpen && (
            <ChangelogModal
              isOpen={isChangelogOpen}
              onClose={() => setIsChangelogOpen(false)}
              isDarkMode={isDarkMode}
              language={language}
            />
          )}
        </AnimatePresence>

        <div className="h-full p-8 flex items-center">
          {/* Left Side - Logo */}
          <div className="flex-none w-[600px] flex items-center justify-center pl-32">
            <motion.div
              animate={{
                filter: [
                  'drop-shadow(0 0 15px rgb(59, 130, 246))',
                  'drop-shadow(0 0 25px rgb(59, 130, 246))',
                  'drop-shadow(0 0 15px rgb(59, 130, 246))'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src="/logo.png" 
                alt="Logo"
                className="w-[500px] h-[500px] object-contain"
              />
            </motion.div>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1 flex flex-col items-center justify-center pl-24">
            {/* Action Boxes */}
            <div className="flex gap-8 mb-12">
              <ActionBox
                icon={<Plus size={64} className="text-white" />}
                title={t.createNewProject}
                onClick={handleCreateNewProject}
                isDarkMode={isDarkMode}
              />
              <ActionBox
                icon={<FolderOpen size={64} className="text-white" />}
                title={t.loadProject}
                onClick={handleLoadProject}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Recent Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`${isDarkMode ? 'glass-card-dark' : 'glass-card'} p-6 rounded-lg backdrop-blur-sm bg-opacity-50 w-[600px]`}
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-semibold mb-4 text-center text-blue-500"
              >
                {t.recentProjects}
              </motion.h2>

              <div className="grid grid-cols-3 gap-4">
                <AnimatePresence>
                  {[0, 1, 2].map((index) => (
                    <ProjectBox
                      key={recentProjects[index]?.id || `empty-${index}`}
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

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
        isDarkMode={isDarkMode}
        language={language}
      /> */}
    </div>
  );
};

ProjectBox.displayName = 'ProjectBox';
Dashboard.displayName = 'Dashboard';

export default Dashboard;
