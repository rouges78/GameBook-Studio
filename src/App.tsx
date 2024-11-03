import React, { useState, useEffect, createContext, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CreateNewProject from './components/CreateNewProject';
import ParagraphEditor from './components/ParagraphEditor/index';
import Footer from './components/Footer';
import Library from './components/Library';
import ThemeEditor from './components/ThemeEditor';
import Settings from './components/Settings';
import Help from './components/Help';
import ExportPage from './components/ExportPage';
import Notification from './components/Notification';
import { saveProject, getProjects, deleteProject, debugDatabase, migrateProjectData } from './utils/storage';
import { startAutoBackup, stopAutoBackup } from './utils/autoBackup';
import packageJson from '../package.json';
import { Project } from './components/ParagraphEditor/types';

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
  borderRadius: number;
  buttonStyle: 'rounded' | 'square' | 'pill';
  spacing: number;
  paragraphBackground: string;
  animationSpeed: number;
  iconSet: 'default' | 'minimal' | 'colorful';
  layout: 'grid' | 'list';
}

export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}>({
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    textColor: '#F9FAFB',
    backgroundColor: '#111827',
    fontSize: 16,
    fontFamily: 'Roboto',
    borderRadius: 4,
    buttonStyle: 'rounded',
    spacing: 16,
    paragraphBackground: '#1F2937',
    animationSpeed: 300,
    iconSet: 'default',
    layout: 'grid',
  },
  setTheme: () => {},
});

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'createProject' | 'paragraphEditor' | 'library' | 'themeEditor' | 'settings' | 'help' | 'export'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'it' | 'en'>('it');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [lastBackup, setLastBackup] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [theme, setTheme] = useState<Theme>({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    textColor: '#F9FAFB',
    backgroundColor: '#111827',
    fontSize: 16,
    fontFamily: 'Roboto',
    borderRadius: 4,
    buttonStyle: 'rounded',
    spacing: 16,
    paragraphBackground: '#1F2937',
    animationSpeed: 300,
    iconSet: 'default',
    layout: 'grid',
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await migrateProjectData();
        console.log('Project migration completed');

        const savedProjects = await getProjects();
        setProjects(savedProjects || []);
        
        const dbContent = await debugDatabase();
        console.log('Database content:', dbContent);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        showNotification('Errore nell\'inizializzazione dell\'app', 'error');
      }
    };

    initializeApp();
    startAutoBackup(5);
    console.log('Auto backup initialized in App component');

    return () => {
      stopAutoBackup();
      console.log('Auto backup stopped in App component cleanup');
    };
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleCreateProject = useCallback(async (project: Project) => {
    try {
      await saveProject(project);
      setProjects(prevProjects => [...prevProjects, project]);
      setCurrentProject(project);
      showNotification('Progetto creato con successo', 'success');
    } catch (error) {
      console.error('Failed to create project:', error);
      showNotification('Errore nella creazione del progetto', 'error');
    }
  }, []);

  const handleSaveProject = useCallback(async (project: Project) => {
    try {
      await saveProject(project);
      setProjects(prevProjects =>
        prevProjects.map((p) => (p.bookTitle === project.bookTitle ? project : p))
      );
      if (currentProject?.bookTitle === project.bookTitle) {
        setCurrentProject(project);
      }
      showNotification('Progetto salvato con successo', 'success');
      setLastBackup(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to save project:', error);
      showNotification('Errore nel salvataggio del progetto', 'error');
    }
  }, [currentProject]);

  const handleDeleteProject = useCallback(async (bookTitle: string) => {
    try {
      await deleteProject(bookTitle);
      setProjects((prevProjects) => prevProjects.filter((p) => p.bookTitle !== bookTitle));
      showNotification('Progetto eliminato con successo', 'success');
    } catch (error) {
      console.error('Failed to delete project:', error);
      showNotification('Errore nell\'eliminazione del progetto', 'error');
    }
  }, []);

  const handleUpdateLastBackup = useCallback((date: string) => {
    setLastBackup(date);
  }, []);

  const handleLogout = useCallback(() => {
    console.log('User logged out');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`h-screen flex flex-col ${isDarkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        <Header 
          isDarkMode={isDarkMode} 
          version={packageJson.version}
          edition={packageJson.edition}
          update={packageJson.update}
          revision={packageJson.revision}
        />
        {currentPage === 'dashboard' && (
          <Dashboard
            isDarkMode={isDarkMode}
            setCurrentPage={setCurrentPage}
            setIsDarkMode={setIsDarkMode}
            language={language}
            setLanguage={setLanguage}
            projects={projects}
            setCurrentProject={setCurrentProject}
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'createProject' && (
          <CreateNewProject
            setCurrentPage={setCurrentPage}
            onCreateProject={handleCreateProject}
            isDarkMode={isDarkMode}
            language={language}
          />
        )}
        {currentPage === 'paragraphEditor' && currentProject && (
          <ParagraphEditor
            setCurrentPage={setCurrentPage}
            bookTitle={currentProject.bookTitle}
            author={currentProject.author}
            onSaveProject={handleSaveProject}
            isDarkMode={isDarkMode}
            language={language}
            initialParagraphs={currentProject.paragraphs}
            initialMapSettings={currentProject.mapSettings}
            updateLastBackup={handleUpdateLastBackup}
          />
        )}
        {currentPage === 'library' && (
          <Library
            setCurrentPage={setCurrentPage}
            books={projects}
            isDarkMode={isDarkMode}
            onEditBook={(bookTitle: string) => {
              const project = projects.find((p) => p.bookTitle === bookTitle);
              if (project) {
                setCurrentProject(project);
                setCurrentPage('paragraphEditor');
              }
            }}
            onDeleteBook={handleDeleteProject}
            onSaveBook={handleSaveProject}
            language={language}
          />
        )}
        {currentPage === 'themeEditor' && (
          <ThemeEditor
            setCurrentPage={setCurrentPage}
            isDarkMode={isDarkMode}
            language={language}
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        )}
        {currentPage === 'settings' && (
          <Settings
            setCurrentPage={setCurrentPage}
            isDarkMode={isDarkMode}
            language={language}
          />
        )}
        {currentPage === 'help' && (
          <Help
            setCurrentPage={setCurrentPage}
            isDarkMode={isDarkMode}
            language={language}
          />
        )}
        {currentPage === 'export' && currentProject && (
          <ExportPage
            setCurrentPage={setCurrentPage}
            bookTitle={currentProject.bookTitle}
            author={currentProject.author}
            paragraphs={currentProject.paragraphs}
            isDarkMode={isDarkMode}
            language={language}
          />
        )}
        <Footer
          projectCount={projects.length}
          lastBackup={lastBackup}
          isDarkMode={isDarkMode}
        />
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
