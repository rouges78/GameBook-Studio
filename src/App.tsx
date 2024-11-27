import React, { useState, useEffect, useCallback } from 'react';
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
import UpdateNotification from './components/UpdateNotification';
import UpdateErrorBoundary from './components/UpdateNotification/ErrorBoundary';
import BackupManager from './components/BackupManager';
import { useAutoUpdater } from './hooks/useAutoUpdater';
import { saveProject, getProjects, deleteProject, debugDatabase, migrateProjectData } from './utils/storage';
import { startAutoBackup, stopAutoBackup } from './utils/autoBackup';
import { ThemeContext, defaultTheme, mochaTheme, type Theme } from './contexts/ThemeContext';
import packageJson from '../package.json';
import type { Paragraph as EditorParagraph } from './components/ParagraphEditor/types';
import type { Paragraph as ExportParagraph } from './components/ExportPage/types';
import { PageType, Project } from './types/pages';

const isElectron = !!(window as any).electron;

// Mock storage for browser context
let browserProjects: Project[] = [];

interface NotificationType {
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState<'it' | 'en'>('it');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [lastBackup, setLastBackup] = useState<string>('');
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    setTheme(isDarkMode ? defaultTheme : mochaTheme);
  }, [isDarkMode]);

  const {
    updateAvailable,
    updateInfo,
    downloadProgress,
    isDownloading,
    updateDownloaded,
    error,
    isRetrying,
    startDownload,
    installUpdate,
    dismissUpdate,
    retryOperation
  } = useAutoUpdater();

  const transformParagraphsForExport = (paragraphs: EditorParagraph[]): ExportParagraph[] => {
    return paragraphs.map((p, index) => ({
      id: Number(p.id),
      title: `Paragraph ${index + 1}`,
      content: p.content,
      actions: p.actions,
      type: 'normale'
    }));
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (isElectron) {
          await migrateProjectData();
          console.log('Project migration completed');

          const savedProjects = await getProjects();
          setProjects(savedProjects || []);
          
          const dbContent = await debugDatabase();
          console.log('Database content:', dbContent);
          
          startAutoBackup(5);
          console.log('Auto backup initialized in App component');
        } else {
          // Use browser storage
          const savedProjects = localStorage.getItem('projects');
          if (savedProjects) {
            browserProjects = JSON.parse(savedProjects);
            setProjects(browserProjects);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        showNotification('Errore nell\'inizializzazione dell\'app', 'error');
      }
    };

    initializeApp();

    return () => {
      if (isElectron) {
        stopAutoBackup();
        console.log('Auto backup stopped in App component cleanup');
      }
    };
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleCreateProject = useCallback(async (project: Project) => {
    try {
      const now = new Date();
      const completeProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
        name: project.bookTitle,
        created: now,
        modified: now,
        lastEdited: now.toISOString()
      };

      if (isElectron) {
        await saveProject(completeProject);
      } else {
        browserProjects.push(completeProject);
        localStorage.setItem('projects', JSON.stringify(browserProjects));
      }
      setProjects(prevProjects => [...prevProjects, completeProject]);
      setCurrentProject(completeProject);
      showNotification('Progetto creato con successo', 'success');
    } catch (error) {
      console.error('Failed to create project:', error);
      showNotification('Errore nella creazione del progetto', 'error');
    }
  }, []);

  const handleSaveProject = useCallback(async (project: Project) => {
    try {
      const now = new Date();
      const updatedProject: Project = {
        ...project,
        modified: now,
        lastEdited: now.toISOString()
      };

      if (isElectron) {
        await saveProject(updatedProject);
      } else {
        const index = browserProjects.findIndex(p => p.bookTitle === project.bookTitle);
        if (index !== -1) {
          browserProjects[index] = updatedProject;
        } else {
          browserProjects.push(updatedProject);
        }
        localStorage.setItem('projects', JSON.stringify(browserProjects));
      }
      setProjects(prevProjects =>
        prevProjects.map((p) => (p.bookTitle === project.bookTitle ? updatedProject : p))
      );
      if (currentProject?.bookTitle === project.bookTitle) {
        setCurrentProject(updatedProject);
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
      if (isElectron) {
        await deleteProject(bookTitle);
      } else {
        browserProjects = browserProjects.filter(p => p.bookTitle !== bookTitle);
        localStorage.setItem('projects', JSON.stringify(browserProjects));
      }
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
    if (isElectron) {
      window.electron['window:close']();
    }
  }, []);

  const handleSetPage = useCallback((page: PageType) => {
    setCurrentPage(page);
  }, []);

  const handleSetCurrentProject = useCallback((project: Project | null) => {
    setCurrentProject(project);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            key="dashboard"
            isDarkMode={isDarkMode}
            setCurrentPage={handleSetPage}
            setIsDarkMode={setIsDarkMode}
            language={language}
            setLanguage={setLanguage}
            projects={projects}
            setCurrentProject={handleSetCurrentProject}
            onLogout={handleLogout}
          />
        );
      case 'createProject':
        return (
          <CreateNewProject
            key="create-project"
            setCurrentPage={handleSetPage}
            onCreateProject={handleCreateProject}
            isDarkMode={isDarkMode}
            language={language}
          />
        );
      case 'paragraphEditor':
        return currentProject ? (
          <ParagraphEditor
            key={`editor-${currentProject.bookTitle}`}
            setCurrentPage={handleSetPage}
            bookTitle={currentProject.bookTitle}
            author={currentProject.author}
            onSaveProject={handleSaveProject}
            isDarkMode={isDarkMode}
            language={language}
            initialParagraphs={currentProject.paragraphs}
            initialMapSettings={currentProject.mapSettings}
            updateLastBackup={handleUpdateLastBackup}
          />
        ) : null;
      case 'library':
        return (
          <Library
            key="library"
            setCurrentPage={handleSetPage}
            books={projects}
            isDarkMode={isDarkMode}
            onEditBook={(bookTitle: string) => {
              const project = projects.find((p) => p.bookTitle === bookTitle);
              if (project) {
                setCurrentProject(project);
                handleSetPage('paragraphEditor');
              }
            }}
            onDeleteBook={handleDeleteProject}
            onSaveBook={handleSaveProject}
            language={language}
          />
        );
      case 'themeEditor':
        return (
          <ThemeEditor
            key="theme-editor"
            setCurrentPage={handleSetPage}
            isDarkMode={isDarkMode}
            language={language}
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        );
      case 'settings':
        return (
          <Settings
            key="settings"
            setCurrentPage={handleSetPage}
            isDarkMode={isDarkMode}
            language={language}
          />
        );
      case 'help':
        return (
          <Help
            key="help"
            setCurrentPage={handleSetPage}
            isDarkMode={isDarkMode}
            language={language}
          />
        );
      case 'export':
        return currentProject ? (
          <ExportPage
            key={`export-${currentProject.bookTitle}`}
            setCurrentPage={handleSetPage}
            bookTitle={currentProject.bookTitle}
            author={currentProject.author}
            paragraphs={transformParagraphsForExport(currentProject.paragraphs)}
            isDarkMode={isDarkMode}
            language={language}
          />
        ) : null;
      case 'backupManager':
        return (
          <BackupManager
            key="backup-manager"
            setCurrentPage={handleSetPage}
            isDarkMode={isDarkMode}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`h-screen flex flex-col overflow-hidden ${isDarkMode ? 'dark' : 'light'}`} style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        <Header 
          isDarkMode={isDarkMode} 
          version={packageJson.version}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          language={language}
        />
        {renderPage()}
        <Footer
          projectCount={projects.length}
          lastBackup={lastBackup}
          isDarkMode={isDarkMode}
          language={language}
        />
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            isDarkMode={isDarkMode}
          />
        )}
        <UpdateErrorBoundary>
          <UpdateNotification
            updateAvailable={updateAvailable}
            updateInfo={updateInfo}
            downloadProgress={downloadProgress}
            isDownloading={isDownloading}
            error={error}
            isRetrying={isRetrying}
            onStartDownload={startDownload}
            onInstallUpdate={installUpdate}
            onDismiss={dismissUpdate}
            onRetry={retryOperation}
          />
        </UpdateErrorBoundary>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
